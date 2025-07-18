import { DonationType, DonationSource } from '../../domain/entities/Donation';

export interface CreateGasofilacoDto {
  cultDate: string; // ISO string
  amount: number;
  registeredBy: string; // userId do líder/diácono
  description?: string;
  notes?: string;
}

export interface CreateElectronicDonationDto {
  transactionId: string;
  amount: number;
  paymentMethod: 'pix' | 'cartao' | 'transferencia';
  donorId?: string;
  donorName?: string;
  bankInfo?: string;
  transactionDate: string; // ISO string
  description?: string;
}

export interface GetDonationsDto {
  type?: DonationType;
  source?: DonationSource;
  startDate?: string; // ISO string
  endDate?: string; // ISO string
  limit?: number;
  offset?: number;
}

export interface GetDonationSummaryDto {
  startDate: string; // ISO string
  endDate: string; // ISO string
  groupBy?: 'day' | 'week' | 'month' | 'cult';
}

export interface GetCultDonationSummaryDto {
  cultDate: string; // ISO string
}