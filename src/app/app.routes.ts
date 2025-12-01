import { Routes } from '@angular/router';
import { CategoryCrud } from './components/categories/category-crud/category-crud';
import { ActivityCrud } from './components/activities/activity-crud/activity-crud';
import { RatingCrud } from './components/ratings/rating-crud/rating-crud';
import { OrganizerCrud } from './components/organizers/organizer-crud/organizer-crud';
import { StudentCrud } from './components/students/student-crud/student-crud';
import { UserCrud } from './components/users/user-crud/user-crud';
import { EnrollmentCrud } from './components/enrollments/enrollment-crud/enrollment-crud';

export const routes: Routes = [
    {path:"activity-crud", component:ActivityCrud},
    {path:"category-crud", component:CategoryCrud},
    {path:"rating-crud", component:RatingCrud},
    {path:"organizer-crud", component:OrganizerCrud},
    {path:"student-crud", component:StudentCrud},
    {path:"enrollment-crud", component:EnrollmentCrud},
    {path:"user-crud", component:UserCrud},
    //si no se indica ruta
    {path:"", redirectTo:"home", pathMatch:"full"},
    //si la ruta no existe
    {path:"**", redirectTo:"home"},
];
