import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Activity } from '../../../models/Activity';
import { ServActivitiesJson } from '../../../services/serv-activities-json';
import { Category } from '../../../models/Category';
import { Organizer } from '../../../models/Organizer';
import { ServCategoriesJson } from '../../../services/serv-categories-json';
import { ServOrganizersJson } from '../../../services/serv-organizers-json';
import { horaRangeValidator } from '../../../validators/horaRangeValidator';
import { registrationDeadlineValidator } from '../../../validators/registrationDeadlineValidator';
import { Router } from '@angular/router';
import { ActivitiesCalendar } from '../activities-calendar/activities-calendar';

declare const bootstrap: any;

@Component({
  selector: 'app-my-activities-page',
  imports: [ActivitiesCalendar, ReactiveFormsModule],
  templateUrl: './my-activities-page.html',
  styleUrl: './my-activities-page.css'
})
export class MyActivitiesPage {
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

  constructor(
    private activitiesService: ServActivitiesJson,
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
    this.activitiesService.getActivities().subscribe((data: Activity[]) => {
      this.activities = data;
      this.filteredActivities = [...data];
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
      this.activitiesService.delete(activity.id).subscribe(() => {
        alert("Actividad eliminada");
        this.loadActivities();
      });
    }
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

  openEditById(id: number) {
    const activity = this.activities.find(a => a.id === id);
    if (!activity) return;
    this.openEdit(activity);
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
      this.activitiesService.update(activity).subscribe(() => {
        alert("Actividad actualizada");
        this.modalRef.hide();
        this.loadActivities();
      });
    } else {
      let activity: Activity = { ...datos };
      this.activitiesService.create(activity).subscribe(() => {
        alert("Actividad creada");
        this.modalRef.hide();
        this.loadActivities();
      });
    }
  }

}