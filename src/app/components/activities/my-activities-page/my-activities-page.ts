import { Component, ElementRef, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Category } from '../../../models/Category';
import { horaRangeValidator } from '../../../validators/horaRangeValidator';
import { registrationDeadlineValidator } from '../../../validators/registrationDeadlineValidator';
import { Router } from '@angular/router';
import { ActivitiesCalendar } from '../../activities/activities-calendar/activities-calendar';
import { AuthService } from '../../../services/auth.service';
import { ServActivitiesApi } from '../../../services/serv-activities-api';
import { ServCategoriesApi } from '../../../services/serv-categories-api';
import { ApiErrorService } from '../../../shared/api-error.service';
import { UiAlertService } from '../../../shared/ui-alert.service';

declare const bootstrap: any;

@Component({
  selector: 'app-my-activities-page',
  imports: [ActivitiesCalendar, ReactiveFormsModule],
  templateUrl: './my-activities-page.html',
  styleUrl: './my-activities-page.css'
})
export class MyActivitiesPage implements OnInit, AfterViewInit {

  categories: Category[] = [];
  formActivity!: FormGroup;
  editingId: number | null = null;

  minDate: string = "2020-01-01";
  maxDate = new Date().toISOString().split("T")[0];

  photoPreview: string | null = null;
  modalRef: any;

  userId = 0;

  @ViewChild(ActivitiesCalendar) calendarComponent!: ActivitiesCalendar;
  @ViewChild("activityModalRef") modalElement!: ElementRef;

  constructor(
    private activitiesService: ServActivitiesApi,
    private categoriesService: ServCategoriesApi,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
    private apiError: ApiErrorService,
    private ui: UiAlertService
  ) {
    this.formActivity = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
      categoryId: ['', Validators.required],
      date: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      registrationDeadline: ['', Validators.required],
      location: ['', [Validators.required, Validators.minLength(3)]],
      capacity: [10, [Validators.required, Validators.min(10), Validators.max(500)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      photoUrl: [''],
    }, { validators: [horaRangeValidator, registrationDeadlineValidator] });
  }

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    const userRole = this.authService.getUserRole();
    if (userRole !== 'Organizador') {
      this.ui.warning('Solo los organizadores pueden ver esta página')
        .then(() => this.router.navigate(['/']));
    }

    const userId = this.authService.getUserId();
    if (userId) {
      this.userId = Number(userId);
    }
    
    this.loadCategories();
  }

  ngAfterViewInit() {
    this.modalRef = new bootstrap.Modal(this.modalElement.nativeElement);
  }

  loadCategories() {
    this.categoriesService.getCategories().subscribe(data => {
      this.categories = data;
    });
  }

  goToCurrentMonth() {
    if (this.calendarComponent) {
      this.calendarComponent.goToCurrentMonth();
    }
  }

  get maxDeadlineDate() {
    return this.formActivity.get('date')?.value || this.maxDate;
  }

  deactivate(id: number) {
    this.activitiesService.getActivityById(id).subscribe({
      next: (activity) => {
        this.ui.confirm(
          '¿Desactivar actividad?',
          `"${activity.title}" dejará de ser visible para los estudiantes`,
          'Sí, ocultar'
        ).then(result => {
          if (result.isConfirmed) {
            this.activitiesService.delete(id).subscribe({
              next: () => {
                this.ui.success('La actividad ha sido desactivada');
                this.calendarComponent.goToMonth(activity.date);
              },
              error: (err) => {
                this.apiError.handle(err, 'desactivar la actividad');
              }
            });
          }
        });
      },
      error: (err) => {
        this.apiError.handle(err, 'cargar la actividad');
      }
    });
  }

  activate(id: number) {
    this.activitiesService.getActivityById(id).subscribe({
      next: (activity) => {
        this.ui.confirm(
          '¿Activar actividad?',
          `"${activity.title}" será visible para los estudiantes`,
          'Sí, activar'
        ).then(result => {
          if (result.isConfirmed) {
            this.activitiesService.activate(id).subscribe({
              next: () => {
                this.ui.success('La actividad ha sido reactivada');
                this.calendarComponent.goToMonth(activity.date);
              },
              error: (err) => {
                this.apiError.handle(err, 'activar la actividad');
              }
            });
          }
        });
      },
      error: (err) => {
        this.apiError.handle(err, 'cargar la actividad');
      }
    });
  }

  openNew() {
    this.editingId = null;
    this.formActivity.enable();

    this.formActivity.reset({
      title: '',
      categoryId: '',
      date: '',
      startTime: '',
      endTime: '',
      registrationDeadline: '',
      location: '',
      capacity: 10,
      description: '',
      photoUrl: '',
    });

    this.photoPreview = null;
    this.modalRef.show();
  }

  openEditById(id: number) {
    this.activitiesService.getActivityById(id).subscribe({
      next: (activity) => {
        if (!activity) {
          this.ui.error('No se encontró la actividad');
        }

        this.editingId = id;
        this.formActivity.enable();

        const [startTime = '', endTime = ''] = (activity.timeRange || '').split(' - ').map(t => t.trim());

        this.formActivity.patchValue({
          title: activity.title || '',
          categoryId: activity.categoryId || '',
          date: activity.date || '',
          startTime: startTime,
          endTime: endTime,
          registrationDeadline: activity.registrationDeadline || '',
          location: activity.location || '',
          capacity: activity.capacity || 10,
          description: activity.description || '',
          photoUrl: activity.photoUrl || '',
        });

        this.photoPreview = activity.photoUrl || null;
        this.modalRef.show();
      },
      error: (err) => {
        this.apiError.handle(err, 'cargar la actividad');
      }
    });
  }

  save() {
    if (this.formActivity.invalid) {
      this.formActivity.markAllAsTouched();
      return;
    }

    const datos = this.formActivity.value;
    datos.timeRange = `${datos.startTime} - ${datos.endTime}`;
    datos.organizerId = this.userId;

    delete datos.startTime;
    delete datos.endTime;

    if (this.editingId) {
      datos.id = this.editingId;
      this.activitiesService.update(datos).subscribe({
        next: () => {
          this.ui.success('Actividad actualizada correctamente');
          this.modalRef.hide();
          this.calendarComponent.goToMonth(datos.date);
        },
        error: (err) => {
          this.apiError.handle(err, 'actualizar');
        }
      });
    } else {
      this.activitiesService.create(datos).subscribe({
        next: () => {
          this.ui.success('Actividad creada correctamente');
          this.modalRef.hide();
          this.calendarComponent.goToMonth(datos.date);
        },
        error: (err) => {
          this.apiError.handle(err, 'crear');
        }
      });
    }
  }

  updatePhotoPreview() {
    const url = this.formActivity.get('photoUrl')?.value;
    this.photoPreview = url?.trim() ? url : null;
  }

}