<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    /**
     * Display a listing of products.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Product::with('category');

            // Apply search filter
            if ($request->filled('search')) {
                $query->search($request->search);
            }

            // Apply category filter
            if ($request->filled('category')) {
                if (is_numeric($request->category)) {
                    $query->byCategory($request->category);
                } else {
                    // Handle category slug
                    $category = Category::findBySlug($request->category);
                    if ($category) {
                        $query->byCategory($category->id);
                    }
                }
            }

            // Apply sorting
            $sortBy = $request->get('sort_by', 'title');
            $sortOrder = $request->get('sort_order', 'asc');

            $validSortColumns = ['title', 'price', 'rating', 'created_at'];
            if (in_array($sortBy, $validSortColumns)) {
                $query->orderBy($sortBy, $sortOrder);
            } else {
                $query->orderBy('title', 'asc');
            }

            $products = $query->get();

            return response()->json([
                'success' => true,
                'data' => $products,
                'count' => $products->count(),
                'message' => 'Products retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve products',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Search products by term.
     */
    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'q' => 'required|string|min:2|max:100'
        ]);

        try {
            $products = Product::with('category')
                ->search($request->q)
                ->orderBy('title')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $products,
                'count' => $products->count(),
                'query' => $request->q,
                'message' => 'Search completed successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Search failed',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Filter products by category.
     */
    public function filterByCategory(Request $request): JsonResponse
    {
        $request->validate([
            'category_id' => 'required|exists:categories,id'
        ]);

        try {
            $products = Product::with('category')
                ->byCategory($request->category_id)
                ->orderBy('title')
                ->get();

            $category = Category::find($request->category_id);

            return response()->json([
                'success' => true,
                'data' => $products,
                'count' => $products->count(),
                'category' => $category,
                'message' => 'Products filtered successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Filter failed',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Display the specified product.
     */
    public function show(Product $product): JsonResponse
    {
        try {
            $product->load('category');

            return response()->json([
                'success' => true,
                'data' => $product,
                'message' => 'Product retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve product',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get featured/popular products.
     */
    public function featured(): JsonResponse
    {
        try {
            $products = Product::with('category')
                ->orderByDesc('rating')
                ->orderByDesc('rating_count')
                ->take(9)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $products,
                'count' => $products->count(),
                'message' => 'Featured products retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve featured products',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
}
