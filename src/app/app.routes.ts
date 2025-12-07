import { Routes } from '@angular/router';
import { CategoryCrud } from './components/categories/category-crud/category-crud';
import { ActivityCrud } from './components/activities/activity-crud/activity-crud';
import { RatingCrud } from './components/ratings/rating-crud/rating-crud';
import { OrganizerCrud } from './components/organizers/organizer-crud/organizer-crud';
import { StudentCrud } from './components/students/student-crud/student-crud';
import { UserCrud } from './components/users/user-crud/user-crud';
import { EnrollmentCrud } from './components/enrollments/enrollment-crud/enrollment-crud';
import { ActivitiesPage } from './components/activities/activities-page/activities-page';
import { MyEnrollmentsPage } from './components/enrollments/my-enrollments-page/my-enrollments-page';
import { ActivityView } from './components/activities/activity-view/activity-view';
import { Login } from './components/auth/login/login';
import { authGuard } from './guards/auth-guard';
import { StudentProfile } from './components/students/student-profile/student-profile';
import { OrganizerProfile } from './components/organizers/organizer-profile/organizer-profile';
import { MyActivitiesPage } from './components/organizers/my-activities-page/my-activities-page';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },

  { path: 'activities', component: ActivitiesPage },
  { path: 'activity-view/:id', component: ActivityView },

  {
    path: 'student',
    children: [
      { path: 'my-enrollments', component: MyEnrollmentsPage, canActivate: [authGuard] },
      { path: 'profile', component: StudentProfile, canActivate: [authGuard] },
      // { path: 'history', component: StudentHistory, canActivate: [authGuard] },
    ]
  },

  {
    path: 'organizer',
    children: [
      // { path: 'dashboard', component: OrganizerDashboard, canActivate: [authGuard] },
      { path: 'my-activities', component: MyActivitiesPage, canActivate: [authGuard] },
      { path: 'profile', component: OrganizerProfile, canActivate: [authGuard] },
      // { path: 'reports', component: OrganizerReports, canActivate: [authGuard] },
    ]
  },

  {
    path: 'admin',
    children: [
      { path: 'activity-crud', component: ActivityCrud, canActivate: [authGuard] },
      { path: 'category-crud', component: CategoryCrud, canActivate: [authGuard] },
      { path: 'rating-crud', component: RatingCrud, canActivate: [authGuard] },
      { path: 'organizer-crud', component: OrganizerCrud, canActivate: [authGuard] },
      { path: 'student-crud', component: StudentCrud, canActivate: [authGuard] },
      { path: 'enrollment-crud', component: EnrollmentCrud, canActivate: [authGuard] },
      { path: 'user-crud', component: UserCrud, canActivate: [authGuard] },
    ]
  },

  { path: '**', redirectTo: 'activities' },
];
