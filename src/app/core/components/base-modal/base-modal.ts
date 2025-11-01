import { Component, Input, Output, EventEmitter, signal, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-base-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './base-modal.html',
  styleUrls: ['./base-modal.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('250ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms cubic-bezier(0.4, 0, 1, 1)', style({ opacity: 0 }))
      ])
    ]),
    trigger('slideUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px) scale(0.95)' }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ]),
      transition(':leave', [
        animate('200ms cubic-bezier(0.4, 0, 1, 1)', style({ opacity: 0, transform: 'translateY(20px) scale(0.95)' }))
      ])
    ])
  ]
})
export class BaseModalComponent implements AfterViewInit, OnDestroy {
  @Input() title: string = '';
  @Input() showCloseButton: boolean = true;
  @Input() maxWidth: string = '500px';
  @Output() onClose = new EventEmitter<void>();

  @ViewChild('modalContent', { static: false }) modalContent?: ElementRef<HTMLDivElement>;

  private previousActiveElement: HTMLElement | null = null;
  private keydownListener?: (event: KeyboardEvent) => void;

  ngAfterViewInit(): void {
    // Store the previously focused element to restore later
    this.previousActiveElement = document.activeElement as HTMLElement;

    // Focus the modal content
    setTimeout(() => {
      this.modalContent?.nativeElement.focus();
    }, 100);

    // Add keyboard event listener for Escape key
    this.keydownListener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        this.close();
      }

      // Trap focus within modal
      if (event.key === 'Tab') {
        this.handleTabKey(event);
      }
    };

    document.addEventListener('keydown', this.keydownListener);
  }

  ngOnDestroy(): void {
    // Restore focus to the previously active element
    if (this.previousActiveElement) {
      this.previousActiveElement.focus();
    }

    // Remove keyboard event listener
    if (this.keydownListener) {
      document.removeEventListener('keydown', this.keydownListener);
    }
  }

  close(): void {
    this.onClose.emit();
  }

  onOverlayClick(): void {
    this.close();
  }

  onContentClick(event: Event): void {
    event.stopPropagation();
  }

  /**
   * Handle Tab key to trap focus within modal
   */
  private handleTabKey(event: KeyboardEvent): void {
    if (!this.modalContent) return;

    const focusableElements = this.modalContent.nativeElement.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const focusableArray = Array.from(focusableElements);
    const firstElement = focusableArray[0];
    const lastElement = focusableArray[focusableArray.length - 1];

    if (event.shiftKey) {
      // Shift + Tab: moving backwards
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      }
    } else {
      // Tab: moving forwards
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }
  }
}
