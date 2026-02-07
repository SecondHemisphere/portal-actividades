import { Component, Input, Output, EventEmitter, CSP_NONCE } from '@angular/core';
import { Activity } from '../../../models/Activity';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-activity-card',
  templateUrl: './activity-card.html',
  styleUrl: './activity-card.css',
  imports: [CommonModule],
})
export class ActivityCard {
  @Input() activity!: Activity;
  
  constructor(private router:Router) {
  }

  view() {
    this.router.navigate(["/activity-view/",this.activity.id]);
  }

  getCategoryColor(): string {
    const colors = [
      '#944FB6',
      '#5A67D8',
      '#4C9FE3',
      '#2D3748',
      '#3CA38E',
      '#C09B40',
      '#E29578',
      '#429E51',
      '#D977CE',
      '#D96459',
    ];

    const index = (this.activity.categoryId - 1) % colors.length;
    return colors[index];
  }

}
