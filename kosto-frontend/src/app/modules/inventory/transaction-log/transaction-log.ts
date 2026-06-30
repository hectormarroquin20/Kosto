import { Component, computed, inject, signal } from '@angular/core';
import { TransactionLogModel } from '../../../core/models/transaction-log.interface';
import { TransactionLogService } from '../../../core/services/transaction-log.service';

import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { Router, RouterLink } from '@angular/router';
import { ProductModel } from '../../../core/models/product.interface';
import { Product } from '../../../core/services/product';
import { forkJoin } from 'rxjs';


@Component({
  selector: 'app-transaction-log',
  imports: [
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    RouterLink
  ],
  templateUrl: './transaction-log.html',
  styleUrl: './transaction-log.scss',
})
export class TransactionLog {
  private readonly transactionLogService = inject(TransactionLogService);
  private readonly productService = inject(Product);

  // Estado reactivo usando Signals
  public transactionLogs = signal<TransactionLogModel[]>([]);
  public products = signal<ProductModel[]>([]);

  public isLoading = signal<boolean>(true);

  // Creamos un mapa para búsqueda rápida O(1) en el HTML
  public productMap = computed(() => {
    const map = new Map<string, ProductModel>(); // Guardamos todo el objeto
    this.products().forEach(p => map.set(p.id!, p));
    return map;
  });

  // Las columnas que queremos mostrar en la tabla
  // public displayedColumns: string[] = ['type', 'reference_id', 'quantity', 'total_amount', 'transaction_date'];
  public displayedColumns: string[] = ['type', 'product_name', 'quantity', 'total_amount', 'transaction_date'];

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading.set(true);
    this.transactionLogService.getTransactionLogs().subscribe({
      next: (response: any) => {
        console.log('Lo que llega del backend:', response);

        // CORRECCIÓN: Si response.data es un objeto, lo metemos en un arreglo [response.data]
        // Si response.data es un arreglo, usamos response.data directamente
        const data = Array.isArray(response.data) ? response.data : [response.data];

        this.transactionLogs.set(data);
      },
      error: (err) => console.error('Error cargando los registros:', err)
    });
    forkJoin({
      logs: this.transactionLogService.getTransactionLogs(),
      prods: this.productService.getProducts()
    }).subscribe({
      next: (res) => {
        // Normalización estricta: si viene { data: ... } usamos data, si no, el res directo
        const logsRaw = (res.logs as any).data || res.logs;
        const prodsRaw = (res.prods as any).data || res.prods;

        // Fuerza a que siempre sea un array, incluso si viene un solo objeto
        const logsData = Array.isArray(logsRaw) ? logsRaw : [logsRaw];
        const prodsData = Array.isArray(prodsRaw) ? prodsRaw : [prodsRaw];

        this.transactionLogs.set(logsData);
        this.products.set(prodsData);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Error cargando datos:', err)
      }
    });
  }
}
