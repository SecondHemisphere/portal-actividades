export interface Enrollment {
  id?: number;
  activityId: number;
  studentId: number;
  date: string;
  status: 'Pendiente' | 'Confirmada' | 'Cancelada';
}
