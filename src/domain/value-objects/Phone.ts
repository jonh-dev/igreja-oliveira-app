export class Phone {
  private constructor(
    private readonly value: string,
    private readonly countryCode: string
  ) {}

  static create(
    phoneNumber: string,
    countryCode: string = '+55'
  ): Phone | null {
    if (!phoneNumber || !countryCode) {
      return null;
    }

    const formattedCountryCode = countryCode.startsWith('+')
      ? countryCode
      : `+${countryCode}`;

    const digitsOnly = phoneNumber.replace(/\D/g, '');
    const internationalNumber = formattedCountryCode + digitsOnly;
    if (!Phone.isValid(internationalNumber)) {
      return null;
    }

    return new Phone(internationalNumber, formattedCountryCode);
  }

  static fromInternational(internationalNumber: string): Phone | null {
    if (!internationalNumber || !Phone.isValid(internationalNumber)) {
      return null;
    }

    const match = internationalNumber.match(/^(\+\d{1,4})/);
    if (!match) {
      return null;
    }

    const countryCode = match[1];
    return new Phone(internationalNumber, countryCode);
  }

  static isValid(phoneNumber: string): boolean {
    if (!phoneNumber) return false;

    if (phoneNumber.startsWith('+55')) {
      return Phone.isValidBrazilian(phoneNumber);
    }

    if (phoneNumber.startsWith('+1')) {
      return /^\+1[2-9]\d{2}[2-9]\d{6}$/.test(phoneNumber);
    }

    return /^\+[1-9]\d{6,18}$/.test(phoneNumber);
  }

  static isValidBrazilian(phoneNumber: string): boolean {
    if (!phoneNumber.startsWith('+55')) {
      return false;
    }

    const digits = phoneNumber.substring(3);

    if (digits.length < 10 || digits.length > 11) {
      return false;
    }

    const areaCode = parseInt(digits.substring(0, 2));
    if (areaCode < 11 || areaCode > 99) {
      return false;
    }

    if (digits.length === 11) {
      return digits[2] === '9';
    }

    if (digits.length === 10) {
      const firstDigitOfNumber = digits[2];
      return firstDigitOfNumber !== '0' && firstDigitOfNumber !== '1';
    }

    return false;
  }

  getValue(): string {
    return this.value;
  }

  getCountryCode(): string {
    return this.countryCode;
  }

  getLocalNumber(): string {
    return this.value.substring(this.countryCode.length);
  }

  getFormattedBrazilian(): string {
    if (!this.value.startsWith('+55')) {
      return this.value;
    }

    const localNumber = this.getLocalNumber();
    if (localNumber.length < 10) {
      return this.value;
    }

    const areaCode = localNumber.substring(0, 2);
    const number = localNumber.substring(2);

    if (number.length === 9) {
      return `+55 (${areaCode}) ${number.substring(0, 5)}-${number.substring(5)}`;
    } else if (number.length === 8) {
      return `+55 (${areaCode}) ${number.substring(0, 4)}-${number.substring(4)}`;
    }

    return this.value;
  }

  getFormattedDisplay(): string {
    if (this.value.startsWith('+55')) {
      return this.getFormattedBrazilian();
    }

    return this.value;
  }

  isMobile(): boolean {
    if (this.value.startsWith('+55')) {
      const localNumber = this.getLocalNumber();
      return localNumber.length === 11 && localNumber[2] === '9';
    }

    return true;
  }

  isLandline(): boolean {
    if (this.value.startsWith('+55')) {
      const localNumber = this.getLocalNumber();
      return localNumber.length === 10;
    }

    return false;
  }

  getWhatsAppUrl(message?: string): string {
    const phoneForWhatsApp = this.value.substring(1);
    const encodedMessage = message ? encodeURIComponent(message) : '';

    return `https://wa.me/${phoneForWhatsApp}${message ? `?text=${encodedMessage}` : ''}`;
  }

  equals(other: Phone): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
