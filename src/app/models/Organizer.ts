import { User } from './User';

export interface Organizer extends User {
  department: string;
  position: string; // Cargo institucional
  bio: string; // Descripción breve
  shifts: ShiftType[]; // Turno
  workDays: WeekDay[]; // Días
  photoUrl?: string;
}

export enum ShiftType {
  Manana = 'Mañana',
  Tarde = 'Tarde',
  Noche = 'Noche'
}

export enum WeekDay {
  Lunes = 'Lunes',
  Martes = 'Martes',
  Miercoles = 'Miércoles',
  Jueves = 'Jueves',
  Viernes = 'Viernes',
  Sabado = 'Sábado',
  Domingo = 'Domingo'
}