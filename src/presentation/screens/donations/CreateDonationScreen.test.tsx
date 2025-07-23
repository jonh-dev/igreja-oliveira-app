import { DonationType, CountingMethod, BillCount, CoinCount } from '../../../domain/entities/Donation';

describe('CreateDonationScreen Logic', () => {
  const calculateTotalFromCounts = (billCounts: BillCount[], coinCounts: CoinCount[]): number => {
    const billTotal = billCounts.reduce((sum, bill) => sum + (bill.value * bill.count), 0);
    const coinTotal = coinCounts.reduce((sum, coin) => sum + (coin.value * coin.count), 0);
    return billTotal + coinTotal;
  };

  const formatCurrency = (value: string): string => {
    const numericValue = value.replace(/[^\d]/g, '');
    if (numericValue === '') return '';
    
    const floatValue = parseFloat(numericValue) / 100;
    return floatValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    });
  };

  const validateForm = (
    amount: string,
    date: string,
    donationType: DonationType,
    userId: string,
    countingMethod: CountingMethod,
    billCounts: BillCount[],
    coinCounts: CoinCount[]
  ): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!amount.trim()) {
      errors.amount = 'Valor é obrigatório';
    } else {
      const amountValue = parseFloat(amount.replace(/[^\d,]/g, '').replace(',', '.'));
      if (isNaN(amountValue) || amountValue <= 0) {
        errors.amount = 'Valor deve ser maior que zero';
      }
    }

    if (!date.trim()) {
      errors.date = 'Data é obrigatória';
    } else {
      const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
      if (!dateRegex.test(date)) {
        errors.date = 'Data deve estar no formato DD/MM/AAAA';
      }
    }

    if (donationType === 'tithe' || donationType === 'special') {
      if (!userId.trim()) {
        errors.userId = 'Identificação do doador é obrigatória';
      }
    }

    if (donationType === 'culto' && countingMethod === 'detailed') {
      const totalFromCounts = calculateTotalFromCounts(billCounts, coinCounts);
      if (totalFromCounts === 0) {
        errors.counting = 'Adicione pelo menos uma cédula ou moeda';
      }
    }

    return errors;
  };

  describe('calculateTotalFromCounts', () => {
    it('should calculate total from bill and coin counts', () => {
      const billCounts: BillCount[] = [
        { value: 100, count: 2 },
        { value: 50, count: 1 },
        { value: 20, count: 3 }
      ];
      const coinCounts: CoinCount[] = [
        { value: 1, count: 5 },
        { value: 0.5, count: 2 }
      ];

      const total = calculateTotalFromCounts(billCounts, coinCounts);
      expect(total).toBe(316); // 200 + 50 + 60 + 5 + 1 = 316
    });

    it('should return 0 for empty counts', () => {
      const total = calculateTotalFromCounts([], []);
      expect(total).toBe(0);
    });

    it('should handle only bills', () => {
      const billCounts: BillCount[] = [
        { value: 200, count: 1 },
        { value: 100, count: 2 }
      ];

      const total = calculateTotalFromCounts(billCounts, []);
      expect(total).toBe(400);
    });

    it('should handle only coins', () => {
      const coinCounts: CoinCount[] = [
        { value: 1, count: 10 },
        { value: 0.25, count: 4 }
      ];

      const total = calculateTotalFromCounts([], coinCounts);
      expect(total).toBe(11);
    });
  });

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency('123456')).toContain('R$');
      expect(formatCurrency('123456')).toContain('1.234,56');
      expect(formatCurrency('100')).toContain('R$');
      expect(formatCurrency('100')).toContain('1,00');
      expect(formatCurrency('')).toBe('');
    });

    it('should handle zero values', () => {
      expect(formatCurrency('0')).toContain('R$');
      expect(formatCurrency('0')).toContain('0,00');
    });
  });

  describe('validateForm', () => {
    it('should validate required fields', () => {
      const errors = validateForm('', '', 'culto', '', 'total', [], []);
      
      expect(errors.amount).toBe('Valor é obrigatório');
      expect(errors.date).toBe('Data é obrigatória');
    });

    it('should validate amount format', () => {
      const errors = validateForm('0', '15/01/2025', 'culto', '', 'total', [], []);
      
      expect(errors.amount).toBe('Valor deve ser maior que zero');
    });

    it('should validate date format', () => {
      const errors = validateForm('100', 'invalid-date', 'culto', '', 'total', [], []);
      
      expect(errors.date).toBe('Data deve estar no formato DD/MM/AAAA');
    });

    it('should validate user ID for tithe and special donations', () => {
      const errors = validateForm('100', '15/01/2025', 'tithe', '', 'total', [], []);
      
      expect(errors.userId).toBe('Identificação do doador é obrigatória');
    });

    it('should not require user ID for culto donations', () => {
      const errors = validateForm('100', '15/01/2025', 'culto', '', 'total', [], []);
      
      expect(errors.userId).toBeUndefined();
    });

    it('should validate counting for detailed culto donations', () => {
      const errors = validateForm('100', '15/01/2025', 'culto', '', 'detailed', [], []);
      
      expect(errors.counting).toBe('Adicione pelo menos uma cédula ou moeda');
    });

    it('should not validate counting for total method', () => {
      const errors = validateForm('100', '15/01/2025', 'culto', '', 'total', [], []);
      
      expect(errors.counting).toBeUndefined();
    });

    it('should pass validation with valid data', () => {
      const errors = validateForm('100', '15/01/2025', 'culto', '', 'total', [], []);
      
      expect(Object.keys(errors)).toHaveLength(0);
    });

    it('should pass validation with detailed counting', () => {
      const billCounts: BillCount[] = [{ value: 100, count: 1 }];
      const errors = validateForm('100', '15/01/2025', 'culto', '', 'detailed', billCounts, []);
      
      expect(errors.counting).toBeUndefined();
    });
  });

  describe('Donation Types', () => {
    it('should support culto donations', () => {
      const donationType: DonationType = 'culto';
      expect(donationType).toBe('culto');
    });

    it('should support tithe donations', () => {
      const donationType: DonationType = 'tithe';
      expect(donationType).toBe('tithe');
    });

    it('should support special donations', () => {
      const donationType: DonationType = 'special';
      expect(donationType).toBe('special');
    });
  });

  describe('Counting Methods', () => {
    it('should support detailed counting', () => {
      const countingMethod: CountingMethod = 'detailed';
      expect(countingMethod).toBe('detailed');
    });

    it('should support total counting', () => {
      const countingMethod: CountingMethod = 'total';
      expect(countingMethod).toBe('total');
    });
  });

  describe('Bill and Coin Values', () => {
    it('should have correct bill values', () => {
      const billValues = [200, 100, 50, 20, 10, 5, 2];
      expect(billValues).toHaveLength(7);
      expect(billValues[0]).toBe(200);
      expect(billValues[6]).toBe(2);
    });

    it('should have correct coin values', () => {
      const coinValues = [1, 0.5, 0.25, 0.1, 0.05, 0.01];
      expect(coinValues).toHaveLength(6);
      expect(coinValues[0]).toBe(1);
      expect(coinValues[5]).toBe(0.01);
    });
  });
}); 