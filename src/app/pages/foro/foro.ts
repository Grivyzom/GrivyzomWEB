import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, TrendingUp, Clock, Users, User, PenSquare, Hash, Crown } from 'lucide-angular';
import { CommunityService, CommunityPost, PostCategory, TopContributor, TrendingTag, PostFilter } from '../../core/services/community.service';
import { AuthService } from '../../core/services/auth.service';
import { PostCardComponent } from '../../core/components/post-card/post-card';

@Component({
    selector: 'app-foro',
    standalone: true,
    imports: [CommonModule, RouterModule, LucideAngularModule, PostCardComponent],
    templateUrl: './foro.html',
    styleUrl: './foro.css'
})
export class ForoComponent implements OnInit {
    readonly icons = { TrendingUp, Clock, Users, User, PenSquare, Hash, Crown };

    private readonly communityService = inject(CommunityService);
    private readonly authService = inject(AuthService);

    // State
    posts = signal<CommunityPost[]>([]);
    categories = signal<PostCategory[]>([]);
    topContributors = signal<TopContributor[]>([]);
    trendingTags = signal<TrendingTag[]>([]);

    currentFilter = signal<PostFilter>('recent');
    currentCategory = signal<string | undefined>(undefined);
    currentPage = signal(1);
    totalPages = signal(0);
    isLoading = signal(false);

    isAuthenticated = this.authService.isAuthenticated;

    // Filter tabs
    readonly filters: { key: PostFilter; label: string; icon: any; requiresAuth: boolean }[] = [
        { key: 'trending', label: 'Tendencias', icon: TrendingUp, requiresAuth: false },
        { key: 'recent', label: 'Recientes', icon: Clock, requiresAuth: false },
        { key: 'following', label: 'Siguiendo', icon: Users, requiresAuth: true },
    ];

    ngOnInit(): void {
        this.loadPosts();
        this.loadSidebarData();
    }

    loadPosts(): void {
        this.isLoading.set(true);
        this.communityService.getPosts(
            this.currentFilter(),
            this.currentCategory(),
            this.currentPage()
        ).subscribe(response => {
            this.posts.set(response.posts);
            this.totalPages.set(response.total_pages);
            this.isLoading.set(false);
        });
    }

    loadSidebarData(): void {
        this.communityService.getCategories().subscribe(cats => this.categories.set(cats));
        this.communityService.getTopContributors().subscribe(users => this.topContributors.set(users));
        this.communityService.getTrendingTags().subscribe(tags => this.trendingTags.set(tags));
    }

    setFilter(filter: PostFilter): void {
        if (filter === 'following' && !this.isAuthenticated()) return;
        this.currentFilter.set(filter);
        this.currentPage.set(1);
        this.loadPosts();
    }

    setCategory(slug?: string): void {
        this.currentCategory.set(slug);
        this.currentPage.set(1);
        this.loadPosts();
    }

    onLike(postId: number): void {
        if (!this.isAuthenticated()) return;
        this.communityService.toggleLike(postId).subscribe(result => {
            if (result.success) {
                this.posts.update(posts => posts.map(p =>
                    p.id === postId
                        ? { ...p, is_liked: result.liked, likes_count: result.likes_count }
                        : p
                ));
            }
        });
    }

    onBookmark(postId: number): void {
        if (!this.isAuthenticated()) return;
        this.communityService.toggleBookmark(postId).subscribe(result => {
            if (result.success) {
                this.posts.update(posts => posts.map(p =>
                    p.id === postId
                        ? { ...p, is_bookmarked: result.bookmarked }
                        : p
                ));
            }
        });
    }

    onFollow(userId: number): void {
        if (!this.isAuthenticated()) return;
        this.communityService.toggleFollow(userId).subscribe();
    }

    loadMore(): void {
        if (this.currentPage() < this.totalPages()) {
            this.currentPage.update(p => p + 1);
            this.isLoading.set(true);
            this.communityService.getPosts(
                this.currentFilter(),
                this.currentCategory(),
                this.currentPage()
            ).subscribe(response => {
                this.posts.update(posts => [...posts, ...response.posts]);
                this.isLoading.set(false);
            });
        }
    }
}
