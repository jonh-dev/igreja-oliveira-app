export interface Address {
  id: string;
  userId: string;
  street: string;
  neighborhood: string;
  city: string;
  state?: string;
  zipCode?: string;
  country?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAddressData {
  userId: string;
  street: string;
  neighborhood: string;
  city: string;
  state?: string;
  zipCode?: string;
  country?: string;
  isDefault?: boolean;
}

export interface UpdateAddressData {
  street?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  isDefault?: boolean;
}