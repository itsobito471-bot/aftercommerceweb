import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KycListComponent } from './kyc-list/kyc-list.component';
import { KycFormComponent } from './kyc-form/kyc-form.component';
import { Routes } from '@angular/router';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzIconModule } from 'ng-zorro-antd/icon';

const routes:Routes = [
  {path:'',component:KycListComponent,canActivate:[AuthGuard]},
  {path:'kyc-form',component:KycFormComponent,canActivate:[AuthGuard]},
  {path:'kyc-form/:id',component:KycFormComponent,canActivate:[AuthGuard]},
]


@NgModule({
  declarations: [
    KycListComponent,
    KycFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzTableModule,
    NzIconModule

  ]
})
export class KycModule { }
