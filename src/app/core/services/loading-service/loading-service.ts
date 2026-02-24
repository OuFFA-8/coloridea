import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private _visible = signal(false);
  private _message = signal('Loading...');

  visible = this._visible.asReadonly();
  message = this._message.asReadonly();

  show(message = 'Loading...') {
    this._message.set(message);
    this._visible.set(true);
  }

  hide() {
    this._visible.set(false);
  }
}
