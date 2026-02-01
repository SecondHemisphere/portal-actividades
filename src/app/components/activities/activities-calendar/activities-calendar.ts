import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Activity } from '../../../models/Activity';
import { Organizer } from '../../../models/Organizer';
import { AuthService } from '../../../services/auth.service';
import { ServActivitiesApi } from '../../../services/serv-activities-api';
import { ServOrganizersApi } from '../../../services/serv-organizers-api';

@Component({
  selector: 'app-activities-calendar',
  imports: [CommonModule, FormsModule],
  templateUrl: './activities-calendar.html',
  styleUrl: './activities-calendar.css',
})
export class ActivitiesCalendar {

  @Output() editActivity = new EventEmitter<number>();
  @Output() newActivity = new EventEmitter<void>();

  organizers: Organizer[] = [];
  activities: Activity[] = [];
  userId = 0;

  filteredDays: {
    date: Date;
    activities: {
      id: number;
      title: string;
      active: boolean;
      start: string;
      end: string;
      eventDate: string | undefined;
      organizer?: Organizer;
    }[];
  }[] = [];

  selectedYear = new Date().getFullYear();
  selectedMonth = new Date().getMonth();

  months = [
    'Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
  ];

  constructor(
    private activitiesService: ServActivitiesApi,
    private organizersService: ServOrganizersApi,
    private authService: AuthService,
    private router: Router
  )
  {
    this.loadData();
  }

  loadData() {
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.userId = Number(userId);

    this.organizersService.getOrganizers().subscribe(orgs => {

      this.organizers = orgs;
      const organizer = orgs.find(o => o.id === this.userId);

      if (!organizer) {
        this.activities = [];
        this.filteredDays = [];
        return;
      }

      this.activitiesService.getActivities().subscribe(list => {
        this.activities = list.filter(a => a.organizerId === organizer.id);
        this.generateFilteredDays();
      });
    });
  }

  generateFilteredDays() {
    this.filteredDays = [];

    this.activities.forEach(act => {
      if (!act.date) return;

      const eventDateObj = new Date(act.date + 'T00:00:00');

      if (
        eventDateObj.getFullYear() === this.selectedYear &&
        eventDateObj.getMonth() === this.selectedMonth
      ) {

        let day = this.filteredDays.find(d =>
          d.date.getFullYear() === eventDateObj.getFullYear() &&
          d.date.getMonth() === eventDateObj.getMonth() &&
          d.date.getDate() === eventDateObj.getDate()
        );

        if (!day) {
          day = { date: eventDateObj, activities: [] };
          this.filteredDays.push(day);
        }

        const organizer = this.organizers.find(o => o.id === act.organizerId);

        const [startRaw, endRaw] =
          act.timeRange?.split('-').map(t => t.trim()) ?? [];

        day.activities.push({
          id: act.id!,
          title: act.title ?? 'Actividad',
          active: act.active,
          start: startRaw || '—',
          end: endRaw || '—',
          eventDate: act.date,
          organizer: organizer
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

  edit(id: number) {
    this.editActivity.emit(id);
  }

  new() {
    this.newActivity.emit();
  }

}
