export interface Enrollment {
  id?: number;
  activityId: number;
  studentId: number;
  activityName?: string;
  studentName?: string;
  enrollmentDate: string;
  note?: string;
  status: EnrollmentStatus;
}

export enum EnrollmentStatus {
  Inscrito = 'Inscrito',
  Cancelado = 'Cancelado'
}
