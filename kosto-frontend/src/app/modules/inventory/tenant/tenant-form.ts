import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { TenantModel } from '../../../core/models/tenant.inteface';
import { TenantService } from '../../../core/services/tenant.service';
import { IAuthService } from '../../../core/models/auth.interface';

import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-tenant-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    TranslatePipe
  ],
  templateUrl: './tenant-form.html',
})
export class TenantForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly tenantService = inject(TenantService);
  private readonly authService = inject(IAuthService);
  private readonly router = inject(Router);

  public isFieldsEnabled = false;
  public tenantId: string | null = null;

  public tenantForm = this.fb.group({
    company_name: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(3)]],
    tier: [{ value: '', disabled: true }, Validators.required],
    created_at: [{ value: '', disabled: true }],
    is_active: [{ value: true, disabled: true }]
  });

  ngOnInit() {
    // Get the tenant ID directly from the authentication service
    this.tenantId = this.authService.getTenantId();

    if (this.tenantId) {
      this.loadTenantData(this.tenantId);
    }
  }

  toggleEdit() {
    this.isFieldsEnabled = !this.isFieldsEnabled;
    this.isFieldsEnabled ? this.tenantForm.enable() : this.tenantForm.disable();
    this.tenantForm.get('created_at')?.disable();
  }

  loadTenantData(id: string) {
    this.tenantService.getTenantbyId(id).subscribe({
      next: (response: any) => {
        // response.data is now always an array: [ {company_name: "..."} ]
        const tenantArray = response.data;

        // Take the first element if it exists
        if (tenantArray && tenantArray.length > 0) {
          const tenantData = tenantArray[0];

          this.tenantForm.patchValue({
            company_name: tenantData.company_name,
            tier: tenantData.tier,
            created_at: tenantData.created_at,
            is_active: tenantData.is_active
          });
        }
      },
      error: (err) => console.error('Error loading company data:', err)
    });
  }

  onSubmit() {
    if (!this.tenantId) {
      console.error("Critical error: Tenant ID is null or undefined");
      alert("Could not identify your account. Please reload the page.");
      return;
    }

    if (this.tenantForm.invalid) return;

    // getRawValue() brings the fields even if they are disabled
    const rawData = this.tenantForm.getRawValue();

    const payload = {
      ...this.tenantForm.getRawValue(),
      id: this.tenantId // Ensure sending the ID
    } as unknown as TenantModel;

    this.tenantService.updateTenant(payload).subscribe({
      next: () => {
        alert('Company updated');
        this.tenantForm.disable(); // Re-lock after saving
        this.isFieldsEnabled = false;
      }
    });
  }
}