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
import Swal, { SweetAlertIcon } from 'sweetalert2';

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

  constructor(
    private activitiesService: ServActivitiesApi,
    private enrollmentsService: ServEnrollmentsApi,
    private ratingsService: ServRatingsApi,
    private authService: AuthService,
    private route: ActivatedRoute,
    private formbuilder: FormBuilder
  ) {
    this.formRating = this.formbuilder.group({
      stars: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(250)]]
    });
  }

  @ViewChild('ratingModalRef') modalElement!: ElementRef;

  ngAfterViewInit() {
    this.modalRef = new bootstrap.Modal(this.modalElement.nativeElement);
  }

  ngOnInit() {
    this.loadCurrentUser();
    
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.showError('No se especificó ID de actividad');
      return;
    }

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
      error: (error) => {
        console.error('Error loading activity:', error);
        this.isLoading = false;
        this.hasError = true;
        this.showError('No se pudo cargar la actividad');
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
        error: (error) => {
          console.error('Error loading ratings:', error);
          this.showError('Error al cargar las valoraciones');
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
        error: (error) => console.error('Error checking enrollment:', error)
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
      this.showInfo('Solo los estudiantes pueden inscribirse');
      return;
    }

    if (!this.activity) {
      this.showError('No se ha cargado la actividad todavía');
      return;
    }

    if (this.isRegistrationClosed()) {
      this.showWarning('Las inscripciones están cerradas');
      return;
    }

    this.showConfirm(
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
            this.showInfo('Ya estás inscrito en esta actividad');
            return;
          }

          if (existing.status === EnrollmentStatus.Cancelado) {
            const updated: Enrollment = {
              ...existing,
              status: EnrollmentStatus.Inscrito,
              enrollmentDate: new Date().toISOString()
            };

            this.enrollmentsService.update(updated).subscribe({
              next: (e) => {
                this.isEnrolled = true;
                this.currentEnrollment = e;
                this.checkIfCanReview();
                this.showSuccess('Tu inscripción ha sido reactivada');
              },
              error: (error) => this.showError('Error al reactivar inscripción')
            });
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
            this.showSuccess('Te has inscrito correctamente');
          },
          error: (error) => this.showError('Error al inscribirse')
        });
      },
      error: (error) => this.showError('Error al verificar inscripciones')
    });
  }

  cancelEnrollment() {
    if (!this.currentEnrollment) {
      this.showWarning('No tienes una inscripción activa para cancelar');
      return;
    }

    if (this.currentEnrollment.status === EnrollmentStatus.Cancelado) {
      this.showInfo('La inscripción ya está cancelada');
      return;
    }

    this.showConfirm(
      '¿Cancelar inscripción?',
      '¿Estás seguro de que deseas cancelar tu inscripción en esta actividad?',
      'Sí, cancelar',
      'No, mantener'
    ).then((result) => {
      if (result.isConfirmed) {
        this.processCancellation();
      }
    });
  }

  private processCancellation() {
    const updated: Enrollment = {
      ...this.currentEnrollment!,
      status: EnrollmentStatus.Cancelado,
      enrollmentDate: new Date().toISOString()
    };

    this.enrollmentsService.update(updated).subscribe({
      next: (e) => {
        this.isEnrolled = false;
        this.currentEnrollment = e;
        this.checkIfCanReview();
        this.showSuccess('Tu inscripción ha sido cancelada');
      },
      error: (error) => this.showError('Error al cancelar inscripción')
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
        this.showSuccess('Valoración enviada');
        setTimeout(() => {
          this.ratings.push(res);
          this.checkIfCanReview();
        }, 300);
      },
      error: (error) => {
        const errorMsg = this.getErrorMessage(error, 'Error al enviar la valoración');
        this.showError(errorMsg);
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
    this.showDeleteConfirm(
      '¿Eliminar valoración?',
      '¿Estás seguro de que deseas eliminar esta valoración?'
    ).then((result) => {
      if (result.isConfirmed && rating.id) {
        this.ratingsService.delete(rating.id).subscribe({
          next: () => {
            this.ratings = this.ratings.filter(r => r.id !== rating.id);
            setTimeout(() => {
              this.checkIfCanReview();
            }, 0);
            this.showSuccess('Valoración eliminada');
          },
          error: (error) => {
            const errorMsg = this.getErrorMessage(error, 'Error al eliminar valoración');
            this.showError(errorMsg);
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
  
  private getErrorMessage(error: any, defaultMessage: string): string {
    if (error.error?.message) {
      return error.error.message;
    }
    return defaultMessage;
  }

  private showAlert(
    icon: SweetAlertIcon,
    title: string,
    text: string,
    showConfirmButton: boolean = true,
    timer?: number
  ): void {
    const config: any = {
      icon,
      title,
      text
    };

    if (timer && !showConfirmButton) {
      config.timer = timer;
      config.showConfirmButton = false;
    } else {
      config.showConfirmButton = showConfirmButton;
    }

    Swal.fire(config);
  }

  private showSuccess(message: string, timer: number = 3000): void {
    this.showAlert('success', '¡Éxito!', message, false, timer);
  }

  private showError(message: string): void {
    this.showAlert('error', 'Error', message);
  }

  private showWarning(message: string): void {
    this.showAlert('warning', 'Advertencia', message);
  }

  private showInfo(message: string, timer: number = 3000): void {
    this.showAlert('info', 'Información', message, false, timer);
  }

  private showConfirm(
    title: string,
    text: string,
    confirmButtonText: string = 'Confirmar',
    cancelButtonText: string = 'Cancelar',
    icon: SweetAlertIcon = 'question'
  ): Promise<any> {
    return Swal.fire({
      title,
      text,
      icon,
      showCancelButton: true,
      confirmButtonText,
      cancelButtonText,
    });
  }

  private showDeleteConfirm(
    title: string = '¿Eliminar?',
    text: string = 'Esta acción no se puede deshacer',
    itemName?: string
  ): Promise<any> {
    const message = itemName
      ? `¿Estás seguro de eliminar "${itemName}"?`
      : text;
    
    return Swal.fire({
      title,
      text: message,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
  }

}