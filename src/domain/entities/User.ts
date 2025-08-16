export enum UserRole {
  ADMIN = 'admin',
  PASTOR = 'pastor',
  DEACON = 'deacon',
  LEADER = 'leader',
  MEMBER = 'member',
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  countryCode?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  id?: string;
  email: string;
  fullName: string;
  phone?: string;
  countryCode?: string;
  role: UserRole;
}

export interface UpdateUserData {
  fullName?: string;
  phone?: string;
  countryCode?: string;
  role?: UserRole;
}
