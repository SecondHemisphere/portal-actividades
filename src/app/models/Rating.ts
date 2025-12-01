export interface Rating {
  id?: number;
  activityId: number;
  studentId: number;
  stars: number;
  comment?: string;
  date: string;
}