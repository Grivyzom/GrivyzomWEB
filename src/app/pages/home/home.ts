import { Component, ChangeDetectionStrategy, inject, computed, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HeroSectionComponent } from '../../core/components/hero-section/hero-section';
import { ActionBar } from '../../core/components/action-bar/action-bar';
import { GameHeaderComponent } from '../../core/components/game-header/game-header';
import { ServersGridComponent } from '../../core/components/servers-grid/servers-grid';
import { EventCalendarCardComponent } from '../../core/components/event-calendar-card/event-calendar-card';
import { AuthService } from '../../core/services/auth.service';
import { ServersService } from '../../core/services/servers.service';
import { ServerInfo } from '../../core/components/server-card/server-card';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeroSectionComponent, ActionBar, GameHeaderComponent, ServersGridComponent, EventCalendarCardComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly serversService = inject(ServersService);
  private readonly router = inject(Router);
  private serversSubscription?: Subscription;

  // Computed para verificar si el usuario está autenticado
  protected readonly isAuthenticated = computed(() => this.authService.isAuthenticated());

  // Servers desde el servicio (signals)
  protected readonly servers = this.serversService.servers;
  protected readonly serversLoading = this.serversService.loading;
  protected readonly serversError = this.serversService.error;

  // Estadísticas del servidor (Signals)
  protected readonly showStats = signal(true);
  protected readonly usersOnline = signal<string>('0');
  protected readonly totalUsers = signal<string>('0');

  // Configuración del slider
  protected readonly autoPlay = true;
  protected readonly autoPlayInterval = 5000;

  ngOnInit(): void {
    // Cargar estadísticas públicas
    this.loadStats();

    // Inicia auto-refresh cada 30 segundos
    this.serversSubscription = this.serversService.startAutoRefresh(30000).subscribe();
  }

  /**
   * Carga las estadísticas públicas desde el backend
   */
  private loadStats(): void {
    this.serversService.getPublicStats().subscribe({
      next: (stats) => {
        this.usersOnline.set(stats.players_online.toString());
        this.totalUsers.set(stats.total_users.toString());
      },
      error: () => {
        this.usersOnline.set('0');
        this.totalUsers.set('0');
      }
    });
  }

  ngOnDestroy(): void {
    this.serversSubscription?.unsubscribe();
  }

  /**
   * Maneja eventos del botón hero
   */
  protected onHeroButtonClick(): void {
  }

  /**
   * Maneja el cambio de slide
   */
  protected onSlideChange(index: number): void {
  }

  /**
   * Maneja click en servidor
   */
  protected onServerClick(server: ServerInfo): void {
    console.log('Server clicked:', server);
    // TODO: Navegar a la página del servidor o mostrar modal
  }

  /**
   * Navega a la tienda
   */
  protected navigateToStore(): void {
    this.router.navigate(['/tienda']);
  }

  /**
   * Abre Minecraft Bedrock o Java
   */
  protected playNow(): void {
    // Intenta abrir el protocolo de Minecraft
    window.location.href = 'minecraft:';
    
    // Opcional: Podríamos mostrar un mensaje si el usuario no tiene Minecraft instalado
    // o simplemente copiar la IP al portapapeles.
    console.log('Intentando abrir Minecraft...');
  }
}
