import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServRatingsJson } from '../../../services/serv-ratings-json';
import { ServActivitiesJson } from '../../../services/serv-activities-json';
import { AuthService } from '../../../services/auth/auth-service';
import { Rating } from '../../../models/Rating';
import { Activity } from '../../../models/Activity';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rating-historial',
  imports: [CommonModule],
  templateUrl: './rating-historial.html',
  styleUrl: './rating-historial.css'
})
export class RatingHistorial {

  ratings: (Rating & { activity?: Activity })[] = [];
  userId!: number;

  constructor(
    private ratingsService: ServRatingsJson,
    private activitiesService: ServActivitiesJson,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUserValue();
    if (!user) return;

    this.userId = Number(user.id);

    this.loadRatings();
  }

  loadRatings() {
    this.ratingsService.getRatingsByStudent(this.userId).subscribe(ratings => {
      this.ratings = ratings;

      this.ratings.forEach(r => {
        this.activitiesService.getActivityById(r.activityId).subscribe(activity => {
          r.activity = activity;
        });
      });
    });
  }

  view(id: number) {
    this.router.navigate(['/activity-view', id]);
  }
}
