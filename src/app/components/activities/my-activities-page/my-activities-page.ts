import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Activity } from '../../../models/Activity';
import { Category } from '../../../models/Category';
import { Organizer } from '../../../models/Organizer';
import { horaRangeValidator } from '../../../validators/horaRangeValidator';
import { registrationDeadlineValidator } from '../../../validators/registrationDeadlineValidator';
import { Router } from '@angular/router';
import { ActivitiesCalendar } from '../../activities/activities-calendar/activities-calendar';
import { AuthService } from '../../../services/auth.service';
import { ServActivitiesApi } from '../../../services/serv-activities-api';
import { ServCategoriesApi } from '../../../services/serv-categories-api';
import { ServOrganizersApi } from '../../../services/serv-organizers-api';

declare const bootstrap: any;

@Component({
  selector: 'app-my-activities-page',
  imports: [ActivitiesCalendar, ReactiveFormsModule],
  templateUrl: './my-activities-page.html',
  styleUrl: './my-activities-page.css'
})
export class MyActivitiesPage {

  activities: Activity[] = [];
  categories: Category[] = [];
  organizers: Organizer[] = [];

  formActivity!: FormGroup;
  editingId: number | null = null;

  minDate:string = "2020-01-01";
  maxDate = new Date().toISOString().split("T")[0]; ///fecha con formato yyyy-mm-dd

  photoPreview: string | null = null;
  modalRef: any;

  userId = 0;

  constructor(
    private activitiesService: ServActivitiesApi,
    private categoriesService: ServCategoriesApi,
    private organizersService: ServOrganizersApi,
    private authService: AuthService,
    private formbuilder: FormBuilder,
    private router: Router
  ) {

    this.formActivity = this.formbuilder.group({
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
      active: [true]
    }, { validators: [horaRangeValidator, registrationDeadlineValidator] });

  }

  ngOnInit() {
    this.loadActivities();
    this.loadCategories();
    this.loadData();
  }

  loadActivities(){
    this.activitiesService.getActivities().subscribe(data => {
      this.activities = data;
    });
  }

  loadCategories(){
    this.categoriesService.getCategories().subscribe(data => {
      this.categories = data;
    });
  }

  loadData() {
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.userId = Number(userId);

    this.organizersService.getOrganizers().subscribe(orgs => {

      this.organizers = orgs;
      const organizer = orgs.find(o => o.id === this.userId);

      if (!organizer) {
        this.activities = [];
        return;
      }

      this.activitiesService.getActivities().subscribe(list => {
        this.activities = list.filter(a => a.organizerId === organizer.id);
      });

    });
  }

  @ViewChild("activityModalRef") modalElement!: ElementRef;
  ngAfterViewInit() {
    this.modalRef = new bootstrap.Modal(this.modalElement.nativeElement);
  }

  get maxDeadlineDate() { return this.formActivity.get('date')?.value || this.maxDate; }

  openNew() {
    this.editingId = null;

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
      active: true
    });

    this.photoPreview = null;
    this.modalRef.show();
  }

  openEditById(id: number) {
    const activity = this.activities.find(a => a.id === id);
    if (!activity) return;

    this.editingId = id;

    const [startTime, endTime] = activity.timeRange?.split(' - ') ?? ['', ''];

    this.formActivity.patchValue({
      ...activity,
      startTime,
      endTime
    });

    this.photoPreview = activity.photoUrl ?? null;
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

    datos.organizerId = String(this.userId);

    if (this.editingId) {
      this.activitiesService.update({ ...datos, id: this.editingId }).subscribe(() => {
        alert("Actividad actualizada");
        this.modalRef.hide();
        this.loadActivities();
      });
    } else {
      this.activitiesService.create(datos).subscribe(() => {
        alert("Actividad creada");
        this.modalRef.hide();
        this.loadActivities();
      });
    }
  }

  delete(activity: Activity) {
    const confirmado = confirm(`¿Eliminar actividad "${activity.title}"?`);
    if (!confirmado) return;

    this.activitiesService.delete(Number(activity.id)).subscribe(() => {
      alert("Actividad eliminada");
      this.loadActivities();
    });
  }

  view(activity: Activity) {
    this.router.navigate(['/activity-view', activity.id]);
  }

  updatePhotoPreview() {
    const url = this.formActivity.get('photoUrl')?.value;
    this.photoPreview = url?.trim() ? url : null;
  }
}