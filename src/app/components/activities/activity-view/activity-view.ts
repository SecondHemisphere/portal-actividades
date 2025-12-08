import { Component } from '@angular/core';
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
import { AuthService } from '../../../services/auth/auth-service';
import { UserRole } from '../../../models/User';
import { ServEnrollmentsJson } from '../../../services/serv-enrollments-json';
import { Enrollment, EnrollmentStatus } from '../../../models/Enrollment';

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

  userId: number = 0;
  role: 'student' | 'organizer' | 'public' = 'public';

  isEnrolled: boolean = false;
  isMyActivity: boolean = false;
  canReview: boolean = false;

  currentEnrollment?: Enrollment;

  rating: number = 0;
  reviewText: string = '';

  constructor(
    private activitiesService: ServActivitiesJson,
    private categoriesService: ServCategoriesJson,
    private organizersService: ServOrganizersJson,
    private studentsService: ServStudentsJson,
    private enrollmentsService: ServEnrollmentsJson,
    private ratingsService: ServRatingsJson,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCurrentUser();

    const id = Number(this.route.snapshot.paramMap.get("id"));

    this.activitiesService.getActivityById(id).subscribe(activity => {
      this.activity = activity;

      this.loadCategories();
      this.loadOrganizers();
      this.loadStudents();
      this.loadRatings();

      this.checkEnrollment();
      this.checkOrganizerOwnership();
    });
  }

  loadCurrentUser() {
    const user = this.authService.getCurrentUserValue();

    if (!user) {
      this.role = 'public';
      return;
    }

    this.userId = Number(user.id);

    if (user.role === UserRole.Estudiante) this.role = 'student';
    else if (user.role === UserRole.Organizador) this.role = 'organizer';
    else this.role = 'public';
  }

  loadRatings() {
    if (!this.activity) return;
    this.ratingsService.getRatingsByActivity(this.activity.id!)
      .subscribe(data => this.ratings = data);
  }

  loadCategories() {
    this.categoriesService.getCategories()
      .subscribe(data => this.categories = data);
  }

  loadOrganizers() {
    this.organizersService.getOrganizers()
      .subscribe(data => this.organizers = data);
  }

  loadStudents() {
    this.studentsService.getStudents()
      .subscribe(data => this.students = data);
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
    if (this.role !== 'student') {
      this.isEnrolled = false;
      return;
    }

    this.enrollmentsService
      .getEnrollmentsByStudent(this.userId)
      .subscribe(enrollments => {
        const active = enrollments.find(e =>
          e.activityId == this.activity.id &&
          e.status === EnrollmentStatus.Inscrito
        );

        this.currentEnrollment = active;
        this.isEnrolled = !!active;

        this.checkIfCanReview();
      });
  }

  checkOrganizerOwnership() {
    if (this.role !== 'organizer') {
      this.isMyActivity = false;
      return;
    }

    this.isMyActivity = Number(this.activity.organizerId) === Number(this.userId);
  }

  hasActivityEnded(): boolean {
    const eventDate = new Date(this.activity.date);
    return eventDate < new Date();
  }

  checkIfCanReview() {
    this.canReview =
      this.role === 'student' &&
      this.isEnrolled &&
      this.hasActivityEnded();
  }

  enroll() {
    if (this.role !== 'student') return;

    if (!this.activity) {
      alert('No se ha cargado la actividad todavía.');
      return;
    }

    if (this.isRegistrationClosed()) {
      alert('Las inscripciones están cerradas.');
      return;
    }

    const confirmed = window.confirm('¿Estás seguro de que deseas inscribirte en esta actividad?');
    if (!confirmed) return;

    this.enrollmentsService.getEnrollmentsByStudent(this.userId).subscribe(enrollments => {
      const existing = enrollments.find(e =>
        e.activityId === this.activity.id && e.studentId === this.userId
      );

      if (existing) {
        if (existing.status === EnrollmentStatus.Inscrito) {
          this.isEnrolled = true;
          this.currentEnrollment = existing;
          this.checkIfCanReview();
          alert('Ya estás inscrito en esta actividad.');
          return;
        }

        if (existing.status === EnrollmentStatus.Cancelado) {
          const updated: Enrollment = {
            ...existing,
            status: EnrollmentStatus.Inscrito,
            date: new Date().toISOString()
          };

          this.enrollmentsService.update(updated).subscribe(e => {
            this.isEnrolled = true;
            this.currentEnrollment = e;
            this.checkIfCanReview();
            alert('Tu inscripción ha sido reactivada.');
          });
          return;
        }
      }

      const enrollment: Omit<Enrollment, 'id'> = {
        activityId: this.activity.id!,
        studentId: this.userId,
        date: new Date().toISOString(),
        status: EnrollmentStatus.Inscrito
      };

      this.enrollmentsService.create(enrollment).subscribe(e => {
        this.isEnrolled = true;
        this.currentEnrollment = e;
        this.checkIfCanReview();
        alert('Te has inscrito correctamente.');
      });
    });
  }

  cancelEnrollment() {
    if (!this.currentEnrollment) {
      alert('No tienes una inscripción activa para cancelar.');
      return;
    }

    if (this.currentEnrollment.status === EnrollmentStatus.Cancelado) {
      alert('La inscripción ya está cancelada.');
      return;
    }

    const confirmed = window.confirm('¿Estás seguro de que deseas cancelar tu inscripción en esta actividad?');
    if (!confirmed) return;

    const updated: Enrollment = {
      ...this.currentEnrollment,
      status: EnrollmentStatus.Cancelado,
      date: new Date().toISOString()
    };

    this.enrollmentsService.update(updated).subscribe(e => {
      this.isEnrolled = false;
      this.currentEnrollment = e;
      this.checkIfCanReview();
      alert('Tu inscripción ha sido cancelada.');
    });
  }

  edit() {
    this.router.navigate(['/organizer/my-activities']);
  }

  setRating(stars: number) {
    this.rating = stars;
  }

  submitReview() {
    if (!this.canReview) return;
    if (this.rating <= 0) return;

    const review: Rating = {
      activityId: this.activity.id!,
      studentId: this.userId,
      stars: this.rating,
      comment: this.reviewText,
      date: new Date().toISOString()
    };

    this.ratingsService.create(review).subscribe(r => {
      this.ratings.push(r);
      this.rating = 0;
      this.reviewText = '';
    });
  }

  isRegistrationClosed(): boolean {
    if (!this.activity.registrationDeadline) return true;
    const deadline = new Date(this.activity.registrationDeadline);
    return deadline < new Date();
  }

}
