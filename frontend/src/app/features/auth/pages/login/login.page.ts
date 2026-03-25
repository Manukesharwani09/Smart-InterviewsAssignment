import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { AuthApiService } from '../../services/auth.api';
import { AuthSessionService } from '../../services/auth.session';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.page.html',
})
export class LoginPage {
  protected readonly title = 'Sign in to TaskTrackr';
  protected readonly subtitle = 'Step back into your flow and keep priorities moving forward.';
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthApiService);
  private readonly router = inject(Router);
  private readonly session = inject(AuthSessionService);
  protected readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    remember: [true]
  });
  protected submitted = false;
  protected showPassword = false;
  protected isSubmitting = false;
  protected serverMessage = '';
  protected errorMessage = '';

  protected togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  protected submit(): void {
    this.submitted = true;
    this.serverMessage = '';
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const { email, password, remember } = this.loginForm.getRawValue();
    this.authApi
      .login({ email: email.trim().toLowerCase(), password: password.trim() })
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: response => {
          if (response.data) {
            this.session.setSession(response.data, { remember });
          }
          this.serverMessage = response.message ?? 'Authenticated! Redirecting to your workspace...';
          this.router.navigate(['/dashboard']);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = error.error?.message ?? 'Unable to sign in. Please verify your credentials.';
        }
      });
  }

  protected showError(control: AbstractControl | null): boolean {
    return !!control && control.invalid && (control.dirty || control.touched || this.submitted);
  }

  protected get emailCtrl(): AbstractControl | null {
    return this.loginForm.get('email');
  }

  protected get passwordCtrl(): AbstractControl | null {
    return this.loginForm.get('password');
  }
}
