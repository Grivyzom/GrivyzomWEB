import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-animated-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './animated-button.html',
  styleUrl: './animated-button.css',
})
export class AnimatedButton {
  @Input() label: string = 'Button';
  @Input() icon: string = ''; // Clase del icono (ej: 'ci ci-Copy')
  @Input() iconSrc: string = ''; // Ruta de imagen del icono (ej: 'fonts/coolicons_png/Black/User/User_Add.png')
  @Input() title: string = '';
  @Input() disabled: boolean = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  @Output() buttonClick = new EventEmitter<MouseEvent>();

  onClick(event: MouseEvent) {
    if (!this.disabled) {
      this.buttonClick.emit(event);
    }
  }
}
