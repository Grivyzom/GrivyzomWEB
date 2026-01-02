/**
 * Modelos del Calendario de Eventos - Grivyzom
 */

// ============================================================================
// TYPES
// ============================================================================

export type EventCategoryType = 'pvp' | 'evento' | 'actualizacion' | 'torneo' | 'construccion' | 'comunidad';
export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
export type PrizeRarity = 'common' | 'rare' | 'epic' | 'legendary';

// ============================================================================
// CALENDAR EVENT
// ============================================================================

export interface CalendarEvent {
    id: string;
    title: string;
    description: string;
    shortDescription?: string;

    // Date & Time
    date: string; // ISO 8601 format (YYYY-MM-DD)
    startTime: string; // HH:mm format
    endTime?: string; // HH:mm format
    duration?: number; // in minutes

    // Categorization
    category: EventCategoryType;
    status: EventStatus;

    // Visual
    bannerUrl?: string;
    imageUrl?: string;
    color?: string; // Category color override

    // Rewards
    prizes: EventPrize[];

    // Additional Info
    location?: string; // Server/World location
    maxParticipants?: number;
    currentParticipants?: number;
    requiresRegistration?: boolean;
    registrationUrl?: string;

    // User Participation & Rewards (Grovs System)
    grovs_reward?: number; // Grovs otorgados al completar el evento
    user_has_completed?: boolean; // Si el usuario actual ha completado el evento
    user_participation_status?: 'registered' | 'participated' | 'completed' | 'claimed';

    // Metadata
    createdAt?: string;
    updatedAt?: string;
}

export interface EventPrize {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    rarity?: PrizeRarity;
    position?: number; // 1st, 2nd, 3rd place
}

// ============================================================================
// CATEGORY
// ============================================================================

export interface EventCategory {
    id: EventCategoryType;
    name: string;
    icon: string; // Emoji or icon class
    color: string; // Hex color
    description?: string;
}

// ============================================================================
// CALENDAR STATE
// ============================================================================

export interface CalendarEventState {
    events: CalendarEvent[];
    categories: EventCategory[];

    // Current View State
    currentMonth: Date;
    selectedDate: Date | null;
    selectedEvent: CalendarEvent | null;

    // Filters
    activeCategories: EventCategoryType[]; // Empty = all categories
    showCompletedEvents: boolean;

    // Loading State
    loading: boolean;
    error: string | null;
}

// ============================================================================
// API RESPONSES
// ============================================================================

export interface CalendarEventApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    error?: string;
}

export interface EventsResponse {
    events: CalendarEvent[];
    total: number;
}

export interface CategoriesResponse {
    categories: EventCategory[];
}

// ============================================================================
// CALENDAR HELPERS
// ============================================================================

export interface CalendarDay {
    date: Date;
    dayNumber: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    isPast: boolean;
    hasEvents: boolean;
    events: CalendarEvent[];
}

export interface MonthData {
    year: number;
    month: number; // 0-11 (JS Date format)
    monthName: string;
    weeks: CalendarDay[][];
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const EVENT_CATEGORY_CONFIG: Record<EventCategoryType, { name: string; icon: string; color: string; bgColor: string }> = {
    pvp: {
        name: 'PvP',
        icon: '⚔️',
        color: '#ef4444',
        bgColor: '#fef2f2'
    },
    evento: {
        name: 'Evento',
        icon: '🎉',
        color: '#8b5cf6',
        bgColor: '#faf5ff'
    },
    actualizacion: {
        name: 'Actualización',
        icon: '🔄',
        color: '#3b82f6',
        bgColor: '#eff6ff'
    },
    torneo: {
        name: 'Torneo',
        icon: '🏆',
        color: '#f59e0b',
        bgColor: '#fffbeb'
    },
    construccion: {
        name: 'Construcción',
        icon: '🏗️',
        color: '#22c55e',
        bgColor: '#f0fdf4'
    },
    comunidad: {
        name: 'Comunidad',
        icon: '👥',
        color: '#ec4899',
        bgColor: '#fdf2f8'
    }
};

export const MONTH_NAMES_ES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const MONTH_NAMES_SHORT_ES = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

export const DAY_NAMES_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
export const DAY_NAMES_SHORT_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export const RARITY_COLORS = {
    common: {
        bg: '#f8fafc',
        border: '#e2e8f0',
        text: '#64748b',
        glow: 'rgba(148, 163, 184, 0.3)'
    },
    rare: {
        bg: '#eff6ff',
        border: '#3b82f6',
        text: '#1d4ed8',
        glow: 'rgba(59, 130, 246, 0.4)'
    },
    epic: {
        bg: '#faf5ff',
        border: '#8b5cf6',
        text: '#7c3aed',
        glow: 'rgba(139, 92, 246, 0.4)'
    },
    legendary: {
        bg: '#fffbeb',
        border: '#f59e0b',
        text: '#d97706',
        glow: 'rgba(245, 158, 11, 0.4)'
    }
};

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isUpcomingEvent(event: CalendarEvent): boolean {
    const eventDate = new Date(event.date);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return eventDate >= now && event.status === 'upcoming';
}

export function isOngoingEvent(event: CalendarEvent): boolean {
    return event.status === 'ongoing';
}

export function isCompletedEvent(event: CalendarEvent): boolean {
    return event.status === 'completed';
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function getCategoryConfig(category: EventCategoryType) {
    return EVENT_CATEGORY_CONFIG[category];
}

export function formatEventTime(startTime: string, endTime?: string): string {
    if (endTime) {
        return `${startTime} - ${endTime}`;
    }
    return startTime;
}

export function formatEventDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

export function formatEventDateShort(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short'
    });
}
