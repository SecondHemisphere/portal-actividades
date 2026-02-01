import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }

    const allowedRoles = route.data?.['roles'] as string[] | undefined;
    const userRole = this.authService.getUserRole();

    if (allowedRoles && (!userRole || !allowedRoles.includes(userRole))) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'Tu rol no tiene permiso para esta sección',
        confirmButtonText: 'Aceptar'
      }).then(() => {
        window.history.back();
      });
      return false;
    }

    return true;
  }
}
