import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import {
  GrovsState,
  GrovTransaction,
  GrovsApiResponse,
  BalanceResponse,
  TransactionsResponse,
  DailyRewardResponse,
  EventRewardResponse,
  CheckoutWithGrovsResponse,
  DAILY_LOGIN_CONFIG
} from '../models/grovs.models';

/**
 * Servicio de gestión de Grovs (puntos de recompensa)
 *
 * Gestiona el balance de grovs del usuario, transacciones, rewards diarios,
 * completación de eventos y compras con grovs.
 *
 * Usa Angular Signals para gestión reactiva de estado.
 */
@Injectable({
  providedIn: 'root'
})
export class GrovsService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/grovs`;

  // ========================================================================
  // STATE (Signal-based)
  // ========================================================================

  private readonly state = signal<GrovsState>({
    balance: 0,
    total_earned: 0,
    total_spent: 0,
    current_streak: 0,
    longest_streak: 0,
    last_daily_claim: undefined,

    transactions: [],
    transactions_loading: false,
    transactions_total: 0,
    transactions_page: 1,

    daily_reward_available: false,
    next_streak_milestone: undefined,

    loading: false,
    error: null
  });

  // ========================================================================
  // PUBLIC SELECTORS (Computed Signals)
  // ========================================================================

  readonly balance = computed(() => this.state().balance);
  readonly totalEarned = computed(() => this.state().total_earned);
  readonly totalSpent = computed(() => this.state().total_spent);
  readonly currentStreak = computed(() => this.state().current_streak);
  readonly longestStreak = computed(() => this.state().longest_streak);
  readonly dailyRewardAvailable = computed(() => this.state().daily_reward_available);
  readonly nextStreakMilestone = computed(() => this.state().next_streak_milestone);

  readonly transactions = computed(() => this.state().transactions);
  readonly transactionsLoading = computed(() => this.state().transactions_loading);

  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  // Formatted values
  readonly formattedBalance = computed(() =>
    `${this.balance().toLocaleString()} Grovs`
  );

  // ========================================================================
  // CONSTRUCTOR - Auto-sync with AuthService
  // ========================================================================

  constructor() {
    // Efecto que sincroniza balance cuando el usuario cambia
    // allowSignalWrites: true permite actualizar signals dentro del effect
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        // Solo actualizar si hay un usuario autenticado
        this.updateStateFromUser(user);
        this.checkDailyRewardAvailability();
      } else {
        this.resetState();
      }
    }, { allowSignalWrites: true });
  }

  // ========================================================================
  // API METHODS - BALANCE
  // ========================================================================

  /**
   * Obtiene el balance completo del usuario desde el backend
   */
  getBalance(): Observable<BalanceResponse | null> {
    this.updateState({ loading: true, error: null });

    return this.http.get<GrovsApiResponse<BalanceResponse>>(
      `${this.apiUrl}/balance/`,
      { withCredentials: true }
    ).pipe(
      tap(response => {
        if (response.success) {
          this.updateState({
            balance: response.data.balance,
            total_earned: response.data.total_earned,
            total_spent: response.data.total_spent,
            current_streak: response.data.current_streak,
            longest_streak: response.data.longest_streak,
            last_daily_claim: response.data.last_daily_claim,
            loading: false
          });

          // También sincronizar con AuthService
          this.syncBalanceToAuthService(response.data.balance);
          this.checkDailyRewardAvailability();
        }
      }),
      map(response => response.data),
      catchError(error => {
        console.error('Error fetching grovs balance:', error);
        this.updateState({
          loading: false,
          error: 'Error al cargar balance de Grovs'
        });
        return of(null);
      })
    );
  }

  /**
   * Recarga solo el balance (lightweight)
   */
  refreshBalance(): void {
    this.getBalance().subscribe();
  }

  // ========================================================================
  // API METHODS - TRANSACTIONS
  // ========================================================================

  /**
   * Obtiene historial de transacciones con paginación
   */
  getTransactions(page: number = 1, perPage: number = 20): Observable<GrovTransaction[]> {
    this.updateState({ transactions_loading: true });

    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    return this.http.get<GrovsApiResponse<TransactionsResponse>>(
      `${this.apiUrl}/transactions/`,
      { params, withCredentials: true }
    ).pipe(
      tap(response => {
        if (response.success) {
          this.updateState({
            transactions: response.data.transactions,
            transactions_total: response.data.total,
            transactions_page: response.data.page,
            transactions_loading: false
          });
        }
      }),
      map(response => response.data.transactions),
      catchError(error => {
        console.error('Error fetching transactions:', error);
        this.updateState({ transactions_loading: false });
        return of([]);
      })
    );
  }

  // ========================================================================
  // API METHODS - EARN GROVS
  // ========================================================================

  /**
   * Reclama recompensa diaria por login
   */
  claimDailyReward(): Observable<DailyRewardResponse | null> {
    this.updateState({ loading: true, error: null });

    return this.http.post<GrovsApiResponse<DailyRewardResponse>>(
      `${this.apiUrl}/daily-reward/claim/`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(response => {
        if (response.success) {
          const data = response.data;

          // Actualizar estado local
          this.updateState({
            balance: data.new_balance,
            current_streak: data.reward.current_streak,
            last_daily_claim: new Date().toISOString(),
            daily_reward_available: false,
            loading: false
          });

          // Sincronizar con AuthService
          this.syncBalanceToAuthService(data.new_balance);

          // Añadir transacción al inicio del historial
          this.prependTransaction({
            id: data.transaction_id,
            user_id: this.authService.currentUser()?.id || '',
            type: 'daily_login',
            amount: data.reward.total_grovs,
            balance_after: data.new_balance,
            status: 'completed',
            description: `Login diario (Día ${data.reward.current_streak})`,
            created_at: new Date().toISOString()
          });
        }
      }),
      map(response => response.success ? response.data : null),
      catchError(error => {
        console.error('Error claiming daily reward:', error);
        this.updateState({
          loading: false,
          error: error.error?.error || 'Error al reclamar recompensa diaria'
        });
        return of(null);
      })
    );
  }

  /**
   * Registra finalización de evento y otorga grovs
   */
  completeEvent(eventId: string): Observable<EventRewardResponse | null> {
    this.updateState({ loading: true, error: null });

    return this.http.post<GrovsApiResponse<EventRewardResponse>>(
      `${this.apiUrl}/events/${eventId}/complete/`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(response => {
        if (response.success) {
          const data = response.data;

          this.updateState({
            balance: data.new_balance,
            loading: false
          });

          this.syncBalanceToAuthService(data.new_balance);

          this.prependTransaction({
            id: data.transaction_id,
            user_id: this.authService.currentUser()?.id || '',
            type: 'event_completion',
            amount: data.grovs_earned,
            balance_after: data.new_balance,
            status: 'completed',
            description: `Evento completado: ${data.event_title}`,
            reference_id: eventId,
            reference_type: 'event',
            created_at: new Date().toISOString()
          });
        }
      }),
      map(response => response.success ? response.data : null),
      catchError(error => {
        console.error('Error completing event:', error);
        this.updateState({
          loading: false,
          error: error.error?.error || 'Error al completar evento'
        });
        return of(null);
      })
    );
  }

  // ========================================================================
  // API METHODS - SPEND GROVS
  // ========================================================================

  /**
   * Comprar productos con grovs (checkout)
   */
  checkoutWithGrovs(items: Array<{ productId: string; quantity: number }>): Observable<CheckoutWithGrovsResponse | null> {
    this.updateState({ loading: true, error: null });

    return this.http.post<GrovsApiResponse<CheckoutWithGrovsResponse>>(
      `${this.apiUrl}/checkout/`,
      { items },
      { withCredentials: true }
    ).pipe(
      tap(response => {
        if (response.success) {
          const data = response.data;

          this.updateState({
            balance: data.new_balance,
            loading: false
          });

          this.syncBalanceToAuthService(data.new_balance);

          // Añadir transacción de compra
          this.prependTransaction({
            id: data.order_id,
            user_id: this.authService.currentUser()?.id || '',
            type: 'store_purchase',
            amount: -data.grovs_spent,
            balance_after: data.new_balance,
            status: 'completed',
            description: `Compra: ${data.items_purchased.join(', ')}`,
            reference_id: data.order_id,
            reference_type: 'purchase',
            created_at: new Date().toISOString()
          });
        }
      }),
      map(response => response.success ? response.data : null),
      catchError(error => {
        console.error('Error in grovs checkout:', error);
        this.updateState({
          loading: false,
          error: error.error?.error || 'Error al procesar compra con Grovs'
        });
        return of(null);
      })
    );
  }

  /**
   * Valida si el usuario tiene suficientes grovs para una compra
   */
  canAfford(grovsRequired: number): boolean {
    return this.balance() >= grovsRequired;
  }

  // ========================================================================
  // HELPERS
  // ========================================================================

  /**
   * Sincroniza balance de User en AuthService
   * NOTE: No llamamos getUserProfile() aquí porque crea un loop infinito:
   * effect() -> syncBalanceToAuthService() -> getUserProfile() -> actualiza currentUser() -> effect() ...
   * El balance ya está actualizado localmente y se sincronizará en el próximo refresh.
   */
  private syncBalanceToAuthService(newBalance: number): void {
    // Implementación vacía para evitar loop infinito
    // El balance se sincroniza naturalmente cuando el usuario recarga la página
    // o cuando se llama getUserProfile() desde otro lugar
  }

  /**
   * Actualiza estado desde User del AuthService
   */
  private updateStateFromUser(user: any): void {
    this.updateState({
      balance: user.grovs_balance || 0,
      total_earned: user.total_grovs_earned || 0,
      total_spent: user.total_grovs_spent || 0,
      current_streak: user.current_login_streak || 0,
      longest_streak: user.longest_login_streak || 0,
      last_daily_claim: user.last_daily_reward_claim
    });
  }

  /**
   * Verifica si el reward diario está disponible
   */
  private checkDailyRewardAvailability(): void {
    const lastClaim = this.state().last_daily_claim;

    if (!lastClaim) {
      this.updateState({ daily_reward_available: true });
      return;
    }

    const lastClaimDate = new Date(lastClaim);
    const now = new Date();

    // Comparar solo fechas (ignorar horas)
    lastClaimDate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((now.getTime() - lastClaimDate.getTime()) / (1000 * 60 * 60 * 24));

    this.updateState({ daily_reward_available: daysDiff >= 1 });
  }

  /**
   * Añade transacción al inicio del array (para reflejar cambios instantáneos)
   */
  private prependTransaction(transaction: GrovTransaction): void {
    this.updateState({
      transactions: [transaction, ...this.state().transactions]
    });
  }

  /**
   * Resetea el estado cuando el usuario hace logout
   */
  private resetState(): void {
    this.state.set({
      balance: 0,
      total_earned: 0,
      total_spent: 0,
      current_streak: 0,
      longest_streak: 0,
      last_daily_claim: undefined,
      transactions: [],
      transactions_loading: false,
      transactions_total: 0,
      transactions_page: 1,
      daily_reward_available: false,
      next_streak_milestone: undefined,
      loading: false,
      error: null
    });
  }

  /**
   * Actualiza estado parcial
   */
  private updateState(partialState: Partial<GrovsState>): void {
    this.state.update(current => ({ ...current, ...partialState }));
  }
}
