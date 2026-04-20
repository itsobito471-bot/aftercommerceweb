import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

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
    { label: 'Dashboard', icon: 'dashboard', route: '/admin/dashboard' },
    { label: 'Orders', icon: 'shopping-cart', route: '/admin/orders' },
    { label: 'Products', icon: 'appstore', route: '/admin/products' },
    { label: 'Customers', icon: 'team', route: '/admin/customers' },
    { label: 'Revenue', icon: 'dollar-circle', route: '/admin/revenue' },
    { label: 'Analytics', icon: 'bar-chart', route: '/admin/analytics' },
    { label: 'Integrations', icon: 'api', route: '/admin/integrations' },
    { label: 'Settings', icon: 'setting', route: '/admin/settings' },
  ];

  private routerSub!: Subscription;

  constructor(private router: Router) { }

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
    // Clear persisted preferences on logout
    localStorage.removeItem('ac-theme');
    localStorage.removeItem('ac-sidebar-collapsed');

    // Navigate to login — replace with your auth service call
    this.router.navigate(['/login']);
  }

  private updatePageTitle(): void {
    const url = this.router.url;
    const match = this.menuItems.find(item => url.startsWith(item.route));
    this.currentPageTitle = match ? match.label : 'Dashboard';
  }
}