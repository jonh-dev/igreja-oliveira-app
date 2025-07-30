import { Address, CreateAddressData, UpdateAddressData } from '../../../domain/entities/Address';

export interface IAddressRepository {
  findById(id: string): Promise<Address | null>;
  findByUserId(userId: string): Promise<Address[]>;
  findDefaultByUserId(userId: string): Promise<Address | null>;
  create(addressData: CreateAddressData): Promise<Address>;
  update(id: string, addressData: UpdateAddressData): Promise<Address>;
  delete(id: string): Promise<void>;
  setAsDefault(addressId: string, userId: string): Promise<void>;
}