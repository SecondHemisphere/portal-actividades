import { Routes } from '@angular/router';
import { CategoryCrud } from './components/categories/category-crud/category-crud';
import { ActivityCrud } from './components/activities/activity-crud/activity-crud';
import { RatingCrud } from './components/ratings/rating-crud/rating-crud';
import { OrganizerCrud } from './components/organizers/organizer-crud/organizer-crud';
import { StudentCrud } from './components/students/student-crud/student-crud';
import { UserCrud } from './components/auth/users/user-crud/user-crud';
import { EnrollmentCrud } from './components/enrollments/enrollment-crud/enrollment-crud';
import { ActivitiesPage } from './components/activities/activities-page/activities-page';
import { MyEnrollmentsPage } from './components/enrollments/my-enrollments-page/my-enrollments-page';
import { ActivityView } from './components/activities/activity-view/activity-view';
import { Login } from './components/auth/login/login';
import { StudentProfile } from './components/students/student-profile/student-profile';
import { OrganizerProfile } from './components/organizers/organizer-profile/organizer-profile';
import { MyActivitiesPage } from './components/activities/my-activities-page/my-activities-page';
import { Dashboard } from './components/admin/dashboard/dashboard';
import { RatingHistorial } from './components/ratings/rating-historial/rating-historial';
import { AuthGuard } from './guards/auth.guard';
import { AdminProfile } from './components/admin/admin-profile/admin-profile';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },

  { path: 'activities', component: ActivitiesPage },
  { path: 'activity-view/:id', component: ActivityView },

  // RUTAS ESTUDIANTE
  {
    path: 'student',
    children: [
      { path: 'my-enrollments', canActivate: [AuthGuard], component: MyEnrollmentsPage, data: { roles: ['Estudiante'] }},
      { path: 'profile', canActivate: [AuthGuard], component: StudentProfile, data: { roles: ['Estudiante'] }},
      { path: 'rating-historial', canActivate: [AuthGuard], component: RatingHistorial, data: { roles: ['Estudiante'] }},
    ]
  },

  // RUTAS ORGANIZADOR
  {
    path: 'organizer',
    children: [
      { path: 'my-activities', canActivate: [AuthGuard], component: MyActivitiesPage, data: { roles: ['Organizador'] }},
      { path: 'profile', canActivate: [AuthGuard], component: OrganizerProfile, data: { roles: ['Organizador'] }},
    ]
  },

  // RUTAS ADMIN
  {
    path: 'admin',
    children: [
      { path: 'profile', canActivate: [AuthGuard], component: AdminProfile, data: { roles: ['Admin'] }},
      { path: 'dashboard', canActivate: [AuthGuard], component: Dashboard, data: { roles: ['Admin'] }},
      { path: 'activity-crud', canActivate: [AuthGuard], component: ActivityCrud, data: { roles: ['Admin'] }},
      { path: 'category-crud', canActivate: [AuthGuard], component: CategoryCrud, data: { roles: ['Admin'] }},
      { path: 'rating-crud', canActivate: [AuthGuard], component: RatingCrud, data: { roles: ['Admin'] }},
      { path: 'organizer-crud', canActivate: [AuthGuard], component: OrganizerCrud, data: { roles: ['Admin'] }},
      { path: 'student-crud', canActivate: [AuthGuard], component: StudentCrud, data: { roles: ['Admin'] }},
      { path: 'enrollment-crud', canActivate: [AuthGuard], component: EnrollmentCrud, data: { roles: ['Admin'] }},
      { path: 'user-crud', canActivate: [AuthGuard], component: UserCrud, data: { roles: ['Admin'] }},
    ]
  },

  { path: '**', redirectTo: 'activities' },
];
