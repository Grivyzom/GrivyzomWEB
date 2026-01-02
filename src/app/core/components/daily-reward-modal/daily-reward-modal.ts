import { Component, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Gift, TrendingUp, Trophy, X } from 'lucide-angular';
import { GrovsService } from '../../services/grovs.service';
import { AuthService } from '../../services/auth.service';
import { calculateDailyReward, DAILY_LOGIN_CONFIG } from '../../models/grovs.models';

@Component({
  selector: 'app-daily-reward-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './daily-reward-modal.html',
  styleUrl: './daily-reward-modal.css'
})
export class DailyRewardModalComponent {
  // Lucide icons
  readonly icons = { Gift, TrendingUp, Trophy, X };

  // Services
  private readonly grovsService = inject(GrovsService);
  private readonly authService = inject(AuthService);

  // State
  readonly isOpen = signal(false);
  readonly isClaiming = signal(false);
  readonly showSuccess = signal(false);
  readonly claimedReward = signal<{
    total: number;
    base: number;
    bonus: number;
    streak: number;
  } | null>(null);

  // Computed
  readonly isAuthenticated = this.authService.isAuthenticated;
  readonly dailyRewardAvailable = this.grovsService.dailyRewardAvailable;
  readonly currentStreak = this.grovsService.currentStreak;
  readonly nextMilestone = this.grovsService.nextStreakMilestone;

  // Calculate projected reward
  readonly projectedReward = computed(() => {
    const streak = this.currentStreak();
    return calculateDailyReward(streak);
  });

  // Progress to next milestone
  readonly milestoneProgress = computed(() => {
    const current = this.currentStreak();
    const next = this.nextMilestone();

    if (!next) {
      return 100; // No more milestones
    }

    const previous = DAILY_LOGIN_CONFIG.milestones
      .filter(m => m.days < current)
      .sort((a, b) => b.days - a.days)[0]?.days || 0;

    const progress = ((current - previous) / (next.days - previous)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  });

  // Flag to prevent showing modal multiple times
  private hasShownModal = false;

  constructor() {
    // Auto-show modal when authenticated and reward is available
    // allowSignalWrites: true required for setting isOpen inside effect
    effect(() => {
      const isAuth = this.isAuthenticated();
      const rewardAvailable = this.dailyRewardAvailable();

      // Reset flag on logout
      if (!isAuth) {
        this.hasShownModal = false;
        return;
      }

      // Show modal only once per session
      if (isAuth && rewardAvailable && !this.isOpen() && !this.hasShownModal) {
        this.hasShownModal = true;
        // Delay 3 seconds for page to stabilize after login
        setTimeout(() => {
          this.isOpen.set(true);
        }, 3000);
      }
    }, { allowSignalWrites: true });
  }

  /**
   * Claim the daily reward
   */
  claimReward(): void {
    if (this.isClaiming()) return;

    this.isClaiming.set(true);

    this.grovsService.claimDailyReward().subscribe({
      next: (response) => {
        if (response) {
          // Store claimed reward data
          this.claimedReward.set({
            total: response.reward.total_grovs,
            base: response.reward.grovs_amount,
            bonus: response.reward.streak_bonus || 0,
            streak: response.reward.current_streak
          });

          // Show success animation
          this.showSuccess.set(true);

          // Close modal after 2 seconds
          setTimeout(() => {
            this.close();
          }, 2500);
        } else {
          // Error occurred
          alert('Error al reclamar la recompensa. Intenta más tarde.');
          this.isClaiming.set(false);
        }
      },
      error: (error) => {
        console.error('Error claiming reward:', error);
        alert('Error al reclamar la recompensa. Intenta más tarde.');
        this.isClaiming.set(false);
      }
    });
  }

  /**
   * Close the modal
   */
  close(): void {
    this.isOpen.set(false);
    this.showSuccess.set(false);
    this.isClaiming.set(false);
    this.claimedReward.set(null);
  }

  /**
   * Stop propagation for modal content clicks
   */
  onModalContentClick(event: Event): void {
    event.stopPropagation();
  }
}
