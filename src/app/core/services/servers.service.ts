import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap, interval, switchMap, startWith } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ServerInfo } from '../components/server-card/server-card';

/**
 * Respuesta de la API de servidores
 */
export interface ServersApiResponse {
    success: boolean;
    servers: ServerInfo[];
    lastUpdate: string;
}

/**
 * Estadísticas públicas del servidor
 */
export interface PublicStats {
    total_users: number;
    players_online: number;
    status: string;
}

/**
 * Estado interno del servicio
 */
interface ServersState {
    servers: ServerInfo[];
    loading: boolean;
    error: string | null;
    lastUpdate: Date | null;
}

@Injectable({
    providedIn: 'root'
})
export class ServersService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/servers/`;

    // Estado reactivo con signals
    private readonly state = signal<ServersState>({
        servers: [],
        loading: false,
        error: null,
        lastUpdate: null
    });

    // Selectores públicos (computed signals)
    readonly servers = computed(() => this.state().servers);
    readonly loading = computed(() => this.state().loading);
    readonly error = computed(() => this.state().error);
    readonly lastUpdate = computed(() => this.state().lastUpdate);

    // Estadísticas computadas
    readonly totalPlayersOnline = computed(() =>
        this.state().servers.reduce((acc, server) => acc + server.playersOnline, 0)
    );

    readonly serversOnline = computed(() =>
        this.state().servers.filter(s => s.status === 'online').length
    );

    /**
     * Obtiene la lista de servidores desde la API
     */
    getServers(): Observable<ServersApiResponse> {
        this.updateState({ loading: true, error: null });

        return this.http.get<ServersApiResponse>(this.apiUrl).pipe(
            tap(response => {
                if (response.success) {
                    this.updateState({
                        servers: response.servers,
                        loading: false,
                        lastUpdate: new Date()
                    });
                }
            }),
            catchError(error => {
                console.error('Error fetching servers:', error);
                this.updateState({
                    loading: false,
                    error: 'Error al cargar los servidores'
                });
                return of({
                    success: false,
                    servers: [],
                    lastUpdate: new Date().toISOString()
                });
            })
        );
    }

    /**
     * Inicia auto-refresh de servidores cada X segundos
     * @param intervalMs Intervalo en milisegundos (default: 30 segundos)
     */
    startAutoRefresh(intervalMs: number = 30000): Observable<ServersApiResponse> {
        return interval(intervalMs).pipe(
            startWith(0),
            switchMap(() => this.getServers())
        );
    }

    /**
     * Obtiene estadísticas públicas del servidor
     */
    getPublicStats(): Observable<PublicStats> {
        return this.http.get<PublicStats>(`${environment.apiUrl}/stats/public/`).pipe(
            catchError(error => {
                console.error('Error fetching public stats:', error);
                return of({ total_users: 0, players_online: 0, status: 'offline' });
            })
        );
    }

    /**
     * Obtiene un servidor específico por ID
     */
    getServerById(id: string): Observable<ServerInfo | null> {
        return this.http.get<{ success: boolean; server: ServerInfo }>(`${this.apiUrl}${id}/`).pipe(
            tap(response => {
                if (response.success && response.server) {
                    // Actualiza el servidor en el estado si existe
                    const currentServers = this.state().servers;
                    const index = currentServers.findIndex(s => s.id === id);
                    if (index >= 0) {
                        const updatedServers = [...currentServers];
                        updatedServers[index] = response.server;
                        this.updateState({ servers: updatedServers });
                    }
                }
            }),
            switchMap(response => of(response.success ? response.server : null)),
            catchError(error => {
                console.error(`Error fetching server ${id}:`, error);
                return of(null);
            })
        );
    }

    /**
     * Actualiza el estado del servicio
     */
    private updateState(partialState: Partial<ServersState>): void {
        this.state.update(current => ({ ...current, ...partialState }));
    }

    /**
     * Limpia el estado (útil al desloguearse o cambiar de página)
     */
    clearState(): void {
        this.state.set({
            servers: [],
            loading: false,
            error: null,
            lastUpdate: null
        });
    }
}
