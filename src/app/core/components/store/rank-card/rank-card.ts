import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Check, ShoppingCart, Sparkles, Crown } from 'lucide-angular';
import { RankProduct, RARITY_COLORS } from '../../../models/store.models';

@Component({
    selector: 'app-rank-card',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './rank-card.html',
    styleUrls: ['./rank-card.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RankCardComponent {
    readonly icons = { Check, ShoppingCart, Sparkles, Crown };
    readonly rarityColors = RARITY_COLORS;

    @Input({ required: true }) rank!: RankProduct;
    @Output() addToCart = new EventEmitter<RankProduct>();

    get discountPercent(): number {
        if (!this.rank.discountPrice) return 0;
        return Math.round((1 - this.rank.discountPrice / this.rank.price) * 100);
    }

    get headerGradient(): string {
        if (this.rank.gradientColors) {
            return `linear-gradient(135deg, ${this.rank.gradientColors[0]} 0%, ${this.rank.gradientColors[1]} 100%)`;
        }
        return this.rank.color;
    }

    get isLegendary(): boolean {
        return this.rank.rarity === 'legendary';
    }

    /**
     * Calcula el cashback en Grovs
     */
    get cashbackGrovs(): number {
        const price = this.rank.discountPrice || this.rank.price;
        const cashbackPercent = this.rank.cashback_percentage || 0;
        return Math.floor(price * (cashbackPercent / 100));
    }

    onAddToCart(): void {
        this.addToCart.emit(this.rank);
    }
}
