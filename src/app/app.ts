import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule, RouterOutlet } from '@angular/router';
import { PortalLayout } from './components/shared/portal-layout/portal-layout';

@Component({
  selector: 'app-root',
  imports: [PortalLayout],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('portal-actividades');
}
