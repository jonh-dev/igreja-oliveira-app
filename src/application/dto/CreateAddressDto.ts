export interface CreateAddressDto {
  userId: string;
  street: string;
  neighborhood: string;
  city: string;
  state?: string;
  zipCode: string;
  country?: string;
  isDefault?: boolean;
}