import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SearchFilter, SearchForm } from '../../shared/search-form/search-form';
import { DataTable, TableColumn } from '../../shared/data-table/data-table';
import { ShiftType, Organizer, WeekDay } from '../../../models/Organizer';
import { ServOrganizersJson } from '../../../services/serv-organizers-json';

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
    { field: 'displayShifts', header: 'Disponibilidad' },
    { field: 'active', header: 'Activo', type: 'boolean' }
  ];

  constructor(
    private miServicio: ServOrganizersJson,
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
      photoUrl: ['', [Validators.required]],
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

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.photoPreview = reader.result as string;
      this.formOrganizer.patchValue({ photoUrl: this.photoPreview });
    };

    reader.readAsDataURL(file);
  }

  loadOrganizers() {
    this.miServicio.getOrganizers().subscribe((data: Organizer[]) => {

      this.organizers = data.map(o => ({
        ...o,
        displayShifts: o.shifts?.join(', ') ?? ''
      }));

      this.filteredOrganizers = [...this.organizers];
    });
  }

  delete(org: Organizer) {
    const confirmado = confirm(`¿Seguro de eliminar el organizador ${org.name}?`);
    if (confirmado) {
      this.miServicio.delete(org.id).subscribe(() => {
        alert("Organizador eliminado");
        this.loadOrganizers();
      });
    }
  }

  search(filters: any) {
    this.miServicio.searchOrganizers(filters).subscribe(
      (data: Organizer[]) => {
        this.filteredOrganizers = data.map(o => ({
          ...o,
          displayShifts: o.shifts?.join(', ')
        }));
      }
    );
  }

  openView(org: Organizer) {

  }

  openNew() {
    this.editingId = null;

    this.formOrganizer.reset({
      email: 'example@ug.edu.ec',
      active: true
    });

    this.formOrganizer.get('shifts')?.setValue([]);
    this.formOrganizer.get('workDays')?.setValue([]);

    this.modalRef.show();
  }

  openEdit(org: Organizer) {
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

    this.formOrganizer.get('shifts')?.setValue(org.shifts || []);
    this.formOrganizer.get('workDays')?.setValue(org.workDays || []);

    this.modalRef.show();
  }

  save() {
    if (this.formOrganizer.invalid) {
      this.formOrganizer.markAllAsTouched();
      return;
    }

    const datos = this.formOrganizer.value;

    datos.shifts = Array.isArray(datos.shifts) ? datos.shifts : [];
    datos.workDays = Array.isArray(datos.workDays) ? datos.workDays : [];

    if (this.editingId) {
      const organizer: Organizer = { ...datos, id: this.editingId };
      this.miServicio.update(organizer).subscribe(() => {
        alert("Organizador actualizado");
        this.modalRef.hide();
        this.loadOrganizers();
      });
    } else {
      const organizer: Organizer = { ...datos };
      this.miServicio.create(organizer).subscribe(() => {
        alert("Organizador creado");
        this.modalRef.hide();
        this.loadOrganizers();
      });
    }
  }
}
