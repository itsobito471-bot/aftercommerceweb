import { Injectable, NgZone } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  apiEndpoint = environment.apiEndpoint;

  constructor(public http: HttpClient,
    // public afs: AngularFirestore,
    // public afAuth: AngularFireAuth,
    public router: Router,
    public ngZone: NgZone) {
  }

  appName = 'After Commerce';


  getAppName() {
    return this.appName;
  }



  public get<T>(url: any) {
    return this.http.get<T>(this.apiEndpoint + url, {
      headers: this.getHeaders(),
    });
  }

  // making delete request
  public delete(url: any) {
    return this.http.delete(this.apiEndpoint + url, {
      headers: this.getHeaders(),
    });
  }

  // making post request
  public post(url: any, data: any) {
    return this.http.post(this.apiEndpoint + url, data, {
      headers: this.getHeaders(),
    });
  }

  public put(url: any, data: any) {
    return this.http.put<any>(this.apiEndpoint + url, data, {
      headers: this.getHeaders(),
    });
  }

  public postFormData(url: any, data: any) {
    let isformData = true;
    return this.http.post(this.apiEndpoint + url, data, {
      headers: this.getHeaders(isformData),
    });
  }

  public putFormData(url: any, data: any) {
    let isformData = true;
    return this.http.put(this.apiEndpoint + url, data, {
      headers: this.getHeaders(isformData),
    });
  }

  public getHeaders(isformData = false) {
    let headers = new HttpHeaders()
      .set('X-Requested-With', 'XMLHttpRequest')
      .set('Access-Control-Allow-Origin', '*');
    if (isformData !== true) {
      headers = headers.set('content-type', 'application/json');
    }
    if (localStorage.getItem('token') != null) {
      headers = headers.set(
        'Authorization',
        'Bearer ' + localStorage.getItem('token')
      );
    } else {
      headers = headers.set(
        'Authorization',
        'Bearer ' + localStorage.getItem('token')
      );
    }
    return headers;
  }




  //login api
  public login(data:any){
    let headers = this.getHeaders();
    return this.http.post(this.apiEndpoint+'/api/admin/auth/login',data,{
      headers:headers
    })
  }


  public verify2FA(data:any,tempToken:any){
    let headers = new HttpHeaders()
    .set('X-Requested-With', 'XMLHttpRequest')
      .set('Access-Control-Allow-Origin', '*')
      .set('content-type', 'application/json')
      .set('Authorization', 'Bearer ' + tempToken);

    return this.http.post(this.apiEndpoint + '/api/admin/auth/login/2fa', data, { headers });
  }

  public completeSetup(data:any){
    return this.post('/api/admin/auth/complete-setup', data)
  }

  //getme 
  public UserDetails(){
    return this.get('/api/admin/users/me')
  }

  public getMe(){
    const meData = localStorage.getItem('me');
    const dupMeData = localStorage.getItem('me');
    if (meData != null) {
      return JSON.parse(decodeURIComponent(atob(meData)));
    } else if (dupMeData != null) {
      return JSON.parse(decodeURIComponent(atob(dupMeData)));
    } else {
      this.navigateToLogin();
      return null;
    }

  }



  navigateToLogin() {
    localStorage.removeItem('me');
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  //logout api
  public logout(){
    return this.post('/api/admin/auth/logout','')
  }



  // Get all staff (uses the Base64 encoded ?q= JSON query)
  public getStaffList(params: string = '') {
    return this.get(`/api/admin/users${params}`); 
  }

  public getStaffById(id: string) {
    return this.get(`/api/admin/users/${id}`);
  }

  public createStaff(data: any) {
    return this.post('/api/admin/team', data);
  }

  public updateStaff(id: string, data: any) {
    return this.put(`/api/admin/users/${id}`, data);
  }

  public deleteStaff(id: string) {
    return this.delete(`/api/admin/users/${id}`);
  }


  public getAvailablePermissions() {
    return this.get('/api/admin/permissions'); 
  }
}
