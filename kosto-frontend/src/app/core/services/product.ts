import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { ProductModel } from '../models/product.interface';

@Service()
export class Product {
    private readonly http = inject(HttpClient); // <--- Así se inyecta ahora
    private readonly apiUrl = 'http://127.0.0.1:3000';

    getProducts() {
        return this.http.get<ProductModel[]>(`${this.apiUrl}/products`);
    }

    createProduct(product: Partial<ProductModel>) {
        return this.http.post<ProductModel>(`${this.apiUrl}/products`, product);
    }

    updateProduct(product: ProductModel) {
        return this.http.put<ProductModel>(`${this.apiUrl}/products`, product);
    }

    deleteProduct(id: string) {
        // Nota: Al ser DELETE con query params, usamos { params: ... }
        return this.http.delete(`${this.apiUrl}/products`, { params: { id } });
    }
}
