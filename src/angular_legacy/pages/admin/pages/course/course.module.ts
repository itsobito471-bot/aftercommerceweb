import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoriesComponent } from './categories/categories.component';
import { CategoryFormComponent } from './category-form/category-form.component';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzIconModule } from 'ng-zorro-antd/icon';

const routes:Routes = [
  {path:'categories',component:CategoriesComponent,canActivate:[AuthGuard]},
  {path:'categories-form',component:CategoryFormComponent,canActivate:[AuthGuard]},
  {path:'categories-form/:id',component:CategoryFormComponent,canActivate:[AuthGuard]},

]

@NgModule({
  declarations: [
    CategoriesComponent,
    CategoryFormComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    NzTableModule,
    NzIconModule
  ]
})
export class CourseModule { }
