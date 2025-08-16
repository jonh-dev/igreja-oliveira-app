export type DonationType = 'culto' | 'tithe' | 'special';
export type DonationSource = 'manual' | 'electronic';
export type CountingMethod = 'detailed' | 'total';

export interface BillCount {
  value: number; // 200, 100, 50, 20, 10, 5, 2
  count: number;
}

export interface CoinCount {
  value: number; // 1, 0.5, 0.25, 0.1, 0.05, 0.01
  count: number;
}

export interface Donation {
  id: string;
  type: DonationType;
  source: DonationSource;
  amount: number;
  date: Date;
  userId?: string; // Para dízimos e doações especiais
  description?: string;
  registeredBy: string; // Quem registrou (para manuais)

  // Para doações de culto (manual)
  cultoData?: {
    billCounts: BillCount[];
    coinCounts: CoinCount[];
    notes?: string;
    countingMethod: CountingMethod;
  };

  // Para doações eletrônicas (automático)
  electronicData?: {
    transactionId: string;
    donorId?: string;
    donorName?: string;
    paymentMethod: 'pix' | 'cartao' | 'transferencia';
    bankInfo?: string;
    transactionDate: Date;
  };

  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCultoDonationData {
  date: Date;
  amount: number;
  registeredBy: string;
  billCounts?: BillCount[];
  coinCounts?: CoinCount[];
  countingMethod: CountingMethod;
  notes?: string;
  description?: string;
}

export interface CreateManualDonationData {
  type: 'tithe' | 'special';
  amount: number;
  date: Date;
  userId: string; // Identificação do doador
  registeredBy: string; // Quem registrou
  description?: string;
}

export interface CreateElectronicDonationData {
  transactionId: string;
  amount: number;
  paymentMethod: 'pix' | 'cartao' | 'transferencia';
  donorId?: string;
  donorName?: string;
  bankInfo?: string;
  transactionDate: Date;
  description?: string;
}

export interface UpdateDonationData {
  amount?: number;
  description?: string;
  notes?: string;
}

export interface DonationSummary {
  totalAmount: number;
  manualAmount: number;
  electronicAmount: number;
  donationCount: number;
  period: {
    start: Date;
    end: Date;
  };
}

export interface CultDonationSummary {
  cultDate: Date;
  manualAmount: number;
  electronicAmount: number;
  totalAmount: number;
  registeredBy: string;
  notes?: string;
}
