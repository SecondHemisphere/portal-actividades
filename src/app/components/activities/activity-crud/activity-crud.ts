import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SearchFilter, SearchForm } from '../../shared/search-form/search-form';
import { DataTable, TableColumn } from '../../shared/data-table/data-table';
import { Activity } from '../../../models/Activity';
import { Category } from '../../../models/Category';
import { Organizer } from '../../../models/Organizer';
import { horaRangeValidator } from '../../../validators/horaRangeValidator';
import { registrationDeadlineValidator } from '../../../validators/registrationDeadlineValidator';
import { Router } from '@angular/router';
import { ServActivitiesApi } from '../../../services/serv-activities-api';
import { ServCategoriesApi } from '../../../services/serv-categories-api';
import { ServOrganizersApi } from '../../../services/serv-organizers-api';
import { ApiErrorService } from '../../../shared/api-error.service';
import { UiAlertService } from '../../../shared/ui-alert.service';

declare const bootstrap: any;

@Component({
  selector: 'app-activity-crud',
  imports: [ReactiveFormsModule, DataTable, SearchForm],
  templateUrl: './activity-crud.html',
  styleUrl: './activity-crud.css'
})
export class ActivityCrud implements AfterViewInit {
  activities: Activity[] = [];
  filteredActivities: Activity[] = [];
  formActivity!: FormGroup;
  editingId: number | null = null;
  modalRef: any;

  photoPreview: string | null = null;

  minDate: string = "2020-01-01";
  maxDate: string = new Date().toISOString().split("T")[0];

  categories: Category[] = [];
  organizers: Organizer[] = [];

  activityFilters: SearchFilter[] = [
    { type: 'text', field: 'title', label: 'Título' },
    { type: 'select', field: 'categoryId', label: 'Categoría', options: [] },
    { type: 'select', field: 'organizerId', label: 'Organizador', options: [] },
    { type: 'text', field: 'location', label: 'Lugar' },
    { type: 'date', field: 'fromDate', label: 'Fecha desde' },
    { type: 'date', field: 'toDate', label: 'Fecha hasta' }
  ];

  colArray: TableColumn[] = [
    { field: 'id', header: 'ID', type: 'number' },
    { field: 'title', header: 'Título' },
    { field: 'description', header: 'Descripción', type: 'longtext' },
    { field: 'categoryName', header: 'Categoría' },
    { field: 'organizerName', header: 'Organizador' },
    { field: 'date', header: 'Fecha', type: 'date' },
    { field: 'registrationDeadline', header: 'Inscripciones hasta', type: 'date' },
    { field: 'timeRange', header: 'Horario' },
    { field: 'location', header: 'Lugar' },
    { field: 'capacity', header: 'Cupo', type: 'number' },
    { field: 'active', header: 'Activo', type: 'boolean' }
  ];

  @ViewChild('activityModalRef') modalElement!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private activitiesService: ServActivitiesApi,
    private categoriesService: ServCategoriesApi,
    private organizersService: ServOrganizersApi,
    private router: Router,
    private apiError: ApiErrorService,
    private ui: UiAlertService
  ) {
    this.formActivity = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
      categoryId: ['', Validators.required],
      organizerId: ['', Validators.required],
      date: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      registrationDeadline: ['', Validators.required],
      location: ['', [Validators.required, Validators.minLength(3)]],
      capacity: [10, [Validators.required, Validators.min(10), Validators.max(500)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      photoUrl: [''],
      active: [true]
    }, { validators: [horaRangeValidator, registrationDeadlineValidator] });

    this.loadCategories();
    this.loadOrganizers();
    this.loadActivities();
  }

  ngAfterViewInit() {
    this.modalRef = new bootstrap.Modal(this.modalElement.nativeElement);
  }

  get maxDeadlineDate() {
    return this.formActivity.get('date')?.value || this.maxDate;
  }

  loadActivities() {
    this.activitiesService.getActivities2().subscribe(data => {
      this.activities = data;
      this.filteredActivities = [...this.activities];
    });
  }

  loadCategories() {
    this.categoriesService.getCategories().subscribe(data => {
      this.categories = data;
      const categoryFilter = this.activityFilters.find(f => f.field === 'categoryId');
      if (categoryFilter) {
        categoryFilter.options = data.map(c => ({ label: c.name, value: c.id }));
      }
    });
  }

  loadOrganizers() {
    this.organizersService.getOrganizers2().subscribe((data: Organizer[]) => {
      this.organizers = data;

      const organizerFilter = this.activityFilters.find(f => f.field === 'organizerId');
      if (organizerFilter) {
        organizerFilter.options = data.map((o: Organizer) => ({
          label: o.name,
          value: o.id
        }));
      }
    });
  }
  
  openNew() {
    this.editingId = null;
    this.formActivity.enable();
    
    this.formActivity.reset({
      title: '',
      categoryId: '',
      organizerId: '',
      date: '',
      startTime: '',
      endTime: '',
      registrationDeadline: '',
      location: '',
      capacity: 10,
      description: '',
      photoUrl: '',
      active: true
    });

    this.photoPreview = null;
    this.modalRef.show();
  }

  openEdit(activity: Activity) {
    this.editingId = activity.id ?? null;

    const [startTime, endTime] = activity.timeRange?.split(' - ') || ['', ''];

    this.formActivity.patchValue({
      title: activity.title,
      categoryId: activity.categoryId,
      organizerId: activity.organizerId,
      date: activity.date,
      startTime: startTime,
      endTime: endTime,
      registrationDeadline: activity.registrationDeadline,
      location: activity.location,
      capacity: activity.capacity,
      description: activity.description,
      photoUrl: activity.photoUrl,
      active: activity.active
    });

    this.photoPreview = activity.photoUrl || null;
    this.modalRef.show();
  }

  save() {
    if (this.formActivity.invalid) {
      this.formActivity.markAllAsTouched();
      return;
    }

    const datos = this.formActivity.value;
    datos.timeRange = `${datos.startTime} - ${datos.endTime}`;
    
    delete datos.startTime;
    delete datos.endTime;

    if (this.editingId) {
      datos.id = this.editingId;
      this.activitiesService.update(datos).subscribe({
        next: () => {
          this.ui.success('Actividad actualizada correctamente');
          this.modalRef.hide();
          this.loadActivities();
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
          this.loadActivities();
        },
        error: (err) => {
          this.apiError.handle(err, 'crear');
        }
      });
    }
  }

  delete(activity: Activity) {
    this.ui.deleteConfirm(activity.title)
      .then(result => {
        if (result.isConfirmed) {
          this.activitiesService.delete(activity.id!).subscribe({
            next: () => {
              this.ui.success('Actividad eliminada');
              this.loadActivities();
            },
            error: (err) => {
              this.apiError.handle(err, 'eliminar');
            }
          });
        }
      });
  }

  view(activity: Activity) {
    this.router.navigate(['/activity-view', activity.id]);
  }

  updatePhotoPreview() {
    const url = this.formActivity.get('photoUrl')?.value;
    this.photoPreview = url && url.trim() !== '' ? url : null;
  }

  search(filters: {
    categoryId?: number;
    organizerId?: number;
    fromDate?: string;
    toDate?: string;
    location?: string;
    title?: string;
  }) {
    this.activitiesService.search(filters).subscribe({
      next: (data: Activity[]) => {
        this.filteredActivities = data;
      },
      error: (err) => {
        this.apiError.handle(err, 'buscar');
      }
    });
  }
  
}