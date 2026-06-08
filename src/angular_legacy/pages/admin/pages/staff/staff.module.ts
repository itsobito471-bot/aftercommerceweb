import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StafflistComponent } from './stafflist/stafflist.component';
import { StaffformComponent } from './staffform/staffform.component';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzIconModule } from 'ng-zorro-antd/icon';


const routes:Routes = [
  {path:'',component:StafflistComponent,canActivate:[AuthGuard]},
  {path:'staff-list',component:StafflistComponent,canActivate:[AuthGuard]},
  {path:'staff-form',component:StaffformComponent,canActivate:[AuthGuard]},
  {path:'staff-form/:id',component:StaffformComponent,canActivate:[AuthGuard]},


]


@NgModule({
  declarations: [
    StafflistComponent,
    StaffformComponent
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
export class StaffModule { }
