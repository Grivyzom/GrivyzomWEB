import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

interface HeroSectionData {
  title: string;
  description: string;
  image_url: string;
}

@Injectable({
  providedIn: 'root'
})
export class HeroService {
  private apiUrl = `${environment.apiUrl}/hero-section/`;

  constructor(private http: HttpClient) { }

  getHeroSectionData(): Observable<HeroSectionData> {
    return this.http.get<HeroSectionData>(this.apiUrl);
  }
}
