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
    MatDialogModule,
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

  // Inject the modal control and data passed by the table
  public dialogRef = inject(MatDialogRef<ProductionForm>);
  public data = inject(MAT_DIALOG_DATA);

  // Initialize the form with the ID locked (disabled) because we already know what product it is
  productionForm: FormGroup = this.fb.group({
    product_id: [{ value: this.data.product_id, disabled: true }, Validators.required],
    quantity_produced: [1, [Validators.required, Validators.min(1)]]
  });

  productionResult = signal<any>(null);
  errorMessage = signal<string | null>(null); // Signal for errors

  onSubmit() {
    if (this.productionForm.valid) {
      const payload = {
        product_id: this.data.product_id, // Use the ID from the modal data
        quantity: this.productionForm.get('quantity_produced')?.value
      };

      this.productionService.produce(payload).subscribe({
        next: (res) => {
          this.productionResult.set(res);
          this.errorMessage.set(null);
        },
        error: (err) => {
          // Adjust to read the 'error' field we return in the buildResponse of the catch
          console.log('Full backend error:', err);
          const msg = err.error?.error || 'Unknown error while producing';
          this.errorMessage.set(msg);
        }
      });
    }
  }

  // Method to close the modal and notify if changes were made
  closeDialog(refreshTable: boolean = false) {
    this.dialogRef.close(refreshTable);
  }
}
