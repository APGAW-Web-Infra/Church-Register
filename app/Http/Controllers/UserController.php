<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $this->authorizeAdmin($request);

        $query = User::with(['roles']);

        // Search
        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%')
                  ->orWhere('firstname', 'like', '%' . $request->search . '%')
                  ->orWhere('lastname', 'like', '%' . $request->search . '%');
            });
        }

        // Filter by role
        if ($request->filled('role')) {
            $query->whereHas('roles', function($q) use ($request) {
                $q->where('id', $request->role);
            });
        }

        // Filter by email verification status
        if ($request->filled('status')) {
            if ($request->status === 'verified') {
                $query->whereNotNull('email_verified_at');
            } else {
                $query->whereNull('email_verified_at');
            }
        }

        // Filter by registration status
        if ($request->filled('registration_status')) {
            $query->where('registration_status', $request->registration_status);
        }

        // Filter by sector
        if ($request->filled('sector')) {
            $query->where('sector', $request->sector);
        }

        // Filter by state
        if ($request->filled('state')) {
            $query->where('state', $request->state);
        }

        // Date range filter
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Sorting
        $sortField = $request->get('sort_field', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        $perPage = $request->get('per_page', 10);
        $users = $query->paginate($perPage);

        // Statistics
        $statistics = [
            'total_users' => User::count(),
            'verified_users' => User::whereNotNull('email_verified_at')->count(),
            'unverified_users' => User::whereNull('email_verified_at')->count(),
            'today_users' => User::whereDate('created_at', today())->count(),
            'pending_users' => User::where('registration_status', 'pending')->count(),
            'suspended_users' => User::where('registration_status', 'suspended')->count(),
            'total_roles' => Role::count(),
        ];

        // Filter options
        $filterOptions = [
            'statuses' => [
                ['value' => 'verified', 'label' => 'Email Verified'],
                ['value' => 'unverified', 'label' => 'Email Unverified'],
            ],
            'registrationStatuses' => [
                ['value' => 'pending', 'label' => 'Pending'],
                ['value' => 'verified', 'label' => 'Verified'],
                ['value' => 'suspended', 'label' => 'Suspended'],
                ['value' => 'rejected', 'label' => 'Rejected'],
            ],
            'sectors' => User::distinct()->whereNotNull('sector')->pluck('sector')->toArray(),
            'states' => User::distinct()->whereNotNull('state')->pluck('state')->toArray(),
        ];

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'roles' => Role::all(),
            'filters' => $request->only(['search', 'role', 'status', 'registration_status', 'sector', 'state', 'date_from', 'date_to', 'sort_field', 'sort_direction', 'per_page']),
            'filterOptions' => $filterOptions,
            'statistics' => $statistics,
        ]);
    }

    public function create(Request $request)
    {
        $this->authorizeAdmin($request);

        return Inertia::render('Admin/Users/Create', [
            'roles' => Role::all(),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:users',
            'email' => 'required|email|unique:users',
            'firstname' => 'nullable|string|max:255',
            'lastname' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:8|confirmed',
            'sector' => 'nullable|string',
            'address' => 'nullable|string',
            'date_of_birth' => 'nullable|date',
            'education_level' => 'nullable|in:primary,secondary,diploma,bachelors,masters,phd',
            'skills_of_interest' => 'nullable|array',
            'state' => 'nullable|string',
            'lga' => 'nullable|string',
            'nin' => 'nullable|string',
            'passport_number' => 'nullable|string',
            'registration_status' => 'nullable|in:pending,verified,suspended,rejected',
            'roles' => 'nullable|array',
            'roles.*' => 'exists:roles,id',
        ]);

        $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);

        if (!empty($validated['roles'])) {
            $user->roles()->sync($validated['roles']);
        }

        return redirect()->route('users.index')
            ->with('success', 'User created successfully!');
    }

    public function show(Request $request, User $user)
    {
        $this->authorizeAdmin($request);

        $user->load(['roles', 'permissions']);

        return Inertia::render('Admin/Users/Show', [
            'user' => $user,
        ]);
    }

    public function edit(Request $request, User $user)
    {
        $this->authorizeAdmin($request);

        $user->load('roles');

        return Inertia::render('Admin/Users/Edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'firstname' => $user->firstname,
                'lastname' => $user->lastname,
                'email' => $user->email,
                'phone' => $user->phone,
                'sector' => $user->sector,
                'address' => $user->address,
                'date_of_birth' => $user->date_of_birth,
                'education_level' => $user->education_level,
                'skills_of_interest' => $user->skills_of_interest,
                'state' => $user->state,
                'lga' => $user->lga,
                'nin' => $user->nin,
                'passport_number' => $user->passport_number,
                'registration_status' => $user->registration_status,
                'roles' => $user->roles->pluck('id')->toArray(),
            ],
            'roles' => Role::all(),
        ]);
    }

 public function update(Request $request, User $user)
{
    $this->authorizeAdmin($request);

    $validated = $request->validate([
        'name' => ['required', 'string', 'max:255', Rule::unique('users')->ignore($user->id)],
        'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
        'firstname' => 'nullable|string|max:255',
        'lastname' => 'nullable|string|max:255',
        'phone' => 'nullable|string|max:20',
        'password' => 'nullable|string|min:8|confirmed',
        'sector' => 'nullable|string',
        'address' => 'nullable|string',
        'date_of_birth' => 'nullable|date',
        'education_level' => 'nullable|in:primary,secondary,diploma,bachelors,masters,phd',
        'skills_of_interest' => 'nullable|array',
        'state' => 'nullable|string',
        'lga' => 'nullable|string',
        'nin' => 'nullable|string|max:11',
        'passport_number' => 'nullable|string|max:20',
        'registration_status' => 'required|in:pending,verified,suspended,rejected',
        'roles' => 'nullable|array',
        'roles.*' => 'exists:roles,id',
    ]);

    // Only hash password if provided
    if (!empty($validated['password'])) {
        $validated['password'] = Hash::make($validated['password']);
    } else {
        unset($validated['password']);
    }

    // Update user
    $user->update($validated);

    // Sync roles if provided
    if (isset($validated['roles'])) {
        $user->roles()->sync($validated['roles']);
    }

    return redirect()->route('users.show', $user->id)
        ->with('success', 'User updated successfully!');
}

    public function destroy(Request $request, User $user)
    {
        $this->authorizeAdmin($request);

        if ($user->id === Auth::user()->id) {
            return back()->withErrors(['error' => 'You cannot delete your own account.']);
        }

        $user->delete();

        return redirect()->route('users.index')
            ->with('success', 'User deleted successfully!');
    }

    public function export(Request $request)
    {
        $this->authorizeAdmin($request);

        // Implementation for CSV export
        $query = User::with(['roles']);

        // Apply same filters as index
        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }

        // Add other filters...

        $users = $query->get();

        $csv = "Name,Email,Phone,State,Registration Status,Email Verified,Roles,Created At\n";

        foreach ($users as $user) {
            $csv .= sprintf(
                '"%s","%s","%s","%s","%s","%s","%s","%s"' . "\n",
                $user->name,
                $user->email,
                $user->phone ?? '',
                $user->state ?? '',
                $user->registration_status,
                $user->email_verified_at ? 'Yes' : 'No',
                $user->roles->pluck('name')->implode(', '),
                $user->created_at->format('Y-m-d H:i:s')
            );
        }

        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="users_' . date('Y-m-d') . '.csv"');
    }

    private function authorizeAdmin(Request $request): void
    {
        abort_unless($request->user()?->hasRole(['super_admin', 'admin']), 403, 'Unauthorized access to user management.');
    }
}
