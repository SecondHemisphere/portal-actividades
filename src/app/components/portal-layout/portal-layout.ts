import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserRole } from '../../models/User';
import { AuthService } from '../../services/auth/auth-service';

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

  studentNav = [
    { label: 'Explorar Actividades', link: '/activities' },
    { label: 'Mis Inscripciones', link: '/student/enrollment-list' },
    { label: 'Historial y Valorar', link: '/student/history' },
    { label: 'Mi Perfil', link: '/student/profile' }
  ];

  organizerNav = [
    { label: 'Dashboard', link: '/organizer/dashboard' },
    { label: 'Gestión Actividades', link: '/organizer/activities' },
    { label: 'Reportes', link: '/organizer/reports' },
    { label: 'Mi Perfil', link: '/organizer/profile' }
  ];

  adminNav = [
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

  constructor(private router: Router, private authService: AuthService) {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      const user = this.authService.getCurrentUserValue();
      this.currentRole = user?.role || UserRole.Estudiante;
    }
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
    this.isLoggedIn = false;
    this.currentRole = UserRole.Estudiante;
    this.router.navigate(['/login']);
  }

}
