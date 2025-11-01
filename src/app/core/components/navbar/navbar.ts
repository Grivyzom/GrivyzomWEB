import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { AnimatedButton } from '../animated-button/animated-button';
import { ServerIpService, IPServer } from '../../services/server-ip.service';
import { IpAddressesDropdownComponent } from '../ip-addresses-dropdown/ip-addresses-dropdown';
import { BaseModalComponent } from '../base-modal/base-modal';
import { WhyMultipleServersComponent } from '../why-multiple-servers/why-multiple-servers';

@Component({
  selector: 'app-navbar',
  imports: [
    CommonModule,
    AnimatedButton,
    NgOptimizedImage,
    IpAddressesDropdownComponent,
    BaseModalComponent,
    WhyMultipleServersComponent
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  // Inyectar el servicio de IPs
  private readonly serverIpService = inject(ServerIpService);

  // Estado reactivo
  readonly isMenuOpen = signal(false);
  readonly isAuthenticated = signal(false);
  readonly showCopyFeedback = signal(false);
  readonly showIPModal = signal(false);
  readonly showInfoModal = signal(false);

  // Computed values desde el servicio
  readonly selectedServer = computed(() => this.serverIpService.selectedServer());
  readonly serverIP = computed(() => this.selectedServer().ip);

  // Ruta del GIF mini
  readonly videoSource = 'assets/videos/Puente_Magico_a_la_Biblioteca_Grivyzom.gif';

  /**
   * Alterna el menú móvil
   */
  toggleMenu(): void {
    this.isMenuOpen.update(value => !value);
  }

  /**
   * Abre el modal de selección de IPs
   */
  openIPModal(): void {
    this.showIPModal.set(true);
  }

  /**
   * Cierra el modal de selección de IPs
   */
  closeIPModal(): void {
    this.showIPModal.set(false);
  }

  /**
   * Maneja la selección de un servidor desde el modal
   */
  onServerSelect(server: IPServer): void {
    console.log('Servidor seleccionado:', server);
    // Cerrar el modal automáticamente
    this.closeIPModal();
  }

  /**
   * Abre el modal de información "¿Por qué hay varias direcciones?"
   */
  openInfoModal(): void {
    this.showInfoModal.set(true);
  }

  /**
   * Cierra el modal de información
   */
  closeInfoModal(): void {
    this.showInfoModal.set(false);
  }

  /**
   * Navega a la página de login
   */
  onLogin(): void {
    // TODO: Implementar navegación a la página de login
    console.log('Navegar a Login');
  }

  /**
   * Navega a la página de registro
   */
  onRegister(): void {
    // TODO: Implementar navegación a la página de registro
    console.log('Navegar a Register');
  }
}
