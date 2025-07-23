import { IDonationRepository } from '../../application/interfaces/repositories/IDonationRepository';
import { Donation, UpdateDonationData, CreateGasofilacoData } from '../../domain/entities/Donation';
import { supabase, DatabaseDonation } from '../config/supabase';

export class SupabaseDonationRepository implements IDonationRepository {
  async findById(id: string): Promise<Donation | null> {
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Error finding donation by id: ${error.message}`);
    }

    return data ? this.mapToDonation(data) : null;
  }

  async findByUserId(userId: string, params?: { limit?: number; offset?: number }): Promise<Donation[]> {
    let query = supabase
      .from('donations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (params?.limit) {
      query = query.limit(params.limit);
    }

    if (params?.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 50) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error finding donations by user id: ${error.message}`);
    }

    return data.map(donation => this.mapToDonation(donation));
  }

  async createGasofilaco(gasofilacoData: CreateGasofilacoData): Promise<Donation> {
    const { data, error } = await supabase
      .from('donations')
      .insert({
        type: 'gasofilaco',
        source: 'manual',
        amount: gasofilacoData.amount,
        description: gasofilacoData.description,
        gasofilaco_data: {
          cult_date: gasofilacoData.cultDate.toISOString(),
          registered_by: gasofilacoData.registeredBy,
          notes: gasofilacoData.notes,
        },
        date: gasofilacoData.cultDate.toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating gasofilaco donation: ${error.message}`);
    }

    return this.mapToDonation(data);
  }

  async update(id: string, donationData: UpdateDonationData): Promise<Donation> {
    const updateData: Partial<DatabaseDonation> = {};
    
    if (donationData.amount !== undefined) updateData.amount = donationData.amount;
    if (donationData.description !== undefined) updateData.description = donationData.description;

    const { data, error } = await supabase
      .from('donations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating donation: ${error.message}`);
    }

    return this.mapToDonation(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('donations')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting donation: ${error.message}`);
    }
  }

  async findAll(params?: { limit?: number; offset?: number }): Promise<Donation[]> {
    let query = supabase
      .from('donations')
      .select('*')
      .order('created_at', { ascending: false });

    if (params?.limit) {
      query = query.limit(params.limit);
    }

    if (params?.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 50) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error finding donations: ${error.message}`);
    }

    return data.map(donation => this.mapToDonation(donation));
  }

  private mapToDonation(databaseDonation: DatabaseDonation): Donation {
    return {
      id: databaseDonation.id,
      type: databaseDonation.type as Donation['type'],
      source: databaseDonation.source as Donation['source'],
      amount: databaseDonation.amount,
      description: databaseDonation.description || undefined,
      gasofilacoData: databaseDonation.gasofilaco_data ? {
        cultDate: new Date(databaseDonation.gasofilaco_data.cult_date),
        registeredBy: databaseDonation.gasofilaco_data.registered_by,
        notes: databaseDonation.gasofilaco_data.notes,
      } : undefined,
      electronicData: databaseDonation.electronic_data ? {
        transactionId: databaseDonation.electronic_data.transaction_id,
        donorId: databaseDonation.electronic_data.donor_id,
        donorName: databaseDonation.electronic_data.donor_name,
        paymentMethod: databaseDonation.electronic_data.payment_method,
        bankInfo: databaseDonation.electronic_data.bank_info,
        transactionDate: new Date(databaseDonation.electronic_data.transaction_date),
      } : undefined,
      createdAt: new Date(databaseDonation.created_at),
      updatedAt: new Date(databaseDonation.updated_at),
    };
  }
} 