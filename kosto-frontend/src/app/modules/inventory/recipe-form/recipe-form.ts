import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';

import { RecipeItems } from '../../../core/services/recipe-items';
import { RecipeItem } from '../../../core/models/recipe-item';
import { Auth } from '../../../core/services/auth';

import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { Product } from '../../../core/services/product';
import { Resource } from '../../../core/services/resource';

@Component({
  selector: 'app-recipe-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './recipe-form.html',
  styleUrl: './recipe-form.scss',
})
export class RecipeForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly recipeService = inject(RecipeItems);
  private readonly productService = inject(Product);
  private readonly resourceService = inject(Resource);

  private readonly authService = inject(Auth);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  public isEditMode = false;
  public recipeId: string | null = null; // Cambiado por semántica (era productId)
  public products = signal<any[]>([]);
  public resources = signal<any[]>([]);

  // CORRECCIÓN: Inicializamos los IDs como strings ('') para que coincidan con UUID
  public recipeForm = this.fb.group({
    product_id: ['', Validators.required],
    resource_id: ['', Validators.required],
    required_quantity: ['', [Validators.required, Validators.min(0.01)]],
    is_active: [true]
  });

  ngOnInit() {
    // 1. Cargar productos para el dropdown
    this.productService.getProducts().subscribe(res => {
      this.products.set((res as any).data || res);
    });
    this.resourceService.getResources().subscribe(res =>
      this.resources.set((res as any).data || res));

    this.recipeId = this.route.snapshot.paramMap.get('id');
    if (this.recipeId) {
      this.isEditMode = true;
      this.loadRecipeData(this.recipeId);
    }
  }

  // loadRecipeData(id: string) {
  //   this.recipeService.getRecipeItems().subscribe({
  //     next: (response: any) => {
  //       const recipeList = response.data || response;
  //       const recipe = recipeList.find((p: any) => p.id === id);

  //       if (recipe) {
  //         this.recipeForm.patchValue({
  //           product_id: recipe.product_id,
  //           resource_id: recipe.resource_id,
  //           required_quantity: recipe.required_quantity,
  //           is_active: recipe.is_active
  //         });
  //       }
  //     },
  //     error: (err) => console.error('Error cargando receta para editar:', err)
  //   });
  // }

  loadRecipeData(id: string) {
    this.recipeService.getRecipeItems().subscribe(res => {
      const list = (res as any).data || res;
      const recipe = list.find((p: any) => p.id === id);
      if (recipe) this.recipeForm.patchValue(recipe);
    });
  }

  // onSubmit() {
  //   if (this.recipeForm.invalid) return;

  //   // Casteo seguro extrayendo todos los valores en crudo
  //   const payload = {
  //     ...this.recipeForm.getRawValue(),
  //     tenant_id: this.authService.getTenantId()
  //   } as unknown as RecipeItem;

  //   if (this.isEditMode) {
  //     if (!this.recipeId) return;

  //     const updatePayload = {
  //       ...payload,
  //       id: this.recipeId
  //     } as unknown as RecipeItem;

  //     this.recipeService.updateRecipeItem(updatePayload).subscribe({
  //       next: (response) => {
  //         console.log('Receta actualizada:', response);
  //         this.router.navigate(['/recipes']); // Corrección de ruta
  //       },
  //       error: (err) => console.error('Error al guardar:', err)
  //     });
  //   } else {
  //     this.recipeService.createRecipeItem(payload).subscribe({
  //       next: (response) => {
  //         console.log('Receta creada:', response);
  //         this.router.navigate(['/recipes']); // Corrección de ruta
  //       },
  //       error: (err) => console.error('Error al guardar:', err)
  //     });
  //   }
  // }

  onSubmit() {
    if (this.recipeForm.invalid) return;
    const payload = this.recipeForm.getRawValue() as RecipeItem;

    if (this.isEditMode && this.recipeId) {
      this.recipeService.updateRecipeItem({ ...payload, id: this.recipeId }).subscribe(() => this.router.navigate(['/recipes']));
    } else {
      this.recipeService.createRecipeItem(payload).subscribe(() => this.router.navigate(['/recipes']));
    }
  }
}