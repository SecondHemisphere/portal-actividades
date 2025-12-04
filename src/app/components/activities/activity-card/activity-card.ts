import { Component, Input, Output, EventEmitter, CSP_NONCE } from '@angular/core';
import { Activity } from '../../../models/Activity';
import { Category } from '../../../models/Category';
import { Organizer } from '../../../models/Organizer';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export type ActivityCardMode = 'read-only' | 'my-enrollment';

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
  
  constructor(private router:Router) {
  }

  getCategoryName(): string {
    return this.categories.find(c => Number(c.id) === Number(this.activity.categoryId))?.name || 'Sin categoría';
  }

  getOrganizerName(): string {
    return this.organizers.find(o => Number(o.id) === Number(this.activity.organizerId))?.name || 'Sin organizador';
  }

  isRegistrationClosed(): boolean {
    const deadline = new Date(this.activity.registrationDeadline);
    return deadline < new Date();
  }

  view() {
    console.log(this.activity.id)
    this.router.navigate(["/activity-view/",this.activity.id]);
  }

}
