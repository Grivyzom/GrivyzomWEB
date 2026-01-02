import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User } from './auth.service';

// ============================================================================
// INTERFACES
// ============================================================================

export interface DashboardStats {
    total_users: number;
    total_posts: number;
    total_gallery_images: number;
    pending_registrations: number;
    users_today: number;
    posts_today: number;
    active_users_week: number;
}

export interface AdminUser {
    id: number;
    username: string;
    email: string;
    minecraft_username: string | null;
    discord_username: string | null;
    role: string;
    role_display: string;
    is_staff: boolean;
    is_active: boolean;
    is_banned: boolean;
    ban_reason: string | null;
    date_joined: string;
    last_login: string;
    avatar_url: string | null;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
}

export interface UsersStats {
    total_users: number;
    online_users: number;
    staff_online: number;
    staff_total: number;
    banned_users: number;
    users_today: number;
    users_week: number;
}

export interface AdminUserDetail extends AdminUser {
    minecraft_uuid: string | null;
    bio: string | null;
    stats: {
        posts_count: number;
        comments_count: number;
        followers_count: number;
        following_count: number;
    };
}

export interface AdminPost {
    id: number;
    title: string;
    slug: string;
    author: {
        id: number;
        username: string;
        avatar_url: string | null;
    };
    category: {
        slug: string;
        name: string;
    } | null;
    status: string;
    views: number;
    likes_count: number;
    comments_count: number;
    is_pinned: boolean;
    is_featured: boolean;
    created_at: string;
}

export interface AdminGalleryImage {
    id: number;
    title: string;
    category: {
        id: number;
        name: string;
        slug: string;
    };
    image_url: string;
    thumbnail_url: string;
    author: string;
    is_featured: boolean;
    created_at: string;
}

export interface AdminGameHeader {
    id: number | null;
    title: string;
    subtitle: string;
    button_text: string;
    image_url: string;
    created_at: string | null;
}

export interface AdminHeroSection {
    id: number | null;
    title: string;
    description: string;
    image_url: string;
    created_at: string | null;
}

export interface AdminWebComponent {
    id: string;
    name: string;
    description: string;
    icon: string;
    has_data: boolean;
    image_url: string;
    title: string;
    updated_at: string | null;
}

// ============================================================================
// PRODUCTS INTERFACES
// ============================================================================

export interface AdminProduct {
    id: number;
    name: string;
    slug: string;
    short_description: string;
    product_type: string;
    product_type_display: string;
    category: {
        id: number;
        name: string;
        slug: string;
    } | null;
    image_url: string;
    price: string;
    discount_price: string | null;
    discount_percent: number;
    final_price: string;
    rarity: string;
    rarity_display: string;
    is_available: boolean;
    is_featured: boolean;
    is_new: boolean;
    stock: number | null;
    views: number;
    purchases: number;
    created_at: string;
    updated_at: string;
    created_by: {
        id: number;
        username: string;
    } | null;
}

export interface AdminProductDetail extends AdminProduct {
    description: string;
    order: number;
    type_specific_data: any;
    last_modified_by: {
        id: number;
        username: string;
    } | null;
}

export interface ProductCategory {
    id: number;
    name: string;
    slug: string;
    description: string;
    product_type: string;
    icon: string;
    color: string;
}

export interface ProductsStats {
    total_products: number;
    available_products: number;
    featured_products: number;
    products_by_type: {
        [key: string]: {
            count: number;
            label: string;
        };
    };
    revenue_potential: string;
    discounted_products: number;
    low_stock: number;
    out_of_stock: number;
}

// ============================================================================
// SERVICE
// ============================================================================

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/admin`;

    // ========================================================================
    // DASHBOARD
    // ========================================================================

    /**
     * Obtiene las estadísticas del dashboard
     */
    getDashboardStats(): Observable<DashboardStats | null> {
        return this.http.get<DashboardStats>(`${this.apiUrl}/stats/`, {
            withCredentials: true
        }).pipe(
            catchError(error => {
                console.error('Error fetching dashboard stats:', error);
                return of(null);
            })
        );
    }

    // ========================================================================
    // USERS
    // ========================================================================

    /**
     * Obtiene estadísticas detalladas de usuarios
     */
    getUsersStats(): Observable<UsersStats | null> {
        return this.http.get<UsersStats>(`${this.apiUrl}/users/stats/`, {
            withCredentials: true
        }).pipe(
            catchError(error => {
                console.error('Error fetching users stats:', error);
                return of(null);
            })
        );
    }

    /**
     * Lista usuarios con paginación y filtros
     */
    getUsers(
        page: number = 1,
        search: string = '',
        role: string = '',
        status: string = ''
    ): Observable<PaginatedResponse<AdminUser> | null> {
        let params = new HttpParams().set('page', page.toString());

        if (search) params = params.set('search', search);
        if (role) params = params.set('role', role);
        if (status) params = params.set('status', status);

        return this.http.get<PaginatedResponse<AdminUser>>(`${this.apiUrl}/users/`, {
            params,
            withCredentials: true
        }).pipe(
            catchError(error => {
                console.error('Error fetching users:', error);
                return of(null);
            })
        );
    }

    /**
     * Obtiene detalle completo de un usuario
     */
    getUserDetail(userId: number): Observable<AdminUserDetail | null> {
        return this.http.get<AdminUserDetail>(`${this.apiUrl}/users/${userId}/`, {
            withCredentials: true
        }).pipe(
            catchError(error => {
                console.error('Error fetching user detail:', error);
                return of(null);
            })
        );
    }

    /**
     * Cambia el rol de un usuario
     */
    changeUserRole(userId: number, newRole: string): Observable<{ success: boolean; message?: string; error?: string }> {
        return this.http.put<{ message: string }>(`${this.apiUrl}/users/${userId}/role/`, {
            role: newRole
        }, { withCredentials: true }).pipe(
            map(response => ({ success: true, message: response.message })),
            catchError(error => of({
                success: false,
                error: error.error?.error || 'Error al cambiar rol'
            }))
        );
    }

    /**
     * Banea o desbanea un usuario
     */
    toggleUserBan(userId: number, ban: boolean, reason?: string): Observable<{ success: boolean; message?: string; error?: string }> {
        return this.http.post<{ message: string }>(`${this.apiUrl}/users/${userId}/ban/`, {
            ban,
            reason
        }, { withCredentials: true }).pipe(
            map(response => ({ success: true, message: response.message })),
            catchError(error => of({
                success: false,
                error: error.error?.error || 'Error al cambiar estado de baneo'
            }))
        );
    }

    // ========================================================================
    // POSTS
    // ========================================================================

    /**
     * Lista posts con paginación y filtros
     */
    getPosts(
        page: number = 1,
        search: string = '',
        status: string = '',
        category: string = ''
    ): Observable<PaginatedResponse<AdminPost> | null> {
        let params = new HttpParams().set('page', page.toString());

        if (search) params = params.set('search', search);
        if (status) params = params.set('status', status);
        if (category) params = params.set('category', category);

        return this.http.get<PaginatedResponse<AdminPost>>(`${this.apiUrl}/posts/`, {
            params,
            withCredentials: true
        }).pipe(
            catchError(error => {
                console.error('Error fetching posts:', error);
                return of(null);
            })
        );
    }

    /**
     * Actualiza el estado de un post
     */
    updatePostStatus(postId: number, status: string): Observable<{ success: boolean; error?: string }> {
        return this.http.put<{ message: string }>(`${this.apiUrl}/posts/${postId}/`, {
            status
        }, { withCredentials: true }).pipe(
            map(() => ({ success: true })),
            catchError(error => of({
                success: false,
                error: error.error?.error || 'Error al actualizar post'
            }))
        );
    }

    /**
     * Fija o desfija un post
     */
    togglePostPin(postId: number, pinned: boolean): Observable<{ success: boolean; error?: string }> {
        return this.http.put<{ message: string }>(`${this.apiUrl}/posts/${postId}/`, {
            is_pinned: pinned
        }, { withCredentials: true }).pipe(
            map(() => ({ success: true })),
            catchError(error => of({
                success: false,
                error: error.error?.error || 'Error al fijar post'
            }))
        );
    }

    /**
     * Elimina un post
     */
    deletePost(postId: number): Observable<{ success: boolean; error?: string }> {
        return this.http.delete<{ message: string }>(`${this.apiUrl}/posts/${postId}/`, {
            withCredentials: true
        }).pipe(
            map(() => ({ success: true })),
            catchError(error => of({
                success: false,
                error: error.error?.error || 'Error al eliminar post'
            }))
        );
    }

    // ========================================================================
    // GALLERY
    // ========================================================================

    /**
     * Lista imágenes de galería con paginación
     */
    getGalleryImages(
        page: number = 1,
        category: string = ''
    ): Observable<PaginatedResponse<AdminGalleryImage> | null> {
        let params = new HttpParams().set('page', page.toString());
        if (category) params = params.set('category', category);

        return this.http.get<PaginatedResponse<AdminGalleryImage>>(`${this.apiUrl}/gallery/`, {
            params,
            withCredentials: true
        }).pipe(
            catchError(error => {
                console.error('Error fetching gallery:', error);
                return of(null);
            })
        );
    }

    /**
     * Sube una nueva imagen a la galería
     */
    uploadGalleryImage(formData: FormData): Observable<{ success: boolean; image?: AdminGalleryImage; error?: string }> {
        return this.http.post<{ image: AdminGalleryImage }>(`${this.apiUrl}/gallery/`, formData, {
            withCredentials: true
        }).pipe(
            map(response => ({ success: true, image: response.image })),
            catchError(error => of({
                success: false,
                error: error.error?.error || 'Error al subir imagen'
            }))
        );
    }

    /**
     * Elimina una imagen de la galería
     */
    deleteGalleryImage(imageId: number): Observable<{ success: boolean; error?: string }> {
        return this.http.delete<{ message: string }>(`${this.apiUrl}/gallery/${imageId}/`, {
            withCredentials: true
        }).pipe(
            map(() => ({ success: true })),
            catchError(error => of({
                success: false,
                error: error.error?.error || 'Error al eliminar imagen'
            }))
        );
    }

    // ========================================================================
    // GAME HEADER (Contenido)
    // ========================================================================

    /**
     * Obtiene el Game Header actual
     */
    getGameHeader(): Observable<AdminGameHeader | null> {
        return this.http.get<AdminGameHeader>(`${this.apiUrl}/game-header/`, {
            withCredentials: true
        }).pipe(
            catchError(error => {
                console.error('Error fetching game header:', error);
                return of(null);
            })
        );
    }

    /**
     * Actualiza el Game Header (soporta subida de imagen)
     */
    updateGameHeader(formData: FormData): Observable<{ success: boolean; data?: AdminGameHeader; error?: string }> {
        return this.http.post<{ success: boolean; data: AdminGameHeader; message: string }>(`${this.apiUrl}/game-header/`, formData, {
            withCredentials: true
        }).pipe(
            map(response => {
                console.log('Game Header update response:', response);
                if (response && response.data) {
                    return { success: true, data: response.data };
                }
                // Si la respuesta no tiene la estructura esperada
                return { success: false, error: 'Respuesta inesperada del servidor' };
            }),
            catchError(error => {
                console.error('Game Header update error:', error);
                const errorMessage = error?.error?.error || error?.message || 'Error al actualizar Game Header';
                return of({
                    success: false,
                    error: errorMessage
                });
            })
        );
    }

    // ========================================================================
    // HERO SECTION
    // ========================================================================

    /**
     * Obtiene el Hero Section actual
     */
    getHeroSection(): Observable<AdminHeroSection | null> {
        return this.http.get<AdminHeroSection>(`${this.apiUrl}/hero-section/`, {
            withCredentials: true
        }).pipe(
            catchError(error => {
                console.error('Error fetching hero section:', error);
                return of(null);
            })
        );
    }

    /**
     * Actualiza el Hero Section (soporta subida de imagen)
     */
    updateHeroSection(formData: FormData): Observable<{ success: boolean; data?: AdminHeroSection; error?: string }> {
        return this.http.post<{ success: boolean; data: AdminHeroSection; message: string }>(`${this.apiUrl}/hero-section/`, formData, {
            withCredentials: true
        }).pipe(
            map(response => {
                console.log('Hero Section update response:', response);
                if (response && response.data) {
                    return { success: true, data: response.data };
                }
                // Si la respuesta no tiene la estructura esperada
                return { success: false, error: 'Respuesta inesperada del servidor' };
            }),
            catchError(error => {
                console.error('Hero Section update error:', error);
                const errorMessage = error?.error?.error || error?.message || 'Error al actualizar Hero Section';
                return of({
                    success: false,
                    error: errorMessage
                });
            })
        );
    }

    // ========================================================================
    // WEB COMPONENTS (Vista general)
    // ========================================================================

    /**
     * Obtiene lista de todos los componentes web editables
     */
    getWebComponents(): Observable<AdminWebComponent[]> {
        return this.http.get<{ components: AdminWebComponent[] }>(`${this.apiUrl}/web-components/`, {
            withCredentials: true
        }).pipe(
            map(response => response.components),
            catchError(error => {
                console.error('Error fetching web components:', error);
                return of([]);
            })
        );
    }

    // ========================================================================
    // PRODUCTS
    // ========================================================================

    /**
     * Obtiene estadísticas de productos
     */
    getProductsStats(): Observable<ProductsStats | null> {
        return this.http.get<ProductsStats>(`${this.apiUrl}/products/stats/`, {
            withCredentials: true
        }).pipe(
            catchError(error => {
                console.error('Error fetching products stats:', error);
                return of(null);
            })
        );
    }

    /**
     * Lista productos con paginación y filtros
     */
    getProducts(
        page: number = 1,
        search: string = '',
        type: string = '',
        category: string = '',
        availability: string = '',
        featured: string = ''
    ): Observable<PaginatedResponse<AdminProduct> | null> {
        let params = new HttpParams().set('page', page.toString());

        if (search) params = params.set('search', search);
        if (type) params = params.set('type', type);
        if (category) params = params.set('category', category);
        if (availability) params = params.set('availability', availability);
        if (featured) params = params.set('featured', featured);

        return this.http.get<PaginatedResponse<AdminProduct>>(`${this.apiUrl}/products/`, {
            params,
            withCredentials: true
        }).pipe(
            catchError(error => {
                console.error('Error fetching products:', error);
                return of(null);
            })
        );
    }

    /**
     * Obtiene detalle completo de un producto
     */
    getProductDetail(productId: number): Observable<AdminProductDetail | null> {
        return this.http.get<{ product: AdminProductDetail }>(`${this.apiUrl}/products/${productId}/`, {
            withCredentials: true
        }).pipe(
            map(response => response.product),
            catchError(error => {
                console.error('Error fetching product detail:', error);
                return of(null);
            })
        );
    }

    /**
     * Crea un nuevo producto
     */
    createProduct(formData: FormData): Observable<{ success: boolean; product?: any; error?: string }> {
        return this.http.post<{ success: boolean; product: any; message: string }>(
            `${this.apiUrl}/products/create/`,
            formData,
            { withCredentials: true }
        ).pipe(
            map(response => ({ success: true, product: response.product })),
            catchError(error => of({
                success: false,
                error: error.error?.error || 'Error al crear producto'
            }))
        );
    }

    /**
     * Actualiza un producto existente
     */
    updateProduct(productId: number, formData: FormData): Observable<{ success: boolean; product?: any; error?: string }> {
        return this.http.put<{ success: boolean; product: any; message: string }>(
            `${this.apiUrl}/products/${productId}/update/`,
            formData,
            { withCredentials: true }
        ).pipe(
            map(response => ({ success: true, product: response.product })),
            catchError(error => of({
                success: false,
                error: error.error?.error || 'Error al actualizar producto'
            }))
        );
    }

    /**
     * Elimina un producto
     */
    deleteProduct(productId: number): Observable<{ success: boolean; message?: string; error?: string }> {
        return this.http.delete<{ success: boolean; message: string }>(
            `${this.apiUrl}/products/${productId}/delete/`,
            { withCredentials: true }
        ).pipe(
            map(response => ({ success: true, message: response.message })),
            catchError(error => of({
                success: false,
                error: error.error?.error || 'Error al eliminar producto'
            }))
        );
    }

    /**
     * Alterna disponibilidad de un producto
     */
    toggleProductAvailability(productId: number): Observable<{ success: boolean; is_available?: boolean; error?: string }> {
        return this.http.post<{ success: boolean; is_available: boolean; message: string }>(
            `${this.apiUrl}/products/${productId}/toggle-availability/`,
            {},
            { withCredentials: true }
        ).pipe(
            map(response => ({ success: true, is_available: response.is_available })),
            catchError(error => of({
                success: false,
                error: error.error?.error || 'Error al cambiar disponibilidad'
            }))
        );
    }

    /**
     * Alterna estado destacado de un producto
     */
    toggleProductFeatured(productId: number): Observable<{ success: boolean; is_featured?: boolean; error?: string }> {
        return this.http.post<{ success: boolean; is_featured: boolean; message: string }>(
            `${this.apiUrl}/products/${productId}/toggle-featured/`,
            {},
            { withCredentials: true }
        ).pipe(
            map(response => ({ success: true, is_featured: response.is_featured })),
            catchError(error => of({
                success: false,
                error: error.error?.error || 'Error al cambiar estado destacado'
            }))
        );
    }

    /**
     * Obtiene categorías de productos
     */
    getProductCategories(): Observable<ProductCategory[]> {
        return this.http.get<{ categories: ProductCategory[] }>(
            `${this.apiUrl}/products/categories/`,
            { withCredentials: true }
        ).pipe(
            map(response => response.categories),
            catchError(error => {
                console.error('Error fetching product categories:', error);
                return of([]);
            })
        );
    }
}
