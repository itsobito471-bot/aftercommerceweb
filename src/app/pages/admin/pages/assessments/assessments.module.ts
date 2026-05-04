import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AssessmentsRoutingModule } from './assessments-routing.module';
import { TemplateListComponent } from './template-list/template-list.component';
import { TemplateFormComponent } from './template-form/template-form.component';
import { QuestionBuilderComponent } from './question-builder/question-builder.component';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    TemplateListComponent,
    TemplateFormComponent,
    QuestionBuilderComponent
  ],
  imports: [
    CommonModule,
    AssessmentsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NzTableModule,
    NzTagModule,
    NzSpaceModule
  ]
})
export class AssessmentsModule { }
