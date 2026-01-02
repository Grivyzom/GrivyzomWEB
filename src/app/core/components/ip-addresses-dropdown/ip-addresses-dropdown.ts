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
   * Copia la IP al portapapeles.
   */
  copyToClipboard(event: Event, server: IPServer): void {
    event.stopPropagation();
    this.serverIpService.copyToClipboard(server.ip);
  }

  /**
   * Cerrar dropdown - emite evento para que el padre cierre el modal
   */
  closeDropdown(): void {
    this.isOpen.set(false);
    this.onDone.emit();
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