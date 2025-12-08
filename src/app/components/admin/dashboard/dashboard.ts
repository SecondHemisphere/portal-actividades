import { Component } from '@angular/core';
import { ServActivitiesJson } from '../../../services/serv-activities-json';
import { ServOrganizersJson } from '../../../services/serv-organizers-json';
import { ServCategoriesJson } from '../../../services/serv-categories-json';
import { ServStudentsJson } from '../../../services/serv-students-json';
import { ServEnrollmentsJson } from '../../../services/serv-enrollments-json';
import { ServUsersJson } from '../../../services/serv-users-json';
import { ServRatingsJson } from '../../../services/serv-ratings-json';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {

  loading: boolean = true;

  totalActivities: number = 0;
  totalOrganizers: number = 0;
  totalUsers: number = 0;

  totalStudents: number = 0;
  totalEnrollments: number = 0;
  totalCategories: number = 0;
  totalRatings: number = 0;

  constructor(
    private servActivities: ServActivitiesJson,
    private servOrganizers: ServOrganizersJson,
    private servCategories: ServCategoriesJson,
    private servStudents: ServStudentsJson,
    private servEnrollments: ServEnrollmentsJson,
    private servRatings: ServRatingsJson,
    private servUsers: ServUsersJson
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;

    this.servActivities.getActivities().subscribe(activities => {
      this.totalActivities  = activities.filter(a => a.active).length;
    });

    this.servOrganizers.getOrganizers().subscribe(orgs => {
      this.totalOrganizers = orgs.filter(o => o.active).length;
    });

    this.servStudents.getStudents().subscribe(students => {
      this.totalStudents = students.length;
    });

    this.servEnrollments.getEnrollments().subscribe(enrs => {
      this.totalEnrollments = enrs.length;
    });

    this.servRatings.getRatings().subscribe(rat => {
      this.totalRatings = rat.length;
    });

    this.servUsers.getUsers().subscribe(u => {
      this.totalUsers = u.length;
    });

    this.servCategories.getCategories().subscribe(cats => {
      this.totalCategories = cats.length;
      this.loading = false;
    });
  }
}