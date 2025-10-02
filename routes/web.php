<?php

use App\Http\Middleware\CheckAdminRole;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Marketplace');
})->name('marketplace');

Route::get('/cart', function () {
    return Inertia::render('Cart');
})->name('cart');

// Protected routes
Route::middleware('auth')->group(function () {
    Route::get('/checkout', function () {
        return Inertia::render('user/Checkout');
    })->name('checkout');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', function () {
        return Inertia::render('user/Profile');
    })->name('profile');
});

Route::middleware('auth')->group(function () {
    Route::get('/orders', function () {
        return Inertia::render('user/Orders');
    })->name('orders');
});

Route::middleware('auth')->group(function () {
    Route::get('/sales-registration', function () {
        return Inertia::render('user/SalesRegistration');
    });
});

// admin routes
Route::middleware(['auth', 'verified', CheckAdminRole::class])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::middleware(['auth', 'verified', CheckAdminRole::class])->prefix('admin')->group(function () {
    Route::get('users-list', function () {
        return Inertia::render('admin/users');
    })->name('admin.userlist');

    Route::get('users-list/{userId}', function (string $userId) {
        return Inertia::render('admin/user-details', [
            'userId' => $userId,
        ]);
    })->name('admin.userdetails');

    Route::get('agent-applications', function () {
        return Inertia::render('admin/agent-applications');
    })->name('admin.agent-applications');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__ . '/api.php';
