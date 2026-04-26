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
  ) { }

  ngOnInit(): void {
    this.fieldForm = this.fb.group({
      label: ['', Validators.required],
      input_type: ['TEXT', Validators.required],
      order_index: [1, Validators.required],
      is_required: [true],
      optionsText: ['']
    });

    this.fieldId = this.route.snapshot.paramMap.get('id');
    if (this.fieldId) {
      this.isEditMode = true;
      this.loadField();
    }
  }

  loadField(): void {
    this.isLoading = true;

    this.appService.getKycFieldById(this.fieldId!).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          const field = res.data;
          this.fieldForm.patchValue({
            label: field.label,
            description: field.description || '',
            input_type: field.input_type,
            order_index: field.order_index,
            is_required: field.is_required,
            optionsText: field.options ? field.options.join(', ') : ''
          });
        }
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  onSubmit(): void {
    if (this.fieldForm.invalid) return;

    this.isLoading = true;
    const formValue = this.fieldForm.value;

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

    const request =
      this.isEditMode && this.fieldId
        ? this.appService.updateKycField(this.fieldId, payload)
        : this.appService.createKycField(payload);

    request.subscribe({
      next: () => {
        // FIXED SWAL STYLING
        Swal.fire({
          title: 'Success!',
          text: 'Field saved successfully.',
          icon: 'success',
          background: 'var(--glass-bg)',
          color: 'var(--color-text-primary)',
          confirmButtonColor: '#10b981' // A nice green to match your theme's buttons
        });
        this.router.navigate(['/admin/kyc']);
      },
      error: () => {
        this.isLoading = false;
        // FIXED ERROR SWAL STYLING TOO
        Swal.fire({
          title: 'Error',
          text: 'Failed to save field.',
          icon: 'error',
          background: 'var(--glass-bg)',
          color: 'var(--color-text-primary)'
        });
      }
    });
  }
}