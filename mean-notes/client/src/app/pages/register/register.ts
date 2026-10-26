import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, errorMessage } from '../../core/auth.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  template: `
    <section class="auth-card">
      <h1>Create your account</h1>
      <p class="muted">Start keeping your notes in one place.</p>

      <form (ngSubmit)="submit()" #f="ngForm" novalidate>
        <label for="name">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          autocomplete="name"
          maxlength="80"
          required
          [ngModel]="name()"
          (ngModelChange)="name.set($event)"
        />

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
          autocomplete="new-password"
          minlength="8"
          required
          [ngModel]="password()"
          (ngModelChange)="password.set($event)"
        />
        <small class="muted">At least 8 characters.</small>

        @if (error()) {
          <p class="error" role="alert">{{ error() }}</p>
        }

        <button class="btn primary block" type="submit" [disabled]="busy()">
          {{ busy() ? 'Creating account…' : 'Create account' }}
        </button>
      </form>

      <p class="muted center">
        Already have an account? <a routerLink="/login">Sign in</a>
      </p>
    </section>
  `,
})
export class RegisterPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly name = signal('');
  readonly email = signal('');
  readonly password = signal('');
  readonly busy = signal(false);
  readonly error = signal('');

  async submit(): Promise<void> {
    if (!this.name().trim()) return this.error.set('Please enter your name.');
    if (!/^\S+@\S+\.\S+$/.test(this.email().trim())) return this.error.set('Please enter a valid email.');
    if (this.password().length < 8) return this.error.set('Password must be at least 8 characters.');

    this.busy.set(true);
    this.error.set('');
    try {
      await this.auth.register(this.name().trim(), this.email().trim(), this.password());
      await this.router.navigate(['/notes']);
    } catch (err) {
      this.error.set(errorMessage(err));
    } finally {
      this.busy.set(false);
    }
  }
}
