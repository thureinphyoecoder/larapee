<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ApprovalRequest;
use App\Models\FinancialAdjustment;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        abort_unless($user && $user->hasAnyRole(['admin', 'manager', 'accountant']), 403);

        $orderQuery = Order::query()
            ->with(['user:id,name,email', 'shop:id,name'])
            ->latest('id');

        if ($request->filled('status')) {
            $orderQuery->where('status', (string) $request->string('status'));
        }

        if ($request->filled('q')) {
            $q = trim((string) $request->string('q'));
            $orderQuery->where(function ($builder) use ($q): void {
                $builder
                    ->where('invoice_no', 'like', "%{$q}%")
                    ->orWhere('receipt_no', 'like', "%{$q}%")
                    ->orWhere('job_no', 'like', "%{$q}%")
                    ->orWhere('phone', 'like', "%{$q}%")
                    ->orWhereHas('user', fn ($query) => $query->where('name', 'like', "%{$q}%"));
            });
        }

        $orders = $orderQuery->paginate(20)->withQueryString();

        $approvals = ApprovalRequest::query()
            ->with(['order:id,invoice_no,status,total_amount', 'requester:id,name', 'approver:id,name'])
            ->latest('id')
            ->paginate(20, ['*'], 'approval_page')
            ->withQueryString();

        $adjustments = FinancialAdjustment::query()
            ->with(['order:id,invoice_no,total_amount', 'creator:id,name', 'approvalRequest:id,status'])
            ->latest('id')
            ->paginate(20, ['*'], 'adjustment_page')
            ->withQueryString();

        return Inertia::render('Admin/Payments/Index', [
            'orders' => $orders,
            'approvals' => $approvals,
            'adjustments' => $adjustments,
            'filters' => [
                'q' => $request->string('q')->toString(),
                'status' => $request->string('status')->toString(),
            ],
        ]);
    }

    public function requestApproval(Request $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user && $user->hasAnyRole(['admin', 'manager', 'accountant', 'cashier']), 403);

        $validated = $request->validate([
            'order_id' => ['required', 'integer', 'exists:orders,id'],
            'request_type' => ['required', 'in:discount,refund'],
            'amount' => ['nullable', 'numeric', 'min:0'],
            'reason' => ['required', 'string', 'max:255'],
        ]);

        ApprovalRequest::query()->create([
            'request_type' => $validated['request_type'],
            'status' => 'pending',
            'order_id' => (int) $validated['order_id'],
            'requested_by' => $user->id,
            'amount' => $validated['amount'] ?? null,
            'reason' => $validated['reason'],
        ]);

        return back()->with('success', 'Approval request submitted.');
    }

    public function approve(Request $request, ApprovalRequest $approvalRequest): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user && $user->hasAnyRole(['admin', 'manager', 'accountant']), 403);

        if ($approvalRequest->status !== 'pending') {
            return back()->withErrors(['approval' => 'Only pending requests can be approved.']);
        }

        $approvalRequest->update([
            'status' => 'approved',
            'approved_by' => $user->id,
            'approved_at' => now(),
        ]);

        return back()->with('success', 'Approval granted.');
    }

    public function reject(Request $request, ApprovalRequest $approvalRequest): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user && $user->hasAnyRole(['admin', 'manager', 'accountant']), 403);

        if ($approvalRequest->status !== 'pending') {
            return back()->withErrors(['approval' => 'Only pending requests can be rejected.']);
        }

        $approvalRequest->update([
            'status' => 'rejected',
            'approved_by' => $user->id,
            'rejected_at' => now(),
        ]);

        return back()->with('success', 'Approval rejected.');
    }

    public function createAdjustment(Request $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user && $user->hasAnyRole(['admin', 'manager', 'accountant']), 403);

        $validated = $request->validate([
            'order_id' => ['required', 'integer', 'exists:orders,id'],
            'adjustment_type' => ['required', 'in:reversal,adjustment'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'reason' => ['required', 'string', 'max:255'],
            'approval_request_id' => ['nullable', 'integer', 'exists:approval_requests,id'],
        ]);

        if (!empty($validated['approval_request_id'])) {
            $approved = ApprovalRequest::query()
                ->whereKey((int) $validated['approval_request_id'])
                ->where('order_id', (int) $validated['order_id'])
                ->where('status', 'approved')
                ->exists();

            if (! $approved) {
                return back()->withErrors(['approval_request_id' => 'Approval request must be approved first.']);
            }
        }

        FinancialAdjustment::query()->create([
            'order_id' => (int) $validated['order_id'],
            'adjustment_type' => $validated['adjustment_type'],
            'amount' => $validated['amount'],
            'reason' => $validated['reason'],
            'created_by' => $user->id,
            'approval_request_id' => $validated['approval_request_id'] ?? null,
        ]);

        return back()->with('success', 'Financial adjustment recorded.');
    }
}
