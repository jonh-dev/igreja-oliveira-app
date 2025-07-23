import { Donation } from '../../../domain/entities/Donation';
import { IDonationRepository } from '../../interfaces/repositories/IDonationRepository';
import { CreateGasofilacoDto } from '../../dto/CreateDonationDto';

export class CreateDonationUseCase {
  constructor(private readonly donationRepository: IDonationRepository) {}

  async execute(dto: CreateGasofilacoDto): Promise<Donation> {
    const { cultDate, amount, registeredBy, description, notes } = dto;

    if (!cultDate) {
      throw new Error('Cult date is required');
    }

    if (!amount || amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }

    if (!registeredBy) {
      throw new Error('Registered by is required');
    }

    if (!this.isValidAmount(amount)) {
      throw new Error('Amount must have at most 2 decimal places');
    }

    const gasofilacoData = {
      cultDate: new Date(cultDate),
      amount,
      registeredBy,
      description,
      notes
    };

    return await this.donationRepository.createGasofilaco(gasofilacoData);
  }

  private isValidAmount(amount: number): boolean {
    return Math.round(amount * 100) / 100 === amount;
  }
}