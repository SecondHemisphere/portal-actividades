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

export const routes: Routes = [
    { path: '', redirectTo: 'student/catalog', pathMatch: 'full' },
    
    {
        path: 'student',
        children: [
          { path: 'catalog', component: ActivitiesPage },
          { path: 'enrollment-list', component: MyEnrollmentsPage },
          // { path: 'history', component: StudentHistory },
          // { path: 'profile', component: StudentProfile },
          { path: '', redirectTo: 'catalog', pathMatch: 'full' }
        ]
    },

    {
        path: 'organizer',
        children: [
          // { path: 'dashboard', component: OrganizerDashboard },
          // { path: 'activities', component: OrganizerActivities },
          // { path: 'reports', component: OrganizerReports },
          // { path: 'profile', component: OrganizerProfile },
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },
    
    {
        path: 'admin',
        children: [
            { path: 'activity-crud', component: ActivityCrud },
            { path: 'category-crud', component: CategoryCrud },
            { path: 'rating-crud', component: RatingCrud },
            { path: 'organizer-crud', component: OrganizerCrud },
            { path: 'student-crud', component: StudentCrud },
            { path: 'enrollment-crud', component: EnrollmentCrud },
            { path: 'user-crud', component: UserCrud },
        ]
    },

    { path: '**', redirectTo: 'student/catalog' },
];