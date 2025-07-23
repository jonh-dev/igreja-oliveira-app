import { DonationType, DonationSource, CountingMethod, BillCount, CoinCount } from '../../domain/entities/Donation';

export interface CreateDonationDto {
  type: DonationType;
  source: DonationSource;
  amount: number;
  date: string; // DD/MM/YYYY
  userId?: string; // Para dízimos e doações especiais
  description?: string;
  registeredBy: string;
  
  // Para doações de culto
  cultoData?: {
    billCounts: BillCount[];
    coinCounts: CoinCount[];
    countingMethod: CountingMethod;
    notes?: string;
  };
  
  // Para doações eletrônicas
  electronicData?: {
    transactionId: string;
    donorId?: string;
    donorName?: string;
    paymentMethod: 'pix' | 'cartao' | 'transferencia';
    bankInfo?: string;
    transactionDate: string; // ISO string
  };
}

export interface CreateCultoDonationDto {
  amount: number;
  date: string; // DD/MM/YYYY
  registeredBy: string;
  billCounts?: BillCount[];
  coinCounts?: CoinCount[];
  countingMethod: CountingMethod;
  notes?: string;
  description?: string;
}

export interface CreateManualDonationDto {
  type: 'tithe' | 'special';
  amount: number;
  date: string; // DD/MM/YYYY
  userId: string;
  registeredBy: string;
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