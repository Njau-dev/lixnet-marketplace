<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Models\User;
use App\Models\Order;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    /**
     * Get authenticated user profile
     */
    public function getProfile(): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            return response()->json([
                'success' => true,
                'message' => 'Profile retrieved successfully',
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'company' => $user->company,
                    'created_at' => $user->created_at->toISOString(),
                    'updated_at' => $user->updated_at->toISOString(),
                    'email_verified_at' => $user->email_verified_at ? $user->email_verified_at->toISOString() : null,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update authenticated user profile
     */
    public function updateProfile(Request $request): JsonResponse
    {
        try {
            $user = User::find($request->user()->id);

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            // Validate input
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|email|max:255|unique:users,email,' . $user->id,
                'phone' => 'nullable|string|max:20',
                'company' => 'nullable|string|max:255'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Update user profile
            $user->update([
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'company' => $request->company
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'company' => $user->company,
                    'created_at' => $user->created_at->toISOString(),
                    'updated_at' => $user->updated_at->toISOString(),
                    'email_verified_at' => $user->email_verified_at ? $user->email_verified_at->toISOString() : null,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user activity summary
     */
    public function getUserSummary(): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            // Get orders summary
            $ordersSummary = DB::table('orders')
                ->where('user_id', $user->id)
                ->selectRaw('
                    COUNT(*) as total_orders,
                    SUM(CASE WHEN status = "completed" OR status = "paid" THEN 1 ELSE 0 END) as successful_orders,
                    SUM(CASE WHEN status = "pending" THEN 1 ELSE 0 END) as pending_orders,
                    SUM(CASE WHEN status = "completed" OR status = "paid" THEN total_amount ELSE 0 END) as total_spent
                ')
                ->first();

            // Get payment summary
            $paymentsSummary = DB::table('orders')
                ->where('user_id', $user->id)
                ->where(function ($query) {
                    $query->where('status', 'completed')
                        ->orWhere('status', 'paid')
                        ->orWhereNotNull('paid_at');
                })
                ->count();

            // Get currency from user's first order or default to KSh
            $currency = DB::table('orders')
                ->where('user_id', $user->id)
                ->value('currency') ?? 'KSh';

            return response()->json([
                'success' => true,
                'message' => 'User summary retrieved successfully',
                'data' => [
                    'total_orders' => (int) $ordersSummary->total_orders,
                    'successful_orders' => (int) $ordersSummary->successful_orders,
                    'pending_orders' => (int) $ordersSummary->pending_orders,
                    'total_payments' => $paymentsSummary,
                    'total_spent' => (float) $ordersSummary->total_spent,
                    'currency' => $currency
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve user summary',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get detailed user statistics
     */
    public function getUserStats(): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            // Get monthly spending data for the last 12 months
            $monthlySpending = DB::table('orders')
                ->where('user_id', $user->id)
                ->where(function ($query) {
                    $query->where('status', 'completed')
                        ->orWhere('status', 'paid');
                })
                ->where('created_at', '>=', now()->subMonths(12))
                ->selectRaw('
                    DATE_FORMAT(created_at, "%Y-%m") as month,
                    SUM(total_amount) as total_spent,
                    COUNT(*) as orders_count
                ')
                ->groupBy('month')
                ->orderBy('month')
                ->get();

            // Get category breakdown
            $categoryBreakdown = DB::table('orders')
                ->join('order_items', 'orders.id', '=', 'order_items.order_id')
                ->join('products', 'order_items.product_id', '=', 'products.id')
                ->join('categories', 'products.category_id', '=', 'categories.id')
                ->where('orders.user_id', $user->id)
                ->where(function ($query) {
                    $query->where('orders.status', 'completed')
                        ->orWhere('orders.status', 'paid');
                })
                ->selectRaw('
                    categories.name as category_name,
                    SUM(order_items.unit_price * order_items.quantity) as total_spent,
                    COUNT(DISTINCT orders.id) as orders_count,
                    SUM(order_items.quantity) as items_count
                ')
                ->groupBy('categories.id', 'categories.name')
                ->orderBy('total_spent', 'desc')
                ->get();

            // Get recent activity (last 10 orders)
            $recentActivity = DB::table('orders')
                ->where('user_id', $user->id)
                ->select('id', 'order_reference', 'status', 'total_amount', 'created_at')
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'User statistics retrieved successfully',
                'data' => [
                    'monthly_spending' => $monthlySpending,
                    'category_breakdown' => $categoryBreakdown,
                    'recent_activity' => $recentActivity
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve user statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user order history with pagination
     */
    public function getOrderHistory(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            $perPage = $request->get('per_page', 10);
            $status = $request->get('status');
            $search = $request->get('search');

            $query = Order::with(['items.product.category'])
                ->where('user_id', $user->id);

            // Apply filters
            if ($status && $status !== 'all') {
                $query->where('status', $status);
            }

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('order_reference', 'like', "%{$search}%")
                        ->orWhereHas('items.product', function ($productQuery) use ($search) {
                            $productQuery->where('title', 'like', "%{$search}%");
                        });
                });
            }

            $orders = $query->orderBy('created_at', 'desc')
                ->paginate($perPage);

            return response()->json([
                'success' => true,
                'message' => 'Order history retrieved successfully',
                'data' => $orders
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve order history',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete user account (soft delete)
     */
    public function deleteAccount(Request $request): JsonResponse
    {
        try {
            $user = Auth::class();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            // Validate password for security
            $validator = Validator::make($request->all(), [
                'password' => 'required|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Password is required to delete account',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Verify password
            if (!Hash::check($request->password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid password'
                ], 422);
            }

            // Check for pending orders
            $pendingOrders = Order::where('user_id', $user->id)
                ->where('status', 'pending')
                ->count();

            if ($pendingOrders > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete account with pending orders. Please contact support.'
                ], 422);
            }

            // Soft delete the user
            $user->delete();

            return response()->json([
                'success' => true,
                'message' => 'Account deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete account',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Change user password
     */
    public function changePassword(Request $request): JsonResponse
    {
        try {
            $user = Auth::class();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            // Validate input
            $validator = Validator::make($request->all(), [
                'current_password' => 'required|string',
                'new_password' => 'required|string|min:8|confirmed',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Verify current password
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Current password is incorrect'
                ], 422);
            }

            // Update password
            $user->update([
                'password' => Hash::make($request->new_password)
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Password updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update password',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
