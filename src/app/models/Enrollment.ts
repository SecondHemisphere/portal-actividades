export interface Enrollment {
  id?: number;
  activityId: number;
  studentId: number;
  date: string;
  note?: string;
  status: EnrollmentStatus;
}

export enum EnrollmentStatus {
  Pendiente = 'Pendiente',
  Confirmada = 'Confirmada',
  Cancelada = 'Cancelada'
}
