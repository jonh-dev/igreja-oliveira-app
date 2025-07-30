import { IDonationRepository } from '../../interfaces/repositories/IDonationRepository';
import { Donation } from '../../../domain/entities/Donation';

export interface GetDonationsDto {
  limit?: number;
  offset?: number;
}

export class GetDonationsUseCase {
  constructor(private donationRepository: IDonationRepository) {}

  async execute(dto: GetDonationsDto): Promise<Donation[]> {
    const { limit, offset } = dto;

    // Por enquanto, retornamos todas as doações
    // Futuramente podemos implementar paginação no repository
    const donations = await this.donationRepository.findAll();
    
    // Aplicar paginação manualmente se necessário
    if (limit || offset) {
      const start = offset || 0;
      const end = limit ? start + limit : undefined;
      return donations.slice(start, end);
    }

    return donations;
  }
}