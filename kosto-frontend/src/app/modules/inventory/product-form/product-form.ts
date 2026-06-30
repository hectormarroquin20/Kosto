import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Product } from '../../../core/services/product';
import { ProductModel } from '../../../core/models/product.interface';

import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { Auth } from '../../../core/services/auth';

import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-form',
  imports: [
    ReactiveFormsModule, // <-- Vital para usar [formGroup]
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss',
})
export class ProductForm {
  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(Product);
  private readonly authService = inject(Auth); // <--- Inyectamos el gestor de sesión
  private readonly router = inject(Router);

  private readonly route = inject(ActivatedRoute);
  public isEditMode = false;
  public productId: string | null = null;

  // El formulario queda inmaculado, solo con campos de negocio
  public productForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    sale_price: [0, [Validators.required, Validators.min(0.01)]],
    is_pre_made: [true, Validators.required]
  });

  loadProductData(id: string) {
    this.productService.getProducts().subscribe({
      next: (response: any) => {

        const productList = response.data || response;

        const product = productList.find((p: any) => p.id === id);

        if (product) {
          // patchValue llena el formulario con los datos encontrados
          this.productForm.patchValue({
            name: product.name,
            sale_price: product.sale_price,
            is_pre_made: product.is_pre_made
          });
        }
      },
      error: (err) => console.error('Error cargando producto para editar:', err)
    });
  }

  ngOnInit() {
    this.productId = this.route.snapshot.paramMap.get('id');
    if (this.productId) {
      this.isEditMode = true;
      // Aquí cargarías los datos del producto para llenar el formulario
      this.loadProductData(this.productId);
    }
  }

  onSubmit() {
    if (this.productForm.invalid) return;

    // Construimos el payload combinando los datos de la UI con el tenant_id del servicio
    const payload: Partial<ProductModel> = {
      ...this.productForm.value,
      tenant_id: this.authService.getTenantId()
    } as Partial<ProductModel>;

    if (this.isEditMode) {
      if (!this.productId) {
        console.error("No se puede editar sin un ID");
        return;
      }
      // Fusión: agregamos el ID al objeto antes de enviarlo
      const updatePayload: ProductModel = {
        ...this.productForm.value,
        tenant_id: this.authService.getTenantId(),
        id: this.productId // Ahora TypeScript está feliz porque sabe que no es nulo
      } as ProductModel;

      this.productService.updateProduct(updatePayload).subscribe({
        next: (response) => {
          console.log('Producto actualizado exitosamente:', response);
          this.router.navigate(['/products']);
        },
        error: (err) => console.error('Error al guardar:', err)
      });
    } else {
      this.productService.createProduct(payload).subscribe({
        next: (response) => {
          console.log('Producto creado exitosamente:', response);
          this.router.navigate(['/products']);
        },
        error: (err) => console.error('Error al guardar:', err)
      });
    }
  }
}
