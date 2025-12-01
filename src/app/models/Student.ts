import { User } from './User';

export interface Student extends User {
  faculty: string;
  career: string;
  semester: number;
  modality: Modality;
  schedule: Schedule;
}

export enum Modality {
  Presencial = 'Presencial',
  Hibrida = 'Híbrida',
  Virtual = 'Virtual'
}

export enum Schedule {
  Matutina = 'Matutina',
  Vespertina = 'Vespertina',
  Nocturna = 'Nocturna'
}
