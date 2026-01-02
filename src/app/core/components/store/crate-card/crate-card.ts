import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Gift, ShoppingCart, Sparkles, Star } from 'lucide-angular';
import { CrateProduct, RARITY_COLORS, RARITY_LABELS } from '../../../models/store.models';

@Component({
    selector: 'app-crate-card',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './crate-card.html',
    styleUrls: ['./crate-card.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrateCardComponent {
    readonly icons = { Gift, ShoppingCart, Sparkles, Star };
    readonly rarityColors = RARITY_COLORS;
    readonly rarityLabels = RARITY_LABELS;

    @Input({ required: true }) crate!: CrateProduct;
    @Output() addToCart = new EventEmitter<{ product: CrateProduct; quantity: number }>();
    @Output() viewDetails = new EventEmitter<CrateProduct>();

    readonly selectedQuantity = signal<1 | 5 | 10>(1);
    readonly isAnimating = signal(false);

    get currentPrice(): number {
        const qty = this.selectedQuantity();
        const bulk = this.crate.bulkPricing?.find(b => b.quantity === qty);
        if (bulk) return bulk.price;
        return (this.crate.discountPrice ?? this.crate.price) * qty;
    }

    get savings(): number | null {
        const qty = this.selectedQuantity();
        const bulk = this.crate.bulkPricing?.find(b => b.quantity === qty);
        return bulk?.savings ?? null;
    }

    get isLegendary(): boolean {
        return this.crate.rarity === 'legendary';
    }

    selectQuantity(qty: 1 | 5 | 10): void {
        this.selectedQuantity.set(qty);
        this.triggerAnimation();
    }

    triggerAnimation(): void {
        this.isAnimating.set(true);
        setTimeout(() => this.isAnimating.set(false), 500);
    }

    onAddToCart(): void {
        this.triggerAnimation();
        this.addToCart.emit({
            product: this.crate,
            quantity: this.selectedQuantity()
        });
    }

    onViewDetails(): void {
        this.viewDetails.emit(this.crate);
    }

    getRarityColor(rarity: string): string {
        return this.rarityColors[rarity as keyof typeof this.rarityColors]?.border || '#9ca3af';
    }

    get cashbackGrovs(): number {
        const price = this.currentPrice;
        const cashbackPercent = this.crate.cashback_percentage || 0;
        return Math.floor(price * (cashbackPercent / 100));
    }
}
