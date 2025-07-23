import { CreateGasofilacoUseCase } from './CreateGasofilacoUseCase';
import { CreateGasofilacoData } from '../../../domain/entities/Donation';

describe('CreateGasofilacoUseCase', () => {
  let useCase: CreateGasofilacoUseCase;
  let mockRepository: jest.Mocked<any>;

  beforeEach(() => {
    mockRepository = {
      createGasofilaco: jest.fn(),
    };
    useCase = new CreateGasofilacoUseCase(mockRepository);
  });

  it('should create gasofilaco with valid data', async () => {
    const validData: CreateGasofilacoData = {
      cultDate: new Date('2025-01-15'),
      amount: 500.50,
      registeredBy: 'user-123',
      description: 'Gasofilaço do culto dominical',
      notes: 'Culto muito abençoado',
    };

    const expectedDonation = {
      id: 'donation-123',
      type: 'gasofilaco',
      source: 'manual',
      amount: 500.50,
      description: 'Gasofilaço do culto dominical',
      gasofilacoData: {
        cultDate: new Date('2025-01-15'),
        registeredBy: 'user-123',
        notes: 'Culto muito abençoado',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockRepository.createGasofilaco.mockResolvedValue(expectedDonation);

    const result = await useCase.execute(validData);

    expect(result).toEqual(expectedDonation);
    expect(mockRepository.createGasofilaco).toHaveBeenCalledWith(validData);
  });

  it('should throw error when cult date is missing', async () => {
    const invalidData: CreateGasofilacoData = {
      cultDate: null as any,
      amount: 500.50,
      registeredBy: 'user-123',
    };

    await expect(useCase.execute(invalidData)).rejects.toThrow('Data do culto é obrigatória');
  });

  it('should throw error when amount is zero', async () => {
    const invalidData: CreateGasofilacoData = {
      cultDate: new Date('2025-01-15'),
      amount: 0,
      registeredBy: 'user-123',
    };

    await expect(useCase.execute(invalidData)).rejects.toThrow('Valor deve ser maior que zero');
  });

  it('should throw error when amount is negative', async () => {
    const invalidData: CreateGasofilacoData = {
      cultDate: new Date('2025-01-15'),
      amount: -100,
      registeredBy: 'user-123',
    };

    await expect(useCase.execute(invalidData)).rejects.toThrow('Valor deve ser maior que zero');
  });

  it('should throw error when registered by is missing', async () => {
    const invalidData: CreateGasofilacoData = {
      cultDate: new Date('2025-01-15'),
      amount: 500.50,
      registeredBy: '',
    };

    await expect(useCase.execute(invalidData)).rejects.toThrow('Usuário que registrou é obrigatório');
  });

  it('should throw error when cult date is in the future', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);

    const invalidData: CreateGasofilacoData = {
      cultDate: futureDate,
      amount: 500.50,
      registeredBy: 'user-123',
    };

    await expect(useCase.execute(invalidData)).rejects.toThrow('Data do culto não pode ser futura');
  });

  it('should throw error when cult date is too old (more than 1 year)', async () => {
    const oldDate = new Date();
    oldDate.setFullYear(oldDate.getFullYear() - 2);

    const invalidData: CreateGasofilacoData = {
      cultDate: oldDate,
      amount: 500.50,
      registeredBy: 'user-123',
    };

    await expect(useCase.execute(invalidData)).rejects.toThrow('Data do culto não pode ser anterior a 1 ano');
  });

  it('should throw error when amount exceeds maximum limit', async () => {
    const invalidData: CreateGasofilacoData = {
      cultDate: new Date('2025-01-15'),
      amount: 2000000, // R$ 2.000.000,00
      registeredBy: 'user-123',
    };

    await expect(useCase.execute(invalidData)).rejects.toThrow('Valor máximo permitido é R$ 1.000.000,00');
  });

  it('should accept amount at maximum limit', async () => {
    const validData: CreateGasofilacoData = {
      cultDate: new Date('2025-01-15'),
      amount: 1000000, // R$ 1.000.000,00 (máximo permitido)
      registeredBy: 'user-123',
    };

    const expectedDonation = {
      id: 'donation-123',
      type: 'gasofilaco',
      source: 'manual',
      amount: 1000000,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockRepository.createGasofilaco.mockResolvedValue(expectedDonation);

    const result = await useCase.execute(validData);

    expect(result).toEqual(expectedDonation);
    expect(mockRepository.createGasofilaco).toHaveBeenCalledWith(validData);
  });

  it('should accept valid data with optional fields', async () => {
    const validData: CreateGasofilacoData = {
      cultDate: new Date('2025-01-15'),
      amount: 500.50,
      registeredBy: 'user-123',
      // description e notes são opcionais
    };

    const expectedDonation = {
      id: 'donation-123',
      type: 'gasofilaco',
      source: 'manual',
      amount: 500.50,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockRepository.createGasofilaco.mockResolvedValue(expectedDonation);

    const result = await useCase.execute(validData);

    expect(result).toEqual(expectedDonation);
    expect(mockRepository.createGasofilaco).toHaveBeenCalledWith(validData);
  });

  it('should handle repository errors', async () => {
    const validData: CreateGasofilacoData = {
      cultDate: new Date('2025-01-15'),
      amount: 500.50,
      registeredBy: 'user-123',
    };

    const repositoryError = new Error('Database connection failed');
    mockRepository.createGasofilaco.mockRejectedValue(repositoryError);

    await expect(useCase.execute(validData)).rejects.toThrow('Database connection failed');
  });
}); 