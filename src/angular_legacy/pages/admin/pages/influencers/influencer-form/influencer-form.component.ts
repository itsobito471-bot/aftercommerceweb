import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-influencer-form',
  templateUrl: './influencer-form.component.html',
  styleUrls: ['./influencer-form.component.css']
})
export class InfluencerFormComponent implements OnInit {
  influencerForm!: FormGroup;
  influencerId: string | null = null;
  isEditMode = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private appService: AppService,
    private route: ActivatedRoute,
    private router: Router,
    private location:Location
  ) {}

  ngOnInit(): void {
    // 1. Check for ID in URL first to set the mode
    this.influencerId = this.route.snapshot.paramMap.get('id');
    if (this.influencerId) {
      this.isEditMode = true;
    }

    // 2. Initialize the form
    this.initForm();
    
    // 3. Setup the auto-generator listener
    this.setupAutoGenerateCode(); 

    // 4. If editing, fetch the existing data
    if (this.isEditMode) {
      this.loadInfluencer();
    }
  }

  initForm(): void {
    this.influencerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('[- +()0-9]{10,15}')]], // Added Phone Validation
      referral_code: ['', [Validators.required, Validators.minLength(3)]],
      discount_percentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      commission_percentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      is_active: [true]
    });
  }

  // ==========================================
  // AUTO-GENERATOR LOGIC
  // ==========================================
  setupAutoGenerateCode(): void {
    // We do NOT want to auto-change codes if we are editing an existing influencer
    if (this.isEditMode) return;

    const nameCtrl = this.influencerForm.get('name');
    const discountCtrl = this.influencerForm.get('discount_percentage');
    const codeCtrl = this.influencerForm.get('referral_code');

    // Listen to Name field
    nameCtrl?.valueChanges.subscribe(name => {
      // 'pristine' means the admin hasn't manually typed in the referral code box yet
      if (codeCtrl?.pristine) {
        this.generateAndSetCode(name, discountCtrl?.value);
      }
    });

    // Listen to Discount field
    discountCtrl?.valueChanges.subscribe(discount => {
      if (codeCtrl?.pristine) {
        this.generateAndSetCode(nameCtrl?.value, discount);
      }
    });
  }

  generateAndSetCode(name: string, discount: number): void {
    if (!name) {
      this.influencerForm.get('referral_code')?.setValue('', { emitEvent: false });
      return;
    }

    // 1. Take the first name (split by space)
    // 2. Remove all special characters and numbers (replace regex)
    // 3. Make it uppercase
    const cleanName = name.split(' ')[0].replace(/[^a-zA-Z]/g, '').toUpperCase();
    
    // 4. Append the discount number (if it's greater than 0)
    const discountStr = discount > 0 ? discount.toString() : '';

    // Set the value without triggering an infinite loop
    this.influencerForm.get('referral_code')?.setValue(`${cleanName}${discountStr}`, { emitEvent: false });
  }

  // ==========================================
  // CRUD LOGIC
  // ==========================================
  loadInfluencer(): void {
    this.isLoading = true;
    this.appService.getInfluencerById(this.influencerId!).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          const user = res.data;
          
          this.influencerForm.patchValue({
            name: user.name,
            email: user.email,
            phone: user.phone || '', // Patches the phone number
            referral_code: user.influencer_profile?.referral_code,
            discount_percentage: user.influencer_profile?.discount_percentage,
            commission_percentage: user.influencer_profile?.commission_percentage,
            is_active: user.is_active
          });
          
          this.influencerForm.get('email')?.disable();
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        Swal.fire('Error', 'Failed to load influencer data', 'error');
      }
    });
  }

  onSubmit(): void {
    if (this.influencerForm.invalid) {
      this.influencerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const val = this.influencerForm.getRawValue();

    const payload = {
      name: val.name,
      email: val.email,
      phone: val.phone, // Includes phone in the payload
      is_active: val.is_active,
      referral_code: val.referral_code,
      discount_percentage: val.discount_percentage,
      commission_percentage: val.commission_percentage
    };

    const request = this.isEditMode 
      ? this.appService.updateInfluencer(this.influencerId!, payload)
      : this.appService.createInfluencer(payload);

    request.subscribe({
      next: () => {
        Swal.fire({
          title: 'Success!',
          text: `Influencer ${this.isEditMode ? 'updated' : 'created'} successfully.`,
          icon: 'success',
          background: 'var(--glass-bg)',
          color: 'var(--color-text-primary)',
          confirmButtonColor: '#10b981'
        });
        this.router.navigate(['/admin/affiliates']);
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire('Error', err.error?.message || 'Something went wrong', 'error');
      }
    });
  }

  Back(){
    this.location.back();
  }
}