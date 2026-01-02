import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ShoppingCart, Eye, Sparkles } from 'lucide-angular';
import { CosmeticProduct, RARITY_COLORS, COSMETIC_TYPE_LABELS } from '../../../models/store.models';

@Component({
    selector: 'app-cosmetic-card',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './cosmetic-card.html',
    styleUrls: ['./cosmetic-card.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CosmeticCardComponent {
    readonly icons = { ShoppingCart, Eye, Sparkles };
    readonly rarityColors = RARITY_COLORS;
    readonly cosmeticLabels = COSMETIC_TYPE_LABELS;

    @Input({ required: true }) cosmetic!: CosmeticProduct;
    @Output() addToCart = new EventEmitter<CosmeticProduct>();
    @Output() preview = new EventEmitter<CosmeticProduct>();

    readonly isHovered = signal(false);

    get typeLabel(): string {
        return this.cosmeticLabels[this.cosmetic.cosmeticType] || 'Cosmético';
    }

    get rarityColor(): { bg: string; border: string; text: string } {
        return this.rarityColors[this.cosmetic.rarity];
    }

    get cashbackGrovs(): number {
        const price = this.cosmetic.discountPrice || this.cosmetic.price;
        const cashbackPercent = this.cosmetic.cashback_percentage || 0;
        return Math.floor(price * (cashbackPercent / 100));
    }

    onMouseEnter(): void {
        this.isHovered.set(true);
    }

    onMouseLeave(): void {
        this.isHovered.set(false);
    }

    onAddToCart(event: Event): void {
        event.stopPropagation();
        this.addToCart.emit(this.cosmetic);
    }

    onPreview(): void {
        this.preview.emit(this.cosmetic);
    }
}
