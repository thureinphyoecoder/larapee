<?php

namespace App\Actions\Support;

use App\Events\SupportMessageSeen;
use App\Models\SupportMessage;
use Illuminate\Support\Collection;

class MarkSupportMessagesSeenAction
{
    public function execute(int $viewerId, Collection $messages): void
    {
        $unseen = $messages
            ->filter(fn ($message) => $message instanceof SupportMessage)
            ->filter(fn (SupportMessage $message) => (int) $message->sender_id !== $viewerId && $message->seen_at === null)
            ->values();

        if ($unseen->isEmpty()) {
            return;
        }

        $now = now();
        $ids = $unseen->pluck('id')->all();

        SupportMessage::query()->whereIn('id', $ids)->update(['seen_at' => $now]);

        foreach ($unseen as $message) {
            event(new SupportMessageSeen(
                messageId: (int) $message->id,
                viewerId: $viewerId,
                customerId: (int) $message->customer_id,
                staffId: $message->staff_id ? (int) $message->staff_id : null,
            ));
        }
    }
}
