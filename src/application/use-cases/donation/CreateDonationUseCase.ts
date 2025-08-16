import { IDonationRepository } from '../../interfaces/repositories/IDonationRepository';
import {
  CreateCultoDonationDto,
  CreateManualDonationDto,
} from '../../dto/CreateDonationDto';
import {
  CreateCultoDonationData,
  CreateManualDonationData,
} from '../../../domain/entities/Donation';

export class CreateDonationUseCase {
  constructor(private donationRepository: IDonationRepository) {}

  async executeCultoDonation(dto: CreateCultoDonationDto): Promise<void> {
    const cultoData: CreateCultoDonationData = {
      date: this.parseDate(dto.date),
      amount: dto.amount,
      registeredBy: dto.registeredBy,
      billCounts: dto.billCounts || [],
      coinCounts: dto.coinCounts || [],
      countingMethod: dto.countingMethod,
      notes: dto.notes,
      description: dto.description,
    };

    await this.donationRepository.createCultoDonation(cultoData);
  }

  async executeManualDonation(dto: CreateManualDonationDto): Promise<void> {
    const manualData: CreateManualDonationData = {
      type: dto.type,
      amount: dto.amount,
      date: this.parseDate(dto.date),
      userId: dto.userId,
      registeredBy: dto.registeredBy,
      description: dto.description,
    };

    await this.donationRepository.createManualDonation(manualData);
  }

  private parseDate(dateString: string): Date {
    const [day, month, year] = dateString.split('/');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
}
