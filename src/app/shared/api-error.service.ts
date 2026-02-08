import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class ApiErrorService {

  handle(err: any, action: string = 'procesar') {
    console.error(`Error al ${action}:`, err);

    if (err.status === 400 && err.error?.errors) {
      this.handleModelStateErrors(err, action);
    }
    else if (err.status === 400 && err.error?.message) {
      this.handleBackendErrors(err, action);
    }
    else if (err.status === 400 && Array.isArray(err.error?.errors)) {
      this.handleArrayErrors(err, action);
    }
    else {
      this.handleGenericError(err, action);
    }
  }

  private handleModelStateErrors(err: any, action: string) {
    const validationErrors = err.error.errors;
    let errorMessage = '<div style="text-align: left;">';

    Object.keys(validationErrors).forEach(field => {
      const fieldErrors = validationErrors[field];
      if (Array.isArray(fieldErrors)) {
        fieldErrors.forEach(error => {
          const fieldName = this.translateFieldName(field);
          errorMessage += `<strong>${fieldName}:</strong> ${error}<br>`;
        });
      }
    });

    errorMessage += '</div>';

    Swal.fire({
      icon: 'error',
      title: `Error al ${action}`,
      html: errorMessage,
      confirmButtonText: 'Entendido'
    });
  }

  private handleBackendErrors(err: any, action: string) {
    let errorMessage = err.error.message;
    
    const fieldTranslations = this.getFieldTranslations();
    Object.keys(fieldTranslations).forEach(englishField => {
      const spanishField = fieldTranslations[englishField];
      const regex1 = new RegExp(`\\b${englishField}\\b`, 'gi');
      const regex2 = new RegExp(`'${englishField}'`, 'gi');
      
      errorMessage = errorMessage.replace(regex1, spanishField);
      errorMessage = errorMessage.replace(regex2, `'${spanishField}'`);
    });

    if (errorMessage.toLowerCase().includes('name') &&
        !errorMessage.toLowerCase().includes('nombre')) {
      errorMessage = errorMessage.replace(/name/gi, 'Nombre');
    }

    Swal.fire({
      icon: 'error',
      title: `Error al ${action}`,
      text: errorMessage,
      confirmButtonText: 'Entendido'
    });
  }

  private handleArrayErrors(err: any, action: string) {
    const errors = err.error.errors as string[];
    let errorMessage = '<div style="text-align: left;">';
    
    errors.forEach(error => {
      let translatedError = error;
      const fieldTranslations = this.getFieldTranslations();
      
      Object.keys(fieldTranslations).forEach(englishField => {
        const spanishField = fieldTranslations[englishField];
        const regex = new RegExp(`\\b${englishField}\\b`, 'gi');
        translatedError = translatedError.replace(regex, spanishField);
      });
      
      errorMessage += `${translatedError}<br>`;
    });
    
    errorMessage += '</div>';

    Swal.fire({
      icon: 'error',
      title: `Error al ${action}`,
      html: errorMessage,
      confirmButtonText: 'Entendido'
    });
  }

  private handleGenericError(err: any, action: string) {
    let errorMsg = err.error?.message ||
                   err.error?.title ||
                   `Ocurrió un error al ${action}. Por favor, intente nuevamente.`;

    const fieldTranslations = this.getFieldTranslations();
    Object.keys(fieldTranslations).forEach(englishField => {
      const spanishField = fieldTranslations[englishField];
      const regex = new RegExp(`\\b${englishField}\\b`, 'gi');
      errorMsg = errorMsg.replace(regex, spanishField);
    });

    Swal.fire({
      icon: 'error',
      title: `Error al ${action}`,
      text: errorMsg,
      confirmButtonText: 'Entendido'
    });
  }

  private translateFieldName(field: string): string {
    const translations = this.getFieldTranslations();
    return translations[field] || field;
  }

  private getFieldTranslations(): { [key: string]: string } {
    return {
      'Name': 'Nombre',
      'name': 'Nombre',
      'PhotoUrl': 'URL de la foto',
      'TimeRange': 'Horario',
      'Title': 'Título',
      'CategoryId': 'Categoría',
      'OrganizerId': 'Organizador',
      'StudentId': 'Estudiante',
      'Date': 'Fecha',
      'RegistrationDeadline': 'Fecha límite de inscripción',
      'Location': 'Lugar',
      'Capacity': 'Capacidad',
      'Description': 'Descripción',
      'StartTime': 'Hora de inicio',
      'EndTime': 'Hora de fin',
      'Email': 'Correo electrónico',
      'Password': 'Contraseña',
      'ConfirmPassword': 'Confirmar contraseña',
      'Phone': 'Teléfono',
      'Note': 'Nota',
      'Status': 'Estado',
    };
  }
  
}