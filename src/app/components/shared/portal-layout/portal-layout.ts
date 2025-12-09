import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserRole, User } from '../../../models/User';
import { AuthService } from '../../../services/auth/auth-service';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-portal-layout',
  imports: [CommonModule, RouterModule],
  templateUrl: './portal-layout.html',
  styleUrl: './portal-layout.css',
})
export class PortalLayout implements OnInit, OnDestroy {
  public UserRole = UserRole;
  currentRole: UserRole = UserRole.Estudiante;
  isLoggedIn = false;
  private sub!: Subscription;
  private routerSub!: Subscription;
  currentUserName = '';
  displayUserName = '';
  currentUserInitials = '';
  profileLink = '/profile';
  currentRoute = '';
  
  studentNav = [
    { label: 'Explorar Actividades', link: '/activities' },
    { label: 'Mis Inscripciones', link: '/student/my-enrollments' },
    { label: 'Historial Valoraciones', link: '/student/rating-historial' },
  ];
  
  organizerNav = [
    { label: 'Explorar Actividades', link: '/activities' },
    { label: 'Mis Eventos', link: '/organizer/my-activities' },
  ];
  
  adminNav = [
    { label: 'Dashboard', link: '/admin/dashboard' },
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
        this.displayUserName = this.truncateName(user.name, 15);
        this.currentUserInitials = this.generateInitials(user.name);
        
        this.profileLink =
          user.role === UserRole.Organizador ? '/organizer/profile'
          : user.role === UserRole.Admin ? '/admin/user-crud'
          : '/student/profile';
      } else {
        this.currentUserName = '';
        this.displayUserName = '';
        this.currentUserInitials = '';
      }
    });
    
    this.routerSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute = event.url;
      });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    if (this.routerSub) {
      this.routerSub.unsubscribe();
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

  isAdminSectionActive(): boolean {
    return this.currentRoute.startsWith('/admin/') &&
           this.currentRoute !== '/admin/dashboard';
  }

  private generateInitials(name: string): string {
    if (!name || name.trim().length === 0) return 'A';
    
    const words = name.trim().split(' ');
    
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    } else if (words.length === 1) {
      return words[0].substring(0, 1).toUpperCase();
    }
    
    return 'A';
  }

  private truncateName(name: string, maxLength: number = 15): string {
    if (!name) return '';
    
    if (name.length <= maxLength) return name;
    
    const words = name.split(' ');
    if (words.length > 1) {
      const firstName = words[0];
      const lastNameInitial = words[words.length - 1].charAt(0) + '.';
      const abbreviated = `${firstName} ${lastNameInitial}`;
      
      if (abbreviated.length <= maxLength) {
        return abbreviated;
      }
    }
    
    return name.substring(0, maxLength - 3) + '...';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}