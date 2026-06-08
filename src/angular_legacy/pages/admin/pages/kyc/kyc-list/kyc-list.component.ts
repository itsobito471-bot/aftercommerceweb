import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import Swal from 'sweetalert2';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-kyc-list',
  templateUrl: './kyc-list.component.html',
  styleUrls: ['./kyc-list.component.css']
})
export class KycListComponent implements OnInit {
  fields: any[] = [];
  isLoading = true;
  isSavingOrder = false;

  constructor(private appService: AppService, private router: Router) {}

  ngOnInit(): void {
    this.fetchFields();
  }

  fetchFields(): void {
    this.isLoading = true;
    this.appService.getKycFields().subscribe({
      next: (res: any) => {
        if (res?.success) {
          // Ensure they are sorted by order_index initially
          this.fields = res.data.sort((a: any, b: any) => a.order_index - b.order_index);
        }
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  // --- THE DRAG AND DROP LOGIC ---
  drop(event: CdkDragDrop<any[]>): void {
    // 1. If they dropped it in the exact same spot, do nothing
    if (event.previousIndex === event.currentIndex) return;

    // 2. Save a backup of the original array just in case they cancel
    const previousState = [...this.fields];

    // 3. Optimistically move the item so the UI looks smooth
    moveItemInArray(this.fields, event.previousIndex, event.currentIndex);

    // 4. Ask for confirmation
    Swal.fire({
      title: 'Save new order?',
      text: 'Are you sure you want to change the display order of these fields?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, save order',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#10b981', // Your theme green
      background: 'var(--glass-bg)',
      color: 'var(--color-text-primary)'
    }).then((result) => {
      
      if (result.isConfirmed) {
        this.saveNewOrder();
      } else {
        // If they click cancel, instantly snap the array back to the original state
        this.fields = previousState;
      }
    });
  }

  saveNewOrder(): void {
    this.isSavingOrder = true;

    // Recalculate the order_index for every field based on their new visual position
    this.fields.forEach((field, index) => {
      field.order_index = index + 1;
    });

    // Create an array of HTTP PUT requests
    const updateRequests = this.fields.map(field => 
      this.appService.updateKycField(field._id, { order_index: field.order_index })
    );

    // Fire all updates in parallel
    forkJoin(updateRequests).subscribe({
      next: () => {
        this.isSavingOrder = false;
        Swal.fire({
          toast: true, position: 'top-end', icon: 'success', 
          title: 'Display order updated!', showConfirmButton: false, timer: 2000,
          background: 'var(--glass-bg)', color: 'var(--color-text-primary)'
        });
      },
      error: () => {
        this.isSavingOrder = false;
        Swal.fire({
          title: 'Error', text: 'Failed to save new order. Refreshing data...', icon: 'error',
          background: 'var(--glass-bg)', color: 'var(--color-text-primary)'
        });
        this.fetchFields(); // Revert visually if the database fails
      }
    });
  }

  // --- EXISTING CRUD LOGIC ---
  editField(id: string): void {
    this.router.navigate(['/admin/kyc/kyc-form', id]);
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
          background: 'var(--glass-bg)', color: 'var(--color-text-primary)'
        });
      }
    });
  }
}