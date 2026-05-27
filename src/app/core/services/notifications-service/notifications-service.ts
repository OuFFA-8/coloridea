import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../../environments/environment';

export interface Notification {
  _id: string;
  title: { ar: string; en: string };
  message: { ar: string; en: string };
  isRead: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationsService implements OnDestroy {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = `${environment.baseUrl}/api/v1/notifications`;

  private socket: Socket | null = null;
  notifications$ = new BehaviorSubject<Notification[]>([]);
  unreadCount$ = new BehaviorSubject<number>(0);

  connect(token: string) {
    if (!isPlatformBrowser(this.platformId)) return;
    this.disconnect();

    this.socket = io(environment.socketUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    });

    // Step 1: once connected, authenticate with the server
    this.socket.on('connect', () => {
      this.socket!.emit('authenticate', { token });
    });

    // Step 2: server confirms authentication
    this.socket.on('authenticated', () => {
      console.log('[Socket] Authenticated successfully');
    });

    // Step 3: listen for real-time notification events
    this.socket.on('notification', (data: Notification) => {
      const current = this.notifications$.value;
      this.notifications$.next([data, ...current]);
      this.unreadCount$.next(this.unreadCount$.value + 1);
    });

    // Re-authenticate after reconnect (socket ID changes on reconnect)
    this.socket.on('reconnect', () => {
      this.socket!.emit('authenticate', { token });
    });

    this.socket.on('connect_error', (err) => {
      console.warn('[Socket] Connection error:', err.message);
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  loadNotifications() {
    return this.http.get<any>(`${this.apiUrl}/me`).subscribe({
      next: (res) => {
        const list: Notification[] = res.data || [];
        this.notifications$.next(list);
        this.unreadCount$.next(list.filter((n) => !n.isRead).length);
      },
    });
  }

  markAllRead() {
    this.http.patch(`${this.apiUrl}/read-all`, {}).subscribe({
      next: () => {
        const updated = this.notifications$.value.map((n) => ({ ...n, isRead: true }));
        this.notifications$.next(updated);
        this.unreadCount$.next(0);
      },
    });
  }

  markRead(id: string) {
    this.http.patch(`${this.apiUrl}/${id}/read`, {}).subscribe({
      next: () => {
        const updated = this.notifications$.value.map((n) =>
          n._id === id ? { ...n, isRead: true } : n,
        );
        this.notifications$.next(updated);
        this.unreadCount$.next(updated.filter((n) => !n.isRead).length);
      },
    });
  }

  ngOnDestroy() {
    this.disconnect();
  }
}
