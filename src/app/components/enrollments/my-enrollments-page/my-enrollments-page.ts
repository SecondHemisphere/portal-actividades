import { Component } from '@angular/core';
import { EnrollmentsCalendar } from '../enrollments-calendar/enrollments-calendar';

@Component({
  selector: 'app-my-enrollments-page',
  imports: [EnrollmentsCalendar],
  templateUrl: './my-enrollments-page.html',
  styleUrl: './my-enrollments-page.css',
})
export class MyEnrollmentsPage {

}
