import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Timelapse {
  _id: string;
  name: string;
  link: string;
  backgroundColor?: string;
  photo: string | null;
  project: string;
}

export interface TimelapseResponse {
  status: string;
  data: Timelapse[];
}

export interface TimelapseSingleResponse {
  status: string;
  data: Timelapse;
}

export interface CreateTimelapsePayload {
  name: string;
  link: string;
  backgroundColor?: string;
}

@Injectable({
  providedIn: 'root',
})
export class TimelapseService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = `${environment.baseUrl}/api/v1/timeLaps`;

  /**
   * Get the timelapse of a specific project
   *
   * GET /timeLaps/:projectId
   */
  getProjectTimelapse(projectId: string): Observable<TimelapseResponse> {
    return this.http.get<TimelapseResponse>(`${this.baseUrl}/${projectId}`);
  }

  /**
   * Create a timelapse for a project
   *
   * POST /timeLaps/:projectId
   */
  createTimelapse(projectId: string, payload: FormData): Observable<TimelapseSingleResponse> {
    return this.http.post<TimelapseSingleResponse>(`${this.baseUrl}/${projectId}`, payload);
  }

  /**
   * Update an existing timelapse
   *
   * PATCH /timeLaps/:timelapseId
   */
  updateTimelapse(timelapseId: string, payload: FormData): Observable<TimelapseSingleResponse> {
    return this.http.patch<TimelapseSingleResponse>(`${this.baseUrl}/${timelapseId}`, payload);
  }

  /**
   * Delete an existing timelapse
   *
   * DELETE /timeLaps/:timelapseId
   */
  deleteTimelapse(timelapseId: string): Observable<TimelapseSingleResponse> {
    return this.http.delete<TimelapseSingleResponse>(`${this.baseUrl}/${timelapseId}`);
  }
}
