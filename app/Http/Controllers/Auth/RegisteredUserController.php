<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\MemberProfile;
use App\Models\User;
use App\Models\ChurchInvitation;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('Auth/Register', [
            'referralCode' => strtoupper((string) $request->query('ref', '')),
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'phone' => ['nullable', 'string', 'max:30'],
            'date_of_birth' => ['nullable', 'date', 'before_or_equal:today'],
            'gender' => ['nullable', 'in:1,2'],
            'membership_status' => ['nullable', 'in:1,2'],
            'workforce_status' => ['nullable', 'in:1,2'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'state' => 'nullable|string',
            'lga' => 'nullable|string',
            'referral_code' => ['nullable', 'string', 'size:10', 'exists:users,referral_code'],
            'profile_photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        if ($request->filled('membership_status')) {
            $request->validate([
                'profile_photo' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            ]);
        }

        $inviter = $request->filled('referral_code')
            ? User::query()->where('referral_code', strtoupper($request->string('referral_code')->toString()))->first()
            : null;

        if ($inviter && strtolower($inviter->email) === strtolower((string) $request->email)) {
            return back()->withErrors(['referral_code' => 'You cannot use your own referral code.'])->withInput();
        }

        $normalizedGender = $request->gender === '1' ? 'male' : ($request->gender === '2' ? 'female' : null);
        $normalizedMembershipStatus = $request->membership_status === '1' ? 'regular_member' : 'first_timer';
        $normalizedWorkforceStatus = $request->membership_status === '1' ? ($request->workforce_status === '1' ? 'unit_member' : ($request->workforce_status === '2' ? 'not_in_unit' : null)) : null;

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'date_of_birth' => $request->date_of_birth,
            'password' => Hash::make($request->password),
            'state' => $request->state,
            'lga' => $request->lga,
        ]);

        if ($request->filled('membership_status') || $request->hasFile('profile_photo')) {
            $memberProfile = MemberProfile::create([
                'user_id' => $user->id,
                'first_name' => $request->name,
                'phone' => $request->phone,
                'gender' => $normalizedGender,
                'date_of_birth' => $request->date_of_birth,
                'membership_status' => $normalizedMembershipStatus,
                'workforce_status' => $normalizedWorkforceStatus,
                'is_active' => true,
            ]);

            $memberProfile->update([
                'avatar_path' => $request->file('profile_photo')->store('member-profiles', 'local'),
            ]);
        }

        if ($inviter) {
            ChurchInvitation::create([
                'inviter_id' => $inviter->id,
                'invitee_id' => $user->id,
                'referral_code' => $inviter->referral_code,
                'registered_at' => now(),
            ]);
        }

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}
