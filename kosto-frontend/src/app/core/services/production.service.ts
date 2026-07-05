import { inject, Service } from '@angular/core';
import { ProductionResponse } from '../models/production-response.interface';
import { Observable } from 'rxjs/internal/Observable';
import { ProductionRequest } from '../models/production-request.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '@root/src/environments/environment';

@Service()
export class ProductionService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = environment.apiUrl;

    produce(data: ProductionRequest): Observable<ProductionResponse> {
        return this.http.post<ProductionResponse>(`${this.apiUrl}/production`, data);
    }
}

