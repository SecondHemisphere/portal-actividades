import { Component, Input, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Enrollment, EnrollmentStatus } from '../../../models/Enrollment';
import { Activity } from '../../../models/Activity';
import { AuthService } from '../../../services/auth.service';
import { ServActivitiesApi } from '../../../services/serv-activities-api';
import { ServEnrollmentsApi } from '../../../services/serv-enrollments-api';
import Swal from 'sweetalert2';

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
    private router: Router
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
              console.error('Error al cargar actividades:', err);
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar las actividades',
                confirmButtonText: 'OK'
              });
            }
          });
        },
        error: (err) => {
          console.error('Error al cargar inscripciones:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron cargar tus inscripciones',
            confirmButtonText: 'OK'
          });
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

  toggleEnrollmentStatus(activity: any) {
    if (!activity.enrollmentId) return;

    const enrollment = this.enrollments.find(e => e.id === activity.enrollmentId);
    if (!enrollment) return;

    const action = enrollment.status === EnrollmentStatus.Inscrito ? 'cancelar' : 'activar';
    
    const activityObj = this.activities.find(a => a.id === activity.activityId);
    const activityName = activityObj?.title || 'esta actividad';

    Swal.fire({
      title: `¿${action === 'cancelar' ? 'Cancelar' : 'Activar'} inscripción?`,
      text: `¿Estás seguro de ${action} tu inscripción en "${activityName}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Sí, ${action}`,
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        if (enrollment.status === EnrollmentStatus.Inscrito) {
          this.deactivateEnrollment(enrollment.id!, activityName);
        } else {
          this.activateEnrollment(enrollment.id!, activityName);
        }
      }
    });
  }

  deactivateEnrollment(enrollmentId: number, activityName: string) {
    this.enrollmentsService.delete(enrollmentId).subscribe({
      next: (response) => {
        const enrollment = this.enrollments.find(e => e.id === enrollmentId);
        if (enrollment) {
          enrollment.status = EnrollmentStatus.Cancelado;
        }
        
        this.filteredDays.forEach(day => {
          const actIndex = day.activities.findIndex(a => a.enrollmentId === enrollmentId);
          if (actIndex !== -1) {
            day.activities[actIndex].status = EnrollmentStatus.Cancelado;
          }
        });
        
        Swal.fire({
          icon: 'success',
          title: '¡Inscripción cancelada!',
          text:'Tu inscripción ha sido cancelada correctamente',
          confirmButtonText: 'OK'
        });
      },
      error: (error) => {
        console.error('Error al cancelar inscripción:', error);
        
        let errorMessage = 'Error al cancelar la inscripción';
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
          confirmButtonText: 'OK'
        });
      }
    });
  }

  activateEnrollment(enrollmentId: number, activityName: string) {
    this.enrollmentsService.activate(enrollmentId).subscribe({
      next: (response) => {
        const enrollment = this.enrollments.find(e => e.id === enrollmentId);
        if (enrollment) {
          enrollment.status = EnrollmentStatus.Inscrito;
        }
        
        this.filteredDays.forEach(day => {
          const actIndex = day.activities.findIndex(a => a.enrollmentId === enrollmentId);
          if (actIndex !== -1) {
            day.activities[actIndex].status = EnrollmentStatus.Inscrito;
          }
        });
        
        Swal.fire({
          icon: 'success',
          title: '¡Inscripción activada!',
          text: 'Tu inscripción ha sido activada correctamente',
          confirmButtonText: 'OK'
        });
      },
      error: (error) => {
        console.error('Error al activar inscripción:', error);
        
        let errorMessage = 'Error al activar la inscripción';
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
          confirmButtonText: 'OK'
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