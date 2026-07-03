import { inject, Service } from '@angular/core';
import { ProductionResponse } from '../models/production-response.interface';
import { Observable } from 'rxjs/internal/Observable';
import { ProductionRequest } from '../models/production-request.interface';
import { HttpClient } from '@angular/common/http';

@Service()
export class ProductionService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = 'http://127.0.0.1:3000';

    produce(data: ProductionRequest): Observable<ProductionResponse> {
        return this.http.post<ProductionResponse>(`${this.apiUrl}/production`, data);
    }
}
