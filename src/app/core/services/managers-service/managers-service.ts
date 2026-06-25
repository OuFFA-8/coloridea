import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ManagersService {
  private apiUrl = `${environment.baseUrl}/api/v1/managers`;

  constructor(private http: HttpClient) {}

  // ── User: manage managers ────────────────────────────────────────────────────

  getUserManagers(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${userId}`);
  }

  createManager(data: { name: string; email: string; password: string }): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  updateManager(id: string, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, data);
  }

  deleteManager(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // ── User: manage manager's projects ─────────────────────────────────────────

  getManagerProjects(managerId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${managerId}/projects`);
  }

  addProjectToManager(managerId: string, projectId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${managerId}/projects`, { project: projectId });
  }

  removeProjectFromManager(managerId: string, managerProjectId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${managerId}/projects/${managerProjectId}`);
  }

  updateManagerProjectPermissions(
    managerId: string,
    managerProjectId: string,
    permissions: string[],
  ): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${managerId}/projects/${managerProjectId}`, {
      permissions,
    });
  }

  // ── Manager (logged in): own projects ───────────────────────────────────────

  getMyProjects(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me/projects`);
  }

  getMyProjectById(projectId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/me/projects/${projectId}`);
  }

  // ── Manager: cameras ─────────────────────────────────────────────────────────

  getMyManagerCameras(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me/cameras`);
  }

  // ── Manager: add receipt to installment ─────────────────────────────────────

  addReceiptToInstallment(installmentId: string, data: FormData): Observable<any> {
    return this.http.patch(`${this.apiUrl}/me/installments/${installmentId}`, data);
  }
}
