import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { TransactionLogModel } from '../models/transaction-log.interface';
import { environment } from '../../../environments/environment';

@Service()
export class TransactionLogService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = environment.apiUrl;

    getTransactionLogs() {
        return this.http.get<TransactionLogModel[]>(`${this.apiUrl}/sales`);
    }

    createTransactionLog(resource: Partial<TransactionLogModel>) {
        return this.http.post<TransactionLogModel>(`${this.apiUrl}/sales`, resource);
    }
}
