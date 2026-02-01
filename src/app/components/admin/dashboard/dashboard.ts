import { Component } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { ServActivitiesJson } from '../../../services/serv-activities-api';
import { ServOrganizersJson } from '../../../services/serv-organizers-json';
import { ServCategoriesJson } from '../../../services/serv-categories-json';
import { ServStudentsJson } from '../../../services/serv-students-json';
import { ServEnrollmentsJson } from '../../../services/serv-enrollments-json';
import { ServUsersJson } from '../../../services/serv-users-json';
import { ServRatingsJson } from '../../../services/serv-ratings-json';

import { Category } from '../../../models/Category';
import { Rating } from '../../../models/Rating';
import { Enrollment } from '../../../models/Enrollment';
import { Activity } from '../../../models/Activity';

@Component({
  selector: 'app-dashboard',
  imports: [DecimalPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {

  loading = true;

  totalActivities = 0;
  totalOrganizers = 0;
  totalUsers = 0;
  totalStudents = 0;
  totalEnrollments = 0;
  totalCategories = 0;
  totalRatings = 0;

  activities: Activity[] = [];
  categories: Category[] = [];
  ratings: Rating[] = [];
  enrollments: Enrollment[] = [];

  chartInscriptions: { label: string; value: number }[] = [];
  totalInscriptionsLastMonths = 0;

  donutBackground = '';
  donutCategories: any[] = [];

  linePoints: string = '';
  lineDots: { x: number; y: number }[] = [];

  chartTopRatings: any[] = [];

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

    let loaded = 0;
    const done = () => {
      loaded++;
      if (loaded === 7) {
        this.generateCharts();
        this.loading = false;
      }
    };

    this.servActivities.getActivities().subscribe(data => {
      this.activities = data;
      this.totalActivities = data.filter(a => a.active).length;
      done();
    });

    this.servOrganizers.getOrganizers().subscribe(data => {
      this.totalOrganizers = data.filter(o => o.active).length;
      done();
    });

    this.servStudents.getStudents().subscribe(data => {
      this.totalStudents = data.length;
      done();
    });

    this.servEnrollments.getEnrollments().subscribe(data => {
      this.enrollments = data;
      this.totalEnrollments = data.length;
      done();
    });

    this.servRatings.getRatings().subscribe(data => {
      this.ratings = data;
      this.totalRatings = data.length;
      done();
    });

    this.servUsers.getUsers().subscribe(data => {
      this.totalUsers = data.length;
      done();
    });

    this.servCategories.getCategories().subscribe(data => {
      this.categories = data;
      this.totalCategories = data.length;
      done();
    });
  }

  generateCharts(): void {
    this.generateDonutChart();
    this.generateTopRatings();
  }

  generateDonutChart(): void {
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

    const total = this.activities.length;
    let start = 0;
    const slices: string[] = [];

    this.donutCategories = this.categories.map((c, i) => {
      const count = this.activities.filter(a => a.categoryId === c.id).length;
      const angle = total ? (count / total) * 360 : 0;
      const end = start + angle;

      slices.push(`${colors[i % colors.length]} ${start}deg ${end}deg`);
      start = end;

      return {
        label: c.name,
        count,
        color: colors[i % colors.length]
      };
    });

    this.donutBackground = `conic-gradient(${slices.join(',')})`;
  }

  generateTopRatings(): void {
    const map: any[] = [];

    for (const r of this.ratings) {
      let item = map.find(m => m.id === r.activityId);
      if (!item) {
        item = { id: r.activityId, sum: 0, count: 0 };
        map.push(item);
      }
      item.sum += r.stars;
      item.count++;
    }

    const data = map
      .map(m => {
        const act = this.activities.find(a => a.id === m.id);
        return {
          label: act?.title ?? 'Actividad',
          value: m.sum / m.count
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    const max = Math.max(...data.map(d => d.value), 1);

    this.chartTopRatings = data.map(d => ({
      label: d.label,
      value: d.value,
      percent: (d.value / max) * 100
    }));
  }

}
