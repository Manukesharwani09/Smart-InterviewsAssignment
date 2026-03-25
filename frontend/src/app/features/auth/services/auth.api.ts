import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ApiResponse,
  AuthSuccessPayload,
  AuthUserResponse,
  LoginPayload,
  SignupPayload
} from '../models/auth.types';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/auth';

  login(payload: LoginPayload): Observable<ApiResponse<AuthSuccessPayload>> {
    return this.http.post<ApiResponse<AuthSuccessPayload>>(`${this.baseUrl}/login`, payload, {
      withCredentials: true
    });
  }

  signup(payload: SignupPayload): Observable<ApiResponse<AuthSuccessPayload>> {
    return this.http.post<ApiResponse<AuthSuccessPayload>>(`${this.baseUrl}/signup`, payload, {
      withCredentials: true
    });
  }

  logout(): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(
      `${this.baseUrl}/logout`,
      {},
      { withCredentials: true }
    );
  }

  fetchCurrentUser(): Observable<ApiResponse<AuthUserResponse>> {
    return this.http.get<ApiResponse<AuthUserResponse>>(`${this.baseUrl}/current-user`, {
      withCredentials: true
    });
  }
}
