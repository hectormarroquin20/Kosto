import { Component, computed, inject, signal } from '@angular/core';
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

import { toSignal } from '@angular/core/rxjs-interop';
import { TenantModel } from '@/core/models/tenant.inteface.js';

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

  private passwordValue = signal('');

  // Reactive strict form
  registerForm = this.fb.group({
    companyName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [
      Validators.required,
      Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    ]],
    password: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/)
    ]]
  });

  constructor() {
    this.registerForm.controls.password.valueChanges.subscribe(val => {
      this.passwordValue.set(val || '');
    });
  }

  togglePassword() {
    this.hidePassword.update(value => !value);
  }

  passwordStatus = computed(() => {
    const p = this.passwordValue();
    return {
      length: p.length >= 8,
      number: /\d/.test(p),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(p),
      upper: /[A-Z]/.test(p),
      lower: /[a-z]/.test(p)
    };
  });

  onSubmit() {
    if (this.registerForm.invalid) return;

    this.isLoading.set(true);

    const payload: TenantModel = {
      company_name: this.registerForm.value.companyName!,
      email: this.registerForm.value.email!,
      password: this.registerForm.value.password!
    };

    this.tenantService.createTenant(payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading.set(false);
        const errorCode = err.error?.code || 'ERROR_GENERIC';

        // 1. Logic to highlight specific fields
        if (errorCode === 'TENANT_EXISTS') {
          this.registerForm.get('email')?.setErrors({ alreadyTaken: true });
        } else if (errorCode === 'ERROR_PASSWORD_POLICY') {
          this.registerForm.get('password')?.setErrors({ weakPassword: true });
        }

        // 2. Show message in SnackBar
        this.translate.get(`ERRORS.${errorCode}`).subscribe(msg => {
          this.snackBar.open(msg, 'Close', { duration: 5000 });
        });
      }
    });
  }
}

