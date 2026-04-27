import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    // Default route redirects to the home/dashboard
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    // Lazy load the Home Module
    loadChildren: () => import('./home/home.module').then(m => m.HomeModule)
  },
  {
    path: 'staff',
    // Lazy load the Staff Module we just built!
    loadChildren: () => import('./staff/staff.module').then(m => m.StaffModule)
  },
  {
    path: 'profile',
    // Lazy load the Profile Module
    loadChildren: () => import('./profile/profile.module').then(m => m.ProfileModule)
  },
  {
    path: 'courses',
    // Lazy load the Profile Module
    loadChildren: () => import('./course/course.module').then(m => m.CourseModule)
  },
  {
    path: 'kyc',
    // Lazy load the Profile Module
    loadChildren: () => import('./kyc/kyc.module').then(m => m.KycModule)
  },
  {
    path: 'affiliates',
    // Lazy load the Profile Module
    loadChildren: () => import('./influencers/influencers.module').then(m => m.InfluencersModule)
  },

];

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class PagesModule { }
