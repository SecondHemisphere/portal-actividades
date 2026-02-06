import { User } from './User';

export interface Student extends User {
  facultyId?: number;
  facultyName?: string;
  careerId?: number;
  careerName?: string;
  semester?: number;
  modality?: Modality;
  schedule?: Schedule;

  faculty?: Faculty;
  career?: Career;
}

export interface Career {
  id: number;
  name: string;
  facultyId: number;
}

export interface Faculty {
  id: number;
  name: string;
  careers?: Career[];
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
