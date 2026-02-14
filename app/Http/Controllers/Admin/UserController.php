<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Shop;
use App\Models\StaffAttendance;
use App\Models\User;
use App\Support\Payroll\PayrollCalculator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function __construct(
        private readonly PayrollCalculator $payrollCalculator,
    ) {
    }

    public function index(Request $request)
    {
        $actor = $request->user();
        $staffRoles = ['admin', 'manager', 'sales', 'delivery'];
        $type = $request->get('type', 'staff');
        $search = trim((string) $request->get('search', ''));

        $baseRelations = ['roles', 'shop'];
        if ($actor?->hasRole('admin')) {
            $baseRelations[] = 'profile';
        }

        $query = User::with($baseRelations)->orderByDesc('id');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($type === 'customers') {
            $query->whereDoesntHave('roles', function ($q) use ($staffRoles) {
                $q->whereIn('name', $staffRoles);
            });
        } else {
            $query->whereHas('roles', function ($q) use ($staffRoles) {
                $q->whereIn('name', $staffRoles);
            });
        }

        if ($actor?->hasRole('manager')) {
            $query->where('shop_id', $actor->shop_id)
                ->whereHas('roles', function ($q) {
                    $q->whereIn('name', ['sales', 'delivery']);
                });
        }

        $users = $query->paginate(10)->withQueryString();

        $todayStart = Carbon::now()->startOfDay();
        $staffRows = collect($users->items());
        $staffIds = $staffRows->pluck('id')->all();

        $todayAttendance = empty($staffIds)
            ? collect()
            : StaffAttendance::whereIn('user_id', $staffIds)
                ->where('check_in_at', '>=', $todayStart)
                ->orderByDesc('check_in_at')
                ->get()
                ->groupBy('user_id');

        $users->setCollection(
            $staffRows->map(function ($user) use ($todayAttendance) {
                $latest = optional($todayAttendance->get($user->id))->first();
                $activeMinutes = 0;

                if ($latest) {
                    $activeMinutes = $latest->check_out_at
                        ? (int) $latest->worked_minutes
                        : (int) $latest->check_in_at->diffInMinutes(now());
                }

                $user->setAttribute('attendance_today', [
                    'checked_in' => (bool) ($latest && $latest->check_out_at === null),
                    'check_in_at' => $latest?->check_in_at?->toDateTimeString(),
                    'check_out_at' => $latest?->check_out_at?->toDateTimeString(),
                    'worked_minutes' => $activeMinutes,
                ]);

                return $user;
            }),
        );

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'type' => $type,
            'search' => $search,
            'roles' => collect($this->allowedRolesFor($actor)),
            'shops' => Shop::orderBy('name')->get(),
            'canViewSensitiveDetails' => (bool) $actor?->hasRole('admin'),
        ]);
    }

    public function store(Request $request)
    {
        abort_unless($request->user()?->hasAnyRole(['admin', 'manager']), 403);
        $roles = $this->allowedRolesFor($request->user());

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => 'required|in:' . implode(',', $roles),
            'shop_id' => 'nullable|exists:shops,id',
        ]);

        $staffRoles = ['manager', 'sales', 'delivery', 'cashier', 'accountant', 'technician'];
        if (in_array($validated['role'], $staffRoles, true) && empty($validated['shop_id'])) {
            return back()->withErrors(['shop_id' => 'Staff role သတ်မှတ်ထားရင် shop လည်းရွေးပေးပါ။']);
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'shop_id' => in_array($validated['role'], $staffRoles, true) ? $validated['shop_id'] : null,
            'email_verified_at' => now(),
        ]);

        $user->syncRoles([$validated['role']]);

        return redirect()->route('admin.users.index')->with('success', 'Staff user created.');
    }

    public function update(Request $request, User $user)
    {
        abort_unless($request->user()?->hasAnyRole(['admin', 'manager']), 403);
        $roles = $this->allowedRolesFor($request->user());

        $validated = $request->validate([
            'role' => 'required|in:' . implode(',', $roles),
            'shop_id' => 'nullable|exists:shops,id',
        ]);

        if ($request->user()?->hasRole('manager') && $user->hasAnyRole(['admin', 'manager'])) {
            return back()->withErrors(['role' => 'Manager cannot modify admin/manager accounts.']);
        }

        $staffRoles = ['manager', 'sales', 'delivery', 'cashier', 'accountant', 'technician'];
        if (in_array($validated['role'], $staffRoles, true) && empty($validated['shop_id'])) {
            return back()->withErrors(['shop_id' => 'Staff role သတ်မှတ်ထားရင် shop လည်းရွေးပေးပါ။']);
        }

        $user->syncRoles([$validated['role']]);
        $user->shop_id = in_array($validated['role'], $staffRoles, true) ? $validated['shop_id'] : null;
        $user->save();

        return back()->with('success', 'User updated.');
    }

    public function destroy(User $user)
    {
        abort_unless($user->id !== auth()->id(), 422, 'You cannot delete yourself.');
        abort_unless(request()->user()?->hasRole('admin'), 403);

        if ($user->hasRole('admin')) {
            return back()->withErrors(['user' => 'Admin account cannot be deleted from this panel.']);
        }

        $user->delete();
        return back()->with('success', 'User deleted.');
    }

    public function show(Request $request, User $user)
    {
        $actor = $request->user();
        abort_unless($actor && $actor->hasRole('admin'), 403);

        $selectedMonth = $this->payrollCalculator->normalizeMonth((string) $request->string('month')->toString());
        $user->load(['roles', 'shop', 'profile', 'payrollProfile']);
        $staffRoles = ['admin', 'manager', 'sales', 'delivery', 'cashier', 'accountant', 'technician'];
        $isStaff = $user->roles->pluck('name')->intersect($staffRoles)->isNotEmpty();

        $attendances = StaffAttendance::query()
            ->where('user_id', $user->id)
            ->latest('check_in_at')
            ->take(12)
            ->get(['id', 'check_in_at', 'check_out_at', 'worked_minutes']);

        $recentOrders = Order::query()
            ->with(['shop:id,name'])
            ->where('user_id', $user->id)
            ->latest('id')
            ->take(12)
            ->get(['id', 'invoice_no', 'receipt_no', 'status', 'total_amount', 'created_at', 'shop_id']);

        $payrollPreview = null;
        if ($isStaff) {
            $payrollPreview = $this->payrollCalculator->calculate(collect([$user]), $selectedMonth)->first();
        }

        return Inertia::render('Admin/Users/Show', [
            'record' => $user,
            'isStaff' => $isStaff,
            'selectedMonth' => $selectedMonth,
            'stats' => [
                'order_count' => Order::query()->where('user_id', $user->id)->count(),
                'total_spent' => (float) Order::query()->where('user_id', $user->id)->sum('total_amount'),
                'attendance_days' => StaffAttendance::query()->where('user_id', $user->id)->count(),
            ],
            'attendances' => $attendances,
            'recentOrders' => $recentOrders,
            'payrollPreview' => $payrollPreview,
        ]);
    }

    public function updatePhoto(Request $request, User $user)
    {
        $actor = $request->user();
        abort_unless($actor && $actor->hasRole('admin'), 403);

        $validated = $request->validate([
            'photo' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ]);

        $profile = $user->profile()->firstOrCreate(
            ['user_id' => $user->id],
            [
                'nrc_number' => 'Pending NRC',
                'address_line_1' => 'Address not provided',
                'city' => 'Unknown',
                'state' => 'Unknown',
            ]
        );
        if (!empty($profile->photo_path)) {
            Storage::disk('public')->delete($profile->photo_path);
        }

        $profile->update([
            'photo_path' => $request->file('photo')->store('profiles', 'public'),
        ]);

        return back()->with('success', 'Profile photo updated.');
    }

    private function allowedRolesFor(?User $actor): array
    {
        if ($actor?->hasRole('admin')) {
            return Role::orderBy('name')->pluck('name')->all();
        }

        if ($actor?->hasRole('manager')) {
            return ['sales', 'delivery', 'cashier', 'technician'];
        }

        return [];
    }
}
