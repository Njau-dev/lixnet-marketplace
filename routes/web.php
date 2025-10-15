<?php

use App\Models\AgentApplication;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public Only Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return Inertia::render('Marketplace');
})->name('marketplace');

Route::get('/cart', function () {
    return Inertia::render('Cart');
})->name('cart');


/*
|--------------------------------------------------------------------------
| Customer Only Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'customer'])->group(function () {
    Route::get('/checkout', function () {
        return Inertia::render('user/Checkout');
    })->name('checkout');

    Route::get('/profile', function () {
        return Inertia::render('user/Profile');
    })->name('profile');

    Route::get('/orders', function () {
        return Inertia::render('user/Orders');
    })->name('orders');

    Route::get('/sales-registration', function () {
        return Inertia::render('user/SalesRegistration');
    });
});

/*
|--------------------------------------------------------------------------
| Agent Only Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified', 'agent'])->prefix('agent')->name('agent.')->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('agent/Dashboard');
    })->name('dashboard');

    Route::get('profile', function () {
        return Inertia::render('agent/Profile');
    })->name('profile');

    Route::get('sales', function () {
        return Inertia::render('agent/Sales');
    })->name('sales');

    Route::get('sales/{orderId}', function (string $orderId) {
        return Inertia::render('agent/SalesDetail', [
            'orderId' => $orderId,
        ]);
    })->name('sales.detail');
});


/*
|--------------------------------------------------------------------------
| Admin Only Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified', 'admin'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {

    Route::get('users-list', function () {
        return Inertia::render('admin/users');
    })->name('userlist');

    Route::get('users-list/{userId}', function (string $userId) {
        return Inertia::render('admin/user-details', [
            'userId' => $userId,
        ]);
    })->name('userdetails');

    Route::get('agent-applications', function () {
        return Inertia::render('admin/agent-applications/index');
    })->name('agent-applications');

    Route::get('agent-applications/{application}', function (AgentApplication $application) {
        return Inertia::render('admin/agent-applications/show', [
            'applicationId' => $application->id,
        ]);
    })->name('agent-applications.show');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__ . '/api.php';
