import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CamerasService {
  private apiUrl = `${environment.baseUrl}/api/v1/cameras`;

  constructor(private http: HttpClient) {}

  getUserCameras(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${userId}/user`);
  }

  createCamera(data: FormData): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  updateCamera(id: string, data: FormData): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, data);
  }

  deleteCamera(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getMyCameras(): Observable<any> {
    return this.http.get(`${environment.baseUrl}/api/v1/users/me/cameras`);
  }
}
