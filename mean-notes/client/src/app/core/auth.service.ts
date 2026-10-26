import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

export interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

const TOKEN_KEY = 'mean-notes-token';
const USER_KEY = 'mean-notes-user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly user = signal<User | null>(this.loadUser());
  readonly isLoggedIn = computed(() => this.user() !== null);

  get token(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  async register(name: string, email: string, password: string): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<AuthResponse>('/api/auth/register', { name, email, password }),
    );
    this.store(res);
  }

  async login(email: string, password: string): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<AuthResponse>('/api/auth/login', { email, password }),
    );
    this.store(res);
  }

  logout(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      /* storage unavailable */
    }
    this.user.set(null);
    this.router.navigate(['/login']);
  }

  private store(res: AuthResponse): void {
    try {
      localStorage.setItem(TOKEN_KEY, res.token);
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    } catch {
      /* storage unavailable */
    }
    this.user.set(res.user);
  }

  private loadUser(): User | null {
    try {
      if (!localStorage.getItem(TOKEN_KEY)) return null;
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }
}

export function errorMessage(err: unknown): string {
  const e = err as { error?: { error?: string }; status?: number };
  if (e?.error?.error) return e.error.error;
  if (e?.status === 0) return 'Cannot reach the server. Check your connection.';
  return 'Something went wrong. Please try again.';
}
