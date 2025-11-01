import { Component, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { AnimatedButton } from '../animated-button/animated-button';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, AnimatedButton, NgOptimizedImage],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  serverIP = 'grivyzom.network';
  isMenuOpen = signal(false);
  isAuthenticated = signal(false); // Estado de autenticación del usuario

  // Ruta del GIF mini
  videoSource = 'assets/videos/Puente_Magico_a_la_Biblioteca_Grivyzom.gif';

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

  onLogin() {
    // TODO: Implementar navegación a la página de login
    console.log('Navegar a Login');
  }

  onRegister() {
    // TODO: Implementar navegación a la página de registro
    console.log('Navegar a Register');
  }
}
