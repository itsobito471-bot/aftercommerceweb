import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-kyc-list',
  templateUrl: './kyc-list.component.html'
})
export class KycListComponent implements OnInit {
  fields: any[] = [];
  isLoading = true;

  constructor(private appService: AppService, private router: Router) {}

  ngOnInit(): void {
    this.fetchFields();
  }

  fetchFields(): void {
    this.isLoading = true;
    this.appService.getKycFields().subscribe((res: any) => {
      if (res?.success) {
        this.fields = res.data;
      }
      this.isLoading = false;
    }, () => this.isLoading = false);
  }

  editField(id: string): void {
    this.router.navigate(['/admin/settings/kyc-form', id]);
  }

  toggleStatus(field: any): void {
    const newStatus = !field.is_active;
    this.appService.updateKycField(field._id, { is_active: newStatus }).subscribe((res: any) => {
      if (res.success) {
        field.is_active = newStatus;
        Swal.fire({
          toast: true, position: 'top-end', icon: 'success',
          title: `Field ${newStatus ? 'Activated' : 'Deactivated'}`,
          showConfirmButton: false, timer: 2000,
          background: 'var(--color-bg-elevated)', color: 'var(--color-text-primary)'
        });
      }
    });
  }
}