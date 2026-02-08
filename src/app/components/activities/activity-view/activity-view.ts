import { Component, ElementRef, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { Activity } from '../../../models/Activity';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Rating } from '../../../models/Rating';
import { UserRole } from '../../../models/User';
import { Enrollment, EnrollmentStatus } from '../../../models/Enrollment';
import { AuthService } from '../../../services/auth.service';
import { ServActivitiesApi } from '../../../services/serv-activities-api';
import { ServRatingsApi } from '../../../services/serv-ratings-api';
import { ServEnrollmentsApi } from '../../../services/serv-enrollments-api';
import { ApiErrorService } from '../../../shared/api-error.service';
import { UiAlertService } from '../../../shared/ui-alert.service';

declare const bootstrap: any;

@Component({
  selector: 'app-activity-view',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './activity-view.html',
  styleUrls: ['./activity-view.css'],
})
export class ActivityView implements OnInit, AfterViewInit {

  activity!: Activity;
  ratings: Rating[] = [];

  userId: number = 0;
  role: 'student' | 'organizer' | 'public' = 'public';

  isEnrolled: boolean = false;
  isMyActivity: boolean = false;
  canReview: boolean = false;

  currentEnrollment?: Enrollment;

  editingId: number | null = null;

  modalRef: any;
  formRating!: FormGroup;

  isLoading: boolean = true;
  hasError: boolean = false;
  imageError = false;

  constructor(
    private activitiesService: ServActivitiesApi,
    private enrollmentsService: ServEnrollmentsApi,
    private ratingsService: ServRatingsApi,
    private authService: AuthService,
    private route: ActivatedRoute,
    private formbuilder: FormBuilder,
    private apiError: ApiErrorService,
    private ui: UiAlertService
  ) {
    this.formRating = this.formbuilder.group({
      stars: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', [Validators.required, Validators.maxLength(250)]]
    });
  }

  @ViewChild('ratingModalRef') modalElement!: ElementRef;

  ngAfterViewInit() {
    this.modalRef = new bootstrap.Modal(this.modalElement.nativeElement);
  }

  ngOnInit() {
    this.loadCurrentUser();
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.loadActivity(id);
  }

  loadActivity(id: string) {
    this.isLoading = true;
    this.hasError = false;

    this.activitiesService.getActivityById(id).subscribe({
      next: (activity) => {
        this.activity = activity;
        this.loadRatings();
        this.checkEnrollment();
        this.checkOrganizerOwnership();
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.hasError = true;
        this.apiError.handle(err, 'cargar la actividad');
      }
    });
  }

  loadCurrentUser() {
    const userId = this.authService.getUserId();

    if (!userId) {
      this.role = 'public';
      return;
    }

    this.userId = Number(userId);

    const role = this.authService.getUserRole();

    if (role === UserRole.Estudiante) this.role = 'student';
    else if (role === UserRole.Organizador) this.role = 'organizer';
    else this.role = 'public';
  }

  loadRatings() {
    if (!this.activity) return;
    
    this.ratingsService.getRatingsByActivity(this.activity.id!)
      .subscribe({
        next: (data) => {
          this.ratings = data;
        },
        error: (err) => {
          this.apiError.handle(err, 'cargar las valoraciones');
        }
      });
  }
  
  checkEnrollment() {
    if (this.role !== 'student') {
      this.isEnrolled = false;
      return;
    }

    this.enrollmentsService
      .getEnrollmentsByStudent(this.userId)
      .subscribe({
        next: (enrollments) => {
          const active = enrollments.find(e =>
            e.activityId == this.activity.id &&
            e.status === EnrollmentStatus.Inscrito
          );

          this.currentEnrollment = active;
          this.isEnrolled = !!active;
          this.checkIfCanReview();
        },
        error: (err) => {
          this.apiError.handle(err, 'verificar la inscripción');
        }
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
    if (!this.activity?.date) return false;
    const eventDate = new Date(this.activity.date);
    const today = new Date();
    eventDate.setHours(23, 59, 59, 999);
    return eventDate < today;
  }

  checkIfCanReview() {
    this.canReview =
      this.role === 'student' &&
      this.isEnrolled &&
      this.hasActivityEnded() &&
      !this.hasUserAlreadyReviewed();
  }

  hasUserAlreadyReviewed(): boolean {
    return this.ratings.some(r => r.studentId === this.userId);
  }

  enroll() {
    if (this.role !== 'student') {
      this.ui.info('Solo los estudiantes pueden inscribirse');
      return;
    }

    if (!this.activity) {
      this.ui.error('No se ha cargado la actividad todavía');
      return;
    }

    if (this.isRegistrationClosed()) {
      this.ui.warning('Las inscripciones están cerradas');
      return;
    }

    this.ui.confirm(
      '¿Inscribirse en la actividad?',
      `${this.activity.title}`,
      'Sí, inscribirme',
      'Cancelar'
    ).then((result) => {
      if (result.isConfirmed) {
        this.processEnrollment();
      }
    });
  }

  private processEnrollment() {
    this.enrollmentsService.getEnrollmentsByStudent(this.userId).subscribe({
      next: (enrollments) => {
        const existing = enrollments.find(e =>
          e.activityId === this.activity.id && e.studentId === this.userId
        );

        if (existing) {
          if (existing.status === EnrollmentStatus.Inscrito) {
            this.isEnrolled = true;
            this.currentEnrollment = existing;
            this.checkIfCanReview();
            this.ui.info('Ya estás inscrito en esta actividad');
            return;
          }
        }

        const enrollment: Omit<Enrollment, 'id'> = {
          activityId: this.activity.id!,
          studentId: this.userId,
          enrollmentDate: new Date().toISOString(),
          status: EnrollmentStatus.Inscrito,
          note: ''
        };

        this.enrollmentsService.create(enrollment).subscribe({
          next: (e) => {
            this.isEnrolled = true;
            this.currentEnrollment = e;
            this.checkIfCanReview();
            this.ui.success('Te has inscrito correctamente');
          },
          error: (err) => {
            this.apiError.handle(err, 'inscribirse en la actividad');
          }
        });
      },
      error: (err) => {
        this.apiError.handle(err, 'verificar inscripciones');
      }
    });
  }

  submitReview() {
    if (this.formRating.invalid) {
      this.formRating.markAllAsTouched();
      return;
    }

    const review: Rating = {
      activityId: this.activity.id!,
      studentId: this.userId,
      stars: this.formRating.get('stars')?.value,
      comment: this.formRating.get('comment')?.value,
      ratingDate: new Date().toISOString()
    };

    this.ratingsService.create(review).subscribe({
      next: (res) => {
        this.modalRef.hide();
        this.ui.success('Valoración enviada');
        
        this.loadRatings();
        this.checkIfCanReview();
      },
      error: (err) => {
        this.apiError.handle(err, 'enviar la valoración');
      }
    });
  }

  openNew() {
    if (!this.modalRef) return;

    this.editingId = null;
    this.formRating.reset({
      stars: 5,
      comment: ''
    });
    this.modalRef.show();
  }

  openEdit(rating: Rating) {
    this.editingId = rating.id ?? null;

    this.formRating.patchValue({
      stars: rating.stars,
      comment: rating.comment
    });

    this.modalRef.show();
  }

  deleteRating(rating: Rating) {
    this.ui.deleteConfirm(
      '',
      '¿Estás seguro de que deseas eliminar esta valoración?'
    ).then((result) => {
      if (result.isConfirmed && rating.id) {
        this.ratingsService.delete(rating.id).subscribe({
          next: () => {
            this.ratings = this.ratings.filter(r => r.id !== rating.id);
            setTimeout(() => {
              this.checkIfCanReview();
            }, 0);
            this.ui.success('Valoración eliminada');
          },
          error: (err) => {
            this.apiError.handle(err, 'eliminar la valoración');
          }
        });
      }
    });
  }

  isRegistrationClosed(): boolean {
    if (!this.activity.registrationDeadline) return true;
    const deadline = new Date(this.activity.registrationDeadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return deadline < today;
  }

  selectStar(rating: number): void {
    this.formRating.get('stars')?.setValue(rating);
    this.formRating.get('stars')?.markAsTouched();
  }

  getAverageRating(): number {
    if (this.ratings.length === 0) return 0;
    const sum = this.ratings.reduce((total, rating) => total + rating.stars, 0);
    return parseFloat((sum / this.ratings.length).toFixed(1));
  }

  handleImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.style.display = 'none';
    
    console.warn('La imagen no pudo cargar:', imgElement.src);
  }

}