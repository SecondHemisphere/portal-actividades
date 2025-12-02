import { AbstractControl, ValidationErrors } from '@angular/forms';

export function registrationDeadlineValidator(control: AbstractControl): ValidationErrors | null {
  const eventDate = control.get('date')?.value;
  const deadline = control.get('registrationDeadline')?.value;

  if (!eventDate || !deadline) return null;

  return new Date(deadline) > new Date(eventDate)
    ? { deadlineInvalida: true }
    : null;
}
