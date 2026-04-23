import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-staffform',
  templateUrl: './staffform.component.html',
  styleUrls: ['./staffform.component.css']
})
export class StaffformComponent implements OnInit {
  staffForm!: FormGroup;
  staffId: string | null = null;
  isEditMode: boolean = false;
  isLoading: boolean = false;

  // Now an empty array, populated dynamically by the backend
  availablePermissions: { label: string, value: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private appService: AppService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    
    // Fetch dynamic permissions immediately on load
    this.fetchPermissions();

    // Check if we are in Edit Mode
    this.staffId = this.route.snapshot.paramMap.get('id');
    if (this.staffId) {
      this.isEditMode = true;
      this.fetchStaffDetails(this.staffId);
    }
  }

  initForm(): void {
    this.staffForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      role: ['staff', [Validators.required]],
      permissions: [[]] // Array of strings
    });

    // Automatically clear permissions if role is changed to admin
    this.staffForm.get('role')?.valueChanges.subscribe(role => {
      if (role === 'admin') {
        this.staffForm.get('permissions')?.setValue([]);
      }
    });
  }

  // NEW: Fetch and format permissions from the API
  fetchPermissions(): void {
    this.appService.getAvailablePermissions().subscribe((res: any) => {
      if (res?.success) {
        // Map the raw strings ["course:view", ...] into { label, value } objects for the UI
        const rawPermissions: string[] = res.data;
        this.availablePermissions = rawPermissions.map(perm => ({
          label: this.formatPermissionLabel(perm),
          value: perm
        }));
      }
    }, error => {
      console.error("Failed to load permissions list", error);
    });
  }

  // Utility to turn "course:create" into "Course: Create"
  private formatPermissionLabel(perm: string): string {
    const parts = perm.split(':');
    if (parts.length === 2) {
      const module = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      const action = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
      return `${module}: ${action}`;
    }
    return perm; // Fallback just in case
  }

  fetchStaffDetails(id: string): void {
    this.isLoading = true;
    this.appService.getStaffById(id).subscribe((res: any) => {
      if (res?.success) {
        this.staffForm.patchValue({
          name: res.data.name,
          email: res.data.email,
          phone: res.data.phone,
          role: res.data.role,
          permissions: res.data.permissions || []
        });
        this.staffForm.get('email')?.disable();
      }
      this.isLoading = false;
    }, error => {
      this.isLoading = false;
      Swal.fire('Error', 'Could not load staff details.', 'error');
      this.goBack();
    });
  }

  onSubmit(): void {
    if (this.staffForm.invalid) {
      this.staffForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const payload = this.staffForm.getRawValue(); 

    if (this.isEditMode && this.staffId) {
      this.appService.updateStaff(this.staffId, payload).subscribe((res: any) => {
        this.isLoading = false;
        Swal.fire('Success', 'Staff member updated successfully.', 'success');
        this.goBack();
      }, error => {
        this.isLoading = false;
        Swal.fire('Error', error?.error?.message || 'Failed to update staff.', 'error');
      });
    } else {
      this.appService.createStaff(payload).subscribe((res: any) => {
        this.isLoading = false;
        Swal.fire('Success', 'Staff member created. Invite email sent!', 'success');
        this.goBack();
      }, error => {
        this.isLoading = false;
        Swal.fire('Error', error?.error?.message || 'Failed to create staff.', 'error');
      });
    }
  }

  togglePermission(val: string): void {
    const permsControl = this.staffForm.get('permissions');
    let currentPerms: string[] = permsControl?.value || [];
    
    if (currentPerms.includes(val)) {
      currentPerms = currentPerms.filter(p => p !== val);
    } else {
      currentPerms.push(val);
    }
    permsControl?.setValue(currentPerms);
  }

  hasPermission(val: string): boolean {
    const currentPerms: string[] = this.staffForm.get('permissions')?.value || [];
    return currentPerms.includes(val);
  }

  goBack(): void {
    this.router.navigate(['/admin/staff/staff-list']);
  }
}