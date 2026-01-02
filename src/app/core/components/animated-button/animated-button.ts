import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-animated-button',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './animated-button.html',
  styleUrl: './animated-button.css',
})
export class AnimatedButton {
  @Input() label: string = 'Button';
  @Input() icon: any = null; // Lucide icon object (ej: Copy, User, etc.)
  @Input() iconSrc: string = ''; // Ruta de imagen del icono (alternativa)
  @Input() title: string = '';
  @Input() disabled: boolean = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() customClass: string = '';

  @Output() buttonClick = new EventEmitter<MouseEvent>();

  onClick(event: MouseEvent) {
    if (!this.disabled) {
      this.buttonClick.emit(event);
    }
  }
}
