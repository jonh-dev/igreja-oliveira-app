import { Donation } from '../../../domain/entities/Donation';
import { IDonationRepository } from '../../interfaces/repositories/IDonationRepository';
import { CreateGasofilacoData } from '../../../domain/entities/Donation';

export class CreateGasofilacoUseCase {
  constructor(private readonly donationRepository: IDonationRepository) {}

  async execute(data: CreateGasofilacoData): Promise<Donation> {
    // Validações de domínio
    this.validateGasofilacoData(data);

    // Criar gasofilaço no repository
    return await this.donationRepository.createGasofilaco(data);
  }

  private validateGasofilacoData(data: CreateGasofilacoData): void {
    if (!data.cultDate) {
      throw new Error('Data do culto é obrigatória');
    }

    if (!data.amount || data.amount <= 0) {
      throw new Error('Valor deve ser maior que zero');
    }

    if (!data.registeredBy) {
      throw new Error('Usuário que registrou é obrigatório');
    }

    // Validar se a data do culto não é futura
    const today = new Date();
    if (data.cultDate > today) {
      throw new Error('Data do culto não pode ser futura');
    }

    // Validar se a data do culto não é muito antiga (mais de 1 ano)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    if (data.cultDate < oneYearAgo) {
      throw new Error('Data do culto não pode ser anterior a 1 ano');
    }

    // Validar valor máximo (R$ 1.000.000,00)
    if (data.amount > 1000000) {
      throw new Error('Valor máximo permitido é R$ 1.000.000,00');
    }
  }
} 