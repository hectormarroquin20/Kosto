import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { RecipeItem } from '../models/recipe-item';

@Service()
export class RecipeItems {
    private readonly http = inject(HttpClient); // <--- Así se inyecta ahora
    private readonly apiUrl = 'http://127.0.0.1:3000';

    getRecipeItems() {
        return this.http.get<RecipeItem[]>(`${this.apiUrl}/recipes`);
    }

    createRecipeItem(recipeItem: Partial<RecipeItem>) {
        return this.http.post<RecipeItem>(`${this.apiUrl}/recipes`, recipeItem);
    }

    updateRecipeItem(recipeItem: RecipeItem) {
        return this.http.put<RecipeItem>(`${this.apiUrl}/recipes`, recipeItem);
    }

    deleteRecipeItem(id: string) {
        // Nota: Al ser DELETE con query params, usamos { params: ... }
        return this.http.delete(`${this.apiUrl}/recipes`, { params: { id } });
    }
}
