import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';

// Asegúrate de que las rutas a tus modelos y servicios sean correctas
import { ResourceModel } from '../../../core/models/resource.interface';
import { Resource } from '../../../core/services/resource';
import { Auth } from '../../../core/services/auth';

import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-resource-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatSelectModule
  ],
  templateUrl: './resource-form.html',
  styleUrl: './resource-form.scss',
})
export class ResourceForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly resourceService = inject(Resource);
  private readonly authService = inject(Auth);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  public readonly unitOptions = [
    { value: 'kg', label: 'Kilogramos (kg)' },
    { value: 'lb', label: 'Libras (lb)' },
    { value: 'lt', label: 'Litros (lt)' },
    { value: 'ml', label: 'Mililitros (ml)' },
    { value: 'gr', label: 'Gramos (gr)' },
    { value: 'unid', label: 'Unidades (unid)' }
  ];

  public isEditMode = false;
  public resourceId: string | null = null;

  // Formulario alineado EXACTAMENTE con la BD
  public resourceForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    unit_of_measure: ['', [Validators.required, Validators.maxLength(50)]],
    unit_cost: [0, [Validators.required, Validators.min(0)]],
    current_stock: [0, [Validators.required, Validators.min(0)]],
    is_active: [true] // Por defecto true
  });

  ngOnInit() {
    this.resourceId = this.route.snapshot.paramMap.get('id');
    if (this.resourceId) {
      this.isEditMode = true;
      this.loadResourceData(this.resourceId);
    }
  }

  loadResourceData(id: string) {
    this.resourceService.getResources().subscribe({
      next: (response: any) => {
        const list = response.data || response;
        const resource = list.find((r: any) => r.id === id);

        if (resource) {
          this.resourceForm.patchValue({
            name: resource.name,
            unit_of_measure: resource.unit_of_measure,
            unit_cost: resource.unit_cost,
            current_stock: resource.current_stock,
            is_active: resource.is_active
          });
        }
      },
      error: (err) => console.error('Error cargando insumo:', err)
    });
  }

  onSubmit() {
    if (this.resourceForm.invalid) return;

    const payload = {
      ...this.resourceForm.getRawValue(),
      tenant_id: this.authService.getTenantId()
    } as unknown as ResourceModel;

    if (this.isEditMode) {
      if (!this.resourceId) return;

      const updatePayload = {
        ...payload,
        id: this.resourceId
      } as unknown as ResourceModel;

      this.resourceService.updateResource(updatePayload).subscribe({
        next: () => this.router.navigate(['/resources']),
        error: (err) => console.error('Error al actualizar:', err)
      });
    } else {
      this.resourceService.createResource(payload).subscribe({
        next: () => this.router.navigate(['/resources']),
        error: (err) => console.error('Error al crear:', err)
      });
    }
  }
}