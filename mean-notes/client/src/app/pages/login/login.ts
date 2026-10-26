import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, errorMessage } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  template: `
    <section class="auth-card">
      <h1>Welcome back</h1>
      <p class="muted">Sign in to see your notes.</p>

      <form (ngSubmit)="submit()" #f="ngForm" novalidate>
        <label for="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autocomplete="email"
          required
          [ngModel]="email()"
          (ngModelChange)="email.set($event)"
        />

        <label for="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autocomplete="current-password"
          required
          [ngModel]="password()"
          (ngModelChange)="password.set($event)"
        />

        @if (error()) {
          <p class="error" role="alert">{{ error() }}</p>
        }

        <button class="btn primary block" type="submit" [disabled]="busy()">
          {{ busy() ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>

      <p class="muted center">
        New here? <a routerLink="/register">Create an account</a>
      </p>
    </section>
  `,
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly email = signal('');
  readonly password = signal('');
  readonly busy = signal(false);
  readonly error = signal('');

  async submit(): Promise<void> {
    if (!this.email().trim() || !this.password()) {
      this.error.set('Enter your email and password.');
      return;
    }
    this.busy.set(true);
    this.error.set('');
    try {
      await this.auth.login(this.email().trim(), this.password());
      await this.router.navigate(['/notes']);
    } catch (err) {
      this.error.set(errorMessage(err));
    } finally {
      this.busy.set(false);
    }
  }
}
