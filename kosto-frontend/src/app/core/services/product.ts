import { HttpClient, HttpParams } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { ProductModel } from '../models/product.interface';

@Service()
export class Product {
    private readonly http = inject(HttpClient); // <--- Así se inyecta ahora
    private readonly apiUrl = 'http://127.0.0.1:3000';

    // getProducts() {
    //     return this.http.get<ProductModel[]>(`${this.apiUrl}/products`);
    // }

    getProducts(isPreMade?: boolean) {
        let params = new HttpParams();

        if (isPreMade !== undefined) {
            params = params.set('is_pre_made', isPreMade);
        }

        return this.http.get<ProductModel[]>(`${this.apiUrl}/products`, { params });
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
