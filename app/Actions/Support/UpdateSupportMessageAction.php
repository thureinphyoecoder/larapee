<?php

namespace App\Actions\Support;

use App\Models\SupportMessage;
use Illuminate\Validation\ValidationException;

class UpdateSupportMessageAction
{
    public function execute(SupportMessage $message, ?string $rawMessage): void
    {
        $clean = trim(preg_replace('/\s+/u', ' ', strip_tags((string) $rawMessage)) ?? '');

        if ($clean === '') {
            throw ValidationException::withMessages([
                'message' => 'Message cannot be empty.',
            ]);
        }

        $message->update(['message' => $clean]);
    }
}
