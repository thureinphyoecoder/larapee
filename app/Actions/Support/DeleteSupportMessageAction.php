<?php

namespace App\Actions\Support;

use App\Models\SupportMessage;
use Illuminate\Support\Facades\Storage;

class DeleteSupportMessageAction
{
    public function execute(SupportMessage $message): int
    {
        if ($message->attachment_path) {
            Storage::disk('public')->delete($message->attachment_path);
        }

        $deletedId = (int) $message->id;
        $message->delete();

        return $deletedId;
    }
}
