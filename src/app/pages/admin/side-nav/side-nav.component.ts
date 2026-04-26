import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { AppService } from 'src/app/app.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.css']
})
export class SideNavComponent implements OnInit, OnDestroy {
  isSidebarCollapsed = false;
  isMobileOpen = false;
  isLightTheme = true;
  windowWidth = window.innerWidth;
  currentPageTitle = 'Dashboard';

  loggedInUserDetails :any

  // User info (replace with auth service data in production)
  userName = 'Alex Chen';
  userRole = 'Store Admin';
  get userInitials(): string {
    return this.userName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  menuItems = [
    { label: 'Dashboard', icon: 'dashboard', route: '/admin/home' },
    { label: 'Course Catalog', icon: 'book', route: '/admin/courses' },
    { label: 'Categories', icon: 'appstore', route: '/admin/courses/categories' },
    { label: 'Students', icon: 'user', route: '/admin/students' },
    { label: 'Team Management', icon: 'team', route: '/admin/staff' },
    { label: 'Affiliates & Payouts', icon: 'percentage', route: '/admin/affiliates' },
    { label: 'Transactions', icon: 'dollar-circle', route: '/admin/transactions' }
  ];

  private routerSub!: Subscription;

  constructor(
    private router: Router,
    public appService:AppService
  ) { }

  @HostListener('window:resize')
  onResize(): void {
    this.windowWidth = window.innerWidth;
    if (this.windowWidth >= 768 && this.isMobileOpen) {
      this.isMobileOpen = false;
    }
  }

  // Close sidebar on Escape key (accessibility)
  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isMobileOpen) {
      this.isMobileOpen = false;
    }
  }

  ngOnInit(): void {
    // Restore theme from localStorage, defaulting to 'light' since index.html is 'light'
    const savedTheme = localStorage.getItem('ac-theme');
    if (savedTheme === 'dark') {
      this.isLightTheme = false;
      document.documentElement.removeAttribute('data-theme');
    } else {
      this.isLightTheme = true;
      document.documentElement.setAttribute('data-theme', 'light');
    }

    // Restore sidebar collapsed state
    const savedCollapsed = localStorage.getItem('ac-sidebar-collapsed');
    if (savedCollapsed === 'true') {
      this.isSidebarCollapsed = true;
    }

    // Update breadcrumb page title on route change
    this.routerSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updatePageTitle();
      });

    this.updatePageTitle();
    
    this.loggedInUserDetails = this.appService.getMe();
    console.log(this.loggedInUserDetails);

    this.userName=this.loggedInUserDetails?.name
    this.userRole = this.loggedInUserDetails?.role
    console.log(this.loggedInUserDetails?.role,'this.loggedInUserDetails?.role')



  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  toggleSidebar(): void {
    if (this.windowWidth < 768) {
      this.isMobileOpen = !this.isMobileOpen;
    } else {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
      localStorage.setItem('ac-sidebar-collapsed', String(this.isSidebarCollapsed));
    }
  }

  closeMobileSidebar(): void {
    this.isMobileOpen = false;
  }

  toggleTheme(): void {
    this.isLightTheme = !this.isLightTheme;
    if (this.isLightTheme) {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('ac-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('ac-theme', 'dark');
    }
  }

  logout(): void {
    Swal.fire({
      icon: 'question',
      title: 'Are you sure you want to logout?',
      showCancelButton: true,            // Shows the "Cancel" button
      confirmButtonText: 'Yes, logout',  // Text for the confirm button
      cancelButtonText: 'Cancel',        // Text for the cancel button
      confirmButtonColor: '#ef4444',     // A nice red color for destructive actions (Tailwind red-500)
    }).then((result) => {
      
      // result.isConfirmed is true ONLY if they click "Yes, logout"
      if (result.isConfirmed) {
        
        // 1. Clear persisted preferences and tokens
        localStorage.removeItem('ac-theme');
        localStorage.removeItem('ac-sidebar-collapsed');

        // const token = localStorage.getItem('token');

        localStorage.removeItem('me');
        // localStorage.removeItem('token');

        // 2. Call the backend logout API
        this.appService.logout().subscribe({
          next: (res: any) => {
            console.log('Logged out successfully');
            localStorage.removeItem('token');

          },
          error: (error: any) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: error?.error?.message || 'Something went wrong while logging out from the server.'
            });
          }
        });

        // 3. Navigate to login
        this.router.navigate(['/admin/login']);
      }
      // If they click cancel, it does nothing and the modal just closes!
    });
  }

  private updatePageTitle(): void {
    const url = this.router.url;
    const match = this.menuItems.find(item => url.startsWith(item.route));
    this.currentPageTitle = match ? match.label : 'Dashboard';
  }
}