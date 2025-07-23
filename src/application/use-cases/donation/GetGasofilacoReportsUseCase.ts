import { IDonationRepository } from '../../interfaces/repositories/IDonationRepository';
import { DonationSummary, CultDonationSummary } from '../../../domain/entities/Donation';

export interface GetGasofilacoReportsDto {
  startDate: Date;
  endDate: Date;
  groupBy?: 'day' | 'week' | 'month' | 'cult';
  limit?: number;
  offset?: number;
}

export interface GasofilacoReport {
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    totalAmount: number;
    totalCults: number;
    averagePerCult: number;
    highestAmount: number;
    lowestAmount: number;
  };
  cults: CultDonationSummary[];
}

export class GetGasofilacoReportsUseCase {
  constructor(private readonly donationRepository: IDonationRepository) {}

  async execute(dto: GetGasofilacoReportsDto): Promise<GasofilacoReport> {
    // Validações
    this.validateReportRequest(dto);

    // Buscar doações de gasofilaço no período
    const donations = await this.donationRepository.findAll({
      limit: dto.limit || 1000,
      offset: dto.offset || 0,
    });

    // Filtrar apenas gasofilaços no período
    const gasofilacoDonations = donations.filter(donation => {
      return (
        donation.type === 'gasofilaco' &&
        donation.gasofilacoData &&
        donation.gasofilacoData.cultDate >= dto.startDate &&
        donation.gasofilacoData.cultDate <= dto.endDate
      );
    });

    // Agrupar por culto
    const cultsMap = new Map<string, CultDonationSummary>();
    
    gasofilacoDonations.forEach(donation => {
      if (!donation.gasofilacoData) return;
      
      const cultDate = donation.gasofilacoData.cultDate;
      const cultKey = cultDate.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (!cultsMap.has(cultKey)) {
        cultsMap.set(cultKey, {
          cultDate: cultDate,
          gasofilacoAmount: 0,
          electronicAmount: 0,
          totalAmount: 0,
          registeredBy: donation.gasofilacoData.registeredBy,
          notes: donation.gasofilacoData.notes,
        });
      }
      
      const cult = cultsMap.get(cultKey)!;
      cult.gasofilacoAmount += donation.amount;
      cult.totalAmount += donation.amount;
    });

    // Converter para array e ordenar por data
    const cults = Array.from(cultsMap.values()).sort((a, b) => 
      a.cultDate.getTime() - b.cultDate.getTime()
    );

    // Calcular estatísticas
    const totalAmount = cults.reduce((sum, cult) => sum + cult.totalAmount, 0);
    const amounts = cults.map(cult => cult.totalAmount);
    const highestAmount = amounts.length > 0 ? Math.max(...amounts) : 0;
    const lowestAmount = amounts.length > 0 ? Math.min(...amounts) : 0;

    return {
      period: {
        start: dto.startDate,
        end: dto.endDate,
      },
      summary: {
        totalAmount,
        totalCults: cults.length,
        averagePerCult: cults.length > 0 ? totalAmount / cults.length : 0,
        highestAmount,
        lowestAmount,
      },
      cults,
    };
  }

  private validateReportRequest(dto: GetGasofilacoReportsDto): void {
    if (!dto.startDate) {
      throw new Error('Data inicial é obrigatória');
    }

    if (!dto.endDate) {
      throw new Error('Data final é obrigatória');
    }

    if (dto.startDate > dto.endDate) {
      throw new Error('Data inicial não pode ser posterior à data final');
    }

    // Validar período máximo (2 anos)
    const maxPeriod = new Date();
    maxPeriod.setFullYear(maxPeriod.getFullYear() - 2);
    
    if (dto.startDate < maxPeriod) {
      throw new Error('Período máximo permitido é de 2 anos');
    }

    // Validar período mínimo (1 dia)
    const oneDay = 24 * 60 * 60 * 1000;
    if (dto.endDate.getTime() - dto.startDate.getTime() < oneDay) {
      throw new Error('Período mínimo é de 1 dia');
    }

    if (dto.limit && (dto.limit < 1 || dto.limit > 1000)) {
      throw new Error('Limit deve estar entre 1 e 1000');
    }

    if (dto.offset && dto.offset < 0) {
      throw new Error('Offset deve ser não negativo');
    }
  }
} 