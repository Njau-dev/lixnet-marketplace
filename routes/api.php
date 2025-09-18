<?php

use App\Http\Controllers\OrderController;
use App\Http\Controllers\PesapalCallbackController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware(['web', 'auth'])->get('/user', function (Request $request) {
    return $request->user();
});

/*
|--------------------------------------------------------------------------
| Public API Routes (Guest Access)
|--------------------------------------------------------------------------
*/

// Categories
Route::prefix('categories')->group(function () {
    Route::get('/', [CategoryController::class, 'index']);
    Route::get('/{category}', [CategoryController::class, 'show']);
    Route::get('/slug/{slug}', [CategoryController::class, 'showBySlug']);
});

// Products
Route::prefix('products')->group(function () {
    Route::get('/', [ProductController::class, 'index']);
    Route::get('/search', [ProductController::class, 'search']);
    Route::get('/filter', [ProductController::class, 'filterByCategory']);
    Route::get('/featured', [ProductController::class, 'featured']);
    Route::get('/{product}', [ProductController::class, 'show']);
});

Route::prefix('cart')->group(function () {
    Route::get('/view', [CartController::class, 'index']);
});

// Pesapal callback routes (must be public for webhook access)
Route::prefix('pesapal')->group(function () {
    Route::match(['get', 'post'], '/callback', [PesapalCallbackController::class, 'handleCallback']);
    Route::get('/confirm', [PesapalCallbackController::class, 'confirmPayment']);
});

/*
|--------------------------------------------------------------------------
| Authenticated API Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['web', 'auth'])->group(function () {
    // Cart management
    Route::prefix('cart')->group(function () {
        Route::get('/get', [CartController::class, 'index']);
        Route::post('/add', [CartController::class, 'addItem']);
        Route::put('/items/{cartItem}', [CartController::class, 'updateItem']);
        Route::delete('/items/{cartItem}', [CartController::class, 'removeItem']);
        Route::delete('/clear', [CartController::class, 'clear']);
    });

    // Order management
    Route::prefix('orders')->group(function () {
        Route::get('/get', [OrderController::class, 'index']);
        Route::post('/', [OrderController::class, 'store']);
        Route::get('/{order}', [OrderController::class, 'show']);
        Route::post('/{order}/pay', [OrderController::class, 'initiatePayment']);
    });

    // User management
    Route::prefix('user')->group(function () {
        Route::get('/profile', [UserController::class, 'getProfile']);
        Route::put('/profile', [UserController::class, 'updateProfile']);
        Route::get('/summary', [UserController::class, 'getUserSummary']);
        Route::get('/stats', [UserController::class, 'getUserStats']);
        Route::get('/orders', [UserController::class, 'getOrderHistory']);
        Route::delete('/account', [UserController::class, 'deleteAccount']);
        Route::put('/change-password', [UserController::class, 'changePassword']);
    });
});

/*
|--------------------------------------------------------------------------
| Admin Only API Routes (CRUD Operations)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'admin'])->group(function () {
    // Category management (admin only)
    Route::prefix('admin/categories')->group(function () {
        Route::post('/', [CategoryController::class, 'store']);
        Route::put('/{category}', [CategoryController::class, 'update']);
        Route::delete('/{category}', [CategoryController::class, 'destroy']);
    });

    // Product management (admin only)
    Route::prefix('admin/products')->group(function () {
        Route::post('/', [ProductController::class, 'store']);
        Route::put('/{product}', [ProductController::class, 'update']);
        Route::delete('/{product}', [ProductController::class, 'destroy']);
    });
});
