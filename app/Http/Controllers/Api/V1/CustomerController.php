<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class CustomerController extends Controller
{
    public function index(): JsonResponse
    {
        $user = request()->user();
        abort_unless($user->hasAnyRole(['admin', 'manager', 'sales']), 403);

        $customers = User::query()
            ->role('customer')
            ->with('roles')
            ->orderByDesc('id')
            ->paginate((int) request('per_page', 20))
            ->withQueryString();

        return response()->json([
            'data' => UserResource::collection($customers->getCollection()),
            'meta' => [
                'current_page' => $customers->currentPage(),
                'last_page' => $customers->lastPage(),
                'per_page' => $customers->perPage(),
                'total' => $customers->total(),
            ],
        ]);
    }
}
