import { Category } from "./Category";
import { Organizer } from "./Organizer";

export interface Activity {
  id?: number;
  title: string;
  categoryId: number;
  categoryName?: string;
  organizerId: number;
  organizerName?: string;
  date: string;
  registrationDeadline: string;
  timeRange: string;
  location?: string;
  capacity: number;
  description?: string;
  photoUrl?: string;
  active: boolean;

}
