import { Donation, UpdateDonationData, CreateCultoDonationData, CreateManualDonationData } from '../../../domain/entities/Donation';

export interface IDonationRepository {
  createCultoDonation(data: CreateCultoDonationData): Promise<Donation>;
  createManualDonation(data: CreateManualDonationData): Promise<Donation>;
  findAll(): Promise<Donation[]>;
  findById(id: string): Promise<Donation | null>;
  update(id: string, data: UpdateDonationData): Promise<Donation>;
  delete(id: string): Promise<void>;
}