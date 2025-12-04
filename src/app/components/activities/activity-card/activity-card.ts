import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Activity } from '../../../models/Activity';
import { Category } from '../../../models/Category';
import { Organizer } from '../../../models/Organizer';
import { CommonModule } from '@angular/common';

export type ActivityCardMode = 'student' | 'organizer' | 'read-only' | 'my-enrollment';

@Component({
  selector: 'app-activity-card',
  templateUrl: './activity-card.html',
  styleUrl: './activity-card.css',
  imports: [CommonModule],
})
export class ActivityCard {
  @Input() activity!: Activity;
  @Input() categories: Category[] = [];
  @Input() organizers: Organizer[] = [];
  @Input() mode: ActivityCardMode = 'read-only';
  @Input() enrollmentStatus?: string;

  @Output() enrollClickedEvent = new EventEmitter<Activity>();
  @Output() cancelClickedEvent = new EventEmitter<Activity>();
  @Output() viewClickedEvent = new EventEmitter<Activity>();

  getCategoryName(): string {
    return this.categories.find(c => Number(c.id) === Number(this.activity.categoryId))?.name || 'Sin categoría';
  }

  getOrganizerName(): string {
    return this.organizers.find(o => Number(o.id) === Number(this.activity.organizerId))?.name || 'Sin organizador';
  }

  getAvailableCapacity(): number {
    return this.activity.capacity;
  }

  isRegistrationClosed(): boolean {
    const deadline = new Date(this.activity.registrationDeadline);
    return deadline < new Date();
  }

  enrollClicked() {
    this.enrollClickedEvent.emit(this.activity);
  }

  cancelClicked() {
    this.cancelClickedEvent.emit(this.activity);
  }

  viewClicked() {
    this.viewClickedEvent.emit(this.activity);
  }
}
