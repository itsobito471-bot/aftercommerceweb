import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Location } from '@angular/common';

@Component({
  selector: 'app-template-form',
  templateUrl: './template-form.component.html',
  styleUrls: ['./template-form.component.css']
})
export class TemplateFormComponent implements OnInit {
  templateForm!: FormGroup;
  isEditMode: boolean = false;
  templateId: string | null = null;
  isLoading: boolean = false;
  isFetching: boolean = false;

  constructor(
    private fb: FormBuilder,
    private appService: AppService,
    private router: Router,
    private route: ActivatedRoute,
    private msg: NzMessageService,
    private location:Location
  ) {}

  ngOnInit(): void {
    this.templateForm = this.fb.group({
      title: [null, [Validators.required]],
      type: ['QUIZ', [Validators.required]],
      duration_minutes: [0, [Validators.min(0)]],
      passing_score: [null, [Validators.min(0), Validators.max(100)]]
    });

    this.templateForm.get('type')?.valueChanges.subscribe(type => {
      if (type === 'SURVEY') {
        this.templateForm.get('passing_score')?.setValue(null);
        this.templateForm.get('passing_score')?.disable();
      } else {
        this.templateForm.get('passing_score')?.enable();
      }
    });

    this.templateId = this.route.snapshot.paramMap.get('id');
    if (this.templateId) {
      this.isEditMode = true;
      this.fetchTemplateDetails();
    }
  }

  fetchTemplateDetails(): void {
    this.isFetching = true;
    this.appService.getAssessmentTemplateById(this.templateId!).subscribe({
      next: (res: any) => {
        this.isFetching = false;
        if (res && res.success) {
          this.templateForm.patchValue({
            title: res.data.title,
            type: res.data.type,
            duration_minutes: res.data.duration_minutes,
            passing_score: res.data.passing_score
          });
        }
      },
      error: (err) => {
        this.isFetching = false;
        this.msg.error('Failed to load template details.');
        console.error(err);
      }
    });
  }

  submitForm(): void {
    if (this.templateForm.valid) {
      this.isLoading = true;
      const formData = this.templateForm.getRawValue();

      if (this.isEditMode && this.templateId) {
        this.appService.updateAssessmentTemplate(this.templateId, formData).subscribe({
          next: (res: any) => {
            this.isLoading = false;
            if (res && res.success) {
              this.msg.success('Template updated successfully.');
              this.router.navigate(['/admin/assessment-templates']);
            }
          },
          error: (err) => this.handleError(err)
        });
      } else {
        this.appService.createAssessmentTemplate(formData).subscribe({
          next: (res: any) => {
            this.isLoading = false;
            if (res && res.success) {
              this.msg.success('Template created! Now add your questions.');
              this.router.navigate(['/admin/assessment-templates', res.data._id, 'builder']);
            }
          },
          error: (err) => this.handleError(err)
        });
      }
    } else {
      Object.values(this.templateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  handleError(err: any): void {
    this.isLoading = false;
    this.msg.error(err.error?.message || 'An error occurred while saving.');
    console.error(err);
  }

  cancel(): void {
    this.router.navigate(['/admin/assessment-templates']);
  }

  Back(){
    this.location.back();
  }
}