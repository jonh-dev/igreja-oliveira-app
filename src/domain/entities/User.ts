export enum UserRole {
  ADMIN = 'admin',
  PASTOR = 'pastor',
  DEACON = 'deacon',
  LEADER = 'leader',
  MEMBER = 'member'
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
}

export interface UpdateUserData {
  fullName?: string;
  phone?: string;
  role?: UserRole;
}