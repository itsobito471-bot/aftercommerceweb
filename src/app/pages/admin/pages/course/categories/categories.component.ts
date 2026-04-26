import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
  categories: any[] = [];
  isLoading = true;
  searchQuery = '';
  
  page = 1;
  pageSize = 10;
  totalDocs = 0;

  constructor(private appService: AppService, private router: Router) {}

  ngOnInit(): void {
    this.fetchCategories();
  }

  fetchCategories(): void {
    this.isLoading = true;
    
    const filterParams = {
      page: this.page,
      limit: this.pageSize,
      search: this.searchQuery
    };

    const encodedString = btoa(JSON.stringify(filterParams));

    this.appService.getCategories(`?q=${encodedString}`).subscribe((res: any) => {
      if (res?.success) {
        this.categories = res.data;
        this.totalDocs = res.pagination.totalDocs;
      }
      this.isLoading = false;
    }, () => this.isLoading = false);
  }

  onSearch(): void {
    this.page = 1;
    this.fetchCategories();
  }

  onPageIndexChange(index: number): void {
    this.page = index;
    this.fetchCategories();
  }

  editCategory(id: string): void {
    this.router.navigate(['/admin/courses/categories-form', id]);
  }

  toggleStatus(category: any): void {
    const newStatus = !category.is_active;
    this.appService.updateCategory(category._id, { is_active: newStatus }).subscribe((res: any) => {
      if (res.success) {
        category.is_active = newStatus;
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: `Category ${newStatus ? 'Activated' : 'Deactivated'}`,
          showConfirmButton: false,
          timer: 2000,
          background: 'var(--color-bg-elevated)',
          color: 'var(--color-text-primary)'
        });
      }
    });
  }
}