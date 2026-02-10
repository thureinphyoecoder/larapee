<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PayrollAdjustment;
use App\Models\PayrollPayout;
use App\Models\PayrollProfile;
use App\Models\User;
use App\Support\Payroll\PayrollCalculator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PayrollController extends Controller
{
    public function __construct(
        private readonly PayrollCalculator $payrollCalculator,
    ) {
    }

    public function index(Request $request): Response
    {
        $actor = $request->user();
        abort_unless($actor && $actor->hasAnyRole(['admin', 'accountant']), 403);

        $month = $this->payrollCalculator->normalizeMonth((string) $request->string('month')->toString());

        $staffRoles = ['manager', 'sales', 'delivery', 'cashier', 'accountant', 'technician'];
        $staff = User::query()
            ->with(['roles:id,name', 'shop:id,name', 'payrollProfile'])
            ->whereHas('roles', fn ($q) => $q->whereIn('name', $staffRoles))
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'shop_id']);

        $rows = $this->payrollCalculator->calculate($staff, $month);
        [, $to] = $this->payrollCalculator->monthRange($month);

        return Inertia::render('Admin/Payroll/Index', [
            'month' => $month,
            'rows' => $rows,
            'previewReleaseDate' => $to->copy()->subDays(3)->toDateString(),
            'summary' => [
                'staff_count' => $rows->count(),
                'total_net' => (float) $rows->sum(fn ($r) => $r['totals']['net'] ?? 0),
                'paid_count' => $rows->filter(fn ($r) => !empty($r['payout']))->count(),
            ],
        ]);
    }

    public function upsertProfile(Request $request, User $user): RedirectResponse
    {
        $actor = $request->user();
        abort_unless($actor && $actor->hasAnyRole(['admin', 'accountant']), 403);

        $validated = $request->validate([
            'base_salary' => ['required', 'numeric', 'min:0'],
            'allowance' => ['nullable', 'numeric', 'min:0'],
            'attendance_bonus_per_day' => ['nullable', 'numeric', 'min:0'],
            'absence_deduction_per_day' => ['nullable', 'numeric', 'min:0'],
            'performance_bonus' => ['nullable', 'numeric', 'min:0'],
            'overtime_rate_per_hour' => ['nullable', 'numeric', 'min:0'],
            'effective_from' => ['nullable', 'date'],
        ]);

        PayrollProfile::query()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'base_salary' => (float) $validated['base_salary'],
                'allowance' => (float) ($validated['allowance'] ?? 0),
                'attendance_bonus_per_day' => (float) ($validated['attendance_bonus_per_day'] ?? 0),
                'absence_deduction_per_day' => (float) ($validated['absence_deduction_per_day'] ?? 0),
                'performance_bonus' => (float) ($validated['performance_bonus'] ?? 0),
                'overtime_rate_per_hour' => (float) ($validated['overtime_rate_per_hour'] ?? 0),
                'effective_from' => $validated['effective_from'] ?? now()->toDateString(),
            ]
        );

        return back()->with('success', 'Payroll profile updated.');
    }

    public function storeAdjustment(Request $request, User $user): RedirectResponse
    {
        $actor = $request->user();
        abort_unless($actor && $actor->hasAnyRole(['admin', 'accountant']), 403);

        $validated = $request->validate([
            'type' => ['required', 'in:bonus,increment,deduction,allowance'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'reason' => ['required', 'string', 'max:255'],
            'effective_date' => ['required', 'date'],
            'is_recurring' => ['nullable', 'boolean'],
        ]);

        PayrollAdjustment::query()->create([
            'user_id' => $user->id,
            'type' => $validated['type'],
            'amount' => (float) $validated['amount'],
            'reason' => $validated['reason'],
            'effective_date' => $validated['effective_date'],
            'is_recurring' => (bool) ($validated['is_recurring'] ?? false),
            'created_by' => $actor->id,
        ]);

        return back()->with('success', 'Payroll adjustment recorded.');
    }

    public function payout(Request $request, User $user): RedirectResponse
    {
        $actor = $request->user();
        abort_unless($actor && $actor->hasAnyRole(['admin', 'accountant']), 403);

        $validated = $request->validate([
            'period_month' => ['required', 'date_format:Y-m'],
            'gross_amount' => ['required', 'numeric', 'min:0'],
            'deduction_amount' => ['required', 'numeric', 'min:0'],
            'net_amount' => ['required', 'numeric', 'min:0'],
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        PayrollPayout::query()->updateOrCreate(
            [
                'user_id' => $user->id,
                'period_month' => $validated['period_month'],
            ],
            [
                'gross_amount' => (float) $validated['gross_amount'],
                'deduction_amount' => (float) $validated['deduction_amount'],
                'net_amount' => (float) $validated['net_amount'],
                'status' => 'processed',
                'paid_at' => now(),
                'note' => $validated['note'] ?? null,
                'processed_by' => $actor->id,
            ]
        );

        return back()->with('success', 'Salary payout recorded.');
    }

}
