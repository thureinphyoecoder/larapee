<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Orders\CreateOrderFromCartAction;
use App\Actions\Orders\CreateOrderFromItemsAction;
use App\Actions\Orders\RestockOrderItemsAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Orders\StoreOrderRequest;
use App\Http\Requests\Api\V1\Orders\UpdateOrderStatusRequest;
use App\Http\Resources\Api\V1\OrderResource;
use App\Models\Order;
use Illuminate\Http\JsonResponse;

class OrderController extends Controller
{
    public function __construct(
        private readonly CreateOrderFromCartAction $createOrderFromCartAction,
        private readonly CreateOrderFromItemsAction $createOrderFromItemsAction,
        private readonly RestockOrderItemsAction $restockOrderItemsAction,
    ) {
    }

    public function index(): JsonResponse
    {
        $user = request()->user();
        $isStaff = $user->hasAnyRole(['admin', 'manager', 'sales', 'delivery']);

        $orders = Order::query()
            ->with(['user.roles', 'shop', 'items.product', 'items.variant'])
            ->when(! $isStaff, fn ($q) => $q->where('user_id', $user->id))
            ->latest('id')
            ->paginate((int) request('per_page', 20))
            ->withQueryString();

        return response()->json([
            'data' => OrderResource::collection($orders->getCollection()),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    public function show(Order $order): JsonResponse
    {
        $user = request()->user();
        $isStaff = $user->hasAnyRole(['admin', 'manager', 'sales', 'delivery']);

        if (! $isStaff && (int) $order->user_id !== (int) $user->id) {
            abort(403);
        }

        return response()->json([
            'data' => new OrderResource($order->load(['user.roles', 'shop', 'items.product', 'items.variant'])),
        ]);
    }

    public function store(StoreOrderRequest $request): JsonResponse
    {
        $user = $request->user();

        $order = $request->filled('items')
            ? $this->createOrderFromItemsAction->execute(
                user: $user,
                items: $request->input('items', []),
                phone: $request->string('phone')->toString(),
                address: $request->string('address')->toString(),
                forcedShopId: $request->integer('shop_id') ?: null,
                paymentSlip: $request->file('payment_slip'),
            )
            : $this->createOrderFromCartAction->execute(
                user: $user,
                phone: $request->string('phone')->toString(),
                address: $request->string('address')->toString(),
                shopId: $request->integer('shop_id') ?: null,
                paymentSlip: $request->file('payment_slip'),
            );

        event(new \App\Events\NewOrderPlaced($order));

        return response()->json([
            'message' => 'Order created successfully.',
            'data' => new OrderResource($order),
        ], 201);
    }

    public function updateStatus(UpdateOrderStatusRequest $request, Order $order): JsonResponse
    {
        $previousStatus = $order->status;
        $nextStatus = $request->string('status')->toString();

        $order->update(['status' => $nextStatus]);

        if (
            in_array($nextStatus, ['cancelled', 'refunded', 'returned'], true)
            && ! in_array($previousStatus, ['cancelled', 'refunded', 'returned'], true)
        ) {
            $this->restockOrderItemsAction->execute($order);
        }

        if ($nextStatus === 'refund_requested') {
            $order->update(['refund_requested_at' => now()]);
        }
        if ($nextStatus === 'refunded') {
            $order->update(['refunded_at' => now()]);
        }
        if ($nextStatus === 'return_requested') {
            $order->update(['return_requested_at' => now()]);
        }
        if ($nextStatus === 'returned') {
            $order->update(['returned_at' => now()]);
        }
        if ($nextStatus === 'delivered') {
            $order->update(['delivered_at' => now()]);
        }

        event(new \App\Events\OrderStatusUpdated($order));

        return response()->json([
            'message' => 'Order status updated.',
            'data' => new OrderResource($order->load(['user.roles', 'shop', 'items.product', 'items.variant'])),
        ]);
    }
}
