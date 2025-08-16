export interface IPhoneService {
  isPhoneAvailable(phone: string): Promise<boolean>;
}
