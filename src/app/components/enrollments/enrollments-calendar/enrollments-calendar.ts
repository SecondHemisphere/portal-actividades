import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Enrollment } from '../../../models/Enrollment';
import { ServEnrollmentsJson } from '../../../services/serv-enrollments-json';
import { ServActivitiesJson } from '../../../services/serv-activities-json';
import { Activity } from '../../../models/Activity';
import { AuthService } from '../../../services/auth/auth-service';

@Component({
  selector: 'app-enrollments-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './enrollments-calendar.html',
  styleUrl: './enrollments-calendar.css',
})
export class EnrollmentsCalendar {

  enrollments: Enrollment[] = [];
  activities: Activity[] = [];
  userId = 0;

  filteredDays: {
    date: Date;
    activities: {
      id: number;
      title: string;
      status: string;
      start: string;
      end: string;
      eventDate: string | undefined;
      enrollmentDate: string;
    }[];
  }[] = [];

  selectedYear = new Date().getFullYear();
  selectedMonth = new Date().getMonth();

  months = [
    'Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
  ];

  constructor(
    private enrollmentsService: ServEnrollmentsJson,
    private activitiesService: ServActivitiesJson,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const user = this.auth.getCurrentUserValue();
    if (!user) return;

    this.userId = Number(user.id);
    this.loadEnrollments();
  }

  loadEnrollments() {
    this.enrollmentsService.getEnrollmentsByStudent(this.userId).subscribe(enrs => {
      this.enrollments = enrs || [];

      const ids = this.enrollments.map(e => e.activityId);

      this.activitiesService.getActivities().subscribe(actList => {
        this.activities = actList.filter(a => ids.includes(a.id!));
        this.generateFilteredDays();
      });
    });
  }

  generateFilteredDays() {
    this.filteredDays = [];

    this.enrollments.forEach(e => {
      const act = this.activities.find(a => a.id === e.activityId);
      if (!act) return;

      const eventDateObj = new Date(act.date);
      const year = eventDateObj.getFullYear();
      const month = eventDateObj.getMonth();

      if (year === this.selectedYear && month === this.selectedMonth) {

        let day = this.filteredDays.find(d =>
          d.date.getFullYear() === eventDateObj.getFullYear() &&
          d.date.getMonth() === eventDateObj.getMonth() &&
          d.date.getDate() === eventDateObj.getDate()
        );

        if (!day) {
          day = {
            date: eventDateObj,
            activities: []
          };
          this.filteredDays.push(day);
        }

        const [startRaw, endRaw] =
          act.timeRange?.split('-').map(t => t.trim()) ?? [];

        day.activities.push({
          id: e.activityId,
          title: act.title || 'Actividad',
          status: e.status,
          start: startRaw || '—',
          end: endRaw || '—',
          eventDate: act.date,
          enrollmentDate: e.date
        });
      }
    });

    this.filteredDays.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  prevMonth() {
    if (this.selectedMonth === 0) {
      this.selectedMonth = 11;
      this.selectedYear--;
    } else {
      this.selectedMonth--;
    }
    this.generateFilteredDays();
  }

  nextMonth() {
    if (this.selectedMonth === 11) {
      this.selectedMonth = 0;
      this.selectedYear++;
    } else {
      this.selectedMonth++;
    }
    this.generateFilteredDays();
  }

  view(id: number) {
    this.router.navigate(['/activity-view', id]);
  }

  cancel(id: number) {
    this.router.navigate(['/activity-view', id]);
  }
}
