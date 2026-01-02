/**
 * Modelos de la Tienda Premium Grivyzom
 */

// ============================================================================
// TIPOS BASE
// ============================================================================

export type ProductType = 'rank' | 'cosmetic' | 'crate' | 'feature' | 'item';
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
export type CosmeticType = 'particle' | 'pet' | 'trail' | 'hat' | 'wings' | 'aura' | 'emote';
export type FeatureDuration = 'permanent' | 'monthly' | 'weekly' | 'daily';
export type PaymentMethod = 'money' | 'grovs' | 'both';

// ============================================================================
// PRODUCTO BASE
// ============================================================================

export interface Product {
    id: string;
    name: string;
    description: string;
    shortDescription?: string;
    price: number;
    discountPrice?: number;
    discountPercent?: number;
    imageUrl: string;
    type: ProductType;
    categoryId: string;
    rarity: Rarity;
    featured: boolean;
    new: boolean;
    popular?: boolean;
    stock?: number | null; // null = ilimitado
    createdAt?: string;
    updatedAt?: string;

    // CAMPOS GROVS (Sistema de Puntos)
    grovs_price?: number;                // Precio alternativo en Grovs
    payment_methods?: PaymentMethod[];   // Métodos de pago soportados
    cashback_percentage?: number;        // % de cashback si compra con dinero
}

// ============================================================================
// PRODUCTOS ESPECIALIZADOS
// ============================================================================

/**
 * Rango VIP con beneficios
 */
export interface RankProduct extends Product {
    type: 'rank';
    color: string; // Color principal del rango (hex)
    gradientColors?: [string, string]; // Gradiente opcional
    benefits: RankBenefit[];
    commands: string[];
    prefix: string;
    prefixColor?: string;
    priority: number; // Jerarquía (mayor = mejor)
    duration?: FeatureDuration; // Permanente por defecto
}

export interface RankBenefit {
    icon?: string;
    text: string;
    highlight?: boolean;
}

/**
 * Cosmético (partículas, mascotas, etc.)
 */
export interface CosmeticProduct extends Product {
    type: 'cosmetic';
    cosmeticType: CosmeticType;
    previewUrl?: string; // GIF o video de preview
    previewType?: 'image' | 'gif' | 'video';
    colors?: string[]; // Colores disponibles
}

/**
 * Crate/Caja de recompensas
 */
export interface CrateProduct extends Product {
    type: 'crate';
    possibleItems: CrateItem[];
    openAnimation?: string;
    guaranteedRarity?: Rarity; // Rareza mínima garantizada
    bulkPricing?: BulkPrice[];
}

export interface CrateItem {
    name: string;
    imageUrl?: string;
    rarity: Rarity;
    probability?: number; // Porcentaje
}

export interface BulkPrice {
    quantity: number;
    price: number;
    savings?: number; // Porcentaje de ahorro
}

/**
 * Función exclusiva (comandos, habilidades)
 */
export interface FeatureProduct extends Product {
    type: 'feature';
    command?: string; // Ej: "/fly"
    duration: FeatureDuration;
    usageLimit?: number; // null = ilimitado
    requirements?: string[]; // Requisitos previos
}

/**
 * Item genérico (monedas, recursos, etc.)
 */
export interface ItemProduct extends Product {
    type: 'item';
    quantity?: number;
    stackable?: boolean;
}

// ============================================================================
// CATEGORÍAS
// ============================================================================

export interface Category {
    id: string;
    name: string;
    slug: string;
    description: string;
    icon: string; // Nombre del icono o emoji
    imageUrl?: string;
    color?: string;
    order: number;
    productType: ProductType;
    productCount?: number;
    featured?: boolean;
}

// ============================================================================
// CARRITO
// ============================================================================

export interface CartItem {
    product: Product | RankProduct | CosmeticProduct | CrateProduct | FeatureProduct | ItemProduct;
    quantity: number;
    addedAt: Date;
}

export interface Cart {
    items: CartItem[];
    subtotal: number;
    discount: number;
    total: number;
    itemCount: number;
}

// ============================================================================
// OFERTAS Y PROMOCIONES
// ============================================================================

export interface Offer {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    productId?: string;
    categoryId?: string;
    discountPercent: number;
    startDate: string;
    endDate: string;
    active: boolean;
    priority: number;
}

// ============================================================================
// RESPUESTAS API
// ============================================================================

export interface StoreApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    error?: string;
}

export interface ProductsResponse {
    products: Product[];
    total: number;
    page: number;
    pageSize: number;
}

export interface CategoriesResponse {
    categories: Category[];
}

// ============================================================================
// ESTADO DE LA TIENDA
// ============================================================================

export interface StoreState {
    products: Product[];
    categories: Category[];
    offers: Offer[];
    cart: Cart;
    activeCategory: string | null;
    searchQuery: string;
    loading: boolean;
    error: string | null;
}

// ============================================================================
// HELPERS DE TIPO
// ============================================================================

export function isRankProduct(product: Product): product is RankProduct {
    return product.type === 'rank';
}

export function isCosmeticProduct(product: Product): product is CosmeticProduct {
    return product.type === 'cosmetic';
}

export function isCrateProduct(product: Product): product is CrateProduct {
    return product.type === 'crate';
}

export function isFeatureProduct(product: Product): product is FeatureProduct {
    return product.type === 'feature';
}

export function isItemProduct(product: Product): product is ItemProduct {
    return product.type === 'item';
}

// ============================================================================
// CONSTANTES
// ============================================================================

export const RARITY_COLORS: Record<Rarity, { bg: string; border: string; text: string }> = {
    common: { bg: '#f8fafc', border: '#e2e8f0', text: '#64748b' },
    rare: { bg: '#eff6ff', border: '#3b82f6', text: '#1d4ed8' },
    epic: { bg: '#faf5ff', border: '#8b5cf6', text: '#7c3aed' },
    legendary: { bg: '#fffbeb', border: '#f59e0b', text: '#d97706' }
};

export const RARITY_LABELS: Record<Rarity, string> = {
    common: 'Común',
    rare: 'Raro',
    epic: 'Épico',
    legendary: 'Legendario'
};

export const COSMETIC_TYPE_LABELS: Record<CosmeticType, string> = {
    particle: 'Partículas',
    pet: 'Mascota',
    trail: 'Trail',
    hat: 'Sombrero',
    wings: 'Alas',
    aura: 'Aura',
    emote: 'Emote'
};

export const DURATION_LABELS: Record<FeatureDuration, string> = {
    permanent: 'Permanente',
    monthly: 'Mensual',
    weekly: 'Semanal',
    daily: 'Diario'
};
