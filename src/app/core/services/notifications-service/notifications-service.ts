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

    console.log('[Socket] Connecting to:', environment.socketUrl);

    this.socket = io(environment.socketUrl, {
      transports: ['polling', 'websocket'],
      upgrade: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    });

    this.socket.on('connect', () => {
      console.log('[Socket] Connected! ID:', this.socket!.id);
      this.socket!.emit('authenticate', token);
    });

    this.socket.on('authenticate', (res: any) => {
      console.log('[Socket] Authenticate response:', res);
    });

    this.socket.on('create-output-item', (data: unknown) => {
      console.log('[Socket] New notification received:', data);
      this.playNotificationSound();
      this.loadNotifications();
    });
    this.socket.on('send-notification', (data: unknown) => {
      console.log('[Socket] New notification received:', data);
      this.playNotificationSound();
      this.loadNotifications();
    });

    this.socket.on('disconnect', (reason) => {
      console.warn('[Socket] Disconnected:', reason);
    });

    this.socket.on('reconnect', () => {
      console.log('[Socket] Reconnected, re-authenticating...');
      this.socket!.emit('authenticate', token);
    });

    this.socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message, err);
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
    if (!id) return;
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

  private playNotificationSound() {
    try {
      const ctx = new AudioContext();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.connect(gain);
      gain.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
      oscillator.onended = () => ctx.close();
    } catch {
      // Web Audio API not supported
    }
  }

  ngOnDestroy() {
    this.disconnect();
  }
}
