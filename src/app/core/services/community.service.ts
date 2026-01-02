import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// Interfaces
export interface PostAuthor {
    id: number;
    username: string;
    minecraft_username: string;
    avatar_url: string | null;
    role: string;
    role_display: string;
    bio?: string;
    followers_count?: number;
}

export interface PostCategory {
    slug: string;
    name: string;
    description?: string;
    icon: string;
    color: string;
    posts_count?: number;
}

export interface CommunityPost {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    content?: string;
    cover_image: string | null;
    tags: string[];
    views: number;
    likes_count: number;
    comments_count: number;
    is_pinned: boolean;
    is_featured: boolean;
    created_at: string;
    updated_at?: string;
    author: PostAuthor;
    category: PostCategory | null;
    is_liked?: boolean;
    is_bookmarked?: boolean;
    is_following_author?: boolean;
}

export interface PostComment {
    id: number;
    content: string;
    created_at: string;
    author: PostAuthor;
    replies?: PostComment[];
}

export interface TopContributor {
    id: number;
    username: string;
    minecraft_username: string;
    avatar_url: string | null;
    role_display: string;
    posts_count: number;
    followers_count: number;
}

export interface TrendingTag {
    tag: string;
    count: number;
}

export type PostFilter = 'trending' | 'recent' | 'following';

@Injectable({
    providedIn: 'root'
})
export class CommunityService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = environment.apiUrl;

    /**
     * Obtiene lista de posts con filtros y paginación
     */
    getPosts(filter: PostFilter = 'recent', category?: string, page: number = 1): Observable<{
        posts: CommunityPost[];
        total: number;
        page: number;
        total_pages: number;
    }> {
        let params = new HttpParams()
            .set('filter', filter)
            .set('page', page.toString());

        if (category) {
            params = params.set('category', category);
        }

        return this.http.get<any>(`${this.apiUrl}/community/posts/`, {
            params,
            withCredentials: true
        }).pipe(
            catchError(error => {
                console.error('Error fetching posts:', error);
                return of({ posts: [], total: 0, page: 1, total_pages: 0 });
            })
        );
    }

    /**
     * Obtiene detalle de un post por slug
     */
    getPostBySlug(slug: string): Observable<CommunityPost | null> {
        return this.http.get<CommunityPost>(`${this.apiUrl}/community/posts/${slug}/`, {
            withCredentials: true
        }).pipe(
            catchError(error => {
                console.error('Error fetching post:', error);
                return of(null);
            })
        );
    }

    /**
     * Crea un nuevo post
     */
    createPost(data: {
        title: string;
        content: string;
        excerpt?: string;
        category?: string;
        tags?: string[];
    }): Observable<{ success: boolean; post?: { id: number; slug: string }; error?: string }> {
        return this.http.post<any>(`${this.apiUrl}/community/posts/create/`, data, {
            withCredentials: true
        }).pipe(
            map(response => ({ success: true, post: response.post })),
            catchError(error => of({ success: false, error: error.error?.error || 'Error al crear post' }))
        );
    }

    /**
     * Like/Unlike un post
     */
    toggleLike(postId: number): Observable<{ success: boolean; liked: boolean; likes_count: number }> {
        return this.http.post<any>(`${this.apiUrl}/community/posts/${postId}/like/`, {}, {
            withCredentials: true
        }).pipe(
            catchError(error => of({ success: false, liked: false, likes_count: 0 }))
        );
    }

    /**
     * Bookmark/Unbookmark un post
     */
    toggleBookmark(postId: number): Observable<{ success: boolean; bookmarked: boolean }> {
        return this.http.post<any>(`${this.apiUrl}/community/posts/${postId}/bookmark/`, {}, {
            withCredentials: true
        }).pipe(
            catchError(error => of({ success: false, bookmarked: false }))
        );
    }

    /**
     * Obtiene comentarios de un post
     */
    getComments(postId: number): Observable<PostComment[]> {
        return this.http.get<{ comments: PostComment[] }>(`${this.apiUrl}/community/posts/${postId}/comments/`, {
            withCredentials: true
        }).pipe(
            map(response => response.comments),
            catchError(error => of([]))
        );
    }

    /**
     * Agrega un comentario
     */
    addComment(postId: number, content: string, parentId?: number): Observable<{ success: boolean; comment?: PostComment }> {
        return this.http.post<any>(`${this.apiUrl}/community/posts/${postId}/comments/`, {
            content,
            parent_id: parentId
        }, { withCredentials: true }).pipe(
            map(response => ({ success: true, comment: response.comment })),
            catchError(error => of({ success: false }))
        );
    }

    /**
     * Obtiene categorías activas
     */
    getCategories(): Observable<PostCategory[]> {
        return this.http.get<{ categories: PostCategory[] }>(`${this.apiUrl}/community/categories/`).pipe(
            map(response => response.categories),
            catchError(error => of([]))
        );
    }

    /**
     * Obtiene top contributors
     */
    getTopContributors(): Observable<TopContributor[]> {
        return this.http.get<{ contributors: TopContributor[] }>(`${this.apiUrl}/community/top-contributors/`).pipe(
            map(response => response.contributors),
            catchError(error => of([]))
        );
    }

    /**
     * Obtiene trending tags
     */
    getTrendingTags(): Observable<TrendingTag[]> {
        return this.http.get<{ tags: TrendingTag[] }>(`${this.apiUrl}/community/trending-tags/`).pipe(
            map(response => response.tags),
            catchError(error => of([]))
        );
    }

    /**
     * Obtiene perfil público de usuario
     */
    getUserProfile(userId: number): Observable<PostAuthor | null> {
        return this.http.get<PostAuthor>(`${this.apiUrl}/community/users/${userId}/`, {
            withCredentials: true
        }).pipe(
            catchError(error => of(null))
        );
    }

    /**
     * Seguir/Dejar de seguir usuario
     */
    toggleFollow(userId: number): Observable<{ success: boolean; following: boolean; followers_count: number }> {
        return this.http.post<any>(`${this.apiUrl}/community/users/${userId}/follow/`, {}, {
            withCredentials: true
        }).pipe(
            catchError(error => of({ success: false, following: false, followers_count: 0 }))
        );
    }
}
