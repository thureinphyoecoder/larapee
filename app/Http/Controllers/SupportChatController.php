<?php

namespace App\Http\Controllers;

use App\Actions\Support\MarkSupportMessagesSeenAction;
use App\Actions\Support\StoreSupportMessageAction;
use App\Events\SupportMessageSent;
use App\Http\Requests\Support\StoreSupportMessageRequest;
use App\Models\SupportMessage;
use App\Models\User;
use App\Services\SupportAutoReplyService;
use App\Services\SupportChatQueryService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SupportChatController extends Controller
{
    public function __construct(
        private readonly SupportAutoReplyService $autoReplyService,
        private readonly SupportChatQueryService $chatQueryService,
        private readonly StoreSupportMessageAction $storeSupportMessageAction,
        private readonly MarkSupportMessagesSeenAction $markSupportMessagesSeenAction,
    ) {
    }

    public function customer(Request $request)
    {
        $user = $request->user();
        $messagePaginator = $this->chatQueryService->customerMessages($user);
        $this->markSupportMessagesSeenAction->execute($user->id, collect($messagePaginator->items()));

        $payload = $this->chatQueryService->messagePayload($messagePaginator);

        return Inertia::render('Support/Chat', [
            'messages' => $payload['messages'],
            'messagePagination' => $payload['messagePagination'],
            'assignedStaff' => $this->chatQueryService->assignedStaffForCustomer($user),
        ]);
    }

    public function adminIndex(Request $request)
    {
        $user = $request->user();
        abort_unless($user->hasAnyRole(['admin', 'manager', 'sales']), 403);

        $conversations = $this->chatQueryService->adminConversations($user);
        $activeCustomerId = (int) ($request->integer('customer') ?: ($conversations->first()['customer_id'] ?? 0));

        $messages = [];
        $messagePagination = [
            'current_page' => 1,
            'last_page' => 1,
            'per_page' => 30,
            'total' => 0,
            'has_more_pages' => false,
        ];

        if ($activeCustomerId > 0) {
            $messagePaginator = $this->chatQueryService->adminMessages($user, $activeCustomerId);
            $this->markSupportMessagesSeenAction->execute($user->id, collect($messagePaginator->items()));
            $payload = $this->chatQueryService->messagePayload($messagePaginator);
            $messages = $payload['messages'];
            $messagePagination = $payload['messagePagination'];
        }

        return Inertia::render('Admin/SupportInbox', [
            'conversations' => $conversations,
            'messages' => $messages,
            'messagePagination' => $messagePagination,
            'activeCustomerId' => $activeCustomerId,
        ]);
    }

    public function store(StoreSupportMessageRequest $request)
    {
        $user = $request->user();
        $isStaff = $user->hasAnyRole(['admin', 'manager', 'sales']);

        $message = $this->storeSupportMessageAction->execute(
            actor: $user,
            customerId: $isStaff ? (int) $request->integer('customer_id') : null,
            rawMessage: $request->input('message'),
            image: $request->file('image'),
        );

        event(new SupportMessageSent($message));

        if (! $isStaff) {
            $this->sendAutoReply($user, $message->staff_id, $message->message);
        }

        return back()->with('success', $isStaff ? 'Reply sent.' : 'Message sent to support team.');
    }

    private function sendAutoReply(User $customer, ?int $staffId, string $incomingMessage): void
    {
        $reply = $this->autoReplyService->buildReply($incomingMessage);

        if (! $reply) {
            return;
        }

        $bot = User::firstOrCreate(
            ['email' => 'support.bot@larapos.com'],
            [
                'name' => 'Support Bot',
                'password' => bcrypt(Str::random(40)),
            ],
        );

        if (! $bot->email_verified_at) {
            $bot->forceFill(['email_verified_at' => now()])->save();
        }

        $botMessage = SupportMessage::query()->create([
            'customer_id' => $customer->id,
            'staff_id' => $staffId,
            'sender_id' => $bot->id,
            'message' => $reply,
        ]);

        event(new SupportMessageSent($botMessage));
    }
}
