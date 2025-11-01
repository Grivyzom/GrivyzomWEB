import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  serverIP = 'grivyzom.network';
  isMenuOpen = signal(false);

  // Ruta del video mini
  videoSource = 'assets/videos/Puente_Magico_a_la_Biblioteca_Grivyzom.mp4';

  toggleMenu() {
    this.isMenuOpen.set(!this.isMenuOpen());
  }

  copyIP() {
    navigator.clipboard.writeText(this.serverIP).then(() => {
      console.log('IP copiada al portapapeles');
      // Aquí podrías agregar un toast o notificación visual
    }).catch(err => {
      console.error('Error al copiar IP:', err);
    });
  }
}
