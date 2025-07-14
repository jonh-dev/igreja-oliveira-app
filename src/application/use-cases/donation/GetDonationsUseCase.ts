import { Donation } from '../../../domain/entities/Donation';
import { IDonationRepository } from '../../interfaces/repositories/IDonationRepository';
import { GetDonationsDto } from '../../dto/CreateDonationDto';

export class GetDonationsUseCase {
  constructor(private readonly donationRepository: IDonationRepository) {}

  async execute(dto: GetDonationsDto = {}): Promise<Donation[]> {
    const { userId, limit = 50, offset = 0 } = dto;

    // Validações de negócio
    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }

    if (offset < 0) {
      throw new Error('Offset must be non-negative');
    }

    if (userId) {
      return await this.donationRepository.findByUserId(userId, { limit, offset });
    }

    return await this.donationRepository.findAll({ limit, offset });
  }
}