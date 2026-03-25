import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthSuccessPayload, AuthUser } from '../models/auth.types';

interface AuthSnapshot {
  user: AuthUser | null;
  accessToken: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private readonly storageKey = 'tasktrackr.session';
  private readonly userSubject = new BehaviorSubject<AuthUser | null>(null);
  private readonly tokenSubject = new BehaviorSubject<string | null>(null);

  constructor() {
    const persisted = this.readPersisted();
    if (persisted) {
      this.userSubject.next(persisted.user);
      this.tokenSubject.next(persisted.accessToken);
    }
  }

  get user$(): Observable<AuthUser | null> {
    return this.userSubject.asObservable();
  }

  get accessToken$(): Observable<string | null> {
    return this.tokenSubject.asObservable();
  }

  get snapshot(): AuthSnapshot {
    return {
      user: this.userSubject.value,
      accessToken: this.tokenSubject.value
    };
  }

  setSession(payload: AuthSuccessPayload, options?: { remember?: boolean }): void {
    this.userSubject.next(payload.user);
    this.tokenSubject.next(payload.accessToken);
    this.persist(payload, options?.remember ?? true);
  }

  clearSession(): void {
    this.userSubject.next(null);
    this.tokenSubject.next(null);
    this.removePersisted();
  }

  private persist(payload: AuthSuccessPayload, remember: boolean): void {
    if (!this.hasStorage()) {
      return;
    }
    const primary = remember ? window.localStorage : window.sessionStorage;
    const secondary = remember ? window.sessionStorage : window.localStorage;
    try {
      primary.setItem(this.storageKey, JSON.stringify(payload));
    } catch {}
    try {
      secondary.removeItem(this.storageKey);
    } catch {}
  }

  private readPersisted(): AuthSuccessPayload | null {
    if (!this.hasStorage()) {
      return null;
    }
    const raw = window.localStorage.getItem(this.storageKey) ?? window.sessionStorage.getItem(this.storageKey);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as AuthSuccessPayload;
    } catch {
      return null;
    }
  }

  private removePersisted(): void {
    if (!this.hasStorage()) {
      return;
    }
    try {
      window.localStorage.removeItem(this.storageKey);
    } catch {}
    try {
      window.sessionStorage.removeItem(this.storageKey);
    } catch {}
  }

  private hasStorage(): boolean {
    return typeof window !== 'undefined' && !!window.localStorage && !!window.sessionStorage;
  }
}
