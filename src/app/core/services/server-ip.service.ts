import { Injectable, signal, computed } from '@angular/core';

export interface IPServer {
  id: string;
  name: string;
  ip: string;
  icon: string;
  type: 'classic' | 'play' | 'bedrock';
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ServerIpService {
  // Estado reactivo con signals
  private readonly servers = signal<IPServer[]>([
    {
      id: 'classic',
      name: 'IP Classic Grivyzom',
      ip: 'classic.grivyzom.com',
      icon: 'assets/img/java_logo_icon.png',
      type: 'classic',
      description: 'Servidores clásicos de la network'
    },
    {
      id: 'play',
      name: 'IP Play Grivyzom',
      ip: 'play.grivyzom.com',
      icon: 'assets/img/java_logo_icon.png',
      type: 'play',
      description: 'Nueva distribución de servidores'
    },
    {
      id: 'bedrock',
      name: 'IP Bedrock Grivyzom',
      ip: 'bedrock.grivyzom.com:21892',
      icon: 'assets/img/bedrock_icon_.jpg',
      type: 'bedrock',
      description: 'Network compatible con Bedrock'
    }
  ]);

  private readonly selectedServerId = signal<string | null>('classic');

  // Notificación de copia exitosa
  private readonly copyNotification = signal<{
    message: string;
    show: boolean;
    timestamp: number;
  }>({
    message: '',
    show: false,
    timestamp: 0
  });

  // Computed values
  readonly allServers = computed(() => this.servers());
  readonly selectedServer = computed(() => {
    const id = this.selectedServerId();
    return this.servers().find(s => s.id === id) || this.servers()[0];
  });
  readonly notification = computed(() => this.copyNotification());

  /**
   * Selecciona un servidor por ID
   */
  selectServer(serverId: string): void {
    const server = this.servers().find(s => s.id === serverId);
    if (server) {
      this.selectedServerId.set(serverId);
    }
  }

  /**
   * Obtiene la IP del servidor seleccionado
   */
  getSelectedIp(): string {
    return this.selectedServer().ip;
  }

  /**
   * Copia una IP al portapapeles con feedback visual
   */
  async copyToClipboard(ip: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(ip);
      this.showNotification(`IP ${ip} copiada al portapapeles`);
      return true;
    } catch (err) {
      console.error('Error al copiar IP:', err);
      this.showNotification('Error al copiar IP', true);
      return false;
    }
  }

  /**
   * Muestra una notificación temporal
   */
  private showNotification(message: string, isError = false): void {
    this.copyNotification.set({
      message,
      show: true,
      timestamp: Date.now()
    });

    // Auto-ocultar después de 3 segundos
    setTimeout(() => {
      this.hideNotification();
    }, 3000);
  }

  /**
   * Oculta la notificación
   */
  hideNotification(): void {
    this.copyNotification.update(state => ({
      ...state,
      show: false
    }));
  }

  /**
   * Obtiene un servidor por ID
   */
  getServerById(id: string): IPServer | undefined {
    return this.servers().find(s => s.id === id);
  }

  /**
   * Obtiene servidores por tipo
   */
  getServersByType(type: 'classic' | 'play' | 'bedrock'): IPServer[] {
    return this.servers().filter(s => s.type === type);
  }
}
