import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { AuthApiService } from '../../services/auth.api';
import { AuthSessionService } from '../../services/auth.session';

@Component({
  selector: 'app-signup-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup.page.html',
})
export class SignupPage {
  protected readonly title = 'Create your TaskTrackr account';
  protected readonly subtitle = 'Design a calmer workflow with automations that keep everything in sync.';
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthApiService);
  private readonly router = inject(Router);
  private readonly session = inject(AuthSessionService);
  protected showPassword = false;
  protected showConfirmPassword = false;
  protected submitted = false;
  protected isSubmitting = false;
  protected serverMessage = '';
  protected errorMessage = '';
  protected readonly signupForm = this.fb.nonNullable.group(
    {
      name: ['', [Validators.required, Validators.minLength(3)]],
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(24),
          Validators.pattern(/^[a-z0-9._-]+$/i)
        ]
      ],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/)]
      ],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, Validators.requiredTrue]
    },
    { validators: SignupPage.matchPasswords }
  );
  protected togglePassword(field: 'primary' | 'confirm'): void {
    if (field === 'primary') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  protected submit(): void {
    this.submitted = true;
    this.serverMessage = '';
    this.errorMessage = '';

    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const { name, username, email, password } = this.signupForm.getRawValue();
    this.authApi
      .signup({
        name: name.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        password: password.trim()
      })
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: response => {
          if (response.data) {
            this.session.setSession(response.data, { remember: true });
          }
          this.serverMessage =
            response.message ?? 'Account created! Check your inbox to verify your email.';
          this.signupForm.patchValue({ password: '', confirmPassword: '' });
          this.router.navigate(['/dashboard']);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = error.error?.message ?? 'Unable to create your account right now.';
        }
      });
  }

  protected showError(control: AbstractControl | null): boolean {
    return !!control && control.invalid && (control.dirty || control.touched || this.submitted);
  }

  protected get nameCtrl(): AbstractControl | null {
    return this.signupForm.get('name');
  }

  protected get usernameCtrl(): AbstractControl | null {
    return this.signupForm.get('username');
  }

  protected get emailCtrl(): AbstractControl | null {
    return this.signupForm.get('email');
  }

  protected get passwordCtrl(): AbstractControl | null {
    return this.signupForm.get('password');
  }

  protected get confirmPasswordCtrl(): AbstractControl | null {
    return this.signupForm.get('confirmPassword');
  }

  protected get passwordMismatch(): boolean {
    return (
      this.signupForm.hasError('passwordMismatch') &&
      (this.confirmPasswordCtrl?.dirty || this.confirmPasswordCtrl?.touched || this.submitted)
    );
  }

  protected get acceptTermsCtrl(): AbstractControl | null {
    return this.signupForm.get('acceptTerms');
  }

  private static matchPasswords(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    if (!password || !confirm) {
      return null;
    }
    return password === confirm ? null : { passwordMismatch: true };
  }
}
