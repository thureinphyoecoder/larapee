<?php

namespace App\Actions\Orders;

use App\Models\CartItem;
use App\Models\Order;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\ValidationException;

class CreateOrderFromCartAction
{
    public function __construct(
        private readonly CreateOrderFromItemsAction $createOrderFromItemsAction,
    ) {
    }

    public function execute(
        User $user,
        ?string $phone = null,
        ?string $address = null,
        ?int $shopId = null,
        ?UploadedFile $paymentSlip = null,
        ?string $idempotencyKey = null,
    ): Order {
        $cartItems = CartItem::query()
            ->with('variant.product:id,shop_id')
            ->where('user_id', $user->id)
            ->get(['id', 'variant_id', 'quantity']);

        if ($cartItems->isEmpty()) {
            throw ValidationException::withMessages([
                'cart' => 'Cart is empty.',
            ]);
        }

        $defaultShopId = $shopId ?: ($user->shop_id ?: Shop::query()->orderBy('id')->value('id'));
        $grouped = $cartItems->groupBy(function (CartItem $item) use ($defaultShopId) {
            $resolved = $item->variant?->product?->shop_id ?: $defaultShopId;
            return (int) ($resolved ?: 0);
        });

        $firstOrder = null;

        foreach ($grouped as $resolvedShopId => $groupItems) {
            $items = $groupItems
                ->map(fn (CartItem $item) => [
                    'variant_id' => (int) $item->variant_id,
                    'quantity' => (int) $item->quantity,
                ])
                ->all();

            if ($items === []) {
                continue;
            }

            $order = $this->createOrderFromItemsAction->execute(
                user: $user,
                items: $items,
                phone: $phone,
                address: $address,
                customerName: null,
                customerId: null,
                forcedShopId: ((int) $resolvedShopId) > 0 ? (int) $resolvedShopId : (int) ($defaultShopId ?: 0),
                paymentSlip: $paymentSlip,
                idempotencyKey: $idempotencyKey ? "{$idempotencyKey}:shop:{$resolvedShopId}" : null,
            );

            if (! $firstOrder) {
                $firstOrder = $order;
            }
        }

        if (! $firstOrder) {
            throw ValidationException::withMessages([
                'cart' => 'Cart could not be converted to order items.',
            ]);
        }

        CartItem::query()->where('user_id', $user->id)->delete();

        return $firstOrder;
    }
}
