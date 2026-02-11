<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Auth\LoginRequest;
use App\Http\Requests\Api\V1\Auth\RegisterRequest;
use App\Http\Resources\Api\V1\UserResource;
use App\Models\User;
use App\Support\Payroll\PayrollCalculator;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Role;

class AuthController extends Controller
{
    public function __construct(
        private readonly PayrollCalculator $payrollCalculator,
    ) {
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::query()->create([
            'name' => $request->string('name')->toString(),
            'email' => $request->string('email')->toString(),
            'password' => $request->string('password')->toString(),
            'shop_id' => $request->integer('shop_id') ?: null,
        ]);

        if (Role::query()->where('name', 'customer')->exists()) {
            $user->assignRole('customer');
        }

        $token = $user->createToken($request->input('device_name', 'pos-client'))->plainTextToken;

        return response()->json([
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => new UserResource($user->load('roles')),
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::query()->where('email', $request->string('email')->toString())->first();

        if (! $user || ! Hash::check($request->string('password')->toString(), $user->password)) {
            throw ValidationException::withMessages([
                'email' => 'Invalid credentials.',
            ]);
        }

        $token = $user->createToken($request->input('device_name', 'pos-client'))->plainTextToken;

        return response()->json([
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => new UserResource($user->load('roles')),
        ]);
    }

    public function me(): JsonResponse
    {
        $user = request()->user()?->load(['roles', 'profile', 'shop', 'payrollProfile']);
        $month = now()->format('Y-m');
        $salaryPreview = null;

        if ($user && $user->hasAnyRole(['delivery', 'sales', 'manager', 'accountant', 'technician', 'cashier', 'admin'])) {
            $salaryPreview = $this->payrollCalculator
                ->calculate(collect([$user]), $month)
                ->first();
        }

        return response()->json([
            'user' => new UserResource($user),
            'profile' => [
                'shop_name' => $user?->shop?->name,
                'phone_number' => $user?->profile?->phone_number,
                'address' => $user?->profile?->address_line_1,
            ],
            'salary_preview' => $salaryPreview ? [
                'month' => $month,
                'net_salary' => (float) ($salaryPreview['totals']['net'] ?? 0),
                'gross_salary' => (float) ($salaryPreview['totals']['gross'] ?? 0),
                'deduction' => (float) ($salaryPreview['totals']['deduction'] ?? 0),
                'worked_days' => (int) ($salaryPreview['attendance']['days'] ?? 0),
                'expected_days' => (int) ($salaryPreview['attendance']['expected_days'] ?? 0),
            ] : null,
        ]);
    }

    public function logout(): JsonResponse
    {
        request()->user()?->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }
}
