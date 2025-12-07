import { Component} from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserRole, User } from '../../models/User';
import { AuthService } from '../../services/auth/auth-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-portal-layout',
  imports: [CommonModule, RouterModule],
  templateUrl: './portal-layout.html',
  styleUrl: './portal-layout.css',
})
export class PortalLayout {
  public UserRole = UserRole;
  currentRole: UserRole = UserRole.Estudiante;
  isLoggedIn = false;
  private sub!: Subscription;

  currentUserName = '';
  currentUserInitials = '';
  profileLink = '/profile';

  studentNav = [
    { label: 'Explorar Actividades', link: '/activities' },
    { label: 'Mis Inscripciones', link: '/student/my-enrollments' },
    { label: 'Historial De Valoraciones', link: '/student/history' },
  ];

  organizerNav = [
    { label: 'Explorar Actividades', link: '/activities' },
    { label: 'Mis Actividades', link: '/organizer/my-activities' },
    { label: 'Reportes', link: '/organizer/reports' },
  ];

  adminNav = [
    { label: 'Dashboard', link: '/admin/dashboard' },
    { label: 'Actividades', link: '/admin/activity-crud' },
    { label: 'Categorías', link: '/admin/category-crud' },
    { label: 'Inscripciones', link: '/admin/enrollment-crud' },
    { label: 'Organizadores', link: '/admin/organizer-crud' },
    { label: 'Estudiantes', link: '/admin/student-crud' },
    { label: 'Valoraciones', link: '/admin/rating-crud' },
    { label: 'Usuarios', link: '/admin/user-crud' },
  ];

  guestNav = [
    { label: 'Explorar Actividades', link: '/activities' },
    { label: 'Iniciar Sesión', link: '/login' }
  ];

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    this.sub = this.authService.getCurrentUser().subscribe((user: User | null) => {
      this.isLoggedIn = !!user;
      this.currentRole = user?.role || UserRole.Estudiante;

      if (user) {
        this.currentUserName = user.name;
        this.currentUserInitials = user.name
          .split(' ')
          .map(p => p[0])
          .join('')
          .toUpperCase();

        this.profileLink =
          user.role === UserRole.Organizador ? '/organizer/profile'
        : user.role === UserRole.Admin ? '/admin/user-crud'
        : '/student/profile';
      }
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  get navItems() {
    switch (this.currentRole) {
      case UserRole.Estudiante: return this.studentNav;
      case UserRole.Organizador: return this.organizerNav;
      case UserRole.Admin: return this.adminNav;
      default: return this.guestNav;
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
