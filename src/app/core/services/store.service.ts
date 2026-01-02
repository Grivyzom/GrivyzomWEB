import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
    Product, RankProduct, CosmeticProduct, CrateProduct, FeatureProduct, ItemProduct,
    Category, Cart, CartItem, Offer, StoreState, ProductType,
    StoreApiResponse, ProductsResponse, CategoriesResponse
} from '../models/store.models';
import { GrovsService } from './grovs.service';

@Injectable({
    providedIn: 'root'
})
export class StoreService {
    private readonly http = inject(HttpClient);
    private readonly grovsService = inject(GrovsService);
    private readonly apiUrl = `${environment.apiUrl}/store`;

    // ========================================================================
    // ESTADO REACTIVO
    // ========================================================================

    private readonly state = signal<StoreState>({
        products: [],
        categories: [],
        offers: [],
        cart: {
            items: [],
            subtotal: 0,
            discount: 0,
            total: 0,
            itemCount: 0
        },
        activeCategory: null,
        searchQuery: '',
        loading: false,
        error: null
    });

    // ========================================================================
    // SELECTORES PÚBLICOS (Computed Signals)
    // ========================================================================

    // Productos
    readonly products = computed(() => this.state().products);
    readonly loading = computed(() => this.state().loading);
    readonly error = computed(() => this.state().error);

    // Categorías
    readonly categories = computed(() => this.state().categories);
    readonly activeCategory = computed(() => this.state().activeCategory);

    // Ofertas
    readonly offers = computed(() => this.state().offers);
    readonly activeOffers = computed(() =>
        this.state().offers.filter(o => o.active && new Date(o.endDate) > new Date())
    );

    // Carrito
    readonly cart = computed(() => this.state().cart);
    readonly cartItems = computed(() => this.state().cart.items);
    readonly cartTotal = computed(() => this.state().cart.total);
    readonly cartItemCount = computed(() => this.state().cart.itemCount);
    readonly isCartOpen = signal(false);

    // Productos filtrados
    readonly filteredProducts = computed(() => {
        const { products, activeCategory, searchQuery } = this.state();
        let filtered = products;

        if (activeCategory) {
            filtered = filtered.filter(p => p.categoryId === activeCategory);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.description.toLowerCase().includes(query)
            );
        }

        return filtered;
    });

    // Productos por tipo
    readonly rankProducts = computed(() =>
        this.state().products.filter(p => p.type === 'rank') as RankProduct[]
    );

    readonly cosmeticProducts = computed(() =>
        this.state().products.filter(p => p.type === 'cosmetic') as CosmeticProduct[]
    );

    readonly crateProducts = computed(() =>
        this.state().products.filter(p => p.type === 'crate') as CrateProduct[]
    );

    readonly featureProducts = computed(() =>
        this.state().products.filter(p => p.type === 'feature') as FeatureProduct[]
    );

    readonly itemProducts = computed(() =>
        this.state().products.filter(p => p.type === 'item') as ItemProduct[]
    );

    // Productos destacados
    readonly featuredProducts = computed(() =>
        this.state().products.filter(p => p.featured)
    );

    readonly newProducts = computed(() =>
        this.state().products.filter(p => p.new)
    );

    // ========================================================================
    // GROVS - Computed Signals
    // ========================================================================

    /**
     * Total del carrito en Grovs
     */
    readonly cartTotalGrovs = computed(() => {
        return this.state().cart.items.reduce((acc, item) => {
            const grovsPrice = item.product.grovs_price || 0;
            return acc + (grovsPrice * item.quantity);
        }, 0);
    });

    /**
     * Verifica si todos los productos del carrito pueden pagarse con Grovs
     */
    readonly canPayWithGrovs = computed(() => {
        const items = this.state().cart.items;
        if (items.length === 0) return false;

        return items.every(item =>
            item.product.payment_methods?.includes('grovs') ||
            item.product.payment_methods?.includes('both')
        );
    });

    /**
     * Calcula el cashback total en Grovs si compra con dinero
     */
    readonly cartCashbackGrovs = computed(() => {
        return this.state().cart.items.reduce((acc, item) => {
            const price = item.product.discountPrice ?? item.product.price;
            const cashbackPercent = item.product.cashback_percentage || 0;
            return acc + Math.floor((price * item.quantity) * (cashbackPercent / 100));
        }, 0);
    });

    // ========================================================================
    // MÉTODOS API
    // ========================================================================

    /**
     * Carga todos los productos
     */
    loadProducts(): Observable<Product[]> {
        this.updateState({ loading: true, error: null });

        return this.http.get<{ products: any[]; total: number }>(`${this.apiUrl}/products/`).pipe(
            tap(response => {
                // Mapear la respuesta del backend al formato del frontend
                const products = response.products.map(p => ({
                    id: p.id,
                    name: p.name,
                    description: p.description,
                    price: parseFloat(p.price),
                    discount: p.discount || 0,
                    type: p.type as ProductType,
                    image: p.image,
                    available: p.available,
                    featured: p.featured,
                    category: p.category || null,
                    categoryId: p.category || null,
                    rarity: p.rarity,
                    stock: p.stock,
                    createdAt: p.createdAt,
                    updatedAt: p.updatedAt,
                    ...p.type_specific_data
                }));

                this.updateState({
                    products: products,
                    loading: false
                });
            }),
            map(response => {
                return response.products.map(p => ({
                    id: p.id,
                    name: p.name,
                    description: p.description,
                    price: parseFloat(p.price),
                    discount: p.discount || 0,
                    type: p.type as ProductType,
                    image: p.image,
                    available: p.available,
                    featured: p.featured,
                    category: p.category || null,
                    categoryId: p.category || null,
                    rarity: p.rarity,
                    stock: p.stock,
                    createdAt: p.createdAt,
                    updatedAt: p.updatedAt,
                    ...p.type_specific_data
                }));
            }),
            catchError(error => {
                console.error('Error loading products:', error);
                this.updateState({ loading: false, error: 'Error al cargar productos' });
                return of([]);
            })
        );
    }

    /**
     * Carga todas las categorías
     */
    loadCategories(): Observable<Category[]> {
        return this.http.get<{ categories: any[] }>(`${this.apiUrl}/categories/`).pipe(
            tap(response => {
                const categories = response.categories.map(c => ({
                    id: c.slug,
                    name: c.name,
                    slug: c.slug,
                    description: c.description,
                    icon: c.icon,
                    color: c.color,
                    order: c.order || 0,
                    productType: c.product_type || 'item'
                }));
                this.updateState({ categories: categories });
            }),
            map(response => response.categories.map(c => ({
                id: c.slug,
                name: c.name,
                slug: c.slug,
                description: c.description,
                icon: c.icon,
                color: c.color,
                order: c.order || 0,
                productType: c.product_type || 'item'
            }))),
            catchError(error => {
                console.error('Error loading categories:', error);
                return of([]);
            })
        );
    }

    /**
     * Carga ofertas activas
     */
    loadOffers(): Observable<Offer[]> {
        return this.http.get<StoreApiResponse<{ offers: Offer[] }>>(`${this.apiUrl}/offers/`).pipe(
            tap(response => {
                if (response.success) {
                    this.updateState({ offers: response.data.offers });
                }
            }),
            map(response => response.data.offers),
            catchError(error => {
                console.error('Error loading offers:', error);
                return of([]);
            })
        );
    }

    /**
     * Carga todos los datos iniciales de la tienda
     */
    loadStore(): void {
        this.loadProducts().subscribe();
        this.loadCategories().subscribe();
        this.loadOffers().subscribe();
    }

    // ========================================================================
    // FILTROS Y BÚSQUEDA
    // ========================================================================

    /**
     * Filtra por categoría
     */
    setActiveCategory(categoryId: string | null): void {
        this.updateState({ activeCategory: categoryId });
    }

    /**
     * Buscar productos
     */
    setSearchQuery(query: string): void {
        this.updateState({ searchQuery: query });
    }

    /**
     * Obtiene productos por tipo
     */
    getProductsByType(type: ProductType): Product[] {
        return this.state().products.filter(p => p.type === type);
    }

    /**
     * Obtiene productos por categoría
     */
    getProductsByCategory(categoryId: string): Product[] {
        return this.state().products.filter(p => p.categoryId === categoryId);
    }

    // ========================================================================
    // CARRITO
    // ========================================================================

    /**
     * Añade producto al carrito
     */
    addToCart(product: Product, quantity: number = 1): void {
        const currentCart = this.state().cart;
        const existingItemIndex = currentCart.items.findIndex(
            item => item.product.id === product.id
        );

        let newItems: CartItem[];

        if (existingItemIndex >= 0) {
            // Actualizar cantidad existente
            newItems = currentCart.items.map((item, index) =>
                index === existingItemIndex
                    ? { ...item, quantity: item.quantity + quantity }
                    : item
            );
        } else {
            // Añadir nuevo item
            newItems = [
                ...currentCart.items,
                { product, quantity, addedAt: new Date() }
            ];
        }

        this.updateCart(newItems);
        this.isCartOpen.set(true); // Abrir carrito al añadir
    }

    /**
     * Elimina producto del carrito
     */
    removeFromCart(productId: string): void {
        const newItems = this.state().cart.items.filter(
            item => item.product.id !== productId
        );
        this.updateCart(newItems);
    }

    /**
     * Actualiza cantidad de un producto
     */
    updateQuantity(productId: string, quantity: number): void {
        if (quantity <= 0) {
            this.removeFromCart(productId);
            return;
        }

        const newItems = this.state().cart.items.map(item =>
            item.product.id === productId
                ? { ...item, quantity }
                : item
        );
        this.updateCart(newItems);
    }

    /**
     * Vacía el carrito
     */
    clearCart(): void {
        this.updateCart([]);
    }

    /**
     * Toggle carrito sidebar
     */
    toggleCart(): void {
        this.isCartOpen.update(v => !v);
    }

    /**
     * Cierra el carrito
     */
    closeCart(): void {
        this.isCartOpen.set(false);
    }

    /**
     * Recalcula totales del carrito
     */
    private updateCart(items: CartItem[]): void {
        const subtotal = items.reduce((acc, item) => {
            const price = item.product.discountPrice ?? item.product.price;
            return acc + (price * item.quantity);
        }, 0);

        const discount = items.reduce((acc, item) => {
            if (item.product.discountPrice) {
                const saving = (item.product.price - item.product.discountPrice) * item.quantity;
                return acc + saving;
            }
            return acc;
        }, 0);

        const cart: Cart = {
            items,
            subtotal: subtotal + discount, // Precio original
            discount,
            total: subtotal,
            itemCount: items.reduce((acc, item) => acc + item.quantity, 0)
        };

        this.updateState({ cart });
    }

    // ========================================================================
    // CHECKOUT (Preparado para integración)
    // ========================================================================

    /**
     * Inicia proceso de checkout con dinero
     */
    checkout(): Observable<{ success: boolean; checkoutUrl?: string }> {
        const cart = this.state().cart;

        return this.http.post<StoreApiResponse<{ checkoutUrl: string }>>(
            `${this.apiUrl}/checkout/`,
            {
                items: cart.items.map(item => ({
                    productId: item.product.id,
                    quantity: item.quantity
                }))
            }
        ).pipe(
            map(response => ({
                success: response.success,
                checkoutUrl: response.data?.checkoutUrl
            })),
            catchError(error => {
                console.error('Checkout error:', error);
                return of({ success: false });
            })
        );
    }

    /**
     * Checkout con Grovs
     */
    checkoutWithGrovs(): Observable<{ success: boolean; message?: string; error?: string }> {
        const cart = this.state().cart;
        const totalGrovs = this.cartTotalGrovs();

        // Validar que el usuario tenga suficientes Grovs
        if (!this.grovsService.canAfford(totalGrovs)) {
            return of({
                success: false,
                error: `No tienes suficientes Grovs. Necesitas ${totalGrovs} Grovs.`
            });
        }

        // Validar que todos los productos puedan comprarse con Grovs
        if (!this.canPayWithGrovs()) {
            return of({
                success: false,
                error: 'Algunos productos del carrito no pueden comprarse con Grovs.'
            });
        }

        const items = cart.items.map(item => ({
            productId: item.product.id,
            quantity: item.quantity
        }));

        return this.grovsService.checkoutWithGrovs(items).pipe(
            map(response => {
                if (response) {
                    // Limpiar carrito tras compra exitosa
                    this.clearCart();
                    return {
                        success: true,
                        message: `Compra exitosa. Gastaste ${response.grovs_spent} Grovs.`
                    };
                }
                return {
                    success: false,
                    error: 'Error al procesar la compra con Grovs.'
                };
            }),
            catchError(error => {
                console.error('Grovs checkout error:', error);
                return of({
                    success: false,
                    error: error.error?.error || 'Error al procesar la compra con Grovs.'
                });
            })
        );
    }

    // ========================================================================
    // HELPERS INTERNOS
    // ========================================================================

    private updateState(partialState: Partial<StoreState>): void {
        this.state.update(current => ({ ...current, ...partialState }));
    }

    /**
     * Para pruebas: carga datos mock
     */
    loadMockData(): void {
        const mockCategories: Category[] = [
            { id: 'ranks', name: 'Rangos', slug: 'rangos', description: 'Rangos VIP con beneficios exclusivos', icon: '👑', order: 1, productType: 'rank', color: '#f59e0b' },
            { id: 'cosmetics', name: 'Cosméticos', slug: 'cosmeticos', description: 'Personaliza tu personaje', icon: '✨', order: 2, productType: 'cosmetic', color: '#8b5cf6' },
            { id: 'crates', name: 'Crates', slug: 'crates', description: 'Cajas con recompensas aleatorias', icon: '🎁', order: 3, productType: 'crate', color: '#3b82f6' },
            { id: 'features', name: 'Funciones', slug: 'funciones', description: 'Desbloquea comandos exclusivos', icon: '🔓', order: 4, productType: 'feature', color: '#22c55e' },
        ];

        const mockProducts: (RankProduct | CosmeticProduct | CrateProduct | FeatureProduct)[] = [
            // Rangos
            {
                id: 'donador',
                name: 'DONADOR',
                description: 'El rango inicial con beneficios esenciales para disfrutar al máximo.',
                shortDescription: 'Beneficios esenciales',
                price: 9.99,
                imageUrl: '/assets/img/store/donador.png',
                type: 'rank',
                categoryId: 'ranks',
                rarity: 'rare',
                featured: true,
                new: false,
                color: '#22c55e',
                benefits: [
                    { icon: '✈️', text: '/fly en lobbies' },
                    { icon: '🏠', text: '3 homes extra' },
                    { icon: '📦', text: 'Kit Donador diario' },
                    { icon: '💬', text: 'Prefijo [Donador] en chat' },
                ],
                commands: ['/fly', '/hat', '/nick'],
                prefix: '[Donador]',
                priority: 1
            },
            {
                id: 'mvp',
                name: 'MVP',
                description: 'Para jugadores que buscan más poder y beneficios premium.',
                shortDescription: 'Beneficios premium',
                price: 19.99,
                discountPrice: 14.99,
                discountPercent: 25,
                imageUrl: '/assets/img/store/mvp.png',
                type: 'rank',
                categoryId: 'ranks',
                rarity: 'epic',
                featured: true,
                new: false,
                color: '#8b5cf6',
                gradientColors: ['#8b5cf6', '#6366f1'],
                benefits: [
                    { icon: '✈️', text: '/fly en todos los mundos', highlight: true },
                    { icon: '🏠', text: '10 homes extra' },
                    { icon: '📦', text: 'Kit MVP diario' },
                    { icon: '🎨', text: 'Colores en chat' },
                    { icon: '⚡', text: 'Cola prioritaria' },
                ],
                commands: ['/fly', '/hat', '/nick', '/enderchest', '/craft'],
                prefix: '[MVP]',
                prefixColor: '#8b5cf6',
                priority: 2
            },
            {
                id: 'elite',
                name: 'ELITE',
                description: 'El rango más exclusivo con todos los beneficios desbloqueados.',
                shortDescription: 'Máximos beneficios',
                price: 39.99,
                imageUrl: '/assets/img/store/elite.png',
                type: 'rank',
                categoryId: 'ranks',
                rarity: 'legendary',
                featured: true,
                new: true,
                color: '#f59e0b',
                gradientColors: ['#f59e0b', '#fbbf24'],
                benefits: [
                    { icon: '✈️', text: '/fly en TODOS los mundos', highlight: true },
                    { icon: '🏠', text: 'Homes ILIMITADOS', highlight: true },
                    { icon: '📦', text: 'Kit ELITE diario + semanal' },
                    { icon: '🎨', text: 'Todos los colores en chat' },
                    { icon: '⚡', text: 'Acceso VIP a eventos' },
                    { icon: '👑', text: 'Partículas exclusivas' },
                ],
                commands: ['/fly', '/hat', '/nick', '/enderchest', '/craft', '/heal', '/feed', '/god'],
                prefix: '[ELITE]',
                prefixColor: '#f59e0b',
                priority: 3
            },
            // Cosméticos
            {
                id: 'particle-fire',
                name: 'Aura de Fuego',
                description: 'Partículas de fuego que te rodean mientras caminas.',
                price: 4.99,
                imageUrl: '/assets/img/store/fire-aura.png',
                type: 'cosmetic',
                categoryId: 'cosmetics',
                rarity: 'epic',
                featured: false,
                new: true,
                cosmeticType: 'aura',
                previewUrl: '/assets/img/store/fire-aura-preview.gif',
                previewType: 'gif'
            },
            {
                id: 'pet-dragon',
                name: 'Dragón Bebé',
                description: 'Un pequeño dragón que te sigue a todas partes.',
                price: 7.99,
                imageUrl: '/assets/img/store/dragon-pet.png',
                type: 'cosmetic',
                categoryId: 'cosmetics',
                rarity: 'legendary',
                featured: true,
                new: false,
                cosmeticType: 'pet',
                previewUrl: '/assets/img/store/dragon-preview.gif',
                previewType: 'gif'
            },
            // Crates
            {
                id: 'crate-basic',
                name: 'Caja Básica',
                description: 'Contiene items comunes y raros.',
                price: 1.99,
                imageUrl: '/assets/img/store/crate-basic.png',
                type: 'crate',
                categoryId: 'crates',
                rarity: 'common',
                featured: false,
                new: false,
                possibleItems: [
                    { name: 'Diamantes x5', rarity: 'common', probability: 40 },
                    { name: 'Kit Herramientas', rarity: 'rare', probability: 30 },
                    { name: 'Espada Encantada', rarity: 'epic', probability: 20 },
                    { name: 'Item Misterioso', rarity: 'legendary', probability: 10 },
                ],
                bulkPricing: [
                    { quantity: 5, price: 7.99, savings: 20 },
                    { quantity: 10, price: 14.99, savings: 25 },
                ]
            },
            {
                id: 'crate-legendary',
                name: 'Caja Legendaria',
                description: '¡Garantiza al menos un item épico!',
                price: 4.99,
                imageUrl: '/assets/img/store/crate-legendary.png',
                type: 'crate',
                categoryId: 'crates',
                rarity: 'legendary',
                featured: true,
                new: true,
                possibleItems: [
                    { name: 'Set Armadura Diamante', rarity: 'epic', probability: 40 },
                    { name: 'Espada Legendaria', rarity: 'legendary', probability: 30 },
                    { name: 'Mascota Exclusiva', rarity: 'legendary', probability: 20 },
                    { name: 'Rango Temporal', rarity: 'legendary', probability: 10 },
                ],
                guaranteedRarity: 'epic',
                bulkPricing: [
                    { quantity: 5, price: 19.99, savings: 20 },
                    { quantity: 10, price: 34.99, savings: 30 },
                ]
            },
            // Features
            {
                id: 'feature-fly',
                name: 'Comando /fly',
                description: 'Vuela libremente por todos los lobbies y mundos creativos.',
                price: 7.99,
                imageUrl: '/assets/img/store/fly.png',
                type: 'feature',
                categoryId: 'features',
                rarity: 'epic',
                featured: true,
                new: false,
                command: '/fly',
                duration: 'permanent'
            },
            {
                id: 'feature-nick',
                name: 'Comando /nick',
                description: 'Cambia tu nombre visible en el servidor.',
                price: 3.99,
                imageUrl: '/assets/img/store/nick.png',
                type: 'feature',
                categoryId: 'features',
                rarity: 'rare',
                featured: false,
                new: false,
                command: '/nick',
                duration: 'permanent'
            },
        ];

        this.updateState({
            categories: mockCategories,
            products: mockProducts,
            loading: false
        });
    }
}
