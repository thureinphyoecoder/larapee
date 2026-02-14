<?php

namespace App\Listeners;

use App\Events\SupportMessageSent;
use App\Services\MobilePushNotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Cache;

class SendCustomerSupportPush implements ShouldQueue
{
    use InteractsWithQueue;

    public int $tries = 3;
    public int $backoff = 10;

    public function __construct(
        private readonly MobilePushNotificationService $pushService,
    ) {
    }

    public function handle(SupportMessageSent $event): void
    {
        $message = $event->supportMessage;

        if (! $message->customer_id) {
            return;
        }

        // Do not notify when customer sends message to themselves.
        if ((int) $message->sender_id === (int) $message->customer_id) {
            return;
        }

        $sender = (string) ($message->sender?->name ?: 'Support');
        $text = trim((string) ($message->message ?: ''));
        $dedupeKey = 'push:support-message:' . (int) $message->id;
        $lock = Cache::lock($dedupeKey, 120);
        if (! $lock->get()) {
            return;
        }

        try {
            $this->pushService->sendToUser(
                userId: (int) $message->customer_id,
                title: "{$sender} • Support",
                body: $text !== '' ? $text : 'Sent an attachment.',
                data: [
                    'type' => 'support_message',
                    'message_id' => $message->id,
                    'customer_id' => $message->customer_id,
                ],
                app: 'customer-mobile',
            );
        } finally {
            optional($lock)->release();
        }
    }
}
