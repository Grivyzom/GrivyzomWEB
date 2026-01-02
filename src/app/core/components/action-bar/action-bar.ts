import { Component, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, User, Crown, Gamepad2, ExternalLink } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-action-bar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './action-bar.html',
  styleUrl: './action-bar.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionBar {
  private authService = inject(AuthService);

  // Icons
  readonly icons = {
    User,
    Crown,
    Gamepad2,
    ExternalLink
  };

  private user = this.authService.currentUser;

  // Player info
  playerName = computed(() => this.user()?.minecraft_username || 'Steve');
  playerRank = computed(() => this.user()?.role_display || 'Guest');
  playerSkinUrl = computed(() => `https://minotar.net/bust/${this.playerName()}/80`);

  // Banner - Image and Video support
  activeBanner = computed(() => this.user()?.active_banner || null);
  bannerImageUrl = computed(() => this.activeBanner()?.image_url || null);
  bannerVideoUrl = computed(() => this.activeBanner()?.video_url || null);
  hasBanner = computed(() => !!this.bannerImageUrl() || !!this.bannerVideoUrl());
  hasVideo = computed(() => !!this.bannerVideoUrl());

  // Status (could be expanded with real data later)
  isOnline = computed(() => true);

  public onSkinError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/img/placeholder.svg';
  }
}
