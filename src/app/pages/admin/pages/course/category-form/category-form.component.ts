import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css']
})
export class CategoryFormComponent implements OnInit {
  categoryForm!: FormGroup;
  categoryId: string | null = null;
  isEditMode = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private appService: AppService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      is_active: [true]
    });

    this.categoryId = this.route.snapshot.paramMap.get('id');
    if (this.categoryId) {
      this.isEditMode = true;
      this.loadCategory();
    }
  }

  loadCategory(): void {
    this.isLoading = true;
    // We use the filter API to find the specific category
    const q = btoa(JSON.stringify({ search: this.categoryId }));
    this.appService.getCategories(`?q=${q}`).subscribe((res: any) => {
      if (res.success && res.data.length > 0) {
        const cat = res.data[0];
        this.categoryForm.patchValue({
          name: cat.name,
          description: cat.description,
          is_active: cat.is_active
        });
      }
      this.isLoading = false;
    });
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) return;

    this.isLoading = true;
    const data = this.categoryForm.value;

    if (this.isEditMode && this.categoryId) {
      this.appService.updateCategory(this.categoryId, data).subscribe(() => {
        Swal.fire('Updated', 'Category saved successfully', 'success');
        this.router.navigate(['/admin/courses/categories']);
      });
    } else {
      this.appService.createCategory(data).subscribe(() => {
        Swal.fire('Created', 'New category added', 'success');
        this.router.navigate(['/admin/courses/categories']);
      });
    }
  }
}