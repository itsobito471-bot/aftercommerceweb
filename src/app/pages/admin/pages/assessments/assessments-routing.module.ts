import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TemplateListComponent } from './template-list/template-list.component';
import { TemplateFormComponent } from './template-form/template-form.component';
import { QuestionBuilderComponent } from './question-builder/question-builder.component';

const routes: Routes = [
  { path: '', component: TemplateListComponent }, 
  { path: 'new', component: TemplateFormComponent }, 
  { path: 'edit/:id', component: TemplateFormComponent }, 
  { path: ':id/builder', component: QuestionBuilderComponent } 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssessmentsRoutingModule { }