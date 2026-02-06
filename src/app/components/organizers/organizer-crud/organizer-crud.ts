import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SearchFilter, SearchForm } from '../../shared/search-form/search-form';
import { DataTable, TableColumn } from '../../shared/data-table/data-table';
import { ShiftType, Organizer, WeekDay } from '../../../models/Organizer';
import { ServOrganizersApi } from '../../../services/serv-organizers-api';
import Swal from 'sweetalert2';

declare const bootstrap: any;

@Component({
  selector: 'app-organizer-crud',
  imports: [ReactiveFormsModule, DataTable, SearchForm],
  templateUrl: './organizer-crud.html',
  styleUrl: './organizer-crud.css',
})
export class OrganizerCrud {

  organizers: Organizer[] = [];
  filteredOrganizers: Organizer[] = [];
  formOrganizer!: FormGroup;
  editingId: number | null = null;
  modalRef: any;

  shifts = Object.values(ShiftType);
  days = Object.values(WeekDay);

  photoPreview: string | null = null;
  organizerEdit:Organizer ={} as Organizer; //para foto

  organizerFilters: SearchFilter[] = [
    { type: 'text', field: 'name', label: 'Nombre' },
    { type: 'text', field: 'email', label: 'Correo' },
    { type: 'text', field: 'department', label: 'Departamento' },
    { type: 'text', field: 'position', label: 'Cargo' },
    {
      type: 'select',
      field: 'shift',
      label: 'Turno',
      options: Object.values(ShiftType).map(v => ({ label: v, value: v }))
    }
  ];

  colArray: TableColumn[] = [
    { field: 'id', header: 'ID', type: 'number' },
    { field: 'name', header: 'Nombre' },
    { field: 'bio', header: 'Biografía', type: 'longtext' },
    { field: 'email', header: 'Correo' },
    { field: 'phone', header: 'Teléfono' },
    { field: 'department', header: 'Departamento' },
    { field: 'position', header: 'Cargo' },
    { field: 'displayShifts', header: 'Turnos' },
    { field: 'displayDays', header: 'Días' },
    { field: 'active', header: 'Activo', type: 'boolean' }
  ];

  constructor(
    private miServicio: ServOrganizersApi,
    private formbuilder: FormBuilder
  ) {
    this.loadOrganizers();
    this.formOrganizer = this.formbuilder.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{7,15}$/)]],
      department: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      position: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      bio: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(300)]],
      shifts: [[], [Validators.required]],
      workDays: [[], [Validators.required]],
      photoUrl: [''],
      active: [true]
    });
  }

  @ViewChild("organizerModalRef") modalElement!: ElementRef;

  ngAfterViewInit() {
    this.modalRef = new bootstrap.Modal(this.modalElement.nativeElement);
  }

  onShiftChange(event: any, shift: ShiftType) {
    const selected: ShiftType[] = this.formOrganizer.get('shifts')?.value || [];

    if (event.target.checked) {
      if (!selected.includes(shift)) {
        selected.push(shift);
      }
    } else {
      const index = selected.indexOf(shift);
      if (index > -1) {
        selected.splice(index, 1);
      }
    }

    this.formOrganizer.get('shifts')?.setValue(selected);
  }

  onDayChange(event: any, day: WeekDay) {
    const selected: WeekDay[] = this.formOrganizer.get('workDays')?.value || [];

    if (event.target.checked) {
      if (!selected.includes(day)) {
        selected.push(day);
      }
    } else {
      const index = selected.indexOf(day);
      if (index > -1) {
        selected.splice(index, 1);
      }
    }

    this.formOrganizer.get('workDays')?.setValue(selected);
  }

  loadOrganizers() {
    this.miServicio.getOrganizers2().subscribe((data: Organizer[]) => {
      this.organizers = data.map(o => ({
        ...o,
        shifts: this.parseShifts(o.shifts),
        workDays: this.parseWorkDays(o.workDays),
        displayShifts: this.parseShifts(o.shifts).join(', '),
        displayDays: this.parseWorkDays(o.workDays).join(', ')
      }));

      this.filteredOrganizers = [...this.organizers];
    });
  }

  delete(org: Organizer) {
    Swal.fire({
      title: '¿Seguro deseas eliminar el organizador?',
      text: org.name,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.miServicio.delete(Number(org.id)).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Organizador eliminado',
              showConfirmButton: false,
              timer: 1500
            });
            this.loadOrganizers();
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo eliminar el organizador.',
            });
            console.error(err);
          }
        });
      }
    });
  }

  search(filters: any) {
    this.miServicio.search(filters).subscribe(
      (data: Organizer[]) => {
        this.filteredOrganizers = data.map(o => {
          const shiftsParsed = this.parseShifts(o.shifts);
          const daysParsed = this.parseWorkDays(o.workDays);

          return {
            ...o,
            shifts: shiftsParsed,
            workDays: daysParsed,
            displayShifts: shiftsParsed.join(', '),
            displayDays: daysParsed.join(', ')
          };
        });
      }
    );
  }

  openNew() {
    this.editingId = null;

    this.formOrganizer.reset({
      email: 'example@uni.edu',
      active: true
    });

    this.formOrganizer.get('shifts')?.setValue([]);
    this.formOrganizer.get('workDays')?.setValue([]);
    this.photoPreview = null;
    this.modalRef.show();
  }

  updatePhotoPreview() {
    const url = this.formOrganizer.get('photoUrl')?.value;
    this.photoPreview = url && url.trim() !== '' ? url : null;
  }

  openEdit(org: Organizer) {
    this.organizerEdit = org;
    this.editingId = org.id ?? null;

    this.formOrganizer.patchValue({
      name: org.name,
      email: org.email,
      phone: org.phone,
      department: org.department,
      position: org.position,
      bio: org.bio,
      photoUrl: org.photoUrl,
      active: org.active
    });

    this.formOrganizer.get('shifts')?.setValue(this.parseShifts(org.shifts));
    this.formOrganizer.get('workDays')?.setValue(this.parseWorkDays(org.workDays));

    this.photoPreview = org.photoUrl || null;
    this.modalRef.show();
  }

  save() {
    if (this.formOrganizer.invalid) {
      this.formOrganizer.markAllAsTouched();
      return;
    }

    const datos = this.formOrganizer.value;

    const payload = {
      ...datos,
      shifts: Array.isArray(datos.shifts) ? datos.shifts.join(',') : '',
      workDays: Array.isArray(datos.workDays) ? datos.workDays.join(',') : ''
    };

    if (this.editingId) {
      const organizerToUpdate = { ...payload, id: this.editingId };
      this.miServicio.update(organizerToUpdate).subscribe({
        next: (res: any) => {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: res?.message ?? 'Organizador actualizado correctamente'
          });
          this.modalRef.hide();
          this.loadOrganizers();
        },
        error: (err) => {
          let errorMsg = 'Error al actualizar el organizador';
          if (err.error) {
            if (err.error.name) errorMsg = err.error.name.join(', ');
            if (err.error.email) errorMsg = err.error.email.join(', ');
          }
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorMsg
          });
        }
      });
    } else {
      this.miServicio.create(payload).subscribe({
        next: (res: any) => {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: res?.message ?? 'Organizador creado correctamente'
          });
          this.modalRef.hide();
          this.loadOrganizers();
        },
        error: (err) => {
          let errorMsg = 'Error al crear el organizador';
          if (err.error) {
            if (err.error.name) errorMsg = err.error.name.join(', ');
            if (err.error.email) errorMsg = err.error.email.join(', ');
          }
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorMsg
          });
        }
      });
    }
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
