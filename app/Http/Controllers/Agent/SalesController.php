<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Models\Agent;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Carbon;

class SalesController extends Controller
{
    /**
     * Get agent sales list with pagination and filters
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        // Get agent record
        $agent = Agent::where('user_id', $user->id)->firstOrFail();

        // Build query
        $query = Order::where('agent_id', $agent->id);

        // Apply status filter
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Apply search filter
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_reference', 'like', "%{$search}%")
                    ->orWhere('full_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('company', 'like', "%{$search}%");
            });
        }

        // Paginate results
        $perPage = $request->get('per_page', 15);
        $orders = $query->orderBy('created_at', 'desc')
            ->paginate($perPage);

        // Get sales statistics
        $stats = $this->getSalesStats($agent);

        return response()->json([
            'orders' => [
                'data' => $orders->items(),
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
                'from' => $orders->firstItem(),
                'to' => $orders->lastItem(),
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * Get specific order details
     */
    public function show(Request $request, $orderId)
    {
        $user = Auth::user();

        // Get agent record
        $agent = Agent::where('user_id', $user->id)->firstOrFail();

        // Get order with items, ensure it belongs to this agent
        $order = Order::with('items')
            ->where('id', $orderId)
            ->where('agent_id', $agent->id)
            ->firstOrFail();

        return response()->json([
            'order' => [
                'id' => $order->id,
                'order_reference' => $order->order_reference,
                'full_name' => $order->full_name,
                'email' => $order->email,
                'phone' => $order->phone,
                'company' => $order->company,
                'notes' => $order->notes,
                'total_amount' => (float) $order->total_amount,
                'currency' => $order->currency,
                'status' => $order->status,
                'payment_reference' => $order->payment_reference,
                'paid_at' => $order->paid_at?->toDateTimeString(),
                'created_at' => $order->created_at->toDateTimeString(),
                'updated_at' => $order->updated_at->toDateTimeString(),
                'items' => $order->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'product_name' => $item->product_name,
                        'quantity' => $item->quantity,
                        'unit_price' => (float) $item->unit_price,
                        'total_price' => (float) $item->total_price,
                    ];
                }),
            ],
        ]);
    }

    /**
     * Get sales statistics for the agent
     */
    private function getSalesStats(Agent $agent)
    {
        // Total sales (all time, excluding cancelled)
        $totalSales = Order::where('agent_id', $agent->id)
            ->where('status', '!=', 'cancelled')
            ->sum('total_amount');

        // Total orders count
        $totalOrders = Order::where('agent_id', $agent->id)
            ->where('status', '!=', 'cancelled')
            ->count();

        // Average order value
        $averageOrderValue = $totalOrders > 0 ? $totalSales / $totalOrders : 0;

        // This month sales
        $thisMonthSales = Order::where('agent_id', $agent->id)
            ->where('status', '!=', 'cancelled')
            ->whereBetween('created_at', [
                Carbon::now()->startOfMonth(),
                Carbon::now()->endOfMonth()
            ])
            ->sum('total_amount');

        return [
            'total_sales' => (float) $totalSales,
            'total_orders' => $totalOrders,
            'average_order_value' => (float) $averageOrderValue,
            'this_month_sales' => (float) $thisMonthSales,
        ];
    }
}
