import { Component, Input, Output, EventEmitter, signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { ServerIpService, IPServer } from '../../services/server-ip.service';

@Component({
  selector: 'app-ip-addresses-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ip-addresses-dropdown.html',
  styleUrls: ['./ip-addresses-dropdown.css'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ])
  ]
})
export class IpAddressesDropdownComponent {
  @Input() showInfoButton: boolean = false;
  @Output() onServerSelect = new EventEmitter<IPServer>();
  @Output() onInfoClick = new EventEmitter<void>();
  @Output() onDone = new EventEmitter<void>();

  // Inyectar servicio
  private readonly serverIpService = inject(ServerIpService);

  // Estado reactivo con signals
  readonly isOpen = signal(true); // Ahora abierto por defecto para el modal

  // Computed values desde el servicio
  readonly servers = computed(() => this.serverIpService.allServers());
  readonly selectedServer = computed(() => this.serverIpService.selectedServer());

  // Estado de animación para el botón de copia
  readonly copiedServerId = signal<string | null>(null);

  constructor() {
    // Effect para emitir cambios de servidor (solo cuando cambia, no en la inicialización)
    let isFirstRun = true;
    effect(() => {
      const selected = this.selectedServer();
      if (!isFirstRun && selected) {
        this.onServerSelect.emit(selected);
      }
      isFirstRun = false;
    });
  }

  /**
   * Toggle del dropdown con mejor gestión de estado
   */
  toggleDropdown(): void {
    this.isOpen.update(value => !value);
  }

  /**
   * Seleccionar servidor optimizado
   */
  selectServer(server: IPServer): void {
    this.serverIpService.selectServer(server.id);
    this.closeDropdown();
  }

  /**
   * Copiar IP con feedback visual mejorado
   */
  async copyToClipboard(event: Event, server: IPServer): Promise<void> {
    event.stopPropagation();

    const success = await this.serverIpService.copyToClipboard(server.ip);

    if (success) {
      // Mostrar feedback visual temporal
      this.copiedServerId.set(server.id);
      setTimeout(() => this.copiedServerId.set(null), 2000);
    }
  }

  /**
   * Cerrar dropdown - emite evento para que el padre cierre el modal
   */
  closeDropdown(): void {
    this.isOpen.set(false);
    this.onDone.emit();
  }

  /**
   * Verificar si un servidor fue copiado recientemente
   */
  wasCopied(serverId: string): boolean {
    return this.copiedServerId() === serverId;
  }

  /**
   * Manejar click fuera del dropdown
   */
  onOutsideClick(event: Event): void {
    if (this.isOpen()) {
      this.closeDropdown();
    }
  }

  /**
   * Emitir evento de click en el botón de información
   */
  handleInfoClick(): void {
    this.onInfoClick.emit();
  }
}