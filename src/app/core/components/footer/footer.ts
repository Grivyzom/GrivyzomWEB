import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router'; // Import RouterLink

@Component({
  selector: 'app-footer',
  standalone: true, // Assuming it's standalone, which it should be with imports array
  imports: [CommonModule, NgOptimizedImage, RouterLink], // Add RouterLink here
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class FooterComponent { // Change class name to FooterComponent
  logoUrl = 'https://via.placeholder.com/117x117?text=Grivyzom';

  onObjectivosClick(): void {
    console.log('Objetivos clicked');
  }

  // Removed onContactoClick as it's now handled by routerLink
  onSocialClick(platform: string): void {
    console.log(`${platform} clicked`);
  }
}