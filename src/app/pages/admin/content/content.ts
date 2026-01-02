import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminHeaderComponent } from '../../../core/components/admin-header/admin-header';
import { AdminService, AdminGameHeader } from '../../../core/services/admin.service';
import { CalendarEventService } from '../../../core/services/calendar-event.service';
import { CalendarEvent, EventCategoryType, EVENT_CATEGORY_CONFIG, EventPrize } from '../../../core/models/calendar-event.models';
import { LucideAngularModule, Image, Save, Upload, RefreshCw, Check, AlertCircle, Calendar, Plus, Edit, Trash2, X } from 'lucide-angular';

@Component({
  selector: 'app-admin-content',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminHeaderComponent, LucideAngularModule],
  templateUrl: './content.html',
  styleUrls: ['./content.css']
})
export class ContentComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly calendarService = inject(CalendarEventService);

  // Lucide icons
  readonly ImageIcon = Image;
  readonly SaveIcon = Save;
  readonly UploadIcon = Upload;
  readonly RefreshIcon = RefreshCw;
  readonly CheckIcon = Check;
  readonly AlertIcon = AlertCircle;
  readonly CalendarIcon = Calendar;
  readonly PlusIcon = Plus;
  readonly EditIcon = Edit;
  readonly TrashIcon = Trash2;
  readonly XIcon = X;

  // State
  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  // Events state
  readonly events = this.calendarService.events;
  readonly isLoadingEvents = signal(false);
  readonly showEventForm = signal(false);
  readonly editingEvent = signal<CalendarEvent | null>(null);
  readonly eventSuccessMessage = signal<string | null>(null);
  readonly eventErrorMessage = signal<string | null>(null);

  // Event categories
  readonly categories = computed(() =>
    Object.entries(EVENT_CATEGORY_CONFIG).map(([id, config]) => ({
      id: id as EventCategoryType,
      name: config.name,
      icon: config.icon
    }))
  );

  // Form data
  gameHeader: AdminGameHeader = {
    id: null,
    title: 'GRIVYZOM',
    subtitle: 'A WORLD OF ADVENTURE AND CREATIVITY',
    button_text: 'JUGAR AHORA!',
    image_url: '',
    created_at: null
  };

  // Image preview
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  // Event banner preview
  eventBannerFile: File | null = null;
  eventBannerPreview: string | null = null;

  // Event form data
  eventForm: Partial<CalendarEvent> = this.getEmptyEventForm();

  // Prize form
  prizes: EventPrize[] = [];
  newPrize: Partial<EventPrize> = {};

  ngOnInit(): void {
    this.loadGameHeader();
    this.loadEvents();
  }

  // ========================================================================
  // EVENTS MANAGEMENT
  // ========================================================================

  loadEvents(): void {
    this.isLoadingEvents.set(true);
    this.calendarService.loadEvents().subscribe({
      next: () => {
        this.isLoadingEvents.set(false);
      },
      error: () => {
        this.eventErrorMessage.set('Error al cargar eventos');
        this.isLoadingEvents.set(false);
      }
    });
  }

  openEventForm(event?: CalendarEvent): void {
    if (event) {
      this.editingEvent.set(event);
      this.eventForm = { ...event };
      this.prizes = [...(event.prizes || [])];
      this.eventBannerPreview = event.bannerUrl || event.imageUrl || null;
    } else {
      this.editingEvent.set(null);
      this.eventForm = this.getEmptyEventForm();
      this.prizes = [];
      this.eventBannerPreview = null;
    }
    this.showEventForm.set(true);
  }

  closeEventForm(): void {
    this.showEventForm.set(false);
    this.editingEvent.set(null);
    this.eventForm = this.getEmptyEventForm();
    this.prizes = [];
    this.eventBannerFile = null;
    this.eventBannerPreview = null;
    this.eventSuccessMessage.set(null);
    this.eventErrorMessage.set(null);
  }

  saveEvent(): void {
    // Validación básica
    if (!this.eventForm.title || !this.eventForm.date || !this.eventForm.startTime || !this.eventForm.category) {
      this.eventErrorMessage.set('Por favor completa todos los campos requeridos');
      return;
    }

    this.isSaving.set(true);
    this.eventSuccessMessage.set(null);
    this.eventErrorMessage.set(null);

    const eventData: CalendarEvent = {
      id: this.editingEvent()?.id || this.generateEventId(),
      title: this.eventForm.title!,
      description: this.eventForm.description || '',
      shortDescription: this.eventForm.shortDescription,
      date: this.eventForm.date!,
      startTime: this.eventForm.startTime!,
      endTime: this.eventForm.endTime,
      category: this.eventForm.category!,
      status: this.eventForm.status || 'upcoming',
      bannerUrl: this.eventBannerPreview || undefined,
      imageUrl: this.eventBannerPreview || undefined,
      prizes: this.prizes,
      location: this.eventForm.location,
      maxParticipants: this.eventForm.maxParticipants,
      currentParticipants: this.eventForm.currentParticipants || 0,
      requiresRegistration: this.eventForm.requiresRegistration || false,
      registrationUrl: this.eventForm.registrationUrl
    };

    // Aquí deberías hacer una llamada al backend
    // Por ahora, simularemos la operación
    setTimeout(() => {
      this.eventSuccessMessage.set(
        this.editingEvent() ? 'Evento actualizado correctamente' : 'Evento creado correctamente'
      );
      this.isSaving.set(false);

      // Recargar eventos
      this.loadEvents();

      // Cerrar formulario después de 1.5 segundos
      setTimeout(() => {
        this.closeEventForm();
      }, 1500);
    }, 500);
  }

  deleteEvent(event: CalendarEvent): void {
    if (!confirm(`¿Estás seguro de eliminar el evento "${event.title}"?`)) {
      return;
    }

    // Aquí deberías hacer una llamada al backend para eliminar
    this.eventSuccessMessage.set('Evento eliminado correctamente');
    this.loadEvents();
  }

  onEventBannerSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        this.eventErrorMessage.set('Solo se permiten imágenes JPEG, PNG o WebP');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        this.eventErrorMessage.set('La imagen no puede superar los 10MB');
        return;
      }

      this.eventBannerFile = file;
      this.eventErrorMessage.set(null);

      const reader = new FileReader();
      reader.onload = (e) => {
        this.eventBannerPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  addPrize(): void {
    if (!this.newPrize.name) {
      this.eventErrorMessage.set('El premio debe tener un nombre');
      return;
    }

    const prize: EventPrize = {
      id: this.generatePrizeId(),
      name: this.newPrize.name,
      description: this.newPrize.description,
      rarity: this.newPrize.rarity || 'common',
      position: this.newPrize.position
    };

    this.prizes.push(prize);
    this.newPrize = {};
    this.eventErrorMessage.set(null);
  }

  removePrize(index: number): void {
    this.prizes.splice(index, 1);
  }

  triggerEventBannerInput(): void {
    const input = document.getElementById('event-banner-upload') as HTMLInputElement;
    input?.click();
  }

  formatEventDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  getCategoryConfig(category: string) {
    return EVENT_CATEGORY_CONFIG[category as EventCategoryType];
  }

  private getEmptyEventForm(): Partial<CalendarEvent> {
    return {
      title: '',
      description: '',
      shortDescription: '',
      date: '',
      startTime: '',
      endTime: '',
      category: 'evento',
      status: 'upcoming',
      requiresRegistration: false,
      currentParticipants: 0
    };
  }

  private generateEventId(): string {
    return 'event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private generatePrizeId(): string {
    return 'prize_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  loadGameHeader(): void {
    this.isLoading.set(true);
    this.adminService.getGameHeader().subscribe({
      next: (data) => {
        if (data) {
          this.gameHeader = data;
          this.imagePreview = data.image_url || null;
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Error al cargar el Game Header');
        this.isLoading.set(false);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validar tipo
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        this.errorMessage.set('Solo se permiten imágenes JPEG, PNG o WebP');
        return;
      }

      // Validar tamaño (10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.errorMessage.set('La imagen no puede superar los 10MB');
        return;
      }

      this.selectedFile = file;
      this.errorMessage.set(null);

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  saveGameHeader(): void {
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
          this.successMessage.set('Game Header actualizado correctamente');
        } else {
          this.errorMessage.set(response.error || 'Error al actualizar');
        }
        this.isSaving.set(false);

        // Limpiar mensaje después de 3 segundos
        setTimeout(() => {
          this.successMessage.set(null);
        }, 3000);
      },
      error: (err) => {
        this.errorMessage.set('Error al guardar los cambios');
        this.isSaving.set(false);
      }
    });
  }

  triggerFileInput(): void {
    const input = document.getElementById('image-upload') as HTMLInputElement;
    input?.click();
  }
}
