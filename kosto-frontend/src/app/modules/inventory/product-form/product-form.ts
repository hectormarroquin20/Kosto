import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { ProductService } from '../../../core/services/product.service';
import { ProductModel } from '../../../core/models/product.interface';

import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';

import { IAuthService } from '../../../core/models/auth.interface';

import { ActivatedRoute } from '@angular/router';

import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-product-form',
  imports: [
    ReactiveFormsModule, // <-- Vital para usar [formGroup]
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    TranslatePipe,
    MatSlideToggleModule
  ],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss',
})
export class ProductForm {
  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);
  private readonly authService = inject(IAuthService); // <--- Inyectamos el gestor de sesión
  private readonly router = inject(Router);

  private readonly route = inject(ActivatedRoute);
  public isEditMode = false;
  public productId: string | null = null;

  // El formulario queda inmaculado, solo con campos de negocio
  public productForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    sale_price: [0, [Validators.required, Validators.min(0.01)]],
    is_pre_made: [true, Validators.required],
    create_recipe: [false]
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

    const formValue = this.productForm.value;
    const payload: Partial<ProductModel> & { create_recipe?: boolean } = {
      tenant_id: this.authService.getTenantId() ?? undefined,
      name: formValue.name ?? '',
      sale_price: formValue.sale_price ?? 0,
      is_pre_made: formValue.is_pre_made ?? true,
      create_recipe: formValue.create_recipe ?? false
    };

    if (this.isEditMode) {
      if (!this.productId) return;

      const updatePayload: ProductModel = {
        ...payload,
        id: this.productId
      } as ProductModel;

      this.productService.updateProduct(updatePayload).subscribe({
        next: () => this.router.navigate(['/products']),
        error: (err) => console.error('Error al actualizar:', err)
      });

    } else {
      this.productService.createProduct(payload).subscribe({
        next: (response: any) => {
          const newProduct = response.data[0];
          const shouldCreateRecipe = this.productForm.get('create_recipe')?.value;

          if (shouldCreateRecipe && newProduct.id) {
            // Redirigimos a la edición del producto en el módulo de recetas
            // (Como acordamos, ahora editamos basándonos en el product_id)
            this.router.navigate(['/recipes/edit', newProduct.id]);
          } else {
            this.router.navigate(['/products']);
          }
        },
        error: (err) => console.error('Error al crear:', err)
      });
    }
  }
}
