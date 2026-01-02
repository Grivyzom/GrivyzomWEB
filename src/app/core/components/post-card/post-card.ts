import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Heart, MessageCircle, Bookmark, Eye, Pin, Star, UserPlus } from 'lucide-angular';
import { CommunityPost } from '../../services/community.service';

@Component({
    selector: 'app-post-card',
    standalone: true,
    imports: [CommonModule, RouterModule, LucideAngularModule],
    templateUrl: './post-card.html',
    styleUrl: './post-card.css'
})
export class PostCardComponent {
    readonly icons = { Heart, MessageCircle, Bookmark, Eye, Pin, Star, UserPlus };

    @Input() post!: CommunityPost;
    @Input() showFollowButton = true;

    @Output() likeClicked = new EventEmitter<number>();
    @Output() bookmarkClicked = new EventEmitter<number>();
    @Output() followClicked = new EventEmitter<number>();
    @Output() authorHover = new EventEmitter<{ userId: number; event: MouseEvent }>();
    @Output() authorLeave = new EventEmitter<void>();

    get timeAgo(): string {
        const now = new Date();
        const created = new Date(this.post.created_at);
        const diffMs = now.getTime() - created.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `hace ${diffMins}m`;
        if (diffHours < 24) return `hace ${diffHours}h`;
        if (diffDays < 7) return `hace ${diffDays}d`;
        return created.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    }

    onLike(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        this.likeClicked.emit(this.post.id);
    }

    onBookmark(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        this.bookmarkClicked.emit(this.post.id);
    }

    onFollow(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        this.followClicked.emit(this.post.author.id);
    }

    onAuthorMouseEnter(event: MouseEvent): void {
        this.authorHover.emit({ userId: this.post.author.id, event });
    }

    onAuthorMouseLeave(): void {
        this.authorLeave.emit();
    }
}
