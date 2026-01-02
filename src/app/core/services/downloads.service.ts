import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DownloadableFile {
  id: number;
  title: string;
  description: string;
  category: string;
  min_role: string;
  download_count: number;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class DownloadsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/downloads/`;

  /**
   * Obtiene la lista de archivos disponibles
   */
  getFiles(): Observable<{ files: DownloadableFile[] }> {
    return this.http.get<{ files: DownloadableFile[] }>(this.apiUrl);
  }

  /**
   * Inicia la descarga de un archivo
   * @param fileId ID del archivo
   */
  downloadFile(fileId: number): void {
    // Abrimos en una nueva pestaña para que el navegador gestione la descarga
    // El backend responderá con Content-Disposition: attachment
    window.open(`${this.apiUrl}${fileId}/`, '_blank');
  }
}
