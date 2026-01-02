import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../../core/services/store.service';
import { StoreHeroComponent } from '../../core/components/store/store-hero/store-hero';
import { StoreSectionComponent } from '../../core/components/store/store-section/store-section';
import { RankCardComponent } from '../../core/components/store/rank-card/rank-card';
import { CosmeticCardComponent } from '../../core/components/store/cosmetic-card/cosmetic-card';
import { CrateCardComponent } from '../../core/components/store/crate-card/crate-card';
import { FeatureCardComponent } from '../../core/components/store/feature-card/feature-card';
import { CartSidebarComponent } from '../../core/components/store/cart-sidebar/cart-sidebar';
import { CartButtonComponent } from '../../core/components/store/cart-button/cart-button';
import {
    Product, RankProduct, CosmeticProduct, CrateProduct, FeatureProduct
} from '../../core/models/store.models';

@Component({
    selector: 'app-tienda',
    standalone: true,
    imports: [
        CommonModule,
        StoreHeroComponent,
        StoreSectionComponent,
        RankCardComponent,
        CosmeticCardComponent,
        CrateCardComponent,
        FeatureCardComponent,
        CartSidebarComponent,
        CartButtonComponent
    ],
    templateUrl: './tienda.html',
    styleUrls: ['./tienda.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TiendaComponent implements OnInit {
    private readonly storeService = inject(StoreService);

    // Productos por tipo
    readonly rankProducts = this.storeService.rankProducts;
    readonly cosmeticProducts = this.storeService.cosmeticProducts;
    readonly crateProducts = this.storeService.crateProducts;
    readonly featureProducts = this.storeService.featureProducts;

    // Productos destacados
    readonly featuredProducts = this.storeService.featuredProducts;

    // Ofertas
    readonly activeOffers = this.storeService.activeOffers;

    // Estado
    readonly loading = this.storeService.loading;

    ngOnInit(): void {
        // Cargar datos mock para desarrollo
        this.storeService.loadMockData();

        // En producción, usar:
        // this.storeService.loadStore();
    }

    onAddRankToCart(rank: RankProduct): void {
        this.storeService.addToCart(rank);
    }

    onAddCosmeticToCart(cosmetic: CosmeticProduct): void {
        this.storeService.addToCart(cosmetic);
    }

    onAddCrateToCart(event: { product: CrateProduct; quantity: number }): void {
        this.storeService.addToCart(event.product, event.quantity);
    }

    onAddFeatureToCart(feature: FeatureProduct): void {
        this.storeService.addToCart(feature);
    }

    onCosmeticPreview(cosmetic: CosmeticProduct): void {
        console.log('Preview cosmetic:', cosmetic);
        // TODO: Abrir modal de preview
    }

    onCrateDetails(crate: CrateProduct): void {
        console.log('View crate details:', crate);
        // TODO: Abrir modal con detalles del crate
    }

    scrollToSection(sectionId: string): void {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}
