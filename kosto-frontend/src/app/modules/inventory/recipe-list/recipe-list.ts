import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { RecipeItem } from '../../../core/models/recipe-item';
import { RecipeItemsService } from '../../../core/services/recipe-items.service';

import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { ResourceService } from '../../../core/services/resource.service';
import { catchError, forkJoin, of } from 'rxjs';

import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MainKostoComponent } from "@/components/main-kosto/main-kosto";
import { AdBannerComponent } from "@/components/ads/ads.component";

@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    RouterLink,
    TranslatePipe,
    MainKostoComponent
  ],
  templateUrl: './recipe-list.html',
  styleUrl: './recipe-list.scss',
})
export class RecipeList implements OnInit {
  private readonly recipeItemsService = inject(RecipeItemsService);
  private readonly productService = inject(ProductService);
  private readonly resourceService = inject(ResourceService);
  private readonly router = inject(Router);

  public isLoading = signal<boolean>(true);
  public filter = signal('');

  // Reactive state using Signals
  public recipes = signal<RecipeItem[]>([]);
  public products = signal<any[]>([]);
  public resources = signal<any[]>([]);

  // Cross-data mapping for quick lookups
  public productMap = computed(() => new Map(this.products().map(p => [p.id, p.name])));
  public resourceMap = computed(() => new Map(this.resources().map(r => [r.id, { name: r.name, stock: r.current_stock }])));

  // Reactive filtered recipes
  public filteredRecipes = computed(() => {
    const f = this.filter().toLowerCase();
    if (!f) return this.recipes();
    return this.recipes().filter(r =>
      (this.productMap().get(r.product_id) || '').toLowerCase().includes(f)
    );
  });

  public displayedColumns: string[] = ['product_id', 'resource_id', 'required_quantity', 'actions'];

  ngOnInit() {
    // CORRECTION: Call loadAll instead of loadRecipes
    this.loadAll();
  }

  loadAll() {
    this.isLoading.set(true);
    forkJoin({
      recipes: this.recipeItemsService.getRecipeItems().pipe(catchError(() => of({ data: [] }))),
      products: this.productService.getProducts().pipe(catchError(() => of({ data: [] }))),
      resources: this.resourceService.getResources().pipe(catchError(() => of({ data: [] })))
    }).subscribe({
      next: (res) => {
        const rawRecipes = (res.recipes as any).data ?? res.recipes;
        const rawProducts = (res.products as any).data ?? res.products;
        const rawResources = (res.resources as any).data ?? res.resources;

        this.recipes.set(Array.isArray(rawRecipes) ? rawRecipes : [rawRecipes]);
        this.products.set(Array.isArray(rawProducts) ? rawProducts : [rawProducts]);
        this.resources.set(Array.isArray(rawResources) ? rawResources : [rawResources]);

        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onDelete(id: string) {
    if (confirm('Are you sure you want to delete this recipe?')) {
      this.recipeItemsService.deleteRecipeItem(id).subscribe({
        next: () => this.loadAll(), // Reload all after deleting
        error: (err) => alert('Error deleting: ' + err.message)
      });
    }
  }

  onEdit(recipeItem: RecipeItem) {
    this.router.navigate(['/recipes/edit', recipeItem.product_id]);
  }

  hasSufficientStock(resourceId: string, required: number): boolean {
    const res = this.resourceMap().get(resourceId);
    if (!res) {
      console.warn('ID not found in map:', resourceId);
    }
    console.warn('ID found in map:', resourceId);
    return res ? res.stock >= required : false;
  }
}