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

Route::middleware(['auth', 'verified', CheckAdminRole::class])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__ . '/api.php';
