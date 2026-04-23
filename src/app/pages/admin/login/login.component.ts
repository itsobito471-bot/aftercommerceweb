import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  // Forms
  loginForm!: FormGroup;
  otpForm!: FormGroup;
  setupForm!: FormGroup;
  
  // Visibility Toggles
  passwordVisible = false;
  setupPasswordVisible = false;
  confirmPasswordVisible = false;

  // View States
  isOtpStep = false; 
  isSetupStep = false; 

  // Data Handoff States
  tempToken: string = ''; 
  userEmail: string = ''; 

  // --- TIMER VARIABLES ---
  timerInterval: any;
  timeRemaining: number = 0; // in seconds
  displayTime: string = '00:00';
  canResend: boolean = false;

  constructor(
    private fb: FormBuilder,
    public appService: AppService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });

    this.setupForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  // Prevent memory leaks when leaving the page
  ngOnDestroy(): void {
    this.stopTimer();
  }

  // ==========================================
  // STEP 1: STANDARD LOGIN
  // ==========================================
  onLoginSubmit(): void {
    if (this.loginForm.valid) {
      let payload = {
        email: this.loginForm.get('email')?.value,
        password: this.loginForm.get('password')?.value
      };

      this.appService.login(payload).subscribe((res: any) => {
        // Intercept 1: User has 2FA enabled
        if (res?.requires2FA) {
          this.tempToken = res.tempToken; 
          this.isOtpStep = true;
          this.startTimer(300); // 5 Minutes for 2FA
          return;
        }

        // Intercept 2: User is logging in for the very first time
        if (res?.requiresSetup) {
          this.userEmail = this.loginForm.get('email')?.value; 
          this.isSetupStep = true;
          this.startTimer(600); // 10 Minutes for Setup OTP
          return;
        }

        // Standard Login Success
        this.handleSuccessfulLogin(res);

      }, (error: any) => {
        Swal.fire({ title: "Error", icon: 'error', text: error?.error?.message });
      });

    } else {
      this.markFormDirty(this.loginForm);
    }
  }

  // ==========================================
  // STEP 2: 2FA VERIFICATION
  // ==========================================
  onOtpSubmit(): void {
    if (this.otpForm.valid) {
      const payload = { otp: this.otpForm.get('otp')?.value };

      this.appService.verify2FA(payload, this.tempToken).subscribe((res: any) => {
        this.stopTimer(); // Success! Stop the clock.
        this.handleSuccessfulLogin(res);
      }, (error: any) => {
        Swal.fire({ icon: 'error', title: "Error", text: error?.error?.message });
      });
    } else {
      this.markFormDirty(this.otpForm);
    }
  }

  // ==========================================
  // STEP 3: FIRST-TIME SETUP
  // ==========================================
  onSetupSubmit(): void {
    if (this.setupForm.valid) {
      const values = this.setupForm.value;

      if (values.newPassword !== values.confirmPassword) {
        Swal.fire({ icon: 'warning', title: "Mismatch", text: "Passwords do not match." });
        return;
      }

      const payload = {
        email: this.userEmail,
        otp: values.otp,
        newPassword: values.newPassword
      };

      this.appService.completeSetup(payload).subscribe((res: any) => {
        this.stopTimer(); // Success! Stop the clock.
        this.handleSuccessfulLogin(res); 
      }, (error: any) => {
        Swal.fire({ icon: 'error', title: "Error", text: error?.error?.message });
      });

    } else {
      this.markFormDirty(this.setupForm);
    }
  }

  // ==========================================
  // TIMER LOGIC
  // ==========================================
  startTimer(durationInSeconds: number): void {
    this.stopTimer(); // Clear any existing timer first
    this.timeRemaining = durationInSeconds;
    this.canResend = false;
    this.updateDisplayTime();

    this.timerInterval = setInterval(() => {
      if (this.timeRemaining > 0) {
        this.timeRemaining--;
        this.updateDisplayTime();
      } else {
        this.stopTimer();
        this.canResend = true; // Timer hit 0, show the Resend button!
      }
    }, 1000);
  }

  updateDisplayTime(): void {
    const minutes: number = Math.floor(this.timeRemaining / 60);
    const seconds: number = this.timeRemaining % 60;
    // Format to 00:00
    this.displayTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  resendCode(): void {
    // Note: To make this fully functional, call your appService.login() again 
    // with the email to trigger a fresh OTP email, then restart the timer!
    Swal.fire({ icon: 'info', title: 'Code Sent', text: 'A new verification code has been sent.' });
    
    // Restart the clock depending on what screen they are on
    if (this.isOtpStep) this.startTimer(300);
    if (this.isSetupStep) this.startTimer(600);
  }

  // ==========================================
  // UTILITIES
  // ==========================================
  private handleSuccessfulLogin(res: any): void {
    if (res?.token) {
      localStorage.setItem('token', res.token);

      this.appService.UserDetails().subscribe((userRes: any) => {
        if (userRes?.success) {
          let userDetail = btoa(encodeURIComponent(JSON.stringify(userRes?.data)));
          localStorage.setItem('me', userDetail);
          this.router.navigate(['/admin']);
        } else {
          Swal.fire({ icon: 'error', title: "Error", text: "User Details Not Found" });
        }
      }, (error: any) => {
        Swal.fire({ icon: 'error', title: "Error", text: error?.error?.message || "Failed to fetch profile." });
      });
    }
  }

  goBackToLogin(): void {
    this.stopTimer(); // Always stop the timer if they back out!
    this.isOtpStep = false;
    this.isSetupStep = false;
    this.tempToken = '';
    this.userEmail = '';
    this.otpForm.reset();
    this.setupForm.reset();
  }

  forgotPassword(): void {
    console.log("Forgot password clicked");
  }

  private markFormDirty(form: FormGroup): void {
    Object.values(form.controls).forEach(control => {
      if (control.invalid) {
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
      }
    });
  }
}