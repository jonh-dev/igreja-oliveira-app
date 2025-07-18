export type DonationType = 'gasofilaco' | 'pix' | 'cartao' | 'transferencia';
export type DonationSource = 'manual' | 'automatic';

export interface Donation {
  id: string;
  type: DonationType;
  source: DonationSource;
  amount: number;
  description?: string;
  
  // Para gasofilaço (manual)
  gasofilacoData?: {
    cultDate: Date;
    registeredBy: string; // userId do líder/diácono
    notes?: string;
  };
  
  // Para doações eletrônicas (automático)
  electronicData?: {
    transactionId: string;
    donorId?: string; // userId se identificado
    donorName?: string;
    paymentMethod: 'pix' | 'cartao' | 'transferencia';
    bankInfo?: string;
    transactionDate: Date;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateGasofilacoData {
  cultDate: Date;
  amount: number;
  registeredBy: string;
  description?: string;
  notes?: string;
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
  gasofilacoAmount: number;
  electronicAmount: number;
  donationCount: number;
  period: {
    start: Date;
    end: Date;
  };
}

export interface CultDonationSummary {
  cultDate: Date;
  gasofilacoAmount: number;
  electronicAmount: number;
  totalAmount: number;
  registeredBy: string;
  notes?: string;
}