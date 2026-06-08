import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service'; 
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTableQueryParams } from 'ng-zorro-antd/table';

@Component({
  selector: 'app-template-list',
  templateUrl: './template-list.component.html',
  styleUrls: ['./template-list.component.css']
})
export class TemplateListComponent implements OnInit {
  templatesList: any[] = [];
  isLoading: boolean = false;

  // Pagination & Search State
  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  searchQuery: string = '';

  constructor(
    private appService: AppService,
    private router: Router,
    private msg: NzMessageService
  ) {}

  ngOnInit(): void {
    // The initial fetch is triggered automatically by the Ng-Zorro table's 
    // (nzQueryParams) event when it renders, so we leave this empty to prevent double-fetching.
  }

  // Fetch data using the Base64 encoded payload to match your enterprise backend
  fetchTemplates(): void {
    this.isLoading = true;
    
    // 1. Create the JSON payload including pagination and search
    const filterPayload = {
      page: this.pageIndex,
      limit: this.pageSize,
      search: this.searchQuery
    };

    // 2. Stringify and encode to Base64
    const encodedQuery = btoa(JSON.stringify(filterPayload));
    const params = `?q=${encodedQuery}`;
    
    this.appService.getAssessmentTemplates(params).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res && res.success) {
          this.templatesList = res.data;
          // CHANGED THIS LINE: Now matching your actual backend response payload
          this.totalItems = res.meta ? res.meta.total : 0; 
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.msg.error('Failed to load assessment templates.');
        console.error(err);
      }
    });
  }

  // Triggered when the user presses Enter in the search bar
  onSearch(): void {
    this.pageIndex = 1; // Always reset to page 1 when running a new search
    this.fetchTemplates();
  }

  // Triggered by Ng-Zorro table when page or size changes
  onQueryParamsChange(params: NzTableQueryParams): void {
    this.pageIndex = params.pageIndex;
    this.pageSize = params.pageSize;
    this.fetchTemplates();
  }

  // --- Navigation Actions ---

  createNewTemplate(): void {
    this.router.navigate(['/admin/assessment-templates/new']);
  }

  editTemplateSetup(id: string): void {
    this.router.navigate(['/admin/assessment-templates/edit', id]);
  }

  openQuestionBuilder(id: string): void {
    this.router.navigate(['/admin/assessment-templates', id, 'builder']);
  }

  // --- Deletion ---

  deleteTemplate(id: string): void {
    if (confirm('Are you sure you want to delete this template? This cannot be undone.')) {
      this.isLoading = true;
      this.appService.deleteAssessmentTemplate(id).subscribe({
        next: (res: any) => {
          this.msg.success('Template deleted successfully.');
          
          // If we deleted the last item on a page, bump back a page
          if (this.templatesList.length === 1 && this.pageIndex > 1) {
            this.pageIndex--;
          }
          
          this.fetchTemplates(); // Refresh current page
        },
        error: (err) => {
          this.isLoading = false;
          this.msg.error('Error deleting template.');
          console.error(err);
        }
      });
    }
  }
}