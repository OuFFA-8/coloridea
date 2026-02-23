import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthServices {
  private apiUrl = `${environment.baseUrl}/api/v1/auth`;

  constructor(private http: HttpClient) {}

  // 1. POST Login
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  // 2. PATCH Update Password
  updatePassword(data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/updatePassword`, data);
  }

  // 3. PATCH Forget Password
  forgetPassword(email: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/forget-password`, { email });
  }

  // 4. PATCH Reset Password
  resetPassword(
    token: string,
    data: { password: string; confirmPassword: string },
  ): Observable<any> {
    return this.http.patch(`${this.apiUrl}/reset-password/${token}`, data);
  }
}
