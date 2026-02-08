import { Component, Input, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Enrollment, EnrollmentStatus } from '../../../models/Enrollment';
import { Activity } from '../../../models/Activity';
import { AuthService } from '../../../services/auth.service';
import { ServActivitiesApi } from '../../../services/serv-activities-api';
import { ServEnrollmentsApi } from '../../../services/serv-enrollments-api';
import { ApiErrorService } from '../../../shared/api-error.service';
import { UiAlertService } from '../../../shared/ui-alert.service';

@Component({
  selector: 'app-enrollments-calendar',
  imports: [CommonModule, FormsModule],
  templateUrl: './enrollments-calendar.html',
  styleUrl: './enrollments-calendar.css',
})
export class EnrollmentsCalendar {

  enrollments: Enrollment[] = [];
  activities: Activity[] = [];
  userId = 0;

  @Input() refreshTrigger: boolean = false;

  filteredDays: {
    date: Date;
    activities: {
      id: number;
      enrollmentId?: number;
      title: string;
      status: EnrollmentStatus;
      start: string;
      end: string;
      eventDate: string | undefined;
      enrollmentDate: string;
      activityId: number;
    }[];
  }[] = [];

  selectedYear = new Date().getFullYear();
  selectedMonth = new Date().getMonth();

  months = [
    'Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
  ];

  constructor(
    private enrollmentsService: ServEnrollmentsApi,
    private activitiesService: ServActivitiesApi,
    private auth: AuthService,
    private router: Router,
    private apiError: ApiErrorService,
    private ui: UiAlertService
  ) {}

  ngOnInit() {
    const userId = this.auth.getUserId();
    if (!userId) return;

    this.userId = Number(userId);
    this.loadEnrollments();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['refreshTrigger']) {
      this.loadEnrollments();
    }
  }

  loadEnrollments() {
    this.enrollmentsService.getEnrollmentsByStudent(this.userId)
      .subscribe({
        next: (enrs) => {
          this.enrollments = enrs || [];
          
          this.activitiesService.getActivities2().subscribe({
            next: (actList) => {
              const ids = this.enrollments.map(e => e.activityId);
              this.activities = actList.filter(a => ids.includes(a.id!));
              this.generateFilteredDays();
            },
            error: (err) => {
              this.apiError.handle(err, 'cargar las actividades');
            }
          });
        },
        error: (err) => {
          this.apiError.handle(err, 'cargar las inscripciones');
        }
      });
  }

  generateFilteredDays() {
    this.filteredDays = [];

    this.enrollments.forEach(e => {
      const act = this.activities.find(a => a.id === e.activityId);
      if (!act || !act.date) return;

      const eventDateObj = new Date(act.date);
      const year = eventDateObj.getFullYear();
      const month = eventDateObj.getMonth();

      if (year === this.selectedYear && month === this.selectedMonth) {
        let day = this.filteredDays.find(d =>
          d.date.getFullYear() === year &&
          d.date.getMonth() === month &&
          d.date.getDate() === eventDateObj.getDate()
        );

        if (!day) {
          day = { date: eventDateObj, activities: [] };
          this.filteredDays.push(day);
        }

        const [startRaw, endRaw] = act.timeRange?.split('-').map(t => t.trim()) ?? [];

        day.activities.push({
          id: e.activityId,
          enrollmentId: e.id,
          title: act.title || 'Actividad',
          status: e.status,
          start: startRaw || '—',
          end: endRaw || '—',
          eventDate: act.date,
          enrollmentDate: e.enrollmentDate,
          activityId: e.activityId
        });
      }
    });

    this.filteredDays.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  cancelEnrollment(activity: any) {
    if (!activity.enrollmentId || activity.status !== 'Inscrito') return;

    const enrollment = this.enrollments.find(e => e.id === activity.enrollmentId);
    if (!enrollment) return;

    const activityObj = this.activities.find(a => a.id === activity.activityId);
    const activityName = activityObj?.title || 'esta actividad';

    this.ui.confirm(
      '¿Cancelar inscripción?',
      `¿Estás seguro de cancelar tu inscripción en "${activityName}"?`,
      `Sí, cancelar`
    ).then(result => {
      if (result.isConfirmed) {
        this.enrollmentsService.delete(enrollment.id!).subscribe({
          next: () => {
            enrollment.status = EnrollmentStatus.Cancelado;
            this.filteredDays.forEach(day => {
              const actIndex = day.activities.findIndex(a => a.enrollmentId === enrollment.id);
              if (actIndex !== -1) {
                day.activities[actIndex].status = EnrollmentStatus.Cancelado;
              }
            });
            this.ui.success('Tu inscripción ha sido cancelada correctamente');
          },
          error: (error) => {
            console.error('Error al cancelar inscripción:', error);
            const errorMessage = error.error?.message || error.message || 'Error al cancelar la inscripción';
            this.ui.error(errorMessage);
          }
        });
      }
    });
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

  getMonthYear(): string {
    return `${this.months[this.selectedMonth]} ${this.selectedYear}`;
  }

  getDayName(date: Date): string {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return days[date.getDay()];
  }

  getStatusBadge(status: EnrollmentStatus): string {
    return status === 'Inscrito' ? 'Inscrito' :
           status === 'Cancelado' ? 'Cancelado' :
           status || 'Pendiente';
  }

  getStatusClass(status: EnrollmentStatus): string {
    return status === 'Inscrito' ? 'badge-enrolled' :
           status === 'Cancelado' ? 'badge-cancelled' :
           'badge-pending';
  }

}