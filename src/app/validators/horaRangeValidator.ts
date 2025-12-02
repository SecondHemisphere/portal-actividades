import { AbstractControl, ValidationErrors } from '@angular/forms';

export function horaRangeValidator(control: AbstractControl): ValidationErrors | null {
  const start = control.get('startTime')?.value;
  const end = control.get('endTime')?.value;

  if (!start || !end) return null;

  return start >= end ? { horaInvalida: true } : null;
}
