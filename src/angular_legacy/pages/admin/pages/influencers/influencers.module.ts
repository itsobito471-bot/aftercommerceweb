import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { InfluencerlistComponent } from './influencerlist/influencerlist.component';
import { InfluencerFormComponent } from './influencer-form/influencer-form.component';
// import { InfluencerformModule } from './influencerform/influencerform.module';

const routes: Routes = [
  { path: '', component: InfluencerlistComponent, canActivate: [AuthGuard] },
  { path: 'form', component: InfluencerFormComponent, canActivate: [AuthGuard] },
  { path: 'form/:id', component: InfluencerFormComponent, canActivate: [AuthGuard] }
];

@NgModule({
  declarations: [
    InfluencerlistComponent,
    InfluencerFormComponent,
    // InfluencerformModule,
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
export class InfluencersModule { }