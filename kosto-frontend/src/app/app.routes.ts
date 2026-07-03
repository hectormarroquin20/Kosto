import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard'; // Ajusta la ruta a donde lo tengas

export const routes: Routes = [
    // RUTA PÚBLICA: No necesita guard
    {
        path: 'login',
        loadComponent: () => import('./modules/security/login/login').then(m => m.Login)
    },

    // RUTAS PRIVADAS: Requieren estar logueado
    {
        path: '',
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'products', pathMatch: 'full' },

            // Productos
            { path: 'products', loadComponent: () => import('./modules/inventory/product-list/product-list').then(m => m.ProductList) },
            { path: 'products/new', loadComponent: () => import('./modules/inventory/product-form/product-form').then(m => m.ProductForm) },
            { path: 'products/edit/:id', loadComponent: () => import('./modules/inventory/product-form/product-form').then(m => m.ProductForm) },

            // Insumos
            { path: 'resources', loadComponent: () => import('./modules/inventory/resource-list/resource-list').then(m => m.ResourceList) },
            { path: 'resources/new', loadComponent: () => import('./modules/inventory/resource-form/resource-form').then(m => m.ResourceForm) },
            { path: 'resources/edit/:id', loadComponent: () => import('./modules/inventory/resource-form/resource-form').then(m => m.ResourceForm) },

            // Recetas
            { path: 'recipes', loadComponent: () => import('./modules/inventory/recipe-list/recipe-list').then(m => m.RecipeList) },
            { path: 'recipes/new', loadComponent: () => import('./modules/inventory/recipe-form/recipe-form').then(m => m.RecipeForm) },
            { path: 'recipes/edit/:id', loadComponent: () => import('./modules/inventory/recipe-form/recipe-form').then(m => m.RecipeForm) },

            // Otros
            { path: 'transaction-logs', loadComponent: () => import('./modules/inventory/transaction-log/transaction-log').then(m => m.TransactionLog) },
            { path: 'tenants', loadComponent: () => import('./modules/inventory/tenant/tenant-form').then(m => m.TenantForm) },
            { path: 'sales/new', loadComponent: () => import('./modules/inventory/sales-form/sales-form').then(m => m.SalesForm) },
            { path: 'production', loadComponent: () => import('./modules/inventory/production-list/production-list').then(m => m.ProductionList) }
        ]
    },
    { path: '**', redirectTo: 'products' }
]; ``