import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { TranslatePipe } from '@ngx-translate/core';
import { ProductionService } from '../../../core/services/production.service';

@Component({
  selector: 'app-production-form',
  imports: [
    ReactiveFormsModule,
    MatDialogModule, // <-- Reemplaza MatCardModule
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    TranslatePipe,
    DecimalPipe,
    TranslatePipe
  ],
  templateUrl: './production-form.html',
  styleUrl: './production-form.scss',
})
export class ProductionForm {
  private fb = inject(FormBuilder);
  private productionService = inject(ProductionService);

  // Inyectamos el control del modal y la data que nos pasa la tabla
  public dialogRef = inject(MatDialogRef<ProductionForm>);
  public data = inject(MAT_DIALOG_DATA);

  // Inicializamos el form con el ID bloqueado (disabled) porque ya sabemos qué producto es
  productionForm: FormGroup = this.fb.group({
    product_id: [{ value: this.data.product_id, disabled: true }, Validators.required],
    quantity_produced: [1, [Validators.required, Validators.min(1)]]
  });

  productionResult = signal<any>(null);
  errorMessage = signal<string | null>(null); // Señal para errores

  onSubmit() {
    if (this.productionForm.valid) {
      const payload = {
        product_id: this.data.product_id, // Usamos el ID de la data del modal
        quantity: this.productionForm.get('quantity_produced')?.value
      };

      this.productionService.produce(payload).subscribe({
        next: (res) => {
          this.productionResult.set(res);
          this.errorMessage.set(null);
        },
        error: (err) => {
          // Ajustamos para leer el campo 'error' que devolvemos en el buildResponse del catch
          console.log('Error completo del backend:', err);
          const msg = err.error?.error || 'Error desconocido al producir';
          this.errorMessage.set(msg);
        }
      });
    }
  }

  // Método para cerrar el modal y avisar si hubo cambios
  closeDialog(refreshTable: boolean = false) {
    this.dialogRef.close(refreshTable);
  }
}
