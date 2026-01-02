import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, TrendingUp, TrendingDown, Minus } from 'lucide-angular';

export type TrendDirection = 'up' | 'down' | 'neutral';

@Component({
    selector: 'app-stat-card',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './stat-card.html',
    styleUrl: './stat-card.css'
})
export class StatCardComponent {
    @Input() title: string = '';
    @Input() value: string | number = 0;
    @Input() icon: any;
    @Input() iconColor: string = '#8b5cf6';
    @Input() trend?: number;
    @Input() trendLabel?: string;

    readonly icons = { TrendingUp, TrendingDown, Minus };

    get trendDirection(): TrendDirection {
        if (!this.trend || this.trend === 0) return 'neutral';
        return this.trend > 0 ? 'up' : 'down';
    }

    get trendIcon() {
        switch (this.trendDirection) {
            case 'up': return this.icons.TrendingUp;
            case 'down': return this.icons.TrendingDown;
            default: return this.icons.Minus;
        }
    }

    get formattedTrend(): string {
        if (!this.trend) return '0%';
        const sign = this.trend > 0 ? '+' : '';
        return `${sign}${this.trend}%`;
    }
}
