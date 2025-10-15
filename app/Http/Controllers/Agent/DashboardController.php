<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Models\Agent;
use App\Models\AgentTier;
use App\Models\Commission;
use App\Models\Order;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    /**
     * Get agent dashboard data
     */
    public function index()
    {
        $user = Auth::user();

        // Get agent record
        $agent = Agent::where('user_id', $user->id)
            ->with(['commissions', 'tier'])
            ->firstOrFail();

        // Get current year commission data
        $currentYearStart = Carbon::now()->year . '-01-01';
        $currentYearEnd = Carbon::now()->year . '-12-31';

        $currentCommission = Commission::where('agent_id', $agent->id)
            ->whereBetween('period_start', [$currentYearStart, $currentYearEnd])
            ->latest()
            ->first();

        // Get current tier info
        $currentTier = $this->getCurrentTierInfo($agent, $currentCommission);

        // Get stats
        $stats = $this->getAgentStats($agent, $currentCommission, $currentTier);

        // Get quarterly data
        $quarterlyData = $this->getQuarterlyData($agent);

        // Get recent sales
        $recentSales = Order::where('agent_id', $agent->id)
            ->where('created_at', '>=', Carbon::now()->startOfMonth())
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_reference' => $order->order_reference,
                    'full_name' => $order->full_name,
                    'total_amount' => (float) $order->total_amount,
                    'status' => $order->status,
                    'created_at' => $order->created_at->toDateString(),
                ];
            });

        return response()->json([
            'stats' => $stats,
            'tier_info' => $currentTier,
            'quarterly_data' => $quarterlyData,
            'recent_sales' => $recentSales,
            'agent_name' => $user->display_name ?? $user->name,
        ]);
    }

    /**
     * Get agent statistics
     */
    private function getAgentStats(Agent $agent, ?Commission $currentCommission, array $tierInfo)
    {
        // Total sales from all orders
        $totalSales = Order::where('agent_id', $agent->id)
            ->where('status', '!=', 'cancelled')
            ->sum('total_amount');

        // Total earnings from current year commission
        $totalEarnings = $currentCommission?->total_commission ?? 0;

        // Count unique customers
        $customersCount = Order::where('agent_id', $agent->id)
            ->where('status', '!=', 'cancelled')
            ->distinct('email')
            ->count('email');

        return [
            'total_sales' => (float) $totalSales,
            'total_earnings' => (float) $totalEarnings,
            'customers_count' => $customersCount,
            'current_tier' => $tierInfo['name'],
            'current_tier_color' => $this->getTierColor($tierInfo['name']),
        ];
    }

    /**
     * Get current tier information
     */
    private function getCurrentTierInfo(Agent $agent, ?Commission $currentCommission)
    {
        $totalSales = Order::where('agent_id', $agent->id)
            ->where('status', '!=', 'cancelled')
            ->sum('total_amount');

        // Determine current tier based on total sales
        $tiers = [
            ['name' => 'bronze', 'min' => 0, 'max' => 25000],
            ['name' => 'silver', 'min' => 25000, 'max' => 50000],
            ['name' => 'gold', 'min' => 50000, 'max' => PHP_INT_MAX],
        ];

        $currentTierData = null;
        foreach ($tiers as $tier) {
            if ($totalSales >= $tier['min'] && $totalSales < $tier['max']) {
                $currentTierData = $tier;
                break;
            }
        }

        // Default to bronze if no tier found
        if (!$currentTierData) {
            $currentTierData = $tiers[0];
        }

        // Get tier commission rate from database
        $tierModel = AgentTier::where('name', $currentTierData['name'])->first();
        $commissionRate = $tierModel?->commission_rate ?? ($currentTierData['name'] === 'bronze' ? 10 : ($currentTierData['name'] === 'silver' ? 20 : 30));

        // Calculate sales needed for next tier
        $salesToNextTier = 0;
        if ($currentTierData['name'] === 'bronze') {
            $salesToNextTier = 25000 - $totalSales;
        } elseif ($currentTierData['name'] === 'silver') {
            $salesToNextTier = 50000 - $totalSales;
        }

        return [
            'name' => $currentTierData['name'],
            'min_sales' => $currentTierData['min'],
            'max_sales' => $currentTierData['max'],
            'commission_rate' => $commissionRate,
            'current_sales' => (float) $totalSales,
            'sales_to_next_tier' => max(0, $salesToNextTier),
        ];
    }

    /**
     * Get quarterly sales and orders data
     */
    private function getQuarterlyData(Agent $agent)
    {
        $currentYear = Carbon::now()->year;
        $quarters = [];

        for ($q = 1; $q <= 4; $q++) {
            $startMonth = ($q - 1) * 3 + 1;
            $endMonth = $q * 3;

            $quarterStart = Carbon::createFromDate($currentYear, $startMonth, 1)->startOfMonth();
            $quarterEnd = Carbon::createFromDate($currentYear, $endMonth, 1)->endOfMonth();

            $sales = Order::where('agent_id', $agent->id)
                ->whereBetween('created_at', [$quarterStart, $quarterEnd])
                ->where('status', '!=', 'cancelled')
                ->sum('total_amount');

            $orders = Order::where('agent_id', $agent->id)
                ->whereBetween('created_at', [$quarterStart, $quarterEnd])
                ->where('status', '!=', 'cancelled')
                ->count();

            $quarters[] = [
                'quarter' => "Q{$q}",
                'sales' => (float) $sales,
                'orders' => $orders,
            ];
        }

        return $quarters;
    }

    /**
     * Get tier color for UI
     */
    private function getTierColor(string $tier)
    {
        return match ($tier) {
            'bronze' => 'bronze',
            'silver' => 'silver',
            'gold' => 'gold',
            default => 'bronze',
        };
    }
}
