import { Component, Input } from '@angular/core';
import { Activity } from '../../../models/Activity';
import { ServActivitiesJson } from '../../../services/serv-activities-json';
import { Category } from '../../../models/Category';
import { Organizer } from '../../../models/Organizer';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Rating } from '../../../models/Rating';
import { Student } from '../../../models/Student';
import { ServRatingsJson } from '../../../services/serv-ratings-json';
import { ServCategoriesJson } from '../../../services/serv-categories-json';
import { ServOrganizersJson } from '../../../services/serv-organizers-json';
import { ServStudentsJson } from '../../../services/serv-students-json';

@Component({
  selector: 'app-activity-view',
  imports: [DatePipe, FormsModule, CommonModule],
  templateUrl: './activity-view.html',
  styleUrl: './activity-view.css',
})
export class ActivityView {

  activity!: Activity;
  categories: Category[] = [];
  organizers: Organizer[] = [];
  ratings: Rating[] = [];
  students: Student[] = [];
  availableCapacity = 0;

  studentId: number = 1; // ID del usuario actual
  rating: number = 0;    // Rating temporal para el review
  reviewText: string = '';

  isEnrolled: boolean = false;
  isMyActivity: boolean = false;
  canReview: boolean = false;

  role: 'student' | 'organizer' | 'public' = 'public';
   
  constructor(
    private activitiesService: ServActivitiesJson,
    private categoriesService: ServCategoriesJson,
    private organizersService: ServOrganizersJson,
    private studentsService: ServStudentsJson,
    private ratingsService: ServRatingsJson,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get("id"));
    this.activitiesService.getActivityById(id).subscribe((dato: Activity) => {
      this.activity = dato;
      this.loadRatings();
      this.loadCategories();
      this.loadOrganizers();
      this.loadStudents();
      this.checkEnrollment();
    });
  }

  loadRatings() {
    if (!this.activity) return;
    this.ratingsService.getRatingsByActivity(this.activity.id!).subscribe((data: Rating[]) => {
      this.ratings = data;
    });
  }

  loadCategories() {
    this.categoriesService.getCategories().subscribe((data: Category[]) => {
      this.categories = data;
    });
  }

  loadOrganizers() {
    this.organizersService.getOrganizers().subscribe((data: Organizer[]) => {
      this.organizers = data;
    });
  }

  loadStudents() {
    this.studentsService.getStudents().subscribe((data: Student[]) => {
      this.students = data;
    });
  }

  getCategoryName(): string {
    return this.categories.find(c => Number(c.id) === Number(this.activity.categoryId))?.name || 'Sin categoría';
  }

  getOrganizerName(): string {
    return this.organizers.find(o => Number(o.id) === Number(this.activity.organizerId))?.name || 'Sin organizador';
  }

  getStudentName(id: number): string {
    return this.students.find(s => Number(s.id) === Number(id))?.name || 'Estudiante Desconocido';
  }

  checkEnrollment() {
    // Aquí deberías comprobar en tu servicio si el estudiante está inscrito
    // Por ahora simulamos:
    this.isEnrolled = false; // cambiar según lógica real
    this.canReview = this.isEnrolled && !this.isRegistrationClosed();
  }

  enroll() {
    if (!this.activity) return;
    // Aquí agregarías la llamada a tu servicio de inscripciones
    console.log(`Estudiante ${this.studentId} se inscribe en actividad ${this.activity.id}`);
    this.isEnrolled = true;
    this.canReview = true;
  }

  cancelEnrollment() {
    if (!this.activity) return;
    console.log(`Estudiante ${this.studentId} cancela inscripción en actividad ${this.activity.id}`);
    this.isEnrolled = false;
    this.canReview = false;
  }

  edit() {
    this.router.navigate(['/activities/edit', this.activity.id]);
  }

  setRating(stars: number) {
    this.rating = stars;
  }

  submitReview() {
    if (!this.activity || this.rating <= 0) return;
    const newRating: Rating = {
      activityId: this.activity.id!,
      studentId: this.studentId,
      stars: this.rating,
      comment: this.reviewText,
      date: new Date().toISOString()
    };

    this.ratingsService.create(newRating).subscribe((r) => {
      console.log('Review enviada', r);
      this.ratings.push(r);
      this.rating = 0;
      this.reviewText = '';
    });
  }

  isRegistrationClosed(): boolean {
    if (!this.activity) return true;
    const deadline = new Date(this.activity.registrationDeadline);
    return deadline < new Date();
  }

  getAvailableCapacity(): number {
    return this.activity?.capacity || 0;
  }

}
