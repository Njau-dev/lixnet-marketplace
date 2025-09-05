<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cart extends Model
{
    protected $fillable = [
        'user_id',
        'session_id',
    ];

    /**
     * Get the user that owns the cart.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the cart items for the cart.
     */
    public function items(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    /**
     * Get the cart items with their associated products.
     */
    public function itemsWithProducts(): HasMany
    {
        return $this->hasMany(CartItem::class)->with('product');
    }

    /**
     * Calculate total items count in cart.
     */
    public function getTotalItemsAttribute(): int
    {
        return $this->items()->sum('quantity');
    }

    /**
     * Calculate total cart value.
     */
    public function getTotalValueAttribute(): float
    {
        return $this->items()->with('product')->get()->sum(function ($item) {
            return $item->quantity * $item->product->price;
        });
    }

    /**
     * Find or create cart for authenticated user.
     */
    public static function findOrCreateForUser(int $userId): Cart
    {
        return static::firstOrCreate(['user_id' => $userId]);
    }

    /**
     * Find cart by session ID for guest users.
     */
    public static function findBySession(string $sessionId): ?Cart
    {
        return static::where('session_id', $sessionId)->first();
    }
}
