import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AssessmentsRoutingModule } from './assessments-routing.module';
import { TemplateListComponent } from './template-list/template-list.component';
import { TemplateFormComponent } from './template-form/template-form.component';
import { QuestionBuilderComponent } from './question-builder/question-builder.component';

import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzSpinModule } from 'ng-zorro-antd/spin';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzFormModule } from 'ng-zorro-antd/form';

/* ✅ ADD THESE */
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';

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
    NzSpaceModule,
    NzSpinModule,
    NzGridModule,
    NzFormModule,

    /* ✅ ADD THESE */
    NzSelectModule,
    NzInputNumberModule,
    NzIconModule,
    NzDividerModule,
    NzButtonModule,
    NzCheckboxModule
  ]
})
export class AssessmentsModule { }