import { Component } from '@angular/core';
import { ActivityList } from "../activity-list/activity-list";

@Component({
  selector: 'app-activity-page',
  imports: [ActivityList],
  templateUrl: './activities-page.html',
  styleUrl: './activities-page.css',
})
export class ActivitiesPage {

}
