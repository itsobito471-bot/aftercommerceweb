import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-kyc-form',
  templateUrl: './kyc-form.component.html'
})
export class KycFormComponent implements OnInit {
  fieldForm!: FormGroup;
  fieldId: string | null = null;
  isEditMode = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private appService: AppService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fieldForm = this.fb.group({
      label: ['', Validators.required],
      input_type: ['TEXT', Validators.required],
      order_index: [1, Validators.required],
      is_required: [true],
      optionsText: [''] // A temporary text field to handle the comma-separated options
    });

    this.fieldId = this.route.snapshot.paramMap.get('id');
    if (this.fieldId) {
      this.isEditMode = true;
      this.loadField();
    }
  }

  loadField(): void {
    // In a real app, you might have a getById API, or you can filter from the list
    this.appService.getKycFields().subscribe((res: any) => {
      const field = res.data.find((f: any) => f._id === this.fieldId);
      if (field) {
        this.fieldForm.patchValue({
          label: field.label,
          input_type: field.input_type,
          order_index: field.order_index,
          is_required: field.is_required,
          optionsText: field.options ? field.options.join(', ') : ''
        });
      }
    });
  }

  onSubmit(): void {
    if (this.fieldForm.invalid) return;

    this.isLoading = true;
    const formValue = this.fieldForm.value;

    // Convert the comma-separated text back into an array for MongoDB
    let optionsArray: string[] = [];
    if (formValue.input_type === 'DROPDOWN' && formValue.optionsText) {
      optionsArray = formValue.optionsText.split(',').map((opt: string) => opt.trim()).filter((opt: string) => opt.length > 0);
    }

    const payload = {
      label: formValue.label,
      input_type: formValue.input_type,
      order_index: formValue.order_index,
      is_required: formValue.is_required,
      options: optionsArray
    };

    if (this.isEditMode && this.fieldId) {
      this.appService.updateKycField(this.fieldId, payload).subscribe(() => {
        Swal.fire({ title: 'Updated', text: 'Field updated successfully', icon: 'success', background: '#1e293b', color: '#f8fafc' });
        this.router.navigate(['/admin/settings/kyc-list']);
      });
    } else {
      this.appService.createKycField(payload).subscribe(() => {
        Swal.fire({ title: 'Created', text: 'New onboarding field added', icon: 'success', background: '#1e293b', color: '#f8fafc' });
        this.router.navigate(['/admin/settings/kyc-list']);
      });
    }
  }
}