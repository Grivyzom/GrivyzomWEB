import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminHeaderComponent } from '../../../core/components/admin-header/admin-header';
import {
  AdminService,
  AdminWebComponent,
  AdminGameHeader,
  AdminHeroSection
} from '../../../core/services/admin.service';
import {
  LucideAngularModule,
  Image as LucideImage,
  Gamepad2,
  Upload,
  Save,
  RefreshCw,
  Check,
  AlertCircle,
  X,
  Edit3
} from 'lucide-angular';

type EditingComponent = 'game-header' | 'hero-section' | null;

@Component({
  selector: 'app-admin-gallery',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminHeaderComponent, LucideAngularModule],
  templateUrl: './gallery.html',
  styleUrls: ['./gallery.css']
})
export class AdminGalleryComponent implements OnInit {
  private readonly adminService = inject(AdminService);

  // Lucide icons
  readonly ImageIcon = LucideImage;
  readonly GamepadIcon = Gamepad2;
  readonly UploadIcon = Upload;
  readonly SaveIcon = Save;
  readonly RefreshIcon = RefreshCw;
  readonly CheckIcon = Check;
  readonly AlertIcon = AlertCircle;
  readonly CloseIcon = X;
  readonly EditIcon = Edit3;

  // State
  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  // Components list
  components: AdminWebComponent[] = [];
  editingComponent: EditingComponent = null;

  // Game Header form
  gameHeader: AdminGameHeader = {
    id: null,
    title: 'GRIVYZOM',
    subtitle: 'A WORLD OF ADVENTURE AND CREATIVITY',
    button_text: 'JUGAR AHORA!',
    image_url: '',
    created_at: null
  };

  // Hero Section form
  heroSection: AdminHeroSection = {
    id: null,
    title: 'Bienvenido a Grivyzom',
    description: '',
    image_url: '',
    created_at: null
  };

  // Image preview
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  ngOnInit(): void {
    this.loadComponents();
  }

  loadComponents(): void {
    this.isLoading.set(true);
    this.adminService.getWebComponents().subscribe({
      next: (components) => {
        this.components = components;
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Error al cargar componentes');
        this.isLoading.set(false);
      }
    });
  }

  getIconForComponent(componentId: string): any {
    return componentId === 'game-header' ? this.GamepadIcon : this.ImageIcon;
  }

  editComponent(componentId: string): void {
    this.editingComponent = componentId as EditingComponent;
    this.selectedFile = null;
    this.imagePreview = null;
    this.successMessage.set(null);
    this.errorMessage.set(null);

    if (componentId === 'game-header') {
      this.loadGameHeader();
    } else if (componentId === 'hero-section') {
      this.loadHeroSection();
    }
  }

  closeEditor(): void {
    this.editingComponent = null;
    this.selectedFile = null;
    this.imagePreview = null;
  }

  loadGameHeader(): void {
    this.adminService.getGameHeader().subscribe({
      next: (data) => {
        if (data) {
          this.gameHeader = data;
          this.imagePreview = data.image_url || null;
        }
      }
    });
  }

  loadHeroSection(): void {
    this.adminService.getHeroSection().subscribe({
      next: (data) => {
        if (data) {
          this.heroSection = data;
          this.imagePreview = data.image_url || null;
        }
      }
    });
  }

  onFileSelected(event: Event): void {
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

      this.selectedFile = file;
      this.errorMessage.set(null);

      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  saveComponent(): void {
    if (this.editingComponent === 'game-header') {
      this.saveGameHeader();
    } else if (this.editingComponent === 'hero-section') {
      this.saveHeroSection();
    }
  }

  private saveGameHeader(): void {
    this.isSaving.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    const formData = new FormData();
    formData.append('title', this.gameHeader.title);
    formData.append('subtitle', this.gameHeader.subtitle);
    formData.append('button_text', this.gameHeader.button_text);

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.adminService.updateGameHeader(formData).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.gameHeader = response.data;
          this.imagePreview = response.data.image_url;
          this.selectedFile = null;
          this.successMessage.set('Game Header actualizado');
          this.loadComponents(); // Refresh list
        } else {
          this.errorMessage.set(response.error || 'Error al actualizar Game Header');
        }
        this.isSaving.set(false);
        this.clearMessageAfterDelay();
      },
      error: (err) => {
        console.error('Error updating Game Header:', err);
        this.errorMessage.set('Error de conexión al actualizar Game Header');
        this.isSaving.set(false);
        this.clearMessageAfterDelay();
      }
    });
  }

  private saveHeroSection(): void {
    this.isSaving.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    const formData = new FormData();
    formData.append('title', this.heroSection.title);
    formData.append('description', this.heroSection.description);

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.adminService.updateHeroSection(formData).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.heroSection = response.data;
          this.imagePreview = response.data.image_url;
          this.selectedFile = null;
          this.successMessage.set('Hero Section actualizado');
          this.loadComponents();
        } else {
          this.errorMessage.set(response.error || 'Error al actualizar Hero Section');
        }
        this.isSaving.set(false);
        this.clearMessageAfterDelay();
      },
      error: (err) => {
        console.error('Error updating Hero Section:', err);
        this.errorMessage.set('Error de conexión al actualizar Hero Section');
        this.isSaving.set(false);
        this.clearMessageAfterDelay();
      }
    });
  }

  private clearMessageAfterDelay(): void {
    setTimeout(() => {
      this.successMessage.set(null);
    }, 3000);
  }

  triggerFileInput(): void {
    const input = document.getElementById('component-image-upload') as HTMLInputElement;
    input?.click();
  }
}
