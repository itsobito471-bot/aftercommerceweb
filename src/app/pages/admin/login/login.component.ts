import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  otpForm!: FormGroup;
  
  passwordVisible = false;
  isOtpStep = false; // Toggles between Login and 2FA views

  constructor(
    private fb: FormBuilder,
    public appService:AppService,
    public router:Router
  ) {}

  ngOnInit(): void {
    // Initialize Login Form
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    // Initialize 2FA OTP Form
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
  }

  onLoginSubmit(): void {
    if (this.loginForm.valid) {
      console.log('Login credentials:', this.loginForm.value);
      

      let payload = {
        "email":this.loginForm.get('email')?.value,
        "password":this.loginForm.get('password')?.value
      }

      this.appService.login(payload).subscribe((res:any)=>{
        
        console.log(res,'this is the res')

        if(res?.requires2FA){
          this.isOtpStep = true;

          return
        }

        if(res?.requiresSetup){


          return

        }

        if(res?.token){
          localStorage.setItem('token',res?.token)

          this.appService.UserDetails().subscribe((res:any)=>{
            if(res?.success){

              let userDetail =  btoa(encodeURIComponent(JSON.stringify(res?.data)))
              localStorage.setItem('me',userDetail)

              this.router.navigate(['/admin']);
              

            }else{
              Swal.fire({
                icon:'error',
                title:"Error",
                text:"User Details Not Found"
              })
            }
            
          },(error:any)=>{
            Swal.fire({
              icon:'error',
              title:"Error",
              text:error?.error?.message
            })
          })


        }



      },(error:any)=>{
        console.log(error,'error')
        Swal.fire({
          title:"Error",
          icon:'error',
          text:error?.error?.message
        })
      })
      // Simulate API call success for credentials, then show OTP step
      
    } else {
      Object.values(this.loginForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  onOtpSubmit(): void {
    if (this.otpForm.valid) {
      console.log('OTP Submitted:', this.otpForm.value);
      // Handle final authentication and routing here
    } else {
      Object.values(this.otpForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  goBackToLogin(): void {
    this.isOtpStep = false;
    this.otpForm.reset();
  }


  forgotPassword(){
    console.log("Forgotpassword clicked")

  }
}