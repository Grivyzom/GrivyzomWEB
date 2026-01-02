import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, CheckCircle, Gift } from 'lucide-angular';
import { GrovsService } from '../../../services/grovs.service';

@Component({
  selector: 'app-event-completion-button',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './event-completion-button.html',
  styleUrl: './event-completion-button.css'
})
export class EventCompletionButtonComponent {
  // Lucide icons
  readonly icons = { CheckCircle, Gift };

  // Services
  private readonly grovsService = inject(GrovsService);

  // Inputs
  @Input() eventId!: string;
  @Input() eventTitle!: string;
  @Input() grovsReward?: number;
  @Input() hasCompleted: boolean = false;

  // Output
  @Output() completed = new EventEmitter<void>();

  // State
  readonly isCompleting = signal(false);

  /**
   * Complete the event
   */
  completeEvent(): void {
    if (this.isCompleting() || this.hasCompleted) return;

    this.isCompleting.set(true);

    this.grovsService.completeEvent(this.eventId).subscribe({
      next: (response) => {
        if (response) {
          // Success - emit completion event
          this.completed.emit();
          this.hasCompleted = true;
        } else {
          // Error occurred
          alert('Error al completar el evento. Intenta más tarde.');
        }
        this.isCompleting.set(false);
      },
      error: (error) => {
        console.error('Error completing event:', error);
        const errorMessage = error.error?.error || 'Error al completar el evento. Intenta más tarde.';
        alert(errorMessage);
        this.isCompleting.set(false);
      }
    });
  }
}
