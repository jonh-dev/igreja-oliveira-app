import {
  IAuthService,
  AuthResult,
} from '../../application/interfaces/services/IAuthService';
import { User, UserRole } from '../../domain/entities/User';
import { supabase, supabaseAdmin } from '../config/supabase';

export class SupabaseAuthService implements IAuthService {
  async authenticate(email: string, password: string): Promise<AuthResult> {
    console.log('[Auth] authenticate:start', { email });
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log('[Auth] authenticate:error:signIn', { code: error.status, message: error.message });
      throw new Error(`Authentication failed: ${error.message}`);
    }

    if (!data.user) {
      console.log('[Auth] authenticate:error:no-user');
      throw new Error('Authentication failed: No user data returned');
    }

    console.log('[Auth] authenticate:session', { hasSession: !!data.session, userId: data.user.id });

    await this.ensureUserRowExists(
      data.user.id,
      data.user.email ?? undefined,
      {
        full_name: data.user.user_metadata?.full_name as string | undefined,
        phone: data.user.user_metadata?.phone as string | undefined,
      }
    );

    let user = await this.getUserFromDatabase(data.user.id);
    if (!user) {
      console.log('[Auth] authenticate:warn:user-missing-after-ensure', { userId: data.user.id });
      await this.ensureUserRowExists(data.user.id, data.user.email ?? undefined, {
        full_name: data.user.user_metadata?.full_name as string | undefined,
        phone: data.user.user_metadata?.phone as string | undefined,
      });
      user = await this.getUserFromDatabase(data.user.id);
      if (!user) {
        console.log('[Auth] authenticate:error:user-not-found', { userId: data.user.id });
        throw new Error('User not found in database');
      }
    }

    return {
      user,
      token: data.session.access_token,
      refreshToken: data.session.refresh_token,
    };
  }

  async register(
    email: string,
    password: string,
    fullName: string,
    phone?: string,
    addressData?: any
  ): Promise<AuthResult> {
    console.log('[SupabaseAuthService] Iniciando registro de usuário:', {
      email,
      fullName,
      hasPhone: !!phone,
      phone: phone || 'não fornecido',
      hasAddress: !!addressData,
      timestamp: new Date().toISOString()
    });

    let data, error;

    // Se telefone for fornecido e temos admin client, usar admin.createUser para garantir persistência do phone
    if (phone && supabaseAdmin) {
      console.log('[SupabaseAuthService] Usando admin.createUser para garantir persistência do telefone');
      
      const adminResult = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        phone,
        phone_confirm: true, // Auto-confirmar telefone
        user_metadata: {
          full_name: fullName,
          phone_verified: true,
          ...(phone && { phone })
        },
        app_metadata: {
          ...(addressData && { pending_address: addressData }),
          provider: phone ? 'phone' : 'email',
          provider_type: phone ? 'phone' : 'email'
        }
      });
      
      data = adminResult.data;
      error = adminResult.error;
    } else {
      // Fallback para signUp normal
      console.log('[SupabaseAuthService] Usando signUp normal');
      
      const signUpData = {
        email,
        password,
        ...(phone && { phone }),
        options: {
          data: {
            full_name: fullName,
            ...(phone && { phone }),
            provider_type: phone ? 'phone' : 'email'
          },
        },
      };
      
      // Salvar dados de endereço no app_metadata se fornecidos
      if (addressData && supabaseAdmin) {
        console.log('[SupabaseAuthService] Preparando para salvar dados de endereço no app_metadata');
      }
      
      const signUpResult = await supabase.auth.signUp(signUpData);
      data = signUpResult.data;
      error = signUpResult.error;

      // Após signUp com anon, normalizar e persistir metadados críticos via admin
      if (!error && data?.user && supabaseAdmin) {
        try {
          console.log('[SupabaseAuthService] Normalizando metadados via admin.updateUserById');
          const { error: updErr } = await supabaseAdmin.auth.admin.updateUserById(
            data.user.id,
            {
              // Persistir telefone no auth.users e marcá-lo como confirmado quando fornecido
              ...(phone ? { phone, phone_confirm: true } : {}),
              // Garantir user_metadata consistente
              user_metadata: {
                full_name: fullName,
                ...(phone ? { phone, phone_verified: true } : {}),
              },
              // Garantir provider_type no app_metadata e endereço pendente quando aplicável
              app_metadata: {
                provider: phone ? 'phone' : 'email',
                provider_type: phone ? 'phone' : 'email',
                ...(addressData ? { pending_address: addressData } : {}),
              },
            }
          );
          if (updErr) {
            console.warn('[SupabaseAuthService] Falha ao atualizar metadados via admin.updateUserById:', updErr.message || updErr);
          } else {
            console.log('[SupabaseAuthService] Metadados persistidos com sucesso via admin.updateUserById');
          }
        } catch (e: any) {
          console.warn('[SupabaseAuthService] Exceção ao atualizar metadados via admin.updateUserById:', e?.message || e);
        }
      } else if (!supabaseAdmin) {
        console.warn('[SupabaseAuthService] SUPABASE_SERVICE_ROLE_KEY ausente — não foi possível persistir phone/app_metadata em auth.users');
      }
    }
    
    console.log('[SupabaseAuthService] Dados enviados para Supabase Auth:', {
      email,
      hasPassword: !!password,
      phone,
      fullName
    });

    if (error) {
      console.error('[SupabaseAuthService] ERRO no signUp:', {
        error: error.message,
        code: error.status,
        email,
        phone
      });
      throw new Error(`Registration failed: ${error.message}`);
    }

    if (!data.user) {
      console.error('[SupabaseAuthService] ERRO: Nenhum dado de usuário retornado do signUp');
      throw new Error('Registration failed: No user data returned');
    }

    console.log('[SupabaseAuthService] Usuário criado no Supabase Auth com sucesso:', {
      userId: data.user.id,
      email: data.user.email,
      emailConfirmedAt: data.user.email_confirmed_at,
      userMetadata: data.user.user_metadata,
      rawUserMetadata: data.user.user_metadata,
      hasSession: 'session' in data ? !!data.session : false
    });
    
    // Criar usuário e endereço imediatamente, mesmo antes da confirmação do email
    if (supabaseAdmin) {
      try {
        console.log('[SupabaseAuthService] Criando usuário e endereço imediatamente...');
        
        const { error: createError } = await supabaseAdmin.rpc('create_user_with_address', {
          p_user_id: data.user.id,
          p_email: data.user.email,
          p_full_name: fullName,
          p_phone: phone || null,
          p_address: addressData || null
        });
        
        if (createError) {
          console.error('[SupabaseAuthService] Erro ao criar usuário/endereço imediatamente:', createError);
        } else {
          console.log('[SupabaseAuthService] Usuário e endereço criados imediatamente com sucesso');
        }
        
        // Salvar dados de endereço no app_metadata para o trigger de confirmação de email
        if (addressData) {
          const { error: metadataError } = await supabaseAdmin.rpc('save_pending_address_data', {
            user_id: data.user.id,
            address_data: addressData
          });
          
          if (metadataError) {
            console.error('[SupabaseAuthService] Erro ao salvar dados de endereço no metadata:', metadataError);
          } else {
            console.log('[SupabaseAuthService] Dados de endereço salvos no metadata com sucesso');
          }
        }
        
      } catch (error) {
        console.error('[SupabaseAuthService] Erro durante criação imediata:', error);
        // Não falhar o registro por causa disso
      }
    }

    const resultUser = {
      id: data.user.id,
      email: data.user.email!,
      fullName: fullName,
      phone: phone,
      role: 'member' as UserRole,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    console.log('[SupabaseAuthService] Dados do usuário retornados:', resultUser);

    return {
      user: resultUser,
      token: ('session' in data && data.session?.access_token) || '',
      refreshToken: ('session' in data && data.session?.refresh_token) || '',
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthResult> {
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) {
      throw new Error(`Token refresh failed: ${error.message}`);
    }

    if (!data.user || !data.session) {
      throw new Error('Token refresh failed: No user or session data returned');
    }

    const user = await this.getUserFromDatabase(data.user.id);
    if (!user) {
      throw new Error('User not found in database');
    }

    return {
      user,
      token: data.session.access_token,
      refreshToken: data.session.refresh_token,
    };
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(`Logout failed: ${error.message}`);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    return await this.getUserFromDatabase(user.id);
  }

  private async getUserFromDatabase(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.log('[Auth] db:error:getUserFromDatabase', { userId, message: error.message });
      throw new Error(`Error fetching user from database: ${error.message}`);
    }

    if (!data) {
      console.log('[Auth] db:miss:getUserFromDatabase', { userId });
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      phone: data.phone || undefined,
      role: data.role as UserRole,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private async ensureUserRowExists(
    userId: string,
    email?: string,
    metadata?: { full_name?: string; phone?: string }
  ): Promise<void> {
    // Tenta fazer upsert; políticas RLS permitem INSERT quando auth.uid() = id
    const payload: Record<string, string | null> = {
      id: userId,
      email: email ?? null,
      full_name: metadata?.full_name ?? email ?? 'Usuário',
      phone: metadata?.phone ?? null,
      country_code: '+55',
      role: 'member',
    };

    // Remove campos indefinidos para evitar violações
    Object.keys(payload).forEach((k) => {
      if (payload[k] === undefined) delete payload[k];
    });

    const { error } = await supabase
      .from('users')
      .upsert(payload, { onConflict: 'id', ignoreDuplicates: false });

    if (error) {
      // Ignora conflito único benigno; outros erros sobem
      const msg = error.message || '';
      console.log('[Auth] db:error:ensureUserRowExists', { userId, msg });
      if (!/duplicate key|already exists|conflict/i.test(msg)) {
        throw new Error(`Failed to ensure user row: ${msg}`);
      }
    }
    console.log('[Auth] db:ok:ensureUserRowExists', { userId });
  }
}
