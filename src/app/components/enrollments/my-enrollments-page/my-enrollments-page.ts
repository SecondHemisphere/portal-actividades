import { Component } from '@angular/core';
import { EnrollmentsList } from '../enrollments-list/enrollments-list';

@Component({
  selector: 'app-my-enrollments-page',
  imports: [EnrollmentsList],
  templateUrl: './my-enrollments-page.html',
  styleUrl: './my-enrollments-page.css',
})
export class MyEnrollmentsPage {

}
