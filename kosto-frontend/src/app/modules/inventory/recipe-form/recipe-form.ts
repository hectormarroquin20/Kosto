// import { Component, effect, inject, OnInit, signal } from '@angular/core';
// import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
// import { Router, ActivatedRoute, RouterLink } from '@angular/router';
// import { forkJoin } from 'rxjs';
// import { CommonModule } from '@angular/common';
// import { MatSelectModule } from '@angular/material/select';
// import { MatButtonModule } from '@angular/material/button';
// import { MatInputModule } from '@angular/material/input';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatCardModule } from '@angular/material/card';
// import { MatIconModule } from '@angular/material/icon';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { TranslatePipe } from '@ngx-translate/core';

// import { RecipeItems } from '../../../core/services/recipe-items';
// import { Product } from '../../../core/services/product';
// import { Resource } from '../../../core/services/resource';

// @Component({
//   selector: 'app-recipe-form',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, MatIconModule, MatProgressSpinnerModule, TranslatePipe],
//   templateUrl: './recipe-form.html',
// })
// export class RecipeForm implements OnInit {
//   private readonly fb = inject(FormBuilder);
//   private readonly recipeService = inject(RecipeItems);
//   private readonly productService = inject(Product);
//   private readonly resourceService = inject(Resource);
//   private readonly router = inject(Router);
//   private readonly route = inject(ActivatedRoute);

//   private editId: string | null = null;

//   public isEditMode = false;
//   public products = signal<any[]>([]);
//   public resources = signal<any[]>([]);
//   public isIngredientsLoading = signal<boolean>(false);

//   public recipeForm = this.fb.group({
//     product_id: ['', Validators.required],
//     ingredients: this.fb.array([])
//   });

//   get ingredients() { return this.recipeForm.get('ingredients') as FormArray; }

//   constructor() {
//     // 2. Este efecto se dispara AUTOMÁTICAMENTE en cuanto 'products' recibe datos
//     effect(() => {
//       const prods = this.products();
//       const idFromUrl = this.editId;

//       if (prods.length > 0 && idFromUrl && !this.isEditMode) {
//         // DIAGNÓSTICO:
//         console.log("Opciones disponibles en el select:", prods.map(p => p.id));
//         console.log("ID que intentamos setear:", idFromUrl);

//         // Verificamos si realmente existe coincidencia
//         const match = prods.find(p => String(p.id) === String(idFromUrl));
//         console.log("¿Hubo match?:", !!match);

//         this.isEditMode = true;
//         this.recipeForm.patchValue({ product_id: idFromUrl });
//         this.loadRecipeByProduct(idFromUrl);
//       }
//     });
//   }

//   ngOnInit() {
//     this.editId = this.route.snapshot.paramMap.get('id'); // Guardamos el ID

//     forkJoin({
//       products: this.productService.getProducts(),
//       resources: this.resourceService.getResources(),
//       recipeItems: this.recipeService.getRecipeItems() // 1. Traemos todo de una vez
//     }).subscribe(({ products, resources, recipeItems }) => {
//       this.products.set((products as any).data || products);
//       this.resources.set((resources as any).data || resources);

//       const recipeIdFromUrl = this.route.snapshot.paramMap.get('id');

//       if (recipeIdFromUrl) {
//         this.isEditMode = true;

//         // Deshabilita el control programáticamente
//         this.recipeForm.get('product_id')?.disable();

//         const list = (recipeItems as any).data || recipeItems;
//         const recipe = list.find((r: any) => r.id === recipeIdFromUrl);

//         if (recipe) {
//           this.recipeForm.patchValue({ product_id: recipe.product_id });
//           this.loadRecipeByProduct(recipe.product_id);
//         }
//       }
//     });

//     this.recipeForm.get('product_id')?.valueChanges.subscribe(val => val && this.loadRecipeByProduct(val));
//   }

//   loadRecipeByProduct(productId: string) {
//     this.isIngredientsLoading.set(true);
//     this.recipeService.getRecipeItems().subscribe({
//       next: (res) => {
//         const list = (res as any).data || res;
//         this.ingredients.clear();
//         const items = list.filter((p: any) => p.product_id === productId);
//         items.length > 0 ? items.forEach((i: any) => this.addIngredient(i.resource_id, i.required_quantity)) : this.addIngredient();
//         this.isIngredientsLoading.set(false);
//       },
//       error: () => this.isIngredientsLoading.set(false)
//     });
//   }

//   addIngredient(resource_id = '', required_quantity = 0) {
//     this.ingredients.push(this.fb.group({
//       resource_id: [resource_id, Validators.required],
//       required_quantity: [required_quantity, [Validators.required, Validators.min(0.01)]]
//     }));
//   }

//   removeIngredient(index: number) { this.ingredients.removeAt(index); }

//   // Métodos requeridos por el HTML
//   getResourceUnit(resourceId: string): string {
//     const resource = this.resources().find(r => r.id === resourceId);
//     return resource ? resource.unit_of_measure : 'units';
//   }

//   getIngredientCost(group: any): number {
//     const resource = this.resources().find(r => r.id === group.get('resource_id')?.value);
//     return resource ? (resource.unit_cost * (group.get('required_quantity')?.value || 0)) : 0;
//   }

//   get totalRecipeCost(): number {
//     return this.ingredients.controls.reduce((acc, control) => acc + this.getIngredientCost(control), 0);
//   }

//   getProductPrice(productId: string | null | undefined): number {
//     const product = this.products().find(p => String(p.id) === String(productId));
//     return product ? (product.sale_price || 0) : 0;
//   }

//   get costColor(): string {
//     const totalCost = this.totalRecipeCost;
//     const productPrice = this.getProductPrice(this.recipeForm.get('product_id')?.value);
//     if (productPrice === 0) return 'lightgray';
//     return totalCost < productPrice ? 'lightblue' : 'red';
//   }

//   compareById = (o1: any, o2: any) => String(o1) === String(o2);

//   onSubmit() {
//     if (this.recipeForm.invalid) return;
//     const { product_id, ingredients } = this.recipeForm.getRawValue();

//     this.recipeService.getRecipeItems().subscribe(res => {
//       const all = (res as any).data || res;
//       const toDelete = all.filter((i: any) => i.product_id === product_id);
//       const ops = [...toDelete.map((i: any) => this.recipeService.deleteRecipeItem(i.id)),
//       ...ingredients.map((i: any) => this.recipeService.createRecipeItem({ ...i, product_id, is_active: true }))];

//       forkJoin(ops).subscribe(() => this.router.navigate(['/recipes']));
//     });
//   }
// }

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

import { RecipeItems } from '../../../core/services/recipe-items';
import { Product } from '../../../core/services/product';
import { Resource } from '../../../core/services/resource';

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
    TranslatePipe
  ],
  templateUrl: './recipe-form.html',
})
export class RecipeForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly recipeService = inject(RecipeItems);
  private readonly productService = inject(Product);
  private readonly resourceService = inject(Resource);
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
    // Detectamos si es edición (ID de producto) o creación rápida (QueryParam)
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
    const { product_id, ingredients } = this.recipeForm.getRawValue();

    this.recipeService.getRecipeItems().subscribe(res => {
      const all = (res as any).data || res;
      const toDelete = all.filter((i: any) => i.product_id === product_id);
      const ops = [
        ...toDelete.map((i: any) => this.recipeService.deleteRecipeItem(i.id)),
        ...ingredients.map((i: any) => this.recipeService.createRecipeItem({ ...i, product_id, is_active: true }))
      ];

      forkJoin(ops).subscribe(() => this.router.navigate(['/recipes']));
    });
  }
}