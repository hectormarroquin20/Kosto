import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageSelector } from '../language-selector/language-selector.js';
import { TenantService } from '../../../core/services/tenant.service.js';

@Component({
  selector: 'app-register-component',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    TranslatePipe,
    LanguageSelector
  ],
  templateUrl: './register-component.html',
  styleUrl: './register-component.scss',
})
export class RegisterComponent {
  private fb = inject(NonNullableFormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private tenantService = inject(TenantService);

  // Manejo de estado visual con Signals (Angular 20)
  hidePassword = signal(true);
  isLoading = signal(false);

  // Formulario reactivo estricto (NonNullable)
  registerForm = this.fb.group({
    companyName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  togglePassword() {
    this.hidePassword.update(value => !value);
  }

  onSubmit() {
    if (this.registerForm.invalid) return;

    this.isLoading.set(true);

    // Construimos el objeto con el tier inicial definido
    const payload = {
      company_name: this.registerForm.value.companyName,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      tier: 'freemium' // Valor inicial para registros nuevos
    };

    this.tenantService.createTenant(payload).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        console.log('Empresa creada exitosamente:', response);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Error al registrar empresa:', err);
      }
    });
  }
}
