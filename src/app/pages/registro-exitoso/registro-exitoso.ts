import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, CheckCircle, Sparkles, Home, User, Gamepad2 } from 'lucide-angular';
import { AnimatedButton } from '../../core/components/animated-button/animated-button';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-registro-exitoso',
    standalone: true,
    imports: [CommonModule, RouterModule, AnimatedButton, LucideAngularModule],
    templateUrl: './registro-exitoso.html',
    styleUrl: './registro-exitoso.css'
})
export class RegistroExitosoComponent implements OnInit {
    readonly icons = { CheckCircle, Sparkles, Home, User, Gamepad2 };

    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);

    username = '';
    minecraftUsername = '';

    ngOnInit(): void {
        // Verificar que el usuario esté autenticado
        const user = this.authService.currentUser();
        if (!user) {
            // Si no está autenticado, redirigir a login
            this.router.navigate(['/login']);
            return;
        }

        this.username = user.username;
        this.minecraftUsername = user.minecraft_username;

        // Crear efecto de confetti
        this.createConfetti();
    }

    private createConfetti(): void {
        // Simple confetti effect
        const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
        const container = document.querySelector('.confetti-container');

        if (!container) return;

        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = `${Math.random() * 3}s`;
            confetti.style.animationDuration = `${3 + Math.random() * 2}s`;
            container.appendChild(confetti);
        }

        // Clean up after animation
        setTimeout(() => {
            if (container) {
                container.innerHTML = '';
            }
        }, 6000);
    }

    goToHome(): void {
        this.router.navigate(['/']);
    }

    goToProfile(): void {
        this.router.navigate(['/perfil']);
    }
}
