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

  // 1. GET All Users
  getAllUsers(page: number = 1, limit: number = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}?page=${page}&limit=${limit}`);
  }

  // 2. POST Create User (form-data عشان فيه files)
  createUser(data: FormData): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  // 3. DELETE User by ID
  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // 4. PATCH Update Me (form-data عشان فيه files)
  updateMe(data: FormData): Observable<any> {
    return this.http.patch(`${this.apiUrl}/me`, data);
  }
}
