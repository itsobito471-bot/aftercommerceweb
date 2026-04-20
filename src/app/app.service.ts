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
    if (localStorage.getItem('accountAccessToken') != null) {
      headers = headers.set(
        'Authorization',
        'Bearer ' + localStorage.getItem('accountAccessToken')
      );
    } else {
      headers = headers.set(
        'Authorization',
        'Bearer ' + localStorage.getItem('dupaccountAccessToken')
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

  //getme 
  public UserDetails(){
    return this.get('/api/admin/users/me')
  }


}
