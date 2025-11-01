import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  logoUrl = 'https://via.placeholder.com/117x117?text=Grivyzom';

  onObjectivosClick(): void {
    console.log('Objetivos clicked');
  }

  onContactoClick(): void {
    console.log('Contacto clicked');
  }

  onSocialClick(platform: string): void {
    console.log(`${platform} clicked`);
  }
}