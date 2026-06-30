import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { RecipeItem } from '../../../core/models/recipe-item';
import { RecipeItems } from '../../../core/services/recipe-items';

import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { Router, RouterLink } from '@angular/router';
import { Product } from '../../../core/services/product';
import { Resource } from '../../../core/services/resource';
import { catchError, forkJoin, of } from 'rxjs';

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
    RouterLink
  ],
  templateUrl: './recipe-list.html',
  styleUrl: './recipe-list.scss',
})
export class RecipeList implements OnInit {
  private readonly recipeItemsService = inject(RecipeItems);
  private readonly productService = inject(Product);
  private readonly resourceService = inject(Resource);
  private readonly router = inject(Router);

  public isLoading = signal<boolean>(true);
  public filter = signal('');

  // Estado reactivo usando Signals
  public recipes = signal<RecipeItem[]>([]);
  public products = signal<any[]>([]);
  public resources = signal<any[]>([]);

  // Cruzado de datos: Mapas de nombres para búsqueda rápida
  public productMap = computed(() => new Map(this.products().map(p => [p.id, p.name])));
  public resourceMap = computed(() => new Map(this.resources().map(r => [r.id, { name: r.name, stock: r.current_stock }])));

  // Recetas filtradas reactivamente
  public filteredRecipes = computed(() => {
    const f = this.filter().toLowerCase();
    if (!f) return this.recipes();
    return this.recipes().filter(r =>
      (this.productMap().get(r.product_id) || '').toLowerCase().includes(f)
    );
  });

  public displayedColumns: string[] = ['product_id', 'resource_id', 'required_quantity', 'actions'];

  ngOnInit() {
    // CORRECCIÓN: Llamamos a loadAll en lugar de loadRecipes
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
    if (confirm('¿Estás seguro de eliminar esta receta?')) {
      this.recipeItemsService.deleteRecipeItem(id).subscribe({
        next: () => this.loadAll(), // Recargamos todo al borrar
        error: (err) => alert('Error al borrar: ' + err.message)
      });
    }
  }

  onEdit(recipeItem: RecipeItem) {
    this.router.navigate(['/recipes/edit', recipeItem.id]);
  }

  hasSufficientStock(resourceId: string, required: number): boolean {
    const res = this.resourceMap().get(resourceId);
    return res ? res.stock >= required : false;
  }
}