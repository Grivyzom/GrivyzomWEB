import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface GalleryCategory {
    id: number;
    name: string;
    slug: string;
    description: string;
    icon: string;
    image_count: number;
}

export interface GalleryImage {
    id: number;
    title: string;
    description: string;
    image_url: string;
    thumbnail_url: string;
    author: string;
    is_featured: boolean;
    category: {
        id: number;
        name: string;
        slug: string;
    };
    created_at: string;
}

@Injectable({
    providedIn: 'root'
})
export class GalleryService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/gallery`;

    /**
     * Obtiene todas las categorías activas de la galería
     */
    getCategories(): Observable<GalleryCategory[]> {
        return this.http.get<{ categories: GalleryCategory[] }>(`${this.apiUrl}/categories/`)
            .pipe(map(response => response.categories));
    }

    /**
     * Obtiene las imágenes de la galería con filtros opcionales
     * @param categorySlug - Filtrar por categoría
     * @param featured - Solo imágenes destacadas
     * @param limit - Limitar cantidad de resultados
     */
    getImages(categorySlug?: string, featured?: boolean, limit?: number): Observable<GalleryImage[]> {
        let params: string[] = [];

        if (categorySlug) params.push(`category=${categorySlug}`);
        if (featured) params.push('featured=true');
        if (limit) params.push(`limit=${limit}`);

        const queryString = params.length > 0 ? `?${params.join('&')}` : '';

        return this.http.get<{ images: GalleryImage[] }>(`${this.apiUrl}/images/${queryString}`)
            .pipe(map(response => response.images));
    }

    /**
     * Obtiene el detalle de una imagen específica
     * @param imageId - ID de la imagen
     */
    getImage(imageId: number): Observable<GalleryImage> {
        return this.http.get<GalleryImage>(`${this.apiUrl}/images/${imageId}/`);
    }
}
