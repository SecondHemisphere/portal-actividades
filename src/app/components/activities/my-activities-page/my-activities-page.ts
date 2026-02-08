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
import Swal from 'sweetalert2';

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
    private router: Router
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
      Swal.fire({
        icon: 'warning',
        title: 'Acceso restringido',
        text: 'Solo los organizadores pueden ver esta página',
        confirmButtonText: 'OK'
      }).then(() => {
        this.router.navigate(['/']);
      });
      return;
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
        Swal.fire({
          title: '¿Desactivar actividad?',
          text: `"${activity.title}" dejará de ser visible para los estudiantes`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, ocultar',
          cancelButtonText: 'Cancelar',
        }).then((result) => {
          if (result.isConfirmed) {
            this.activitiesService.delete(id).subscribe({
              next: () => {
                Swal.fire('Desactivada', 'La actividad ha sido desactivada', 'success');
                this.calendarComponent.goToMonth(activity.date);
              },
              error: (err) => {
                console.error(err);
                Swal.fire('Error', 'No se pudo desactivar la actividad', 'error');
              }
            });
          }
        });
      },
      error: (err) => {
        console.error('Error cargando actividad:', err);
        Swal.fire('Error', 'No se pudo cargar la actividad', 'error');
      }
    });
  }

  activate(id: number) {
    this.activitiesService.getActivityById(id).subscribe({
      next: (activity) => {
        Swal.fire({
          title: '¿Activar actividad?',
          text: `"${activity.title}" será visible para los estudiantes`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Sí, activar',
          cancelButtonText: 'Cancelar',
        }).then((result) => {
          if (result.isConfirmed) {
            this.activitiesService.activate(id).subscribe({
              next: () => {
                Swal.fire('Activada', 'La actividad ha sido reactivada', 'success');
                this.calendarComponent.goToMonth(activity.date);
              },
              error: (err) => {
                console.error(err);
                Swal.fire('Error', 'No se pudo reactivar la actividad', 'error');
              }
            });
          }
        });
      },
      error: (err) => {
        console.error('Error cargando actividad:', err);
        Swal.fire('Error', 'No se pudo cargar la actividad', 'error');
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
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se encontró la actividad'
          });
          return;
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
        console.error('Error al cargar actividad:', err);
        
        const errorMsg = err.error?.message || 'No se pudo cargar la actividad';
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMsg
        });
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
          Swal.fire({
            icon: 'success',
            title: 'Actualizado',
            text: 'Actividad actualizada correctamente'
          });
          this.modalRef.hide();
          this.calendarComponent.goToMonth(datos.date);
        },
        error: (err) => {
          console.error(err);
          const errorMsg = err.error?.message ?? 'No se pudo actualizar la actividad';
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorMsg
          });
        }
      });
    } else {
      this.activitiesService.create(datos).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Creado',
            text: 'Actividad creada correctamente'
          });
          this.modalRef.hide();
          this.calendarComponent.goToMonth(datos.date);
        },
        error: (err) => {
          console.error(err);
          const errorMsg = err.error?.message ?? 'No se pudo crear la actividad';
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorMsg
          });
        }
      });
    }
  }

  updatePhotoPreview() {
    const url = this.formActivity.get('photoUrl')?.value;
    this.photoPreview = url?.trim() ? url : null;
  }

}