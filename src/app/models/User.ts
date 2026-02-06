export interface User {
  id?: number;
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: UserRole;
  photoUrl?: string;
  active: boolean;
}

export enum UserRole {
  Estudiante = 'Estudiante',
  Organizador = 'Organizador',
  Admin = 'Admin'
}