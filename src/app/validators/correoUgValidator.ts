import { AbstractControl, ValidationErrors } from "@angular/forms";

export function correoUgValidator(control:AbstractControl): ValidationErrors | null{
    const valor = control.value;
    if(valor && !valor.toLowerCase().endsWith("@ug.edu.ec")){
        return {dominioInvalido:true};
    }
    return null;
}