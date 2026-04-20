import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
// Import NG-ZORRO modules
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { SideNavComponent } from './side-nav/side-nav.component';
import { AuthGuard } from 'src/app/guards/auth.guard';


const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'main', 
    component: SideNavComponent, // This is the shell
    canActivate: [AuthGuard],    // Protects accessing the shell
    canActivateChild: [AuthGuard], // Protects all children loaded inside the shell
    children: [
      // These will load INSIDE the side-nav's <router-outlet>
      // { path: 'dashboard', component: DashboardComponent },
      // { path: 'products', component: ProductsComponent },
      // { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];


@NgModule({
  declarations: [
    LoginComponent,
    SideNavComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzIconModule,

  ]
})
export class AdminModule { }
