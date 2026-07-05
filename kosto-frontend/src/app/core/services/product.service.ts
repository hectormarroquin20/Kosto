import { HttpClient, HttpParams } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { ProductModel } from '../models/product.interface';
import { environment } from '../../../environments/environment';

@Service()
export class ProductService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = environment.apiUrl;

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
        // Note: When DELETE uses query params, we use { params: ... }
        return this.http.delete(`${this.apiUrl}/products`, { params: { id } });
    }
}

