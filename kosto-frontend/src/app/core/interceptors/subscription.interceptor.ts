import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { SubscriptionModalService } from '@/core/services/subscription-modal.service';

export const subscriptionInterceptor: HttpInterceptorFn = (req, next) => {
    const modalService = inject(SubscriptionModalService);

    return next(req).pipe(
        catchError((error) => {
            // Catch 403 Forbidden with our custom limit header
            if (error.status === 403 && error.headers.get('X-Limit-Exceeded') === 'true') {
                modalService.openUpgradeModal();
            }
            return throwError(() => error);
        })
    );
};