export class CEP {
  private constructor(private readonly value: string) {}

  static create(cep: string): CEP {
    const cleanCep = this.cleanCEP(cep);
    
    if (!this.isValidFormat(cleanCep)) {
      throw new Error('CEP deve ter 8 dígitos numéricos');
    }

    return new CEP(cleanCep);
  }

  getValue(): string {
    return this.value;
  }

  getFormatted(): string {
    return `${this.value.substring(0, 5)}-${this.value.substring(5)}`;
  }

  private static cleanCEP(cep: string): string {
    return cep.replace(/\D/g, '');
  }

  private static isValidFormat(cep: string): boolean {
    return /^\d{8}$/.test(cep);
  }

  equals(other: CEP): boolean {
    return this.value === other.value;
  }
}