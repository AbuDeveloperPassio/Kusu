import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  template: `
    <header class="topbar">
      <a class="brand" routerLink="/">📝 MEAN Notes</a>
      @if (auth.user(); as user) {
        <div class="who">
          <span class="muted">{{ user.name }}</span>
          <button class="btn ghost" type="button" (click)="auth.logout()">Log out</button>
        </div>
      }
    </header>
    <main class="page">
      <router-outlet />
    </main>
  `,
})
export class App {
  protected readonly auth = inject(AuthService);
}
