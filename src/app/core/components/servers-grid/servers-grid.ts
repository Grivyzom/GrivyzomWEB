import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServerCardComponent, ServerInfo } from '../server-card/server-card';

@Component({
    selector: 'app-servers-grid',
    standalone: true,
    imports: [CommonModule, ServerCardComponent],
    templateUrl: './servers-grid.html',
    styleUrls: ['./servers-grid.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServersGridComponent {
    // Inputs
    @Input() servers: ServerInfo[] = [];
    @Input() title: string = 'Nuestros Servidores';
    @Input() subtitle: string = 'Explora los diferentes mundos disponibles';
    @Input() columns: 2 | 3 | 4 = 3;
    @Input() showHeader: boolean = true;

    // Outputs
    @Output() serverClick = new EventEmitter<ServerInfo>();

    /**
     * Maneja el click en "Ver más" de un servidor
     */
    onServerViewMore(server: ServerInfo): void {
        this.serverClick.emit(server);
    }

    /**
     * TrackBy para optimizar el rendering
     */
    trackByServerId(index: number, server: ServerInfo): string {
        return server.id;
    }
}
