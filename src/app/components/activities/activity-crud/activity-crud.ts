import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SearchFilter, SearchForm } from '../../shared/search-form/search-form';
import { DataTable, TableColumn } from '../../shared/data-table/data-table';
import { Activity } from '../../../models/Activity';
import { ServActivitiesJson } from '../../../services/serv-activities-json';

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

  categories = [
    { id: 1, name: "Arte" },
    { id: 2, name: "Deportes" },
    { id: 3, name: "Bienestar" }
  ];

  organizers = [
    { id: 1, name: "Juan Pérez" },
    { id: 2, name: "María López" }
  ];

  activityFilters: SearchFilter[] = [
    { type: 'text', field: 'title', label: 'Título' },
    { type: 'number', field: 'categoryId', label: 'Categoría' },
    { type: 'number', field: 'organizerId', label: 'Organizador' },
    { type: 'text', field: 'location', label: 'Lugar' },
    { type: 'date', field: 'date', label: 'Fecha' }
  ];

  colArray: TableColumn[] = [
    { field: 'id', header: 'ID', type: 'number' },
    { field: 'title', header: 'Título' },
    { field: 'categoryId', header: 'Categoría' },
    { field: 'organizerId', header: 'Organizador' },
    { field: 'date', header: 'Fecha', type: 'date' },
    { field: 'duration', header: 'Duración' },
    { field: 'location', header: 'Lugar' },
    { field: 'capacity', header: 'Cupo', type: 'number' },
    { field: 'active', header: 'Activo', type: 'boolean' },
  ];

  constructor(
    private miServicio: ServActivitiesJson,
    private formbuilder: FormBuilder
  ) {
    this.loadActivities();

    this.formActivity = this.formbuilder.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
      categoryId: ['', Validators.required],
      organizerId: ['', Validators.required],
      date: ['', Validators.required],
      duration: ['', [Validators.required]],
      location: ['', [Validators.required, Validators.minLength(3)]],
      capacity: [1, [Validators.required, Validators.min(1), Validators.max(500)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      active: [true]
    });
  }

  @ViewChild("activityModalRef") modalElement!: ElementRef;
  ngAfterViewInit() {
    this.modalRef = new bootstrap.Modal(this.modalElement.nativeElement);
  }

  loadActivities() {
    this.miServicio.getActivities().subscribe((data: Activity[]) => {
      this.activities = data;
      this.filteredActivities = [...data];
    });
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
      duration: '',
      location: '',
      capacity: 1,
      description: '',
      active: true
    });

    this.modalRef.show();
  }

  openEdit(activity: Activity) {
    this.editingId = activity.id ?? null;
    this.formActivity.patchValue(activity);
    this.modalRef.show();
  }

  save() {
    if (this.formActivity.invalid) {
      this.formActivity.markAllAsTouched();
      return;
    }

    let datos = this.formActivity.value;

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
