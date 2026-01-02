import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ShoppingCart } from 'lucide-angular';
import { StoreService } from '../../../services/store.service';

@Component({
    selector: 'app-cart-button',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    template: `
        <button 
            class="cart-button" 
            [class.has-items]="itemCount() > 0"
            [class.pulse]="itemCount() > 0"
            (click)="toggleCart()"
            aria-label="Abrir carrito">
            <lucide-icon [img]="icons.ShoppingCart" [size]="24"></lucide-icon>
            @if (itemCount() > 0) {
            <span class="cart-badge">{{ itemCount() }}</span>
            }
        </button>
    `,
    styles: [`
        .cart-button {
            position: fixed;
            bottom: 24px;
            right: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            border: none;
            border-radius: 50%;
            color: #ffffff;
            cursor: pointer;
            box-shadow: 0 8px 30px rgba(99, 102, 241, 0.4);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 900;
        }

        .cart-button:hover {
            transform: scale(1.1);
            box-shadow: 0 12px 40px rgba(99, 102, 241, 0.5);
        }

        .cart-button:active {
            transform: scale(0.95);
        }

        .cart-button.has-items {
            animation: none;
        }

        .cart-button.pulse::after {
            content: '';
            position: absolute;
            inset: -4px;
            border: 2px solid rgba(99, 102, 241, 0.5);
            border-radius: 50%;
            animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        @keyframes ping {
            75%, 100% {
                transform: scale(1.5);
                opacity: 0;
            }
        }

        .cart-badge {
            position: absolute;
            top: -4px;
            right: -4px;
            min-width: 22px;
            height: 22px;
            padding: 0 6px;
            background: #ef4444;
            border: 2px solid #ffffff;
            border-radius: 11px;
            font-size: 0.75rem;
            font-weight: 700;
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        @media (max-width: 480px) {
            .cart-button {
                width: 56px;
                height: 56px;
                bottom: 20px;
                right: 20px;
            }
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartButtonComponent {
    readonly icons = { ShoppingCart };
    private readonly storeService = inject(StoreService);
    readonly itemCount = this.storeService.cartItemCount;

    toggleCart(): void {
        this.storeService.toggleCart();
    }
}
