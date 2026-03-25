import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthSessionService } from './features/auth/services/auth.session';
import { AuthApiService } from './features/auth/services/auth.api';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly session = inject(AuthSessionService);
  private readonly authApi = inject(AuthApiService);
  private readonly router = inject(Router);
  protected readonly user$ = this.session.user$;
  protected loggingOut = false;

  protected logout(): void {
    if (this.loggingOut) {
      return;
    }
    this.loggingOut = true;
    this.authApi
      .logout()
      .pipe(finalize(() => (this.loggingOut = false)))
      .subscribe({
        next: () => this.handlePostLogout(),
        error: () => this.handlePostLogout()
      });
  }

  private handlePostLogout(): void {
    this.session.clearSession();
    this.router.navigate(['/auth/login']);
  }
}
