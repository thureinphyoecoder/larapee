<?php

namespace App\Actions\Orders;

use App\Models\Order;

class TransitionOrderStatusAction
{
    public function __construct(
        private readonly RestockOrderItemsAction $restockOrderItemsAction,
    ) {
    }

    /**
     * @param array{cancel_reason?:string|null,return_reason?:string|null} $extra
     */
    public function execute(Order $order, string $nextStatus, ?int $actorId = null, array $extra = []): Order
    {
        $previousStatus = (string) $order->status;

        $update = ['status' => $nextStatus];

        if ($nextStatus === 'refund_requested') {
            $update['refund_requested_at'] = now();
        }
        if ($nextStatus === 'refunded') {
            $update['refunded_at'] = now();
        }
        if ($nextStatus === 'return_requested') {
            $update['return_requested_at'] = now();
            $update['return_reason'] = $extra['return_reason'] ?? null;
        }
        if ($nextStatus === 'returned') {
            $update['returned_at'] = now();
        }
        if ($nextStatus === 'delivered') {
            $update['delivered_at'] = now();
        }
        if ($nextStatus === 'cancelled') {
            $update['cancelled_at'] = now();
            $update['cancel_reason'] = $extra['cancel_reason'] ?? null;
        }

        $order->update($update);

        if (
            in_array($nextStatus, ['cancelled', 'refunded', 'returned'], true)
            && ! in_array($previousStatus, ['cancelled', 'refunded', 'returned'], true)
        ) {
            $this->restockOrderItemsAction->execute($order, $actorId);
        }

        return $order;
    }
}
