import { IAuthService, AuthResult } from '../../application/interfaces/services/IAuthService';
import { User, UserRole } from '../../domain/entities/User';
import { supabase } from '../config/supabase';

export class SupabaseAuthService implements IAuthService {
  async authenticate(email: string, password: string): Promise<AuthResult> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }

    if (!data.user) {
      throw new Error('Authentication failed: No user data returned');
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

  async register(email: string, password: string, fullName: string): Promise<AuthResult> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }

    if (!data.user) {
      throw new Error('Registration failed: No user data returned');
    }

    const user = await this.getUserFromDatabase(data.user.id);
    if (!user) {
      throw new Error('User not found in database after registration');
    }

    return {
      user,
      token: data.session?.access_token || '',
      refreshToken: data.session?.refresh_token,
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
    const { data: { user } } = await supabase.auth.getUser();
    
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
      throw new Error(`Error fetching user from database: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      fullName: data.name,
      phone: data.phone || undefined,
      role: data.role as UserRole,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
} 