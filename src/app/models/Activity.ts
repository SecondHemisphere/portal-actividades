export interface Activity {
  id?: number;
  title: string;
  categoryId: number;
  organizerId: number;
  date: string;
  timeRange: string;
  location: string;
  capacity: number;
  description: string;
  photoUrl?: string;
  active: boolean;
}
