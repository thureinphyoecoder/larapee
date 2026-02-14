<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Support\DeleteSupportMessageAction;
use App\Actions\Support\MarkSupportMessagesSeenAction;
use App\Actions\Support\StoreSupportMessageAction;
use App\Actions\Support\UpdateSupportMessageAction;
use App\Events\SupportMessageSent;
use App\Http\Controllers\Controller;
use App\Http\Requests\Support\StoreSupportMessageRequest;
use App\Models\SupportMessage;
use App\Services\SupportChatQueryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class SupportController extends Controller
{
    public function __construct(
        private readonly SupportChatQueryService $chatQueryService,
        private readonly StoreSupportMessageAction $storeSupportMessageAction,
        private readonly MarkSupportMessagesSeenAction $markSupportMessagesSeenAction,
        private readonly UpdateSupportMessageAction $updateSupportMessageAction,
        private readonly DeleteSupportMessageAction $deleteSupportMessageAction,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user !== null, 401);

        $messagePaginator = $this->chatQueryService->customerMessages($user);
        $messages = collect($messagePaginator->items());

        if ($request->boolean('mark_seen', false)) {
            $this->markSupportMessagesSeenAction->execute($user->id, $messages);
        }
        $payload = $this->chatQueryService->messagePayload($messagePaginator);

        return response()->json([
            ...$payload,
            'assigned_staff' => $this->chatQueryService->assignedStaffForCustomer($user),
        ]);
    }

    public function store(StoreSupportMessageRequest $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user !== null, 401);

        $message = $this->storeSupportMessageAction->execute(
            actor: $user,
            customerId: null,
            rawMessage: $request->input('message'),
            image: $request->file('image'),
        );

        event(new SupportMessageSent($message));

        return response()->json([
            'message' => 'Message sent.',
            'data' => [
                'id' => $message->id,
            ],
        ], 201);
    }

    public function update(Request $request, SupportMessage $message): JsonResponse
    {
        $user = $request->user();
        abort_unless($user !== null, 401);
        abort_unless((int) $message->sender_id === (int) $user->id, 403);
        abort_unless((int) $message->customer_id === (int) $user->id, 403);

        $validated = $request->validate([
            'message' => ['required', 'string', 'max:1000'],
        ]);

        try {
            $this->updateSupportMessageAction->execute($message, (string) $validated['message']);
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Message updated.',
            'data' => ['id' => $message->id],
        ]);
    }

    public function destroy(Request $request, SupportMessage $message): JsonResponse
    {
        $user = $request->user();
        abort_unless($user !== null, 401);
        abort_unless((int) $message->sender_id === (int) $user->id, 403);
        abort_unless((int) $message->customer_id === (int) $user->id, 403);

        $deletedId = $this->deleteSupportMessageAction->execute($message);

        return response()->json([
            'message' => 'Message deleted.',
            'data' => ['id' => $deletedId],
        ]);
    }
}
