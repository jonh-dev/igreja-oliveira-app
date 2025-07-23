import { GetGasofilacoReportsUseCase, GetGasofilacoReportsDto } from './GetGasofilacoReportsUseCase';
import { Donation } from '../../../domain/entities/Donation';

describe('GetGasofilacoReportsUseCase', () => {
  let useCase: GetGasofilacoReportsUseCase;
  let mockRepository: jest.Mocked<any>;

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
    };
    useCase = new GetGasofilacoReportsUseCase(mockRepository);
  });

  it('should generate report with valid data', async () => {
    const startDate = new Date('2025-01-01');
    const endDate = new Date('2025-01-31');
    
    const mockDonations: Donation[] = [
      {
        id: '1',
        type: 'gasofilaco',
        source: 'manual',
        amount: 500.50,
        gasofilacoData: {
          cultDate: new Date('2025-01-05T10:00:00'),
          registeredBy: 'user-1',
          notes: 'Culto dominical',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        type: 'gasofilaco',
        source: 'manual',
        amount: 750.25,
        gasofilacoData: {
          cultDate: new Date('2025-01-12T10:00:00'),
          registeredBy: 'user-2',
          notes: 'Culto de oração',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockRepository.findAll.mockResolvedValue(mockDonations);

    const dto: GetGasofilacoReportsDto = {
      startDate,
      endDate,
    };

    const result = await useCase.execute(dto);

    expect(result.period.start).toEqual(startDate);
    expect(result.period.end).toEqual(endDate);
    expect(result.summary.totalAmount).toBe(1250.75);
    expect(result.summary.totalCults).toBe(2);
    expect(result.summary.averagePerCult).toBe(625.375);
    expect(result.summary.highestAmount).toBe(750.25);
    expect(result.summary.lowestAmount).toBe(500.50);
    expect(result.cults).toHaveLength(2);
    expect(result.cults[0].cultDate).toEqual(new Date('2025-01-05T10:00:00'));
    expect(result.cults[1].cultDate).toEqual(new Date('2025-01-12T10:00:00'));
  });

  it('should filter only gasofilaco donations in period', async () => {
    const startDate = new Date('2025-01-01');
    const endDate = new Date('2025-01-31');
    
    const mockDonations: Donation[] = [
      {
        id: '1',
        type: 'gasofilaco',
        source: 'manual',
        amount: 500.50,
        gasofilacoData: {
          cultDate: new Date('2025-01-05'),
          registeredBy: 'user-1',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        type: 'pix',
        source: 'automatic',
        amount: 100.00,
        electronicData: {
          transactionId: 'tx-1',
          paymentMethod: 'pix',
          transactionDate: new Date('2025-01-10'),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '3',
        type: 'gasofilaco',
        source: 'manual',
        amount: 750.25,
        gasofilacoData: {
          cultDate: new Date('2025-02-05'), // Fora do período
          registeredBy: 'user-2',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockRepository.findAll.mockResolvedValue(mockDonations);

    const dto: GetGasofilacoReportsDto = {
      startDate,
      endDate,
    };

    const result = await useCase.execute(dto);

    expect(result.summary.totalAmount).toBe(500.50);
    expect(result.summary.totalCults).toBe(1);
    expect(result.cults).toHaveLength(1);
    expect(result.cults[0].cultDate).toEqual(new Date('2025-01-05'));
  });

  it('should group multiple donations by same cult date', async () => {
    const startDate = new Date('2025-01-01');
    const endDate = new Date('2025-01-31');
    
    const mockDonations: Donation[] = [
      {
        id: '1',
        type: 'gasofilaco',
        source: 'manual',
        amount: 500.50,
        gasofilacoData: {
          cultDate: new Date('2025-01-05'),
          registeredBy: 'user-1',
          notes: 'Primeira contagem',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        type: 'gasofilaco',
        source: 'manual',
        amount: 250.25,
        gasofilacoData: {
          cultDate: new Date('2025-01-05'), // Mesmo culto
          registeredBy: 'user-2',
          notes: 'Segunda contagem',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockRepository.findAll.mockResolvedValue(mockDonations);

    const dto: GetGasofilacoReportsDto = {
      startDate,
      endDate,
    };

    const result = await useCase.execute(dto);

    expect(result.summary.totalAmount).toBe(750.75);
    expect(result.summary.totalCults).toBe(1);
    expect(result.cults).toHaveLength(1);
    expect(result.cults[0].gasofilacoAmount).toBe(750.75);
  });

  it('should throw error when start date is missing', async () => {
    const dto: GetGasofilacoReportsDto = {
      startDate: null as any,
      endDate: new Date('2025-01-31'),
    };

    await expect(useCase.execute(dto)).rejects.toThrow('Data inicial é obrigatória');
  });

  it('should throw error when end date is missing', async () => {
    const dto: GetGasofilacoReportsDto = {
      startDate: new Date('2025-01-01'),
      endDate: null as any,
    };

    await expect(useCase.execute(dto)).rejects.toThrow('Data final é obrigatória');
  });

  it('should throw error when start date is after end date', async () => {
    const dto: GetGasofilacoReportsDto = {
      startDate: new Date('2025-01-31'),
      endDate: new Date('2025-01-01'),
    };

    await expect(useCase.execute(dto)).rejects.toThrow('Data inicial não pode ser posterior à data final');
  });

  it('should throw error when period is too old (more than 2 years)', async () => {
    const oldDate = new Date();
    oldDate.setFullYear(oldDate.getFullYear() - 3);

    const dto: GetGasofilacoReportsDto = {
      startDate: oldDate,
      endDate: new Date('2025-01-31'),
    };

    await expect(useCase.execute(dto)).rejects.toThrow('Período máximo permitido é de 2 anos');
  });

  it('should throw error when period is less than 1 day', async () => {
    const sameDate = new Date('2025-01-01');
    
    const dto: GetGasofilacoReportsDto = {
      startDate: sameDate,
      endDate: sameDate,
    };

    await expect(useCase.execute(dto)).rejects.toThrow('Período mínimo é de 1 dia');
  });

  it('should throw error when limit is invalid', async () => {
    const dto: GetGasofilacoReportsDto = {
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-31'),
      limit: 1500, // Valor maior que 1000
    };

    // Não mockar o repository pois a validação deve falhar antes
    await expect(useCase.execute(dto)).rejects.toThrow('Limit deve estar entre 1 e 1000');
  });

  it('should throw error when offset is negative', async () => {
    const dto: GetGasofilacoReportsDto = {
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-31'),
      offset: -1,
    };

    await expect(useCase.execute(dto)).rejects.toThrow('Offset deve ser não negativo');
  });

  it('should handle empty results', async () => {
    const startDate = new Date('2025-01-01');
    const endDate = new Date('2025-01-31');
    
    mockRepository.findAll.mockResolvedValue([]);

    const dto: GetGasofilacoReportsDto = {
      startDate,
      endDate,
    };

    const result = await useCase.execute(dto);

    expect(result.summary.totalAmount).toBe(0);
    expect(result.summary.totalCults).toBe(0);
    expect(result.summary.averagePerCult).toBe(0);
    expect(result.summary.highestAmount).toBe(0);
    expect(result.summary.lowestAmount).toBe(0);
    expect(result.cults).toHaveLength(0);
  });

  it('should handle repository errors', async () => {
    const dto: GetGasofilacoReportsDto = {
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-31'),
    };

    const repositoryError = new Error('Database connection failed');
    mockRepository.findAll.mockRejectedValue(repositoryError);

    await expect(useCase.execute(dto)).rejects.toThrow('Database connection failed');
  });
}); 