import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdVideoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.baseUrl}/api/v1/adVideos`;

  getUserAdVideos(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${userId}/user`);
  }

  getMyAdVideos(): Observable<any> {
    return this.http.get(`${environment.baseUrl}/api/v1/users/me/adVideos`);
  }

  createAdVideo(userId: string, data: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/${userId}/user`, data);
  }

  deleteAdVideo(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  createMyAdVideo(data: FormData): Observable<any> {
    return this.http.post(`${environment.baseUrl}/api/v1/users/me/adVideos`, data);
  }

  deleteMyAdVideo(id: string): Observable<any> {
    return this.http.delete(`${environment.baseUrl}/api/v1/users/me/adVideos/${id}`);
  }
}
