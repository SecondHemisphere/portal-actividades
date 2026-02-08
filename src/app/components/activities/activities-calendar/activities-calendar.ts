import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Activity } from '../../../models/Activity';
import { AuthService } from '../../../services/auth.service';
import { ServActivitiesApi } from '../../../services/serv-activities-api';

@Component({
  selector: 'app-activities-calendar',
  imports: [CommonModule, FormsModule],
  templateUrl: './activities-calendar.html',
  styleUrl: './activities-calendar.css',
})
export class ActivitiesCalendar {

  @Output() editActivity = new EventEmitter<number>();
  @Output() newActivity = new EventEmitter<void>();
  @Output() activateActivity = new EventEmitter<number>();
  @Output() deactivateActivity = new EventEmitter<number>();

  @Input() refreshTrigger: boolean = false;

  activities: Activity[] = [];
  userId = 0;
  
  loading = false;

  filteredDays: {
    date: Date;
    activities: {
      id: number;
      title: string;
      active: boolean;
      start: string;
      end: string;
      eventDate: string | undefined;
      capacity: number;
      location: string;
      registrationDeadline: string;
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
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.userId = Number(userId);
    this.loadActivitiesForMonth();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['refreshTrigger']) {
      this.loadActivitiesForMonth();
    }
  }

  loadActivitiesForMonth() {
    this.loading = true;
    
    this.activitiesService
      .getActivitiesByOrganizerAndMonth(this.userId, this.selectedYear, this.selectedMonth)
      .subscribe({
        next: (list) => {
          this.activities = list;
          this.generateFilteredDays();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error cargando actividades:', error);
          this.loading = false;
          this.activities = [];
          this.filteredDays = [];
        }
      });
  }

  generateFilteredDays() {
    this.filteredDays = [];

    const daysMap = new Map<string, typeof this.filteredDays[0]>();

    this.activities.forEach(act => {
      if (!act.date) return;

      const dayKey = act.date;
      
      if (!daysMap.has(dayKey)) {
        const dateObj = this.parseDate(act.date);
        daysMap.set(dayKey, {
          date: dateObj,
          activities: []
        });
      }

      const day = daysMap.get(dayKey)!;

      const [startRaw, endRaw] = act.timeRange?.split('-').map(t => t.trim()) ?? [];

      day.activities.push({
        id: act.id!,
        title: act.title ?? 'Actividad',
        active: act.active,
        start: startRaw || '—',
        end: endRaw || '—',
        eventDate: act.date,
        capacity: act.capacity || 0,
        location: act.location || 'Sin ubicación',
        registrationDeadline: act.registrationDeadline || ''
      });
    });

    this.filteredDays = Array.from(daysMap.values());
    this.filteredDays.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  parseDate(dateString: string): Date {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  prevMonth() {
    if (this.selectedMonth === 0) {
      this.selectedMonth = 11;
      this.selectedYear--;
    } else {
      this.selectedMonth--;
    }
    this.loadActivitiesForMonth();
  }

  nextMonth() {
    if (this.selectedMonth === 11) {
      this.selectedMonth = 0;
      this.selectedYear++;
    } else {
      this.selectedMonth++;
    }
    this.loadActivitiesForMonth();
  }

  goToCurrentMonth() {
    const now = new Date();
    this.selectedYear = now.getFullYear();
    this.selectedMonth = now.getMonth();
    this.loadActivitiesForMonth();
  }

  goToMonth(date: string | Date) {
    const d = new Date(date);
    this.selectedMonth = d.getMonth();
    this.selectedYear = d.getFullYear();
    this.loadActivitiesForMonth();
  }

  view(id: number) {
    this.router.navigate(['/activity-view', id]);
  }

  edit(id: number) {
    this.editActivity.emit(id);
  }

  activate(id: number) {
    this.activateActivity.emit(id);
  }

  deactivate(id: number) {
    this.deactivateActivity.emit(id);
  }

  new() {
    this.newActivity.emit();
  }

  getMonthYear(): string {
    return `${this.months[this.selectedMonth]} ${this.selectedYear}`;
  }
  
}