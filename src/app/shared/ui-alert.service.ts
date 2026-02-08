import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class UiAlertService {

  success(message: string, timer: number = 3000) {
    return this.fire('success', '¡Éxito!', message, false, timer);
  }

  error(message: string) {
    return this.fire('error', 'Error', message);
  }

  warning(message: string) {
    return this.fire('warning', 'Advertencia', message);
  }

  info(message: string, timer: number = 3000) {
    return this.fire('info', 'Información', message, false, timer);
  }

  confirm(
    title: string,
    text: string,
    confirmText: string = 'Confirmar',
    cancelText: string = 'Cancelar',
    icon: SweetAlertIcon = 'question'
  ) {
    return Swal.fire({
      title,
      text,
      icon,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
    });
  }

  deleteConfirm(
    itemName?: string,
    title: string = '¿Eliminar?',
    text: string = 'Esta acción no se puede deshacer'
  ) {
    return Swal.fire({
      title,
      text: itemName ? `¿Eliminar "${itemName}"?` : text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
  }

  private fire(
    icon: SweetAlertIcon,
    title: string,
    text: string,
    showConfirmButton: boolean = true,
    timer?: number
  ) {
    return Swal.fire({
      icon,
      title,
      text,
      showConfirmButton,
      ...(timer ? { timer } : {})
    });
  }
  
}
