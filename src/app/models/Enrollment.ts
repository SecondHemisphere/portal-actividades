export interface Enrollment {
  id?: number;
  activityId: number;
  studentId: number;
  date: string;
  note?: string;
  status: EnrollmentStatus;
}

export enum EnrollmentStatus {
  Inscrito = 'Inscrito',
  Cancelado = 'Cancelado'
}
