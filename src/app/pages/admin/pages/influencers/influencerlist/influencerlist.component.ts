import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-influencer-list',
  templateUrl: './influencerlist.component.html',
  styleUrls: ['./influencerlist.component.css']
})
export class InfluencerlistComponent implements OnInit {
  influencers: any[] = [];
  isLoading = true;
  
  // Pagination State
  total = 0;
  pageSize = 10;
  pageIndex = 1;
  searchValue = '';

  constructor(private appService: AppService, private router: Router) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;

    // 1. Create the filter object
    const filterObj = {
      page: this.pageIndex,
      limit: this.pageSize,
      search: this.searchValue
    };

    // 2. Encode to Base64 for the 'q' parameter
    const q = btoa(JSON.stringify(filterObj));

    this.appService.getInfluencersFilter(q).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.influencers = res.data;
          this.total = res.pagination.totalRecords;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        Swal.fire('Error', 'Failed to fetch influencers', 'error');
      }
    });
  }

  // Handle page index change
  onPageIndexChange(index: number): void {
    this.pageIndex = index;
    this.loadData();
  }

  // Handle page size change
  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1; // Reset to first page when limit changes
    this.loadData();
  }

  // Handle search
  onSearch(): void {
    this.pageIndex = 1; // Reset to first page on new search
    this.loadData();
  }

  editInfluencer(id: string): void {
    this.router.navigate(['/admin/affiliates/form', id]);
  }

  toggleStatus(influencer: any): void {
    const newStatus = !influencer.is_active;
    this.appService.updateInfluencer(influencer._id, { is_active: newStatus }).subscribe({
      next: (res: any) => {
        if (res.success) {
          influencer.is_active = newStatus;
          Swal.fire({
            toast: true, position: 'top-end', icon: 'success', 
            title: `Influencer ${newStatus ? 'Activated' : 'Deactivated'}`,
            showConfirmButton: false, timer: 2000,
            background: 'var(--glass-bg)', color: 'var(--color-text-primary)'
          });
        }
      }
    });
  }
}