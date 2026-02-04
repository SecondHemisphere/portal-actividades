import { Activity } from "./Activity";
import { Student } from "./Student";

export interface Enrollment {
  id?: number;
  activityId: number;
  studentId: number;
  activityName?: string;
  studentName?: string;
  enrollmentDate: string;
  note?: string;
  status: EnrollmentStatus;

  activity?: Activity;
  student?: Student;
}

export enum EnrollmentStatus {
  Inscrito = 'Inscrito',
  Cancelado = 'Cancelado'
}
