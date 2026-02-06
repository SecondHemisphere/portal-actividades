import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserRole } from '../../../models/User';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-portal-layout',
  imports: [CommonModule, RouterModule],
  templateUrl: './portal-layout.html',
  styleUrl: './portal-layout.css',
})
export class PortalLayout implements OnInit {
  public UserRole = UserRole;

  isLoggedIn = false;
  currentRole: string = '';
  currentUserName = '';
  displayUserName = '';
  currentUserInitials = '';
  profileLink = '';

  studentNav = [
    { label: 'Explorar Actividades', link: '/activities' },
    { label: 'Mis Inscripciones', link: '/student/my-enrollments' },
    { label: 'Historial Valoraciones', link: '/student/rating-historial' },
  ];

  organizerNav = [
    { label: 'Explorar Actividades', link: '/activities' },
    { label: 'Mis Eventos', link: '/organizer/my-activities' },
  ];

  guestNav = [
    { label: 'Explorar Actividades', link: '/activities' },
    { label: 'Iniciar Sesión', link: '/login' },
  ];

  ngOnInit() {
    this.auth.loggedInObs$.subscribe(() => {
      this.updateUserState();
    });
  }

  constructor(public auth: AuthService, private router: Router) {}

  updateUserState() {
    this.isLoggedIn = this.auth.isLoggedIn();
    if (!this.isLoggedIn) {
      this.currentRole = '';
      this.currentUserName = '';
      this.displayUserName = '';
      this.currentUserInitials = '';
      this.profileLink = '';
      return;
    }

    const role = this.auth.getUserRole();
    this.currentRole = role || '';
    this.currentUserName = this.auth.getUsername() || '';
    this.displayUserName = this.truncateName(this.currentUserName, 15);
    this.currentUserInitials = this.generateInitials(this.currentUserName);

    this.profileLink =
      role === 'Organizador'
        ? '/organizer/profile'
        : role === 'Admin'
        ? '/admin/profile'
        : '/student/profile';
  }

  logout() {
    this.auth.logout();
    this.updateUserState();
    this.router.navigate(['/login']);
  }

  private generateInitials(name: string): string {
    if (!name) return 'A';
    const words = name.trim().split(' ');
    if (words.length >= 2) return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    return words[0][0].toUpperCase();
  }

  private truncateName(name: string, maxLength: number = 15): string {
    if (!name) return '';
    if (name.length <= maxLength) return name;
    const words = name.split(' ');
    if (words.length > 1) {
      const firstName = words[0];
      const lastNameInitial = words[words.length - 1].charAt(0) + '.';
      const abbreviated = `${firstName} ${lastNameInitial}`;
      if (abbreviated.length <= maxLength) return abbreviated;
    }
    return name.substring(0, maxLength - 3) + '...';
  }

  get navItems() {
    if (!this.isLoggedIn) return this.guestNav;
    if (this.currentRole === 'Estudiante') return this.studentNav;
    if (this.currentRole === 'Organizador') return this.organizerNav;
    return [];
  }

  isAdminSectionActive(): boolean {
    const adminRoutes = [
      '/admin/activity-crud',
      '/admin/category-crud',
      '/admin/enrollment-crud',
      '/admin/organizer-crud',
      '/admin/student-crud',
      '/admin/rating-crud',
      '/admin/user-crud'
    ];

    return adminRoutes.some(route => this.router.url.startsWith(route));
  }

}
