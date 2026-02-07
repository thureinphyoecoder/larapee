<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order; // Model ရှိရမယ်
use App\Models\Shop;  // Model ရှိရမယ်
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;


class DashboardController extends Controller
{
    // app/Http/Controllers/Admin/DashboardController.php

    public function index(Request $request)
    {
        $user = $request->user();

        if ($user && method_exists($user, 'hasRole')) {
            if ($user->hasRole('admin')) {
                $recentOrders = Order::with(['user', 'shop'])
                    ->latest()
                    ->take(10)
                    ->get();

                $from = Carbon::now()->subDays(6)->startOfDay();
                $dailySalesRaw = Order::where('status', '!=', 'cancelled')
                    ->where('created_at', '>=', $from)
                    ->select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(total_amount) as total'))
                    ->groupBy(DB::raw('DATE(created_at)'))
                    ->orderBy(DB::raw('DATE(created_at)'))
                    ->get()
                    ->keyBy('date');

                $dailySales = collect(range(0, 6))->map(function ($i) use ($dailySalesRaw, $from) {
                    $date = $from->copy()->addDays($i)->toDateString();
                    return [
                        'date' => $date,
                        'total' => (float) ($dailySalesRaw[$date]->total ?? 0),
                    ];
                });

                $stats = [
                    'total_sales' => number_format((float) Order::sum('total_amount')),
                    'active_shops' => Shop::count(),
                    'total_orders' => Order::count(),
                    'system_users' => User::count(),
                ];

                return inertia('Admin/Dashboard', [
                    'stats' => $stats,
                    'recentOrders' => $recentOrders,
                    'dailySales' => $dailySales,
                ]);
            }

            if ($user->hasRole('manager')) {
                $shopId = $user->shop_id;

                $recentOrders = Order::with(['user', 'shop'])
                    ->where('shop_id', $shopId)
                    ->latest()
                    ->take(10)
                    ->get();

                $from = Carbon::now()->subDays(6)->startOfDay();
                $dailySalesRaw = Order::where('shop_id', $shopId)
                    ->where('status', '!=', 'cancelled')
                    ->where('created_at', '>=', $from)
                    ->select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(total_amount) as total'))
                    ->groupBy(DB::raw('DATE(created_at)'))
                    ->orderBy(DB::raw('DATE(created_at)'))
                    ->get()
                    ->keyBy('date');

                $dailySales = collect(range(0, 6))->map(function ($i) use ($dailySalesRaw, $from) {
                    $date = $from->copy()->addDays($i)->toDateString();
                    return [
                        'date' => $date,
                        'total' => (float) ($dailySalesRaw[$date]->total ?? 0),
                    ];
                });

                return inertia('Admin/ManagerDashboard', [
                    'shop' => Shop::find($shopId),
                    'stats' => [
                        'shop_sales' => number_format((float) Order::where('shop_id', $shopId)->sum('total_amount')),
                        'total_orders' => Order::where('shop_id', $shopId)->count(),
                        'pending_orders' => Order::where('shop_id', $shopId)->where('status', 'pending')->count(),
                        'team_members' => User::where('shop_id', $shopId)->count(),
                    ],
                    'recentOrders' => $recentOrders,
                    'dailySales' => $dailySales,
                ]);
            }

            if ($user->hasRole('sales')) {
                $shopId = $user->shop_id;
                $today = now()->startOfDay();

                return inertia('Admin/SalesDashboard', [
                    'shop' => Shop::find($shopId),
                    'stats' => [
                        'today_orders' => Order::where('shop_id', $shopId)->where('created_at', '>=', $today)->count(),
                        'pending_orders' => Order::where('shop_id', $shopId)->where('status', 'pending')->count(),
                        'confirmed_orders' => Order::where('shop_id', $shopId)->where('status', 'confirmed')->count(),
                        'today_sales' => number_format((float) Order::where('shop_id', $shopId)->where('created_at', '>=', $today)->sum('total_amount')),
                    ],
                    'recentOrders' => Order::with(['user', 'shop'])
                        ->where('shop_id', $shopId)
                        ->latest()
                        ->take(10)
                        ->get(),
                ]);
            }

            if ($user->hasRole('delivery')) {
                $shopId = $user->shop_id;
                $deliveryQuery = Order::with(['user', 'shop'])
                    ->when($shopId, fn ($q) => $q->where('shop_id', $shopId));

                return inertia('Admin/DeliveryDashboard', [
                    'shop' => $shopId ? Shop::find($shopId) : null,
                    'stats' => [
                        'assigned_orders' => (clone $deliveryQuery)->whereIn('status', ['confirmed', 'shipped'])->count(),
                        'in_transit' => (clone $deliveryQuery)->where('status', 'shipped')->count(),
                        'delivered_today' => (clone $deliveryQuery)->whereDate('delivered_at', now()->toDateString())->count(),
                        'location_updates_needed' => (clone $deliveryQuery)->where('status', 'shipped')->whereNull('delivery_updated_at')->count(),
                    ],
                    'deliveryOrders' => (clone $deliveryQuery)
                        ->whereIn('status', ['confirmed', 'shipped', 'delivered'])
                        ->latest()
                        ->take(12)
                        ->get(),
                ]);
            }
        }

        // 🎯 သာမန် User ဖြစ်ရင် Pages/Dashboard.jsx ဆီ ပို့မယ်
        $recentOrders = Order::where('user_id', $user->id)
            ->latest()
            ->take(5)
            ->get();

        return inertia('Dashboard', [
            'orderCount' => Order::where('user_id', $user->id)->count(),
            'recentOrders' => $recentOrders,
        ]);
    }
}
