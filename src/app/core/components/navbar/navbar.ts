import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, BookOpen, Trophy, Settings, User, LogOut, Copy, FileText, Terminal, HelpCircle, Calculator, Map, Wrench, Palette, Home, MessageSquare, ShoppingBag, Vote, FolderOpen } from 'lucide-angular';
import { NavDropdownComponent, DropdownItem } from '../nav-dropdown/nav-dropdown';
import { ProfileDropdownComponent } from '../profile-dropdown/profile-dropdown';
import { ServerIpService, IPServer } from '../../services/server-ip.service';
import { AuthService } from '../../services/auth.service';
import { GrovsService } from '../../services/grovs.service';
import { IpAddressesDropdownComponent } from '../ip-addresses-dropdown/ip-addresses-dropdown';
import { BaseModalComponent } from '../base-modal/base-modal';
import { WhyMultipleServersComponent } from '../why-multiple-servers/why-multiple-servers';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    NavDropdownComponent,
    ProfileDropdownComponent,
    NgOptimizedImage,
    IpAddressesDropdownComponent,
    BaseModalComponent,
    WhyMultipleServersComponent,
    RouterModule,
    LucideAngularModule
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  // Lucide icons
  readonly icons = {
    BookOpen, Trophy, Settings, User, LogOut, Copy, FileText, Terminal,
    HelpCircle, Calculator, Map, Wrench, Palette, Home, MessageSquare,
    ShoppingBag, Vote, FolderOpen
  };

  // Recursos dropdown consolidado
  readonly resourcesMenuItems: DropdownItem[] = [
    { label: 'Wikipedia', url: 'https://wiki.grivyzom.com/', icon: FileText, external: true },
    { label: 'Codex', url: '/codex', icon: BookOpen },
    { label: 'Mapas', url: '/maps', icon: Map },
    { label: 'Crafteos', url: '/crafteos', icon: Wrench },
  ];
  private readonly serverIpService = inject(ServerIpService);
  private readonly authService = inject(AuthService);
  private readonly grovsService = inject(GrovsService);
  private readonly router = inject(Router); // Inject Router

  // Estado reactivo
  readonly isMenuOpen = signal(false);
  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());
  readonly currentUser = computed(() => this.authService.currentUser());
  readonly showCopyFeedback = signal(false);
  readonly showIPModal = signal(false);
  readonly showInfoModal = signal(false);

  // Computed values desde el servicio
  readonly selectedServer = computed(() => this.serverIpService.selectedServer());
  readonly serverIP = computed(() => this.selectedServer().ip);

  // Grovs balance
  readonly grovsBalance = computed(() => this.grovsService.balance());

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
    this.router.navigate(['/login']);
  }

  /**
   * Navega a la página de registro
   */
  onRegister(): void {
    this.router.navigate(['/register']);
  }

  /**
   * Cierra la sesión del usuario
   */
  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        console.log('Logout successful');
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Navegar de todas formas
        this.router.navigate(['/']);
      }
    });
  }

  /**
   * Obtiene la URL del avatar del usuario
   */
  getAvatarUrl(): string {
    const user = this.currentUser();
    return user?.avatar_url || 'assets/img/placeholder.svg';
  }

  public onAvatarError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/img/placeholder.svg';
  }
}
