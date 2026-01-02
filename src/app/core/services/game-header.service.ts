import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface GameHeaderData {
  title: string;
  subtitle: string;
  button_text: string;
  image_url: string;
  video_url?: string; // Optional video background URL
}

@Injectable({
  providedIn: 'root'
})
export class GameHeaderService {
  private apiUrl = `${environment.apiUrl}/game-header/`;

  private defaultData: GameHeaderData = {
    title: 'GRIVYZOM',
    subtitle: 'A WORLD OF ADVENTURE AND CREATIVITY',
    button_text: 'JUGAR AHORA!',
    image_url: 'assets/img/default-header.jpg'
  };

  constructor(private http: HttpClient) { }

  getGameHeaderData(): Observable<GameHeaderData> {
    console.log('GameHeaderService: Fetching from', this.apiUrl);
    return this.http.get<GameHeaderData>(this.apiUrl, {
      withCredentials: true
    }).pipe(
      timeout(10000), // 10 segundos de timeout
      catchError((error) => {
        console.error('GameHeaderService: API failed:', error);
        return of(this.defaultData);
      })
    );
  }
}
