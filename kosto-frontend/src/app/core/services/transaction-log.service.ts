import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { TransactionLogModel } from '../models/transaction-log.interface';

@Service()
export class TransactionLogService {
    private readonly http = inject(HttpClient); // <--- Así se inyecta ahora
    private readonly apiUrl = 'http://127.0.0.1:3000';

    getTransactionLogs() {
        return this.http.get<TransactionLogModel[]>(`${this.apiUrl}/sales`);
    }

    createTransactionLog(resource: Partial<TransactionLogModel>) {
        return this.http.post<TransactionLogModel>(`${this.apiUrl}/sales`, resource);
    }
}
