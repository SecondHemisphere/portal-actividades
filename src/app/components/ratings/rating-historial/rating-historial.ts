import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServRatingsJson } from '../../../services/serv-ratings-json';
import { Rating } from '../../../models/Rating';
import { Activity } from '../../../models/Activity';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ServActivitiesApi } from '../../../services/serv-activities-api';

@Component({
  selector: 'app-rating-historial',
  imports: [CommonModule],
  templateUrl: './rating-historial.html',
  styleUrl: './rating-historial.css'
})
export class RatingHistorial {

  ratings: (Rating & { activity?: Activity })[] = [];

  constructor(
    private ratingsService: ServRatingsJson,
    private activitiesService: ServActivitiesApi,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.loadRatings(Number(userId));
  }

  loadRatings(userId: number) {
    this.ratingsService.getRatingsByStudent(userId).subscribe(ratings => {
      this.ratings = ratings;

      this.ratings.forEach(r => {
        if (r.activityId !== undefined && r.activityId !== null) {
          this.activitiesService.getActivityById(r.activityId).subscribe(activity => {
            r.activity = activity;
          });
        }
      });
    });
  }

  view(id: number) {
    this.router.navigate(['/activity-view', id]);
  }
}
