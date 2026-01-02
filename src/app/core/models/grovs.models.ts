/**
 * Modelos del Sistema de Puntos Grovs - Grivyzom
 *
 * Este archivo define toda la arquitectura de datos del sistema de recompensas
 * con puntos llamados "Grovs" que los usuarios pueden ganar y gastar.
 */

// ============================================================================
// TIPOS BASE
// ============================================================================

/**
 * Tipos de transacciones de Grovs
 */
export type GrovTransactionType =
  | 'daily_login'           // Login diario
  | 'login_streak_bonus'    // Bonus por racha de días consecutivos
  | 'event_completion'      // Completar evento del calendario
  | 'purchase_cashback'     // Cashback por compra con dinero real
  | 'store_purchase'        // Compra en tienda con grovs
  | 'admin_adjustment'      // Ajuste manual por admin
  | 'admin_grant'           // Regalo de admin
  | 'admin_deduct';         // Deducción de admin

/**
 * Estados de transacciones
 */
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

/**
 * Métodos de pago soportados en productos
 */
export type PaymentMethod = 'money' | 'grovs' | 'both';

// ============================================================================
// TRANSACTION
// ============================================================================

/**
 * Representa una transacción de Grovs (ganados o gastados)
 */
export interface GrovTransaction {
  id: string;
  user_id: string;
  type: GrovTransactionType;
  amount: number;                     // Positivo = ganado, Negativo = gastado
  balance_after: number;              // Balance resultante tras la transacción
  status: TransactionStatus;

  // Metadata contextual
  description: string;                // Descripción legible
  reference_id?: string;              // ID de evento, producto, etc.
  reference_type?: 'event' | 'product' | 'purchase' | 'manual';

  // Admin context (solo para admin_* types)
  admin_user_id?: string;
  admin_username?: string;
  admin_reason?: string;

  // Timestamps
  created_at: string;                 // ISO 8601
  processed_at?: string;
}

// ============================================================================
// LOGIN STREAK
// ============================================================================

/**
 * Racha de login del usuario
 */
export interface LoginStreak {
  user_id: string;
  current_streak: number;             // Días consecutivos actuales
  longest_streak: number;             // Mejor racha histórica
  last_login_date: string;            // ISO date (YYYY-MM-DD)
  last_reward_claim: string;          // ISO datetime del último claim
  total_daily_logins: number;         // Total de días que ha hecho login
  streak_milestones_reached: number[]; // Ej: [7, 14, 30] días alcanzados
}

/**
 * Recompensa diaria calculada
 */
export interface DailyReward {
  grovs_amount: number;               // Grovs base
  streak_bonus?: number;              // Bonus adicional si hay racha
  total_grovs: number;                // Base + bonus
  current_streak: number;
  next_milestone?: StreakMilestone;
}

/**
 * Hitos de racha de login
 */
export interface StreakMilestone {
  days: number;                       // Días requeridos
  bonus_grovs: number;                // Grovs extra al alcanzar
  title: string;                      // Ej: "¡Racha de 7 días!"
  icon?: string;
}

// ============================================================================
// EVENT PARTICIPATION
// ============================================================================

/**
 * Participación del usuario en eventos
 */
export interface EventParticipation {
  id: string;
  user_id: string;
  event_id: string;
  event_title: string;

  // Status
  status: 'registered' | 'participated' | 'completed' | 'claimed';

  // Rewards
  grovs_reward: number;               // Grovs otorgados por este evento
  has_claimed_reward: boolean;

  // Placement (opcional, para torneos)
  placement?: number;                 // 1st, 2nd, 3rd, etc.

  // Timestamps
  registered_at?: string;
  completed_at?: string;
  reward_claimed_at?: string;
}

// ============================================================================
// STORE PRODUCT EXTENSIONS
// ============================================================================

/**
 * Información de pago de un producto
 */
export interface ProductPaymentInfo {
  payment_methods: PaymentMethod[];  // ['money', 'grovs'] o solo uno
  price_money?: number;               // Precio en dinero (USD/EUR)
  price_grovs?: number;               // Precio en grovs
  discount_price_money?: number;
  discount_price_grovs?: number;
  cashback_percent?: number;          // % de cashback en grovs (si compra con dinero)
  cashback_grovs?: number;            // Grovs calculados de cashback
}

// ============================================================================
// GROVS STATE
// ============================================================================

/**
 * Estado del servicio de Grovs (signal-based)
 */
export interface GrovsState {
  balance: number;
  total_earned: number;
  total_spent: number;
  current_streak: number;
  longest_streak: number;
  last_daily_claim?: string;

  // Transactions
  transactions: GrovTransaction[];
  transactions_loading: boolean;
  transactions_total: number;
  transactions_page: number;

  // Rewards
  daily_reward_available: boolean;
  next_streak_milestone?: StreakMilestone;

  // Loading states
  loading: boolean;
  error: string | null;
}

// ============================================================================
// API RESPONSES
// ============================================================================

/**
 * Formato estándar de respuesta API
 */
export interface GrovsApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

/**
 * Respuesta de balance del usuario
 */
export interface BalanceResponse {
  balance: number;
  total_earned: number;
  total_spent: number;
  current_streak: number;
  longest_streak: number;
  last_daily_claim?: string;
}

/**
 * Respuesta de transacciones paginadas
 */
export interface TransactionsResponse {
  transactions: GrovTransaction[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

/**
 * Respuesta al reclamar recompensa diaria
 */
export interface DailyRewardResponse {
  reward: DailyReward;
  new_balance: number;
  transaction_id: string;
  can_claim_tomorrow: string;        // ISO date del próximo claim
}

/**
 * Respuesta al completar evento
 */
export interface EventRewardResponse {
  grovs_earned: number;
  new_balance: number;
  transaction_id: string;
  event_title: string;
}

/**
 * Respuesta de checkout con Grovs
 */
export interface CheckoutWithGrovsResponse {
  success: boolean;
  order_id: string;
  items_purchased: string[];
  grovs_spent: number;
  new_balance: number;
}

// ============================================================================
// ADMIN INTERFACES
// ============================================================================

/**
 * Estadísticas globales de Grovs (admin)
 */
export interface AdminGrovsStats {
  total_grovs_in_circulation: number;
  total_grovs_earned_all_time: number;
  total_grovs_spent_all_time: number;
  average_balance_per_user: number;
  active_users_with_grovs: number;

  // Distribution
  grovs_by_source: {
    daily_login: number;
    events: number;
    cashback: number;
    admin_grants: number;
  };

  grovs_spent_by_category: {
    [product_type: string]: number;
  };

  // Top users
  top_earners: Array<{
    user_id: string;
    username: string;
    total_earned: number;
  }>;

  top_spenders: Array<{
    user_id: string;
    username: string;
    total_spent: number;
  }>;
}

/**
 * Detalle de Grovs de un usuario (admin)
 */
export interface AdminUserGrovsDetail {
  user_id: string;
  username: string;
  email: string;

  // Balances
  current_balance: number;
  total_earned: number;
  total_spent: number;

  // Streaks
  current_streak: number;
  longest_streak: number;

  // Recent activity
  recent_transactions: GrovTransaction[];
  last_daily_claim?: string;

  // Events
  events_completed: number;
  total_event_grovs: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Configuración de recompensas por login diario
 */
export const DAILY_LOGIN_CONFIG = {
  base_reward: 10,                    // Grovs base por login diario
  streak_multiplier: 0.5,             // +0.5 grovs por cada día de racha
  max_streak_bonus: 50,               // Máximo bonus por racha

  milestones: [
    { days: 7, bonus_grovs: 50, title: '¡Racha de 7 días!', icon: '🔥' },
    { days: 14, bonus_grovs: 100, title: '¡Racha de 14 días!', icon: '💎' },
    { days: 30, bonus_grovs: 300, title: '¡Racha de 30 días!', icon: '👑' },
    { days: 60, bonus_grovs: 750, title: '¡Racha de 60 días!', icon: '🌟' },
    { days: 90, bonus_grovs: 1500, title: '¡Racha de 90 días!', icon: '🏆' }
  ] as StreakMilestone[]
};

/**
 * Configuración de cashback por rol
 */
export const CASHBACK_CONFIG = {
  default_percent: 5,                 // 5% cashback default
  vip_percent: 10,                    // 10% para VIP
  elite_percent: 15                   // 15% para ELITE
};

/**
 * Etiquetas para tipos de transacciones
 */
export const TRANSACTION_TYPE_LABELS: Record<GrovTransactionType, string> = {
  daily_login: 'Login Diario',
  login_streak_bonus: 'Bonus de Racha',
  event_completion: 'Evento Completado',
  purchase_cashback: 'Cashback de Compra',
  store_purchase: 'Compra en Tienda',
  admin_adjustment: 'Ajuste de Admin',
  admin_grant: 'Regalo de Admin',
  admin_deduct: 'Deducción de Admin'
};

/**
 * Iconos para tipos de transacciones
 */
export const TRANSACTION_TYPE_ICONS: Record<GrovTransactionType, string> = {
  daily_login: '🌅',
  login_streak_bonus: '🔥',
  event_completion: '🎉',
  purchase_cashback: '💰',
  store_purchase: '🛒',
  admin_adjustment: '⚙️',
  admin_grant: '🎁',
  admin_deduct: '⚠️'
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calcula la recompensa diaria basada en la racha actual
 */
export function calculateDailyReward(currentStreak: number): DailyReward {
  const base = DAILY_LOGIN_CONFIG.base_reward;
  const streakBonus = Math.min(
    currentStreak * DAILY_LOGIN_CONFIG.streak_multiplier,
    DAILY_LOGIN_CONFIG.max_streak_bonus
  );

  // Find next milestone
  const nextMilestone = DAILY_LOGIN_CONFIG.milestones.find(
    m => m.days > currentStreak
  );

  return {
    grovs_amount: base,
    streak_bonus: streakBonus,
    total_grovs: base + streakBonus,
    current_streak: currentStreak,
    next_milestone: nextMilestone
  };
}

/**
 * Formatea cantidad de grovs para mostrar
 */
export function formatGrovs(amount: number): string {
  return `${amount.toLocaleString()} Grovs`;
}

/**
 * Obtiene color de transacción según tipo
 */
export function getTransactionColor(type: GrovTransactionType): string {
  const earnTypes: GrovTransactionType[] = [
    'daily_login',
    'login_streak_bonus',
    'event_completion',
    'purchase_cashback',
    'admin_grant'
  ];

  return earnTypes.includes(type) ? '#22c55e' : '#ef4444';
}

/**
 * Determina si una transacción es de ganancia
 */
export function isEarnTransaction(type: GrovTransactionType): boolean {
  const earnTypes: GrovTransactionType[] = [
    'daily_login',
    'login_streak_bonus',
    'event_completion',
    'purchase_cashback',
    'admin_grant'
  ];
  return earnTypes.includes(type);
}
