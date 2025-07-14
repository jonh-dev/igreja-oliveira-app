export interface Donation {
  id: string;
  userId: string;
  amount: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDonationData {
  userId: string;
  amount: number;
  description?: string;
}

export interface UpdateDonationData {
  amount?: number;
  description?: string;
}