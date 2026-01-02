import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, User } from '../../core/services/auth.service';

// Interface para los jugadores del ranking
export interface TopPlayer {
  position: number;
  username: string;
  minecraftUsername: string;
  value: number;
  avatarUrl: string | null;
}

@Component({
  selector: 'app-rankings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './rankings.html',
  styleUrl: './rankings.css'
})
export class RankingsComponent implements OnInit {
  private readonly authService = inject(AuthService);

  // User data (para mostrar posición del usuario actual)
  user: User | null = null;
  
  // Rankings
  selectedServer: string = 'survival';
  selectedCategory: string = 'kills';
  
  // Servidores disponibles
  servers = [
    { id: 'survival', name: 'Survival', icon: 'ci-Sword' },
    { id: 'skyblock', name: 'SkyBlock', icon: 'ci-Cloud' },
    { id: 'factions', name: 'Factions', icon: 'ci-Flag' },
    { id: 'prison', name: 'Prison', icon: 'ci-Lock' },
    { id: 'minigames', name: 'Minigames', icon: 'ci-Game_Controller_1' },
  ];
  
  // Categorías de ranking
  rankingCategories = [
    { id: 'kills', name: 'Kills', icon: 'ci-Sword' },
    { id: 'deaths', name: 'Muertes', icon: 'ci-Heart' },
    { id: 'playtime', name: 'Tiempo Jugado', icon: 'ci-Clock' },
    { id: 'blocks_mined', name: 'Bloques Minados', icon: 'ci-Cube' },
    { id: 'money', name: 'Dinero', icon: 'ci-Dollar' },
    { id: 'level', name: 'Nivel', icon: 'ci-Star' },
  ];
  
  // Datos de prueba (será reemplazado por datos del backend)
  topPlayers: TopPlayer[] = [
    { position: 1, username: 'ProGamer123', minecraftUsername: 'ProGamer123', value: 15420, avatarUrl: null },
    { position: 2, username: 'DiamondKing', minecraftUsername: 'DiamondKing', value: 12350, avatarUrl: null },
    { position: 3, username: 'MasterBuilder', minecraftUsername: 'MasterBuilder', value: 10890, avatarUrl: null },
    { position: 4, username: 'ShadowNinja', minecraftUsername: 'ShadowNinja', value: 9540, avatarUrl: null },
    { position: 5, username: 'CreeperSlayer', minecraftUsername: 'CreeperSlayer', value: 8720, avatarUrl: null },
    { position: 6, username: 'EnderDragonX', minecraftUsername: 'EnderDragonX', value: 7650, avatarUrl: null },
    { position: 7, username: 'RedstoneWiz', minecraftUsername: 'RedstoneWiz', value: 6890, avatarUrl: null },
    { position: 8, username: 'NetherKnight', minecraftUsername: 'NetherKnight', value: 5430, avatarUrl: null },
    { position: 9, username: 'PixelWarrior', minecraftUsername: 'PixelWarrior', value: 4210, avatarUrl: null },
    { position: 10, username: 'BlockMaster99', minecraftUsername: 'BlockMaster99', value: 3150, avatarUrl: null },
  ];
  
  isLoadingRankings = false;

  ngOnInit(): void {
    // Cargar datos del usuario actual (si está autenticado)
    this.user = this.authService.currentUser();
    
    // Cargar rankings iniciales
    this.loadRankings();
  }

  // Rankings methods
  selectServer(serverId: string): void {
    this.selectedServer = serverId;
    this.loadRankings();
  }

  selectCategory(categoryId: string): void {
    this.selectedCategory = categoryId;
    this.loadRankings();
  }

  loadRankings(): void {
    this.isLoadingRankings = true;
    // TODO: Conectar con el backend
    // this.rankingsService.getTopPlayers(this.selectedServer, this.selectedCategory).subscribe(...)
    
    // Simulamos una carga
    setTimeout(() => {
      this.isLoadingRankings = false;
    }, 500);
  }

  getPlayerSkinUrl(minecraftUsername: string): string {
    return `https://minotar.net/helm/${minecraftUsername}/32`;
  }

  public onSkinError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = '/static/images/placeholder.svg';
  }

  formatRankingValue(value: number, category: string): string {
    switch(category) {
      case 'money':
        return '$' + value.toLocaleString();
      case 'playtime':
        const hours = Math.floor(value / 60);
        const minutes = value % 60;
        return `${hours}h ${minutes}m`;
      default:
        return value.toLocaleString();
    }
  }

  getPositionClass(position: number): string {
    switch(position) {
      case 1: return 'position-gold';
      case 2: return 'position-silver';
      case 3: return 'position-bronze';
      default: return '';
    }
  }

  getCategoryName(): string {
    const category = this.rankingCategories.find(c => c.id === this.selectedCategory);
    return category?.name || 'Valor';
  }

  getSelectedServerName(): string {
    const server = this.servers.find(s => s.id === this.selectedServer);
    return server?.name || 'Servidor';
  }
}
