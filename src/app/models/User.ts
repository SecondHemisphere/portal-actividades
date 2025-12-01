export interface User {
  id?: number;
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: 'Estudiante' | 'Organizador' | 'Admin';
  active: boolean;
}
