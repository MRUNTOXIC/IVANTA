export type UserRole = 'User' | 'Broker' | 'Builder';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

