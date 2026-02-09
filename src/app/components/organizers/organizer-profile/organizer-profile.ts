import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Organizer, ShiftType, WeekDay } from '../../../models/Organizer';
import { ServProfileApi } from '../../../services/serv-profile-api';
import { UiAlertService } from '../../../shared/ui-alert.service';
import { ApiErrorService } from '../../../shared/api-error.service';

declare const bootstrap: any;

@Component({
  selector: 'app-organizer-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './organizer-profile.html',
  styleUrl: './organizer-profile.css'
})
export class OrganizerProfile {

  organizer!: Organizer;
  formOrganizer: FormGroup;
  modalRef: any;

  shifts = Object.values(ShiftType);
  workDays = Object.values(WeekDay);

  photoPreview: string | null = null;

  @ViewChild('organizerModalRef') modalElement!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private profileService: ServProfileApi,
    private ui: UiAlertService,
    private apiError: ApiErrorService
  ) {
    this.formOrganizer = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      email: [null, [Validators.required, Validators.email]],
      phone: [null, [Validators.required, Validators.pattern(/^\+?[0-9]{7,15}$/)]],
      department: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      position: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      bio: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(300)]],
      shifts: [[], Validators.required],
      workDays: [[], Validators.required],
      photoUrl: ['']
    });
  }

  ngOnInit() {
    this.loadProfile();
  }

  ngAfterViewInit() {
    this.modalRef = new bootstrap.Modal(this.modalElement.nativeElement);
  }

  loadProfile() {
    this.profileService.getMyOrganizerProfile().subscribe({
      next: org => {
        this.organizer = {
          ...org,
          shifts: this.parseShifts(org.shifts),
          workDays: this.parseWorkDays(org.workDays)
        };

        this.photoPreview = org.photoUrl || null;

        this.formOrganizer.patchValue({
          name: this.organizer.name,
          email: this.organizer.email,
          phone: this.organizer.phone,
          department: this.organizer.department,
          position: this.organizer.position,
          bio: this.organizer.bio,
          shifts: this.organizer.shifts,
          workDays: this.organizer.workDays,
          photoUrl: this.organizer.photoUrl
        });
      },
      error: err => this.apiError.handle(err, 'cargar perfil de organizador')
    });
  }

  openEditProfile() {
    this.modalRef.show();
  }

  updatePhotoPreview() {
    const url = this.formOrganizer.get('photoUrl')?.value;
    this.photoPreview = url && url.trim() !== '' ? url : null;
  }

  onShiftChange(event: any, shift: ShiftType) {
    const selected: ShiftType[] = this.formOrganizer.get('shifts')?.value || [];
    if (event.target.checked) {
      if (!selected.includes(shift)) selected.push(shift);
    } else {
      const index = selected.indexOf(shift);
      if (index > -1) selected.splice(index, 1);
    }
    this.formOrganizer.get('shifts')?.setValue(selected);
  }

  onDayChange(event: any, day: WeekDay) {
    const selected: WeekDay[] = this.formOrganizer.get('workDays')?.value || [];
    if (event.target.checked) {
      if (!selected.includes(day)) selected.push(day);
    } else {
      const index = selected.indexOf(day);
      if (index > -1) selected.splice(index, 1);
    }
    this.formOrganizer.get('workDays')?.setValue(selected);
  }

  save() {
    if (this.formOrganizer.invalid) {
      this.formOrganizer.markAllAsTouched();
      return;
    }

    const datos = this.formOrganizer.value;

    const payload: Organizer = {
      ...this.organizer,
      ...datos,
      shifts: datos.shifts.join(','),
      workDays: datos.workDays.join(',')
    };

    this.ui
      .confirm('¿Deseas actualizar tu perfil?', 'Se guardarán tus cambios.')
      .then(result => {
        if (!result.isConfirmed) return;

        this.profileService.updateMyOrganizerProfile(payload).subscribe({
          next: () => {
            this.loadProfile();
            this.ui.success('¡Perfil actualizado!');
            this.modalRef.hide();
          },
          error: err =>
            this.apiError.handle(err, 'actualizar perfil de organizador')
        });
      });
  }

  parseShifts(val: string | ShiftType[] | undefined): ShiftType[] {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    return val.split(',').map(s => s.trim() as ShiftType);
  }

  parseWorkDays(val: string | WeekDay[] | undefined): WeekDay[] {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    return val.split(',').map(d => d.trim() as WeekDay);
  }

}
