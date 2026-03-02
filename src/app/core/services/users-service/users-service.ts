import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private apiUrl = `${environment.baseUrl}/api/v1/users`;

  constructor(private http: HttpClient) {}

  getAllUsers(page: number = 1, limit: number = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}?page=${page}&limit=${limit}`);
  }

  createUser(data: FormData): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  updateMe(data: FormData): Observable<any> {
    return this.http.patch(`${this.apiUrl}/me`, data);
  }

  updateUser(id: string, data: FormData): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, data);
  }
}
