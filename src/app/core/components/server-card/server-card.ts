import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Users, Gamepad2, ChevronRight, Clock, Wifi } from 'lucide-angular';

export interface ServerInfo {
    id: string;
    name: string;
    description: string;
    bannerUrl: string;
    version: string;
    playersOnline: number;
    maxPlayers: number;
    status: 'online' | 'offline' | 'maintenance';
    tags?: string[];
    route?: string;
}

@Component({
    selector: 'app-server-card',
    standalone: true,
    imports: [CommonModule, RouterModule, LucideAngularModule],
    templateUrl: './server-card.html',
    styleUrls: ['./server-card.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServerCardComponent {
    // Icons
    readonly icons = { Users, Gamepad2, ChevronRight, Clock, Wifi };

    // Inputs
    @Input() server!: ServerInfo;

    // Outputs
    @Output() viewMore = new EventEmitter<ServerInfo>();

    /**
     * Emite evento cuando se hace clic en "Ver más"
     */
    onViewMore(): void {
        this.viewMore.emit(this.server);
    }

    /**
     * Obtiene el porcentaje de jugadores conectados
     */
    get playerPercentage(): number {
        if (!this.server.maxPlayers) return 0;
        return Math.min(100, (this.server.playersOnline / this.server.maxPlayers) * 100);
    }

    /**
     * Obtiene la clase de color según el estado
     */
    get statusClass(): string {
        switch (this.server.status) {
            case 'online': return 'status-online';
            case 'offline': return 'status-offline';
            case 'maintenance': return 'status-maintenance';
            default: return 'status-offline';
        }
    }

    /**
     * Obtiene el texto del estado
     */
    get statusText(): string {
        switch (this.server.status) {
            case 'online': return 'En línea';
            case 'offline': return 'Desconectado';
            case 'maintenance': return 'Mantenimiento';
            default: return 'Desconocido';
        }
    }
}
