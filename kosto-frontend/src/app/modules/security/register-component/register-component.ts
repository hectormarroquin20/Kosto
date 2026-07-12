import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';

import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { LanguageSelector } from '../language-selector/language-selector.js';
import { TenantService } from '../../../core/services/tenant.service.js';
import { FormKostoComponent } from "@/components/form-kosto/form-kosto";

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
    LanguageSelector,
    FormKostoComponent
  ],
  templateUrl: './register-component.html',
  styleUrl: './register-component.scss',
})
export class RegisterComponent {
  private fb = inject(NonNullableFormBuilder);
  private router = inject(Router);
  private tenantService = inject(TenantService);
  private translate = inject(TranslateService);
  private snackBar = inject(MatSnackBar);

  // State management with Signals (Angular 20)
  hidePassword = signal(true);
  isLoading = signal(false);

  // Reactive strict form
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

    const payload = {
      company_name: this.registerForm.value.companyName,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      tier: 'freemium'
    };

    this.tenantService.createTenant(payload).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading.set(false);

        // We get the code sent by the backend
        const errorCode = err.error?.code || 'ERROR_GENERIC';

        // We translate using the i18n key
        this.translate.get(`ERRORS.${errorCode}`).subscribe(translatedMessage => {
          this.snackBar.open(translatedMessage, 'Close', { duration: 5000 });
        });
      }
    });

  }
}

