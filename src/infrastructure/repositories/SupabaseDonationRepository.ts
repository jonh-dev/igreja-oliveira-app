import { supabase } from '../config/supabase';
import { Donation, UpdateDonationData, CreateCultoDonationData, CreateManualDonationData } from '../../domain/entities/Donation';
import { IDonationRepository } from '../../application/interfaces/repositories/IDonationRepository';

export class SupabaseDonationRepository implements IDonationRepository {
  async createCultoDonation(data: CreateCultoDonationData): Promise<Donation> {
    const { data: donation, error } = await supabase
      .from('donations')
      .insert({
        type: 'culto',
        source: 'manual',
        amount: data.amount,
        date: data.date.toISOString(),
        registered_by: data.registeredBy,
        description: data.description,
        culto_data: {
          bill_counts: data.billCounts,
          coin_counts: data.coinCounts,
          counting_method: data.countingMethod,
          notes: data.notes,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating culto donation: ${error.message}`);
    }

    return this.mapDatabaseDonationToDonation(donation);
  }

  async createManualDonation(data: CreateManualDonationData): Promise<Donation> {
    const { data: donation, error } = await supabase
      .from('donations')
      .insert({
        type: data.type,
        source: 'manual',
        amount: data.amount,
        date: data.date.toISOString(),
        user_id: data.userId,
        registered_by: data.registeredBy,
        description: data.description,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating manual donation: ${error.message}`);
    }

    return this.mapDatabaseDonationToDonation(donation);
  }

  async findAll(): Promise<Donation[]> {
    const { data: donations, error } = await supabase
      .from('donations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching donations: ${error.message}`);
    }

    return donations.map(this.mapDatabaseDonationToDonation);
  }

  async findById(id: string): Promise<Donation | null> {
    const { data: donation, error } = await supabase
      .from('donations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Error fetching donation: ${error.message}`);
    }

    return this.mapDatabaseDonationToDonation(donation);
  }

  async update(id: string, data: UpdateDonationData): Promise<Donation> {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const { data: donation, error } = await supabase
      .from('donations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating donation: ${error.message}`);
    }

    return this.mapDatabaseDonationToDonation(donation);
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

  private mapDatabaseDonationToDonation(databaseDonation: any): Donation {
    return {
      id: databaseDonation.id,
      type: databaseDonation.type,
      source: databaseDonation.source,
      amount: databaseDonation.amount,
      date: new Date(databaseDonation.date),
      userId: databaseDonation.user_id,
      description: databaseDonation.description,
      registeredBy: databaseDonation.registered_by,
      cultoData: databaseDonation.culto_data ? {
        billCounts: databaseDonation.culto_data.bill_counts || [],
        coinCounts: databaseDonation.culto_data.coin_counts || [],
        countingMethod: databaseDonation.culto_data.counting_method,
        notes: databaseDonation.culto_data.notes,
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