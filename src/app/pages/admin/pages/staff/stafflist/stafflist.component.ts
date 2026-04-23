import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-stafflist',
  templateUrl: './stafflist.component.html',
  styleUrls: ['./stafflist.component.css']
})
export class StafflistComponent implements OnInit {
  staffList: any[] = [];
  isLoading: boolean = true;
  searchQuery: string = '';

  // Metrics for the top cards
  metrics = {
    total: 0,
    active: 0,
    admins: 0
  };

  constructor(
    public appService: AppService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchStaff();
  }

  // 1. Initial Data Fetch (Securely Base64 Encoded)
  fetchStaff(): void {
    this.isLoading = true;
    
    // Create the JSON payload
    const filterParams = {
      page: 1,
      limit: 100 ,
      role:['staff','admin']
    };

    // Encode it to Base64
    const encodedString = btoa(JSON.stringify(filterParams));

    // Call the API with the encoded ?q= parameter
    this.appService.getStaffList(`?q=${encodedString}`).subscribe((res: any) => {
      if (res?.success) {
        // Filter out normal users to only show team members
        this.staffList = res.data.filter((u: any) => u.role === 'admin' || u.role === 'staff');
        this.calculateMetrics();
      }
      this.isLoading = false;
    }, (error: any) => {
      this.isLoading = false;
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load staff.' });
    });
  }

  // 2. Dynamic Search (Securely Base64 Encoded)
  onSearch(): void {
    this.isLoading = true;

    const filterParams = {
      page: 1,
      limit: 100,
      search: this.searchQuery
    };

    const encodedString = btoa(JSON.stringify(filterParams));

    this.appService.getStaffList(`?q=${encodedString}`).subscribe((res: any) => {
      if (res?.success) {
        this.staffList = res.data.filter((u: any) => u.role === 'admin' || u.role === 'staff');
      }
      this.isLoading = false;
    });
  }

  // Update top card numbers dynamically
  calculateMetrics(): void {
    this.metrics.total = this.staffList.length;
    this.metrics.active = this.staffList.filter(s => !s.is_blocked).length;
    this.metrics.admins = this.staffList.filter(s => s.role === 'admin').length;
  }

  // Route to the edit form populated with this user's ID
  editStaff(id: string): void {
    this.router.navigate(['/admin/staff/staff-form', id]); 
  }

  // Delete/Block a team member
  deleteStaff(id: string, name: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to remove ${name} from the team.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#3b82f6',
      confirmButtonText: 'Yes, remove them'
    }).then((result) => {
      if (result.isConfirmed) {
        this.appService.deleteStaff(id).subscribe((res: any) => {
          Swal.fire('Deleted!', 'Staff member has been removed.', 'success');
          this.fetchStaff(); // Refresh the list
        }, (error: any) => {
          Swal.fire('Error!', error?.error?.message || 'Failed to remove staff.', 'error');
        });
      }
    });
  }
}