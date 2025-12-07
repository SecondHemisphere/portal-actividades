import { Component } from '@angular/core';
import { ActivitiesCalendar } from "../activities-calendar/activities-calendar";

@Component({
  selector: 'app-my-activities-page',
  imports: [ActivitiesCalendar],
  templateUrl: './my-activities-page.html',
  styleUrl: './my-activities-page.css',
})
export class MyActivitiesPage {

}
