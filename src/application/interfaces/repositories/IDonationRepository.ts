import { Donation, CreateDonationData, UpdateDonationData } from '../../../domain/entities/Donation';

export interface IDonationRepository {
  findById(id: string): Promise<Donation | null>;
  findByUserId(userId: string, params?: { limit?: number; offset?: number }): Promise<Donation[]>;
  create(donationData: CreateDonationData): Promise<Donation>;
  update(id: string, donationData: UpdateDonationData): Promise<Donation>;
  delete(id: string): Promise<void>;
  findAll(params?: { limit?: number; offset?: number }): Promise<Donation[]>;
}