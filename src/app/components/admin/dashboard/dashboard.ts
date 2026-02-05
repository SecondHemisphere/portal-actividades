import { Component, OnInit } from '@angular/core';
import { DashboardApiService } from '../../../services/serv-dashboard-api';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  imports: [DecimalPipe],
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  loading = true;

  // Totales
  totalActivities = 0;
  totalOrganizers = 0;
  totalUsers = 0;
  totalStudents = 0;
  totalEnrollments = 0;
  totalCategories = 0;
  totalRatings = 0;

  // Datos para gráficos
  chartInscriptions: { label: string; value: number }[] = [];

  donutBackground = '';
  donutCategories: { label: string; count: number; color: string }[] = [];

  chartTopRatings: { label: string; value: number; percent: number }[] = [];

  constructor(private dashboardApi: DashboardApiService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;

    // Totales
    this.dashboardApi.getTotals().subscribe({
      next: totals => {
        this.totalActivities = totals.totalActivities;
        this.totalOrganizers = totals.totalOrganizers;
        this.totalUsers = totals.totalUsers;
        this.totalStudents = totals.totalStudents;
        this.totalEnrollments = totals.totalEnrollments;
        this.totalCategories = totals.totalCategories;
        this.totalRatings = totals.totalRatings;
      },
      error: err => console.error(err)
    });

    // Actividades por categoría (donut)
    this.dashboardApi.getActivitiesByCategory().subscribe({
      next: data => {
        this.donutCategories = data.map((d, i) => ({
          label: d.categoryName,
          count: d.totalActivities,
          color: this.getColor(i)
        }));
        this.generateDonutBackground();
      },
      error: err => console.error(err)
    });

    // Top ratings
    this.dashboardApi.getTopRatings().subscribe({
      next: data => {
        const max = Math.max(...data.map(d => d.avgRating), 1);
        this.chartTopRatings = data.map(d => ({
          label: d.activityTitle,
          value: d.avgRating,
          percent: (d.avgRating / max) * 100
        }));
      },
      error: err => console.error(err)
    });

    this.loading = false;
  }

  private getColor(index: number): string {
    const colors = [
      '#944FB6', '#5A67D8', '#4C9FE3', '#2D3748', '#3CA38E',
      '#C09B40', '#E29578', '#429E51', '#D977CE', '#D96459'
    ];
    return colors[index % colors.length];
  }

  private generateDonutBackground(): void {
    let start = 0;
    const total = this.donutCategories.reduce((sum, c) => sum + c.count, 0);
    const slices = this.donutCategories.map(c => {
      const angle = total ? (c.count / total) * 360 : 0;
      const end = start + angle;
      const slice = `${c.color} ${start}deg ${end}deg`;
      start = end;
      return slice;
    });
    this.donutBackground = `conic-gradient(${slices.join(',')})`;
  }

}
