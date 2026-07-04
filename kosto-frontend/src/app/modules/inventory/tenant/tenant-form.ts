import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { TenantModel } from '../../../core/models/tenant.inteface';
import { Tenant } from '../../../core/services/tenant';
import { IAuthService } from '../../../core/models/auth.interface';

import { TranslatePipe, TranslateService } from '@ngx-translate/core';


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
  private readonly tenantService = inject(Tenant);
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
    // Obtenemos el ID directamente del servicio de autenticación
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
    // Si tu servicio devuelve todo el objeto de respuesta
    // this.tenantService.getTenantbyId(id).subscribe({
    //   next: (response: any) => {
    //     console.log('¿Qué contiene response.data?', response.data);
    //     console.log('Respuesta cruda:', response);

    //     // AQUÍ ESTÁ EL CAMBIO: Extraemos .data antes de aplicar al formulario
    //     const tenantData = response.data;

    //     if (tenantData) {
    //       // Si tenantData es el objeto directo, esto funcionará perfecto
    //       this.tenantForm.patchValue({
    //         company_name: tenantData.company_name,
    //         tier: tenantData.tier,
    //         created_at: tenantData.created_at,
    //         is_active: tenantData.is_active
    //       });
    //     }
    //   },
    //   error: (err) => console.error('Error cargando datos de compañía:', err)
    // });
    this.tenantService.getTenantbyId(id).subscribe({
      next: (response: any) => {
        // response.data ahora es siempre un array: [ {company_name: "..."} ]
        const tenantArray = response.data;

        // Tomamos el primer elemento si existe
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
      error: (err) => console.error('Error cargando datos de compañía:', err)
    });
  }

  onSubmit() {
    if (!this.tenantId) {
      console.error("Error crítico: El ID del tenant es nulo o undefined");
      alert("No se pudo identificar tu cuenta. Por favor, recarga la página.");
      return;
    }

    if (this.tenantForm.invalid) return;

    // getRawValue() trae los campos incluso si están deshabilitados
    const rawData = this.tenantForm.getRawValue();

    const payload = {
      ...this.tenantForm.getRawValue(),
      id: this.tenantId // Aseguramos enviar el ID
    } as unknown as TenantModel;

    this.tenantService.updateTenant(payload).subscribe({
      next: () => {
        alert('Compañía actualizada');
        this.tenantForm.disable(); // Volvemos a bloquear tras guardar
        this.isFieldsEnabled = false;
      }
    });
  }
}