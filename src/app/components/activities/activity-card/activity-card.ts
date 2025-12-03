import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Activity } from '../../../models/Activity';
import { CommonModule } from '@angular/common';
import { Category } from '../../../models/Category';
import { Organizer } from '../../../models/Organizer';

@Component({
  selector: 'app-activity-card',
  imports: [CommonModule],
  templateUrl: './activity-card.html',
  styleUrl: './activity-card.css',
})
export class ActivityCard {

  @Input() activity!: Activity; // actividad que se muestra en la tarjeta
  @Input() categories: Category[] = []; // lista de categorías
  @Input() organizers: Organizer[] = [];  // lista de organizadores
  @Input() availableCapacity: number | null = null; // cupos restantes

  @Output() onEnroll = new EventEmitter<number>(); // evento cuando un estudiante se inscribe en una actividad

  getCategoryName(id: number): string {
    return this.categories.find(c => Number(c.id) === Number(id))?.name || 'General';
  }

  getOrganizerName(id: number): string {
    return this.organizers.find(o => Number(o.id) === Number(id))?.name || 'Desconocido';
  }

  /** Acción del botón Inscribirse */
  enrollClicked() {
    if (this.activity.id) {
      this.onEnroll.emit(this.activity.id);
    }
  }

  /** Verifica si la fecha límite de inscripción ha pasado */
  isRegistrationClosed(): boolean {
    const deadline = new Date(this.activity.registrationDeadline);
    const today = new Date();
    return deadline < today;
  }
}