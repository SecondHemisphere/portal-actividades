export interface Activity {
  id?: number;
  title: string;
  categoryId: number;
  organizerId: number;
  date: string;
  duration: string;
  location: string;
  capacity: number;
  description: string;
  active: boolean;
}
