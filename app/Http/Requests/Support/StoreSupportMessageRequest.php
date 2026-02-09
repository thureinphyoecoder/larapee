<?php

namespace App\Http\Requests\Support;

use Illuminate\Foundation\Http\FormRequest;

class StoreSupportMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $isStaff = $this->user()?->hasAnyRole(['admin', 'manager', 'sales']);

        return [
            // Message can be empty when an image is attached. Final empty-check is handled in action.
            'message' => ['nullable', 'string', 'max:1000'],
            'customer_id' => [$isStaff ? 'required' : 'nullable', 'integer', 'exists:users,id'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:3072'],
        ];
    }
}
