import { Donation } from '../../../domain/entities/Donation';
import { IDonationRepository } from '../../interfaces/repositories/IDonationRepository';
import { CreateDonationDto } from '../../dto/CreateDonationDto';

export class CreateDonationUseCase {
  constructor(private readonly donationRepository: IDonationRepository) {}

  async execute(dto: CreateDonationDto): Promise<Donation> {
    const { userId, amount, description } = dto;

    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!amount || amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }

    if (!this.isValidAmount(amount)) {
      throw new Error('Amount must have at most 2 decimal places');
    }

    const donationData = {
      userId,
      amount,
      description
    };

    return await this.donationRepository.create(donationData);
  }

  private isValidAmount(amount: number): boolean {
    return Math.round(amount * 100) / 100 === amount;
  }
}