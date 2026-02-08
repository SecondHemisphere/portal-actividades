import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Organizer, ShiftType, WeekDay } from '../../../models/Organizer';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { ServOrganizersApi } from '../../../services/serv-organizers-api';
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
  formOrganizer!: FormGroup;
  modalRef: any;
  shifts = Object.values(ShiftType);
  workDays = Object.values(WeekDay);
  photoPreview: string | null = null;

  organizerEdit: Organizer = {} as Organizer; // para foto

  @ViewChild("organizerModalRef") modalElement!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private organizerService: ServOrganizersApi,
    private authService: AuthService,
    private ui: UiAlertService,
    private apiError: ApiErrorService
  ) {
    this.formOrganizer = this.fb.group({})
  }

  ngOnInit() {
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.organizerService.getOrganizerById(Number(userId)).subscribe(org => {
      this.organizer = {
        ...org,
        shifts: this.parseShifts(org.shifts),
        workDays: this.parseWorkDays(org.workDays)
      };
      this.initForm();
    });
  }

  ngAfterViewInit() {
    this.modalRef = new bootstrap.Modal(this.modalElement.nativeElement);
  }

  initForm() {
    this.formOrganizer = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      email: [this.organizer.email, [Validators.required, Validators.email]],
      phone: [this.organizer.phone, [Validators.required, Validators.pattern(/^\+?[0-9]{7,15}$/)]],
      department: [this.organizer.department, [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      position: [this.organizer.position, [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      bio: [this.organizer.bio, [Validators.required, Validators.minLength(10), Validators.maxLength(300)]],
      shifts: [this.parseShifts(this.organizer.shifts), Validators.required],
      workDays: [this.parseWorkDays(this.organizer.workDays), Validators.required],
      photoUrl: [this.organizer.photoUrl || '']
    });

    this.photoPreview = this.organizer.photoUrl || null;
  }

  updatePhotoPreview() {
    const url = this.formOrganizer.get('photoUrl')?.value;
    this.photoPreview = url && url.trim() !== '' ? url : null;
  }

  openEditProfile(organizer: Organizer) {
    this.organizerEdit = organizer;
    this.formOrganizer.patchValue({
      ...organizer,
      shifts: this.parseShifts(organizer.shifts),
      workDays: this.parseWorkDays(organizer.workDays)
    });
    this.photoPreview = organizer.photoUrl || null;
    this.modalRef.show();
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
      shifts: Array.isArray(datos.shifts) ? datos.shifts.join(',') : '',
      workDays: Array.isArray(datos.workDays) ? datos.workDays.join(',') : ''
    };

    this.ui.confirm('¿Deseas actualizar tu perfil?', 'Se actualizarán tus datos del perfil.').then(result => {
      if (!result.isConfirmed) return;

      this.organizerService.update(payload).subscribe({
        next: () => {
          const userId = this.authService.getUserId();
          if (!userId) return;

          this.organizerService.getOrganizerById(Number(userId)).subscribe({
            next: org => {
              this.organizer = {
                ...org,
                shifts: this.parseShifts(org.shifts),
                workDays: this.parseWorkDays(org.workDays)
              };
              this.photoPreview = org.photoUrl || null;
              this.ui.success('¡Perfil actualizado!');
              this.modalRef.hide();
            },
            error: err => this.apiError.handle(err, 'refrescar perfil de organizador')
          });
        },
        error: err => this.apiError.handle(err, 'actualizar perfil de organizador')
      });
    });
  }

  parseShifts(val: string | ShiftType[] | undefined): ShiftType[] {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    return (val as string).split(',').map(s => s.trim() as ShiftType);
  }

  parseWorkDays(val: string | WeekDay[] | undefined): WeekDay[] {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    return (val as string).split(',').map(d => d.trim() as WeekDay);
  }
  
}
