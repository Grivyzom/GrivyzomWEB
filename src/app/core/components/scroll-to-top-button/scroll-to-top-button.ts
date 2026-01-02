import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-scroll-to-top-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isButtonVisible" class="fixed bottom-8 right-8 z-50">
      <button
        (click)="scrollToTop()"
        aria-label="Scroll to top"
        class="bg-gray-800 text-white rounded-full p-3 shadow-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-transform duration-200 ease-in-out hover:scale-110"
      >
        <svg
          class="w-6 h-6"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g id="Arrow / Arrow_Up_LG">
            <path
              id="Vector"
              d="M12 3L7 8M12 3L17 8M12 3V21"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </g>
        </svg>
      </button>
    </div>
  `,
  styles: [],
})
export class ScrollToTopButtonComponent {
  isButtonVisible = false;

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const yOffset = window.pageYOffset;
    const scrollThreshold = 400; // Show button after scrolling 400px
    this.isButtonVisible = yOffset > scrollThreshold;
  }

  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }
}
