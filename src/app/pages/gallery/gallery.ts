import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GalleryService, GalleryCategory, GalleryImage } from '../../core/services/gallery.service';

@Component({
    selector: 'app-gallery',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './gallery.html',
    styleUrls: ['./gallery.css']
})
export class GalleryComponent implements OnInit {
    private galleryService = inject(GalleryService);

    // State signals
    categories = signal<GalleryCategory[]>([]);
    images = signal<GalleryImage[]>([]);
    selectedCategory = signal<string | null>(null);
    loading = signal(true);
    error = signal<string | null>(null);

    // Lightbox state
    lightboxOpen = signal(false);
    lightboxImage = signal<GalleryImage | null>(null);
    lightboxIndex = signal(0);

    // Computed values
    displayedImages = computed(() => this.images());
    hasImages = computed(() => this.images().length > 0);

    ngOnInit(): void {
        this.loadCategories();
        this.loadImages();
    }

    loadCategories(): void {
        this.galleryService.getCategories().subscribe({
            next: (cats) => {
                this.categories.set(cats);
            },
            error: (err) => {
                console.error('Error loading categories:', err);
                // Set default categories as fallback
                this.categories.set([
                    { id: 1, name: 'Screenshots', slug: 'screenshots', description: '', icon: 'ci-Camera', image_count: 0 },
                    { id: 2, name: 'Builds', slug: 'builds', description: '', icon: 'ci-Home', image_count: 0 },
                    { id: 3, name: 'Events', slug: 'events', description: '', icon: 'ci-Calendar', image_count: 0 },
                    { id: 4, name: 'Community', slug: 'community', description: '', icon: 'ci-Group', image_count: 0 }
                ]);
            }
        });
    }

    loadImages(categorySlug?: string): void {
        this.loading.set(true);
        this.error.set(null);

        this.galleryService.getImages(categorySlug).subscribe({
            next: (imgs) => {
                this.images.set(imgs);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading images:', err);
                this.error.set('Error al cargar las imágenes. Por favor, intenta de nuevo.');
                this.loading.set(false);
            }
        });
    }

    selectCategory(categorySlug: string | null): void {
        this.selectedCategory.set(categorySlug);
        this.loadImages(categorySlug ?? undefined);
    }

    // Lightbox methods
    openLightbox(image: GalleryImage): void {
        const index = this.images().findIndex(img => img.id === image.id);
        this.lightboxIndex.set(index);
        this.lightboxImage.set(image);
        this.lightboxOpen.set(true);
        document.body.style.overflow = 'hidden';
    }

    closeLightbox(): void {
        this.lightboxOpen.set(false);
        this.lightboxImage.set(null);
        document.body.style.overflow = '';
    }

    prevImage(event: Event): void {
        event.stopPropagation();
        const currentIndex = this.lightboxIndex();
        const newIndex = currentIndex > 0 ? currentIndex - 1 : this.images().length - 1;
        this.lightboxIndex.set(newIndex);
        this.lightboxImage.set(this.images()[newIndex]);
    }

    nextImage(event: Event): void {
        event.stopPropagation();
        const currentIndex = this.lightboxIndex();
        const newIndex = currentIndex < this.images().length - 1 ? currentIndex + 1 : 0;
        this.lightboxIndex.set(newIndex);
        this.lightboxImage.set(this.images()[newIndex]);
    }

    onKeydown(event: KeyboardEvent): void {
        if (!this.lightboxOpen()) return;

        switch (event.key) {
            case 'Escape':
                this.closeLightbox();
                break;
            case 'ArrowLeft':
                this.prevImage(event);
                break;
            case 'ArrowRight':
                this.nextImage(event);
                break;
        }
    }

    onImageError(event: Event): void {
        const img = event.target as HTMLImageElement;
        img.src = '/assets/img/placeholder.svg';
    }
}
