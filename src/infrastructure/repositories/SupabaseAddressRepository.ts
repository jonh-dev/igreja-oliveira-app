import { IAddressRepository } from '../../application/interfaces/repositories/IAddressRepository';
import {
  Address,
  CreateAddressData,
  UpdateAddressData,
} from '../../domain/entities/Address';
import { supabase, supabaseAdmin, DatabaseAddress } from '../config/supabase';

export class SupabaseAddressRepository implements IAddressRepository {
  async findById(id: string): Promise<Address | null> {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Error finding address by id: ${error.message}`);
    }

    return data ? this.mapToAddress(data) : null;
  }

  async findByUserId(userId: string): Promise<Address[]> {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error finding addresses by user id: ${error.message}`);
    }

    return data.map(address => this.mapToAddress(address));
  }

  async findDefaultByUserId(userId: string): Promise<Address | null> {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .eq('is_default', true)
      .maybeSingle();

    if (error) {
      throw new Error(`Error finding default address: ${error.message}`);
    }

    return data ? this.mapToAddress(data) : null;
  }

  async create(addressData: CreateAddressData): Promise<Address> {
    console.log('[SupabaseAddressRepository] Iniciando criação de endereço:', {
      addressData,
      timestamp: new Date().toISOString()
    });

    if (addressData.isDefault) {
      console.log('[SupabaseAddressRepository] Removendo flag default de outros endereços do usuário:', {
        userId: addressData.userId
      });
      await this.unsetDefaultAddresses(addressData.userId);
    }

    const insertData = {
      user_id: addressData.userId,
      street: addressData.street,
      number: addressData.number || null,
      neighborhood: addressData.neighborhood,
      city: addressData.city,
      state: addressData.state || null,
      zip_code: addressData.zipCode,
      country: addressData.country || 'Brasil',
      is_default: addressData.isDefault || false,
    };
    
    console.log('[SupabaseAddressRepository] Dados para inserção na tabela addresses:', insertData);

    console.log('[SupabaseAddressRepository] Executando INSERT na tabela addresses...');
    // Usar supabaseAdmin para operações de criação durante o registro
    // pois o usuário ainda não está autenticado no contexto do Supabase
    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('addresses')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('[SupabaseAddressRepository] ERRO ao inserir endereço:', {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        insertData
      });
      throw new Error(`Error creating address: ${error.message}`);
    }

    console.log('[SupabaseAddressRepository] Endereço inserido com sucesso na tabela addresses:', {
      insertedData: data,
      hasId: !!data?.id,
      userId: data?.user_id,
      street: data?.street,
      city: data?.city,
      zipCode: data?.zip_code,
      isDefault: data?.is_default
    });

    const mappedAddress = this.mapToAddress(data);
    console.log('[SupabaseAddressRepository] Endereço mapeado para entidade:', {
      id: mappedAddress.id,
      userId: mappedAddress.userId,
      street: mappedAddress.street,
      city: mappedAddress.city,
      zipCode: mappedAddress.zipCode,
      isDefault: mappedAddress.isDefault
    });

    return mappedAddress;
  }

  async update(id: string, addressData: UpdateAddressData): Promise<Address> {
    const updateData: Partial<DatabaseAddress> = {};

    if (addressData.street !== undefined)
      updateData.street = addressData.street;
    if (addressData.number !== undefined)
      updateData.number = addressData.number;
    if (addressData.neighborhood !== undefined)
      updateData.neighborhood = addressData.neighborhood;
    if (addressData.city !== undefined) updateData.city = addressData.city;
    if (addressData.state !== undefined) updateData.state = addressData.state;
    if (addressData.zipCode !== undefined)
      updateData.zip_code = addressData.zipCode;
    if (addressData.country !== undefined)
      updateData.country = addressData.country;
    if (addressData.isDefault !== undefined) {
      updateData.is_default = addressData.isDefault;

      if (addressData.isDefault) {
        const currentAddress = await this.findById(id);
        if (currentAddress) {
          await this.unsetDefaultAddresses(currentAddress.userId);
        }
      }
    }

    const { data, error } = await supabase
      .from('addresses')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating address: ${error.message}`);
    }

    return this.mapToAddress(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('addresses').delete().eq('id', id);

    if (error) {
      throw new Error(`Error deleting address: ${error.message}`);
    }
  }

  async setAsDefault(addressId: string, userId: string): Promise<void> {
    await this.unsetDefaultAddresses(userId);

    const { error } = await supabase
      .from('addresses')
      .update({ is_default: true })
      .eq('id', addressId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Error setting address as default: ${error.message}`);
    }
  }

  private async unsetDefaultAddresses(userId: string): Promise<void> {
    // Usar supabaseAdmin para operações durante o registro
    const client = supabaseAdmin || supabase;
    const { error } = await client
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', userId)
      .eq('is_default', true);

    if (error) {
      throw new Error(`Error unsetting default addresses: ${error.message}`);
    }
  }

  private mapToAddress(databaseAddress: DatabaseAddress): Address {
    return {
      id: databaseAddress.id,
      userId: databaseAddress.user_id,
      street: databaseAddress.street,
      number: databaseAddress.number || undefined,
      neighborhood: databaseAddress.neighborhood,
      city: databaseAddress.city,
      state: databaseAddress.state || undefined,
      zipCode: databaseAddress.zip_code,
      country: databaseAddress.country || undefined,
      isDefault: databaseAddress.is_default,
      createdAt: new Date(databaseAddress.created_at),
      updatedAt: new Date(databaseAddress.updated_at),
    };
  }
}
