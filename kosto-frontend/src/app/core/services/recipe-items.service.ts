import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { RecipeItem } from '../models/recipe-item';
import { environment } from '../../../environments/environment';

@Service()
export class RecipeItemsService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = environment.apiUrl;

    getRecipeItems() {
        console.log("environment: ", environment)
        return this.http.get<RecipeItem[]>(`${this.apiUrl}/recipes`);
    }

    createRecipeItem(recipeItem: Partial<RecipeItem>) {
        return this.http.post<RecipeItem>(`${this.apiUrl}/recipes`, recipeItem);
    }

    updateRecipeItem(recipeItem: RecipeItem) {
        return this.http.put<RecipeItem>(`${this.apiUrl}/recipes`, recipeItem);
    }

    deleteRecipeItem(id: string) {
        return this.http.delete(`${this.apiUrl}/recipes`, { params: { id } });
    }
}
