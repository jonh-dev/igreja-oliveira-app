export interface CreateDonationDto {
  userId: string;
  amount: number;
  description?: string;
}

export interface GetDonationsDto {
  userId?: string;
  limit?: number;
  offset?: number;
}