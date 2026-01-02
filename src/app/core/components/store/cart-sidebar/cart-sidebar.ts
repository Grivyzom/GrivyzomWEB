import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, X, ShoppingCart, Trash2, Plus, Minus, CreditCard, Gem } from 'lucide-angular';
import { StoreService } from '../../../services/store.service';
import { GrovsService } from '../../../services/grovs.service';
import { CartItem } from '../../../models/store.models';

@Component({
    selector: 'app-cart-sidebar',
    standalone: true,
    imports: [CommonModule, LucideAngularModule, FormsModule],
    templateUrl: './cart-sidebar.html',
    styleUrls: ['./cart-sidebar.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartSidebarComponent {
    readonly icons = { X, ShoppingCart, Trash2, Plus, Minus, CreditCard, Gem };
    private readonly storeService = inject(StoreService);
    private readonly grovsService = inject(GrovsService);

    readonly isOpen = this.storeService.isCartOpen;
    readonly cartItems = this.storeService.cartItems;
    readonly cartTotal = this.storeService.cartTotal;
    readonly cart = this.storeService.cart;

    // Grovs-related signals
    readonly grovsBalance = this.grovsService.balance;
    readonly cartTotalGrovs = this.storeService.cartTotalGrovs;
    readonly canPayWithGrovs = this.storeService.canPayWithGrovs;
    readonly cartCashbackGrovs = this.storeService.cartCashbackGrovs;
    readonly selectedPaymentMethod = signal<'money' | 'grovs'>('money');

    close(): void {
        this.storeService.closeCart();
    }

    updateQuantity(productId: string, quantity: number): void {
        this.storeService.updateQuantity(productId, quantity);
    }

    removeItem(productId: string): void {
        this.storeService.removeFromCart(productId);
    }

    clearCart(): void {
        this.storeService.clearCart();
    }

    checkoutWithMoney(): void {
        this.storeService.checkout().subscribe(result => {
            if (result.success && result.checkoutUrl) {
                window.location.href = result.checkoutUrl;
            }
        });
    }

    checkoutWithGrovs(): void {
        const totalGrovs = this.cartTotalGrovs();
        const balance = this.grovsBalance();

        if (balance < totalGrovs) {
            alert(`No tienes suficientes Grovs. Necesitas ${totalGrovs} Grovs pero solo tienes ${balance}.`);
            return;
        }

        this.storeService.checkoutWithGrovs().subscribe(result => {
            if (result.success) {
                alert(result.message || '¡Compra exitosa!');
                this.close();
            } else {
                alert(result.error || 'Error al procesar la compra.');
            }
        });
    }

    checkout(): void {
        if (this.selectedPaymentMethod() === 'money') {
            this.checkoutWithMoney();
        } else {
            this.checkoutWithGrovs();
        }
    }

    getItemPrice(item: CartItem): number {
        return (item.product.discountPrice ?? item.product.price) * item.quantity;
    }

    trackByProductId(index: number, item: CartItem): string {
        return item.product.id;
    }
}
