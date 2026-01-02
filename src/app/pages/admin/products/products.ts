import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Package, ShoppingCart, DollarSign, Plus, Edit, Trash2, X, Image, Save, AlertCircle, Check } from 'lucide-angular';
import { AdminHeaderComponent, Breadcrumb } from '../../../core/components/admin-header/admin-header';
import { StoreService } from '../../../core/services/store.service';
import {
  Product, RankProduct, CosmeticProduct, CrateProduct, FeatureProduct, ItemProduct,
  ProductType, Rarity, CosmeticType, FeatureDuration, RankBenefit, CrateItem,
  RARITY_LABELS, COSMETIC_TYPE_LABELS, DURATION_LABELS
} from '../../../core/models/store.models';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    AdminHeaderComponent
  ],
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class ProductsComponent implements OnInit {
  private readonly storeService = inject(StoreService);

  // Icons
  readonly icons = {
    Package,
    ShoppingCart,
    DollarSign,
    Plus,
    Edit,
    Trash2,
    X,
    Image,
    Save,
    AlertCircle,
    Check
  };

  // Breadcrumbs
  readonly breadcrumbs: Breadcrumb[] = [
    { label: 'Admin', route: '/admin' },
    { label: 'Productos' }
  ];

  // State signals
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  // Products & Categories from service
  readonly products = this.storeService.products;
  readonly categories = this.storeService.categories;

  // Form state
  readonly showProductForm = signal(false);
  readonly editingProduct = signal<Product | null>(null);
  readonly hasDraft = signal(false);

  // Product form data
  productForm: Partial<Product> = this.getEmptyProductForm();

  // Cache key for localStorage
  private readonly DRAFT_KEY = 'admin_product_draft';

  // Image preview
  productImageFile: File | null = null;
  productImagePreview: string | null = null;

  // Type-specific data
  rankBenefits: RankBenefit[] = [];
  rankCommands: string[] = [];
  newBenefit: Partial<RankBenefit> = {};
  newCommand: string = '';

  crateItems: CrateItem[] = [];
  newCrateItem: Partial<CrateItem> = {};

  // Labels for templates
  readonly RARITY_LABELS = RARITY_LABELS;
  readonly COSMETIC_TYPE_LABELS = COSMETIC_TYPE_LABELS;
  readonly DURATION_LABELS = DURATION_LABELS;

  // Product type options
  readonly productTypes: { value: ProductType; label: string }[] = [
    { value: 'rank', label: 'Rango VIP' },
    { value: 'cosmetic', label: 'Cosmético' },
    { value: 'crate', label: 'Caja/Crate' },
    { value: 'feature', label: 'Función' },
    { value: 'item', label: 'Item' }
  ];

  readonly rarityOptions: { value: Rarity; label: string }[] = [
    { value: 'common', label: 'Común' },
    { value: 'rare', label: 'Raro' },
    { value: 'epic', label: 'Épico' },
    { value: 'legendary', label: 'Legendario' }
  ];

  readonly cosmeticTypeOptions: { value: CosmeticType; label: string }[] = [
    { value: 'particle', label: 'Partículas' },
    { value: 'pet', label: 'Mascota' },
    { value: 'trail', label: 'Trail' },
    { value: 'hat', label: 'Sombrero' },
    { value: 'wings', label: 'Alas' },
    { value: 'aura', label: 'Aura' },
    { value: 'emote', label: 'Emote' }
  ];

  readonly durationOptions: { value: FeatureDuration; label: string }[] = [
    { value: 'permanent', label: 'Permanente' },
    { value: 'monthly', label: 'Mensual' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'daily', label: 'Diario' }
  ];

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
    this.checkForDraft();
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.storeService.loadProducts().subscribe({
      next: () => {
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Error al cargar productos');
        this.isLoading.set(false);
      }
    });
  }

  loadCategories(): void {
    this.storeService.loadCategories().subscribe();
  }

  // ========================================================================
  // PRODUCT MANAGEMENT
  // ========================================================================

  openProductForm(product?: Product): void {
    if (product) {
      // Editing existing product - load product data
      this.editingProduct.set(product);
      this.productForm = { ...product };
      this.productImagePreview = product.imageUrl || null;

      // Load type-specific data
      if (product.type === 'rank') {
        const rankProduct = product as RankProduct;
        this.rankBenefits = [...(rankProduct.benefits || [])];
        this.rankCommands = [...(rankProduct.commands || [])];
      } else if (product.type === 'crate') {
        const crateProduct = product as CrateProduct;
        this.crateItems = [...(crateProduct.possibleItems || [])];
      }
    } else {
      // Creating new product - check for draft
      this.editingProduct.set(null);

      // Try to load draft
      if (!this.loadDraft()) {
        // No draft found, start with empty form
        this.productForm = this.getEmptyProductForm();
        this.productImagePreview = null;
        this.rankBenefits = [];
        this.rankCommands = [];
        this.crateItems = [];
      }
    }
    this.showProductForm.set(true);
  }

  closeProductForm(): void {
    this.showProductForm.set(false);
    // Note: No limpiamos el formulario para mantener el borrador
    // Solo se limpia cuando se guarda exitosamente o se descarta explícitamente
    this.successMessage.set(null);
    this.errorMessage.set(null);
  }

  saveProduct(): void {
    // Validación básica
    if (!this.productForm.name || !this.productForm.price || !this.productForm.type || !this.productForm.categoryId) {
      this.errorMessage.set('Por favor completa todos los campos requeridos');
      return;
    }

    this.isSaving.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    // Build product data based on type
    let productData: Product;

    const baseData = {
      id: this.editingProduct()?.id || this.generateProductId(),
      name: this.productForm.name!,
      description: this.productForm.description || '',
      shortDescription: this.productForm.shortDescription,
      price: this.productForm.price!,
      discountPrice: this.productForm.discountPrice,
      discountPercent: this.productForm.discountPercent,
      imageUrl: this.productImagePreview || '',
      type: this.productForm.type!,
      categoryId: this.productForm.categoryId!,
      rarity: this.productForm.rarity || 'common',
      featured: this.productForm.featured || false,
      new: this.productForm.new || false,
      popular: this.productForm.popular || false,
      stock: this.productForm.stock
    };

    switch (this.productForm.type) {
      case 'rank':
        productData = {
          ...baseData,
          type: 'rank',
          color: (this.productForm as Partial<RankProduct>).color || '#8b5cf6',
          benefits: this.rankBenefits,
          commands: this.rankCommands,
          prefix: (this.productForm as Partial<RankProduct>).prefix || '',
          priority: (this.productForm as Partial<RankProduct>).priority || 0
        } as RankProduct;
        break;

      case 'cosmetic':
        productData = {
          ...baseData,
          type: 'cosmetic',
          cosmeticType: (this.productForm as Partial<CosmeticProduct>).cosmeticType || 'particle'
        } as CosmeticProduct;
        break;

      case 'crate':
        productData = {
          ...baseData,
          type: 'crate',
          possibleItems: this.crateItems
        } as CrateProduct;
        break;

      case 'feature':
        productData = {
          ...baseData,
          type: 'feature',
          command: (this.productForm as Partial<FeatureProduct>).command,
          duration: (this.productForm as Partial<FeatureProduct>).duration || 'permanent'
        } as FeatureProduct;
        break;

      case 'item':
      default:
        productData = {
          ...baseData,
          type: 'item',
          quantity: (this.productForm as Partial<ItemProduct>).quantity
        } as ItemProduct;
        break;
    }

    // TODO: Backend API call
    // Por ahora simularemos la operación
    setTimeout(() => {
      this.successMessage.set(
        this.editingProduct() ? 'Producto actualizado correctamente' : 'Producto creado correctamente'
      );
      this.isSaving.set(false);

      // Limpiar borrador al guardar exitosamente
      this.clearDraft();

      // Recargar productos
      this.loadProducts();

      // Resetear formulario y cerrar después de 1.5 segundos
      setTimeout(() => {
        this.resetForm();
        this.closeProductForm();
      }, 1500);
    }, 500);
  }

  deleteProduct(product: Product): void {
    if (!confirm(`¿Estás seguro de eliminar el producto "${product.name}"?`)) {
      return;
    }

    // TODO: Backend API call
    this.successMessage.set('Producto eliminado correctamente');
    this.loadProducts();
  }

  onProductImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        this.errorMessage.set('Solo se permiten imágenes JPEG, PNG o WebP');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        this.errorMessage.set('La imagen no puede superar los 10MB');
        return;
      }

      this.productImageFile = file;
      this.errorMessage.set(null);

      const reader = new FileReader();
      reader.onload = (e) => {
        this.productImagePreview = e.target?.result as string;
        // Guardar borrador cuando cambia la imagen
        this.onFormChange();
      };
      reader.readAsDataURL(file);
    }
  }

  triggerProductImageInput(): void {
    const input = document.getElementById('product-image-upload') as HTMLInputElement;
    input?.click();
  }

  // ========================================================================
  // RANK-SPECIFIC METHODS
  // ========================================================================

  addBenefit(): void {
    if (!this.newBenefit.text) {
      this.errorMessage.set('El beneficio debe tener un texto');
      return;
    }

    const benefit: RankBenefit = {
      icon: this.newBenefit.icon,
      text: this.newBenefit.text,
      highlight: this.newBenefit.highlight || false
    };

    this.rankBenefits.push(benefit);
    this.newBenefit = {};
    this.errorMessage.set(null);
    this.onFormChange();
  }

  removeBenefit(index: number): void {
    this.rankBenefits.splice(index, 1);
    this.onFormChange();
  }

  addCommand(): void {
    if (!this.newCommand.trim()) {
      this.errorMessage.set('El comando no puede estar vacío');
      return;
    }

    const command = this.newCommand.trim();
    if (!command.startsWith('/')) {
      this.errorMessage.set('El comando debe empezar con "/"');
      return;
    }

    this.rankCommands.push(command);
    this.newCommand = '';
    this.errorMessage.set(null);
    this.onFormChange();
  }

  removeCommand(index: number): void {
    this.rankCommands.splice(index, 1);
    this.onFormChange();
  }

  // ========================================================================
  // CRATE-SPECIFIC METHODS
  // ========================================================================

  addCrateItem(): void {
    if (!this.newCrateItem.name) {
      this.errorMessage.set('El item debe tener un nombre');
      return;
    }

    const item: CrateItem = {
      name: this.newCrateItem.name,
      imageUrl: this.newCrateItem.imageUrl,
      rarity: this.newCrateItem.rarity || 'common',
      probability: this.newCrateItem.probability
    };

    this.crateItems.push(item);
    this.newCrateItem = {};
    this.errorMessage.set(null);
    this.onFormChange();
  }

  removeCrateItem(index: number): void {
    this.crateItems.splice(index, 1);
    this.onFormChange();
  }

  // ========================================================================
  // HELPERS
  // ========================================================================

  private getEmptyProductForm(): Partial<Product> {
    return {
      name: '',
      description: '',
      shortDescription: '',
      price: 0,
      type: 'item',
      categoryId: '',
      rarity: 'common',
      featured: false,
      new: false,
      popular: false
    };
  }

  private generateProductId(): string {
    return 'product_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  getRarityColor(rarity: Rarity): string {
    const colors: Record<Rarity, string> = {
      common: '#64748b',
      rare: '#3b82f6',
      epic: '#8b5cf6',
      legendary: '#f59e0b'
    };
    return colors[rarity] || '#64748b';
  }

  getTypeLabel(type: ProductType): string {
    const labels: Record<ProductType, string> = {
      rank: 'Rango',
      cosmetic: 'Cosmético',
      crate: 'Caja',
      feature: 'Función',
      item: 'Item'
    };
    return labels[type];
  }

  formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }

  // ========================================================================
  // DRAFT MANAGEMENT (Cache)
  // ========================================================================

  /**
   * Guarda el estado actual del formulario en localStorage
   */
  saveDraft(): void {
    // Solo guardar borrador si no estamos editando un producto existente
    if (this.editingProduct()) {
      return;
    }

    const draft = {
      productForm: this.productForm,
      productImagePreview: this.productImagePreview,
      rankBenefits: this.rankBenefits,
      rankCommands: this.rankCommands,
      crateItems: this.crateItems,
      savedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem(this.DRAFT_KEY, JSON.stringify(draft));
      this.hasDraft.set(true);
    } catch (error) {
      console.error('Error al guardar borrador:', error);
    }
  }

  /**
   * Carga el borrador desde localStorage
   * @returns true si se cargó un borrador, false si no hay borrador
   */
  loadDraft(): boolean {
    try {
      const draftJson = localStorage.getItem(this.DRAFT_KEY);
      if (!draftJson) {
        return false;
      }

      const draft = JSON.parse(draftJson);

      // Restaurar formulario
      this.productForm = draft.productForm || this.getEmptyProductForm();
      this.productImagePreview = draft.productImagePreview || null;
      this.rankBenefits = draft.rankBenefits || [];
      this.rankCommands = draft.rankCommands || [];
      this.crateItems = draft.crateItems || [];

      console.log('Borrador cargado desde:', draft.savedAt);
      return true;
    } catch (error) {
      console.error('Error al cargar borrador:', error);
      return false;
    }
  }

  /**
   * Limpia el borrador de localStorage
   */
  clearDraft(): void {
    try {
      localStorage.removeItem(this.DRAFT_KEY);
      this.hasDraft.set(false);
    } catch (error) {
      console.error('Error al limpiar borrador:', error);
    }
  }

  /**
   * Verifica si hay un borrador guardado
   */
  checkForDraft(): void {
    try {
      const draftJson = localStorage.getItem(this.DRAFT_KEY);
      this.hasDraft.set(!!draftJson);
    } catch (error) {
      console.error('Error al verificar borrador:', error);
      this.hasDraft.set(false);
    }
  }

  /**
   * Descarta el borrador y resetea el formulario
   */
  discardDraft(): void {
    if (confirm('¿Estás seguro de descartar el borrador? Esta acción no se puede deshacer.')) {
      this.clearDraft();
      this.resetForm();
      this.successMessage.set('Borrador descartado');

      setTimeout(() => {
        this.successMessage.set(null);
      }, 2000);
    }
  }

  /**
   * Resetea el formulario a su estado inicial
   */
  resetForm(): void {
    this.editingProduct.set(null);
    this.productForm = this.getEmptyProductForm();
    this.productImageFile = null;
    this.productImagePreview = null;
    this.rankBenefits = [];
    this.rankCommands = [];
    this.crateItems = [];
  }

  /**
   * Método que se llama cuando cambian los datos del formulario
   * para guardar automáticamente
   */
  onFormChange(): void {
    this.saveDraft();
  }
}
