import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { shareReplay, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

export interface Preferences {
  timezone: string;
  notifications: {
    email: boolean;
    server: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {
  private http = inject(HttpClient);
  private timezonesCache$: Observable<string[]> | null = null;

  getTimezones(): Observable<string[]> {
    if (!this.timezonesCache$) {
      this.timezonesCache$ = this.http.get<string[]>('/assets/timezones.json').pipe(
        shareReplay(1)
      );
    }
    return this.timezonesCache$;
  }

  savePreferences(preferences: Preferences): Observable<any> {
    // Aquí se haría la llamada al backend para guardar las preferencias
    console.log('Saving preferences:', preferences);
    return of({ success: true });
  }
}
