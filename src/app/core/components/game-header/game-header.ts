import { Component, OnInit, Output, EventEmitter, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Copy, Play, Check } from 'lucide-angular';
import { GameHeaderService, GameHeaderData } from '../../services/game-header.service';
import { ServerIpService, IPServer } from '../../services/server-ip.service';
import { BaseModalComponent } from '../base-modal/base-modal';
import { IpAddressesDropdownComponent } from '../ip-addresses-dropdown/ip-addresses-dropdown';
import { WhyMultipleServersComponent } from '../why-multiple-servers/why-multiple-servers';

@Component({
  selector: 'app-game-header',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    BaseModalComponent,
    IpAddressesDropdownComponent,
    WhyMultipleServersComponent
  ],
  templateUrl: './game-header.html',
  styleUrls: ['./game-header.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GameHeaderComponent implements OnInit {
  private readonly serverIpService = inject(ServerIpService);
  private readonly gameHeaderService = inject(GameHeaderService);

  // Lucide icons
  readonly CopyIcon = Copy;
  readonly PlayIcon = Play;
  readonly CheckIcon = Check;

  // Component state using signals for reactivity
  readonly data = signal<GameHeaderData>({
    title: 'GRIVYZOM',
    subtitle: 'A WORLD OF ADVENTURE AND CREATIVITY',
    button_text: 'JUGAR AHORA!',
    image_url: '',
    video_url: ''
  });

  readonly isLoading = signal(true);
  readonly imageReady = signal(false);
  readonly showCopiedFeedback = signal(false);

  // Modal states
  readonly showIPModal = signal(false);
  readonly showInfoModal = signal(false);

  // Server IP state
  readonly selectedServer = computed(() => this.serverIpService.selectedServer());
  readonly serverIP = computed(() => this.selectedServer().ip);

  // Computed states for template
  readonly hasImage = computed(() => !!this.data().image_url);
  readonly hasVideo = computed(() => !!this.data().video_url);
  readonly contentReady = computed(() => !this.isLoading() && (this.imageReady() || !this.hasImage()));

  // Events
  @Output() buttonClick = new EventEmitter<void>();
  @Output() copyIPClick = new EventEmitter<void>();

  ngOnInit(): void {
    this.loadGameHeaderData();
  }

  private loadGameHeaderData(): void {
    this.gameHeaderService.getGameHeaderData().subscribe({
      next: (response) => {
        this.data.set(response);
        this.isLoading.set(false);

        // Preload image if exists
        if (response.image_url) {
          this.preloadImage(response.image_url);
        } else {
          this.imageReady.set(true);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.imageReady.set(true);
      }
    });
  }

  private preloadImage(url: string): void {
    const img = new Image();

    img.onload = () => {
      this.imageReady.set(true);
    };

    img.onerror = () => {
      this.data.update(d => ({ ...d, image_url: '' }));
      this.imageReady.set(true);
    };

    img.src = url;
  }

  // Modal methods
  openIPModal(): void {
    this.showIPModal.set(true);
    this.copyIPClick.emit();
  }

  closeIPModal(): void {
    this.showIPModal.set(false);
  }

  openInfoModal(): void {
    this.showInfoModal.set(true);
  }

  closeInfoModal(): void {
    this.showInfoModal.set(false);
  }

  onServerSelect(server: IPServer): void {
    // Server selection is handled by the dropdown component
    this.closeIPModal();
  }

  onPlayClick(): void {
    this.buttonClick.emit();
  }
}
