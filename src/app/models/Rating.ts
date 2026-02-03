import { Activity } from "./Activity";
import { Student } from "./Student";

export interface Rating {
  id?: number;
  activityId: number;
  studentId: number;
  activityName?: string;
  studentName?: string;
  stars: number;
  comment?: string;
  ratingDate: string;

  activity?: Activity;
  student?: Student;
}