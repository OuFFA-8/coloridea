import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OutputsService {
  private apiUrl = `${environment.baseUrl}/api/v1`;

  constructor(private http: HttpClient) {}

  getOutputsByProject(projectId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/outputs/${projectId}`);
  }

  createOutput(projectId: string, data: { name: string; numberOfItems: number }): Observable<any> {
    return this.http.post(`${this.apiUrl}/outputs/${projectId}`, data);
  }

  updateOutput(outputId: string, data: { numberOfItems: number }): Observable<any> {
    return this.http.patch(`${this.apiUrl}/outputs/${outputId}`, data);
  }

  deleteOutput(outputId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/outputs/${outputId}`);
  }

  addItem(outputId: string, data: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/output-items/${outputId}`, data);
  }
}
