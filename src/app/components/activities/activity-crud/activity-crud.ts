import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SearchFilter, SearchForm } from '../../shared/search-form/search-form';
import { DataTable, TableColumn } from '../../shared/data-table/data-table';
import { Activity } from '../../../models/Activity';
import { ServActivitiesJson } from '../../../services/serv-activities-json';
import { Category } from '../../../models/Category';
import { Organizer } from '../../../models/Organizer';
import { ServCategoriesJson } from '../../../services/serv-categories-json';
import { ServOrganizersJson } from '../../../services/serv-organizers-json';
import { horaRangeValidator } from '../../../validators/horaRangeValidator';
import { registrationDeadlineValidator } from '../../../validators/registrationDeadlineValidator';
import { Router } from '@angular/router';

declare const bootstrap: any;

@Component({
  selector: 'app-activity-crud',
  imports: [ReactiveFormsModule, DataTable, SearchForm],
  templateUrl: './activity-crud.html',
  styleUrl: './activity-crud.css',
})
export class ActivityCrud {
  activities: Activity[] = [];
  filteredActivities: Activity[] = [];
  formActivity!: FormGroup;
  editingId: number | null = null;
  modalRef: any;

  photoPreview: string | null = null;

  minDate:string = "2020-01-01";
  maxDate = new Date().toISOString().split("T")[0]; ///fecha con formato yyyy-mm-dd

  categories: Category[] = [];
  organizers: Organizer[] = [];

  activityEdit:Activity ={} as Activity; //para foto

  activityFilters: SearchFilter[] = [
    { type: 'text', field: 'title', label: 'Título' },
    { type: 'select', field: 'categoryId', label: 'Categoría', options: [] },
    { type: 'select', field: 'organizerId', label: 'Organizador', options: [] },
    { type: 'text', field: 'location', label: 'Lugar' },
    { type: 'date', field: 'date', label: 'Fecha' }
  ];

  colArray: TableColumn[] = [
    { field: 'id', header: 'ID', type: 'number' },
    { field: 'title', header: 'Título' },
    { field: 'description', header: 'Descripción', type: 'longtext' },
    { field: 'categoryId', header: 'Categoría', type: 'lookup', lookup: (id: number) => this.getCategoryName(id) },
    { field: 'organizerId', header: 'Organizador', type: 'lookup', lookup: (id: number) => this.getOrganizerName(id) },
    { field: 'date', header: 'Fecha', type: 'date' },
    { field: 'registrationDeadline', header: 'Inscripciones hasta', type: 'date' },
    { field: 'timeRange', header: 'Horas' },
    { field: 'location', header: 'Lugar' },
    { field: 'capacity', header: 'Cupo', type: 'number' },
    { field: 'active', header: 'Activo', type: 'boolean' },
  ];

  constructor(
    private miServicio: ServActivitiesJson,
    private categoriesService: ServCategoriesJson,
    private organizersService: ServOrganizersJson,
    private formbuilder: FormBuilder,
    private router:Router
  ) {
    this.loadActivities();
    this.loadCategories();
    this.loadOrganizers();

    this.formActivity = this.formbuilder.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
      categoryId: ['', Validators.required],
      organizerId: ['', Validators.required],
      date: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      registrationDeadline: ['', Validators.required ],
      location: ['', [Validators.required, Validators.minLength(3)]],
      capacity: [1, [Validators.required, Validators.min(10), Validators.max(500)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      photoUrl: [''],
      active: [true]
    }, { validators: [horaRangeValidator, registrationDeadlineValidator] });
  }

  @ViewChild("activityModalRef") modalElement!: ElementRef;
  ngAfterViewInit() {
    this.modalRef = new bootstrap.Modal(this.modalElement.nativeElement);
  }

  get maxDeadlineDate() {
    return this.formActivity.get('date')?.value || this.maxDate;
  }

  loadActivities() {
    this.miServicio.getActivities().subscribe((data: Activity[]) => {
      this.activities = data;
      this.filteredActivities = [...data];
    });
  }

  loadCategories() {
    this.categoriesService.getCategories().subscribe((data: Category[]) => {
      this.categories = data;
      const categoryFilter = this.activityFilters.find(f => f.field === 'categoryId');
      if (categoryFilter) {
        categoryFilter.options = this.categories.map(c => ({ label: c.name, value: c.id }));
      }
    });
  }

  loadOrganizers() {
    this.organizersService.getOrganizers().subscribe((data: Organizer[]) => {
      this.organizers = data;
      const organizerFilter = this.activityFilters.find(f => f.field === 'organizerId');
      if (organizerFilter) {
        organizerFilter.options = this.organizers.map(o => ({ label: o.name, value: o.id }));
      }
    });
  }

  getCategoryName(id: number): string {
    return this.categories.find(c => Number(c.id) === Number(id))?.name || 'Sin categoría';
  }

  getOrganizerName(id: number): string {
    return this.organizers.find(o => Number(o.id) === Number(id))?.name || 'Sin organizador';
  }

  updatePhotoPreview() {
    const url = this.formActivity.get('photoUrl')?.value;
    this.photoPreview = url && url.trim() !== '' ? url : null;
  }

  view(activity: Activity) {
    this.router.navigate(['/activity-view', activity.id]);
  }

  delete(activity: Activity) {
    const confirmado = confirm(`¿Seguro deseas eliminar la actividad? ${activity.title}`);
    if (confirmado) {
      this.miServicio.delete(activity.id).subscribe(() => {
        alert("Actividad eliminada");
        this.loadActivities();
      });
    }
  }

  search(filters: any) {
    this.miServicio.searchActivities(filters).subscribe(
      (data: Activity[]) => {
        this.filteredActivities = data;
      }
    );
  }

  openNew() {
    this.editingId = null;
    this.formActivity.reset({
      title: '',
      categoryId: '',
      organizerId: '',
      date: '',
      timeRange: '',
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
    this.activityEdit = activity;
    this.editingId = activity.id ?? null;

    const [startTime, endTime] = activity.timeRange?.split(' - ') || ['', ''];

    this.formActivity.patchValue({
      ...activity,
      startTime: startTime,
      endTime: endTime
    });

    this.photoPreview = activity.photoUrl || null;

    this.modalRef.show();
  }

  save() {
    if (this.formActivity.invalid) {
      this.formActivity.markAllAsTouched();
      return;
    }

    let datos = this.formActivity.value;

    datos.timeRange = `${datos.startTime} - ${datos.endTime}`;

    delete datos.startTime;
    delete datos.endTime;

    if (this.editingId) {
      let activity: Activity = { ...datos, id: this.editingId };
      this.miServicio.update(activity).subscribe(() => {
        alert("Actividad actualizada");
        this.modalRef.hide();
        this.loadActivities();
      });
    } else {
      let activity: Activity = { ...datos };
      this.miServicio.create(activity).subscribe(() => {
        alert("Actividad creada");
        this.modalRef.hide();
        this.loadActivities();
      });
    }
  }

}