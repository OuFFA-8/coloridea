import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  private apiUrl = `${environment.baseUrl}/api/v1/projects`;

  constructor(private http: HttpClient) {}

  getAllProjects(page: number = 1, limit: number = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}?page=${page}&limit=${limit}`);
  }

  getProjectById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  getUserProjects(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${userId}/user`);
  }

  createProject(data: FormData): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  updateProject(id: string, data: FormData): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, data);
  }

  deleteProject(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Installments
  addInstallment(projectId: string, data: { amount: number; createdAt: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/${projectId}/installments`, data);
  }

  updateInstallment(
    installmentId: string,
    data: { amount: number; createdAt: string },
  ): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${installmentId}/installments`, data);
  }

  deleteInstallment(installmentId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${installmentId}/installments`);
  }
}
