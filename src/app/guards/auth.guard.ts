import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = localStorage.getItem('token'); 
    
    if (token) {
      return true; // Token exists, grant access
    }

    // No token found, redirect to the Angular login page
    Swal.fire({
        title:"Unauthorized",
        "text":"Session Expired",
        icon:'warning'
    })
    this.router.navigate(['/admin/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.canActivate(route, state);
  }
}