import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordMatchValidator(): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const password = formGroup.get('password')?.value;
    const confirmPasswordControl = formGroup.get('confirmPassword');

    if (!password || !confirmPasswordControl) return null;

    if (password !== confirmPasswordControl.value) {
      confirmPasswordControl.setErrors({
        ...confirmPasswordControl.errors,
        passwordMismatch: true
      });
    } else {
      if (confirmPasswordControl.errors) {
        const { passwordMismatch, ...otherErrors } = confirmPasswordControl.errors;
        confirmPasswordControl.setErrors(Object.keys(otherErrors).length ? otherErrors : null);
      }
    }

    return null;
  };
}
