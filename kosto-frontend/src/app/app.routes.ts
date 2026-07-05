// Kosto-monorepo/kosto-frontend/src/app/app.routes.ts (1-42)
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard'; // Adjust the path where it is located

export const routes: Routes = [
    // PUBLIC ROUTE: No needs guard
    { path: 'login', loadComponent: () => import('./modules/security/login/login').then(m => m.Login) },
    { path: 'register', loadComponent: () => import('./modules/security/register-component/register-component').then(m => m.RegisterComponent) },

    // PRIVATE ROUTES: Require to be logged in
    {
        path: '',
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'products', pathMatch: 'full' },

            // Products
            { path: 'products', loadComponent: () => import('./modules/inventory/product-list/product-list').then(m => m.ProductList) },
            { path: 'products/new', loadComponent: () => import('./modules/inventory/product-form/product-form').then(m => m.ProductForm) },
            { path: 'products/edit/:id', loadComponent: () => import('./modules/inventory/product-form/product-form').then(m => m.ProductForm) },

            // Resources
            { path: 'resources', loadComponent: () => import('./modules/inventory/resource-list/resource-list').then(m => m.ResourceList) },
            { path: 'resources/new', loadComponent: () => import('./modules/inventory/resource-form/resource-form').then(m => m.ResourceForm) },
            { path: 'resources/edit/:id', loadComponent: () => import('./modules/inventory/resource-form/resource-form').then(m => m.ResourceForm) },

            // Recipes
            { path: 'recipes', loadComponent: () => import('./modules/inventory/recipe-list/recipe-list').then(m => m.RecipeList) },
            { path: 'recipes/new', loadComponent: () => import('./modules/inventory/recipe-form/recipe-form').then(m => m.RecipeForm) },
            { path: 'recipes/edit/:id', loadComponent: () => import('./modules/inventory/recipe-form/recipe-form').then(m => m.RecipeForm) },

            // Others
            { path: 'transaction-logs', loadComponent: () => import('./modules/inventory/transaction-log/transaction-log').then(m => m.TransactionLog) },
            { path: 'missing-stock-resource', loadComponent: () => import('./modules/inventory/missing-stock-resource/missing-stock-resource').then(m => m.MissingStockResource) },
            { path: 'sales/new', loadComponent: () => import('./modules/inventory/sales-form/sales-form').then(m => m.SalesForm) },
            { path: 'production', loadComponent: () => import('./modules/inventory/production-list/production-list').then(m => m.ProductionList) },
            { path: 'tenants', loadComponent: () => import('./modules/inventory/tenant/tenant-form').then(m => m.TenantForm) }

        ]
    },
    { path: '**', redirectTo: 'products' }
];
