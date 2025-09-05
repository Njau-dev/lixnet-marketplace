<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{
    /**
     * Get the authenticated user's cart.
     */
    public function index(): JsonResponse
    {
        try {
            $user = Auth::user();
            $cart = Cart::findOrCreateForUser($user->id);
            $cart->load('itemsWithProducts.product.category');

            return response()->json([
                'success' => true,
                'data' => [
                    'cart' => $cart,
                    'items' => $cart->itemsWithProducts,
                    'total_items' => $cart->total_items,
                    'total_value' => $cart->total_value
                ],
                'message' => 'Cart retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve cart',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Add item to cart.
     */
    public function addItem(Request $request): JsonResponse
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'integer|min:1|max:99'
        ]);

        try {
            $user = Auth::user();
            $cart = Cart::findOrCreateForUser($user->id);
            $product = Product::find($request->product_id);
            $quantity = $request->get('quantity', 1);

            // Check if item already exists in cart
            $existingItem = $cart->items()->where('product_id', $product->id)->first();

            if ($existingItem) {
                // Update quantity
                $newQuantity = $existingItem->quantity + $quantity;
                $existingItem->updateQuantity($newQuantity);
                $cartItem = $existingItem->fresh('product');
            } else {
                // Create new cart item
                $cartItem = $cart->items()->create([
                    'product_id' => $product->id,
                    'quantity' => $quantity
                ]);
                $cartItem->load('product');
            }

            // Refresh cart data
            $cart->refresh();
            $cart->load('itemsWithProducts.product.category');

            return response()->json([
                'success' => true,
                'data' => [
                    'cart_item' => $cartItem,
                    'cart' => $cart,
                    'total_items' => $cart->total_items,
                    'total_value' => $cart->total_value
                ],
                'message' => 'Item added to cart successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add item to cart',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Update cart item quantity.
     */
    public function updateItem(Request $request, CartItem $cartItem): JsonResponse
    {
        $request->validate([
            'quantity' => 'required|integer|min:0|max:99'
        ]);

        try {
            // Verify cart ownership
            if ($cartItem->cart->user_id !== Auth::id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to cart item'
                ], 403);
            }

            $cartItem->updateQuantity($request->quantity);

            // If quantity is 0, item is deleted, so get fresh cart data
            $cart = $cartItem->cart ?? Cart::findOrCreateForUser(Auth::id());
            $cart->load('itemsWithProducts.product.category');

            return response()->json([
                'success' => true,
                'data' => [
                    'cart' => $cart,
                    'total_items' => $cart->total_items,
                    'total_value' => $cart->total_value
                ],
                'message' => $request->quantity > 0
                    ? 'Cart item updated successfully'
                    : 'Cart item removed successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update cart item',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Remove item from cart.
     */
    public function removeItem(CartItem $cartItem): JsonResponse
    {
        try {
            // Verify cart ownership
            if ($cartItem->cart->user_id !== Auth::id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to cart item'
                ], 403);
            }

            $cart = $cartItem->cart;
            $cartItem->delete();

            // Refresh cart data
            $cart->load('itemsWithProducts.product.category');

            return response()->json([
                'success' => true,
                'data' => [
                    'cart' => $cart,
                    'total_items' => $cart->total_items,
                    'total_value' => $cart->total_value
                ],
                'message' => 'Item removed from cart successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove item from cart',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Clear all items from cart.
     */
    public function clear(): JsonResponse
    {
        try {
            $user = Auth::user();
            $cart = Cart::findOrCreateForUser($user->id);
            $cart->items()->delete();

            return response()->json([
                'success' => true,
                'data' => [
                    'cart' => $cart,
                    'total_items' => 0,
                    'total_value' => 0
                ],
                'message' => 'Cart cleared successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to clear cart',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
}
