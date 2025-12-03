import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { UserRole } from '../../models/User';

@Component({
  selector: 'app-portal-layout',
  imports: [CommonModule, RouterModule],
  templateUrl: './portal-layout.html',
  styleUrl: './portal-layout.css',
})
export class PortalLayout implements OnInit {
  
  public UserRole = UserRole;
  currentRole: UserRole = UserRole.Estudiante;
  
  studentNav = [
    { label: 'Catálogo (Explorar)', link: '/student/catalog' },
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

  constructor(private router: Router) { }

  ngOnInit(): void { }

  setCurrentRole(role: UserRole): void {
    this.currentRole = role;
    let targetRoute = '';
    
    switch (role) {
      case UserRole.Estudiante:
        targetRoute = '/student/catalog';
        break;
      case UserRole.Organizador:
        targetRoute = '/organizer/dashboard';
        break;
      case UserRole.Admin:
        targetRoute = '/admin/activity-crud';
        break;
      default:
        targetRoute = '/';
    }
    
    this.router.navigate([targetRoute]);
    alert(`Cambiando a rol: ${role}. La navegación ha cambiado.`);
  }
}