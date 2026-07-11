import { Component, inject, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';

import { RecipeItemsService } from '@/core/services/recipe-items.service';
import { ProductService } from '@/core/services/product.service';
import { ResourceService } from '@/core/services/resource.service';
import { FormKostoComponent } from "@/components/form-kosto/form-kosto";

@Component({
  selector: 'app-recipe-form',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslatePipe, FormKostoComponent],
  templateUrl: './recipe-form.html',
})
export class RecipeForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly recipeService = inject(RecipeItemsService);
  private readonly productService = inject(ProductService);
  private readonly resourceService = inject(ResourceService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  public isEditMode = false;
  public products = signal<any[]>([]);
  public resources = signal<any[]>([]);
  public isIngredientsLoading = signal<boolean>(false);

  public recipeForm = this.fb.group({
    product_id: this.fb.control({ value: '', disabled: false }, Validators.required),
    ingredients: this.fb.array([])
  });

  get ingredients() { return this.recipeForm.get('ingredients') as FormArray; }

  ngOnInit() {
    // Detect if it's an edit (product ID) or quick creation (query parameter)
    const productId = this.route.snapshot.paramMap.get('id') || this.route.snapshot.queryParamMap.get('productId');

    forkJoin({
      products: this.productService.getProducts(),
      resources: this.resourceService.getResources()
    }).subscribe(({ products, resources }) => {
      this.products.set((products as any).data || products);
      this.resources.set((resources as any).data || resources);

      if (productId) {
        this.isEditMode = true;
        this.recipeForm.patchValue({ product_id: productId });
        this.recipeForm.get('product_id')?.disable();
        this.loadRecipeByProduct(productId);
      }
    });

    this.recipeForm.get('product_id')?.valueChanges.subscribe(val => val && this.loadRecipeByProduct(val));
  }

  loadRecipeByProduct(productId: string) {
    this.isIngredientsLoading.set(true);
    this.recipeService.getRecipeItems().subscribe({
      next: (res) => {
        const list = (res as any).data || res;
        this.ingredients.clear();
        const items = list.filter((p: any) => p.product_id === productId);
        items.length > 0 ? items.forEach((i: any) => this.addIngredient(i.resource_id, i.required_quantity)) : this.addIngredient();
        this.isIngredientsLoading.set(false);
      },
      error: () => this.isIngredientsLoading.set(false)
    });
  }

  addIngredient(resource_id = '', required_quantity = 0) {
    this.ingredients.push(this.fb.group({
      resource_id: [resource_id, Validators.required],
      required_quantity: [required_quantity, [Validators.required, Validators.min(0.01)]]
    }));
  }

  removeIngredient(index: number) { this.ingredients.removeAt(index); }

  getResourceUnit(resourceId: string): string {
    const resource = this.resources().find(r => r.id === resourceId);
    return resource ? resource.unit_of_measure : 'units';
  }

  getIngredientCost(group: any): number {
    const resource = this.resources().find(r => r.id === group.get('resource_id')?.value);
    return resource ? (resource.unit_cost * (group.get('required_quantity')?.value || 0)) : 0;
  }

  get totalRecipeCost(): number {
    return this.ingredients.controls.reduce((acc, control) => acc + this.getIngredientCost(control), 0);
  }

  getProductPrice(productId: string | null | undefined): number {
    const product = this.products().find(p => String(p.id) === String(productId));
    return product ? (product.sale_price || 0) : 0;
  }

  get costColor(): string {
    const totalCost = this.totalRecipeCost;
    const productPrice = this.getProductPrice(this.recipeForm.get('product_id')?.value);
    if (productPrice === 0) return 'lightgray';
    return totalCost < productPrice ? 'lightblue' : 'red';
  }

  compareById = (o1: any, o2: any) => String(o1) === String(o2);

  onSubmit() {
    if (this.recipeForm.invalid) return;

    // 1. Get the values
    const rawValue = this.recipeForm.getRawValue();
    const { product_id, ingredients } = rawValue;

    // 2. Data normalization (ensure no null)
    // Convert any null/undefined value to an empty string or handle the error
    const sanitizedProductId = (product_id || '').toString();

    if (!sanitizedProductId) {
      console.error("The product_id is required");
      return;
    }

    // 3. Safe mapping
    const ops = ingredients.map((ing: any) => {
      // Ensure resource_id is a string and quantity is a number
      const resourceId = (ing.resource_id || '').toString();
      const quantity = parseFloat(ing.required_quantity || '0');

      return this.recipeService.updateRecipeItem({
        product_id: sanitizedProductId,
        resource_id: resourceId,
        required_quantity: quantity
      } as any);
    });

    // 4. Execution
    forkJoin(ops).subscribe({
      next: () => {
        console.log('Recipe saved/updated successfully');
        this.router.navigate(['/recipes']);
      },
      error: (err) => console.error('Error saving:', err)
    });
  }
}