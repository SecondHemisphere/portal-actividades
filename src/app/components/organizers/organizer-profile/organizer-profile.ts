import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth-service';
import { ServOrganizersJson } from '../../../services/serv-organizers-json';
import { Organizer, ShiftType, WeekDay } from '../../../models/Organizer';
import { CommonModule } from '@angular/common';

declare const bootstrap: any;

@Component({
  selector: 'app-organizer-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './organizer-profile.html',
  styleUrls: ['./organizer-profile.css']
})
export class OrganizerProfile {
  organizer!: Organizer;
  formOrganizer!: FormGroup;
  modalRef: any;
  shifts = Object.values(ShiftType);
  workDays = Object.values(WeekDay);
  photoPreview: string | null = null;

  organizerEdit:Organizer ={} as Organizer; //para foto

  @ViewChild("organizerModalRef") modalElement!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private organizerService: ServOrganizersJson,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUserValue();
    if (!user) return;

    this.organizerService.getOrganizerById(Number(user.id)).subscribe(org => {
      this.organizer = org;
      this.initForm();
    });
  }

  ngAfterViewInit() {
    this.modalRef = new bootstrap.Modal(this.modalElement.nativeElement);
  }

  initForm() {
    this.formOrganizer = this.fb.group({
      name: [this.organizer.name, [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: [this.organizer.email, [Validators.required, Validators.email]],
      phone: [this.organizer.phone, [Validators.required, Validators.pattern(/^\+?[0-9]{7,15}$/)]],
      department: [this.organizer.department, [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      position: [this.organizer.position, [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      bio: [this.organizer.bio, [Validators.required, Validators.minLength(10), Validators.maxLength(300)]],
      shifts: [this.organizer.shifts || [], Validators.required],
      workDays: [this.organizer.workDays || [], Validators.required],
      photoUrl: [this.organizer.photoUrl || '']
    });

    this.photoPreview = this.organizer.photoUrl || null;
  }

  openEditProfile(organizer: Organizer) {
    this.organizerEdit = organizer;
    this.formOrganizer.patchValue(this.organizer);
    this.photoPreview = organizer.photoUrl || null;
    this.modalRef.show();
  }

  updatePhotoPreview() {
    const url = this.formOrganizer.get('photoUrl')?.value;
    this.photoPreview = url && url.trim() !== '' ? url : null;
  }

  save() {
    if (this.formOrganizer.invalid) {
      this.formOrganizer.markAllAsTouched();
      return;
    }

    const updatedOrganizer: Organizer = {
      ...this.organizer,
      ...this.formOrganizer.value
    };

    this.organizerService.update(updatedOrganizer).subscribe({
      next: () => {
        this.organizer = updatedOrganizer;
        alert('Perfil actualizado correctamente');
        this.modalRef.hide();
      },
      error: () => alert('Ocurrió un error al actualizar el perfil.')
    });
  }

  onShiftChange(event: any, shift: ShiftType) {
    const selected: ShiftType[] = this.formOrganizer.get('shifts')?.value || [];
    if (event.target.checked) {
      selected.push(shift);
    } else {
      const index = selected.indexOf(shift);
      if (index > -1) selected.splice(index, 1);
    }
    this.formOrganizer.get('shifts')?.setValue(selected);
  }

  onDayChange(event: any, day: WeekDay) {
    const selected: WeekDay[] = this.formOrganizer.get('workDays')?.value || [];
    if (event.target.checked) {
      selected.push(day);
    } else {
      const index = selected.indexOf(day);
      if (index > -1) selected.splice(index, 1);
    }
    this.formOrganizer.get('workDays')?.setValue(selected);
  }
}
