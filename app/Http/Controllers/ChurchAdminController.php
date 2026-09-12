<?php

namespace App\Http\Controllers;

use App\Models\AttendanceRecord;
use App\Models\MemberProfile;
use App\Models\ChurchInvitation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ChurchAdminController extends Controller
{
    public function index(Request $request)
    {
        $userCount = User::query()->count('*');
        $memberCount = MemberProfile::count();
        $attendanceToday = AttendanceRecord::whereDate('service_date', today())->count();
        $firstTimersToday = AttendanceRecord::whereDate('service_date', today())->where('first_timer', true)->count();

        $memberLifecycle = [
            'total_active_members' => MemberProfile::where('is_active', true)->where('membership_status', 'member')->count(),
            'total_first_timers' => MemberProfile::where('membership_status', 'first_timer')->where('is_active', true)->count(),
            'total_inactive_members' => MemberProfile::where('is_active', false)->count(),
            'needs_follow_up' => MemberProfile::where('is_active', false)->count() + MemberProfile::where('membership_status', 'first_timer')->where('is_active', true)->count(),
        ];

        $referralConversionQuery = ChurchInvitation::query()
            ->selectRaw('COUNT(*) as total, COUNT(CASE WHEN validated_at IS NOT NULL THEN 1 END) as validated, COUNT(CASE WHEN validated_at IS NULL THEN 1 END) as pending')
            ->first();

        $referralConversion = [
            'total' => (int) ($referralConversionQuery?->total ?? 0),
            'validated' => (int) ($referralConversionQuery?->validated ?? 0),
            'pending' => (int) ($referralConversionQuery?->pending ?? 0),
            'rate' => $referralConversionQuery && $referralConversionQuery->total > 0
                ? (int) round(($referralConversionQuery->validated / $referralConversionQuery->total) * 100)
                : 0,
        ];

        $onboardingCompletionQuery = ChurchInvitation::query()
            ->leftJoin('member_profiles', 'member_profiles.user_id', '=', 'church_invitations.invitee_id')
            ->selectRaw('COUNT(*) as total, COUNT(CASE WHEN member_profiles.profile_completed_at IS NOT NULL THEN 1 END) as completed, COUNT(CASE WHEN member_profiles.profile_completed_at IS NULL THEN 1 END) as incomplete')
            ->first();

        $onboardingCompletion = [
            'total' => (int) ($onboardingCompletionQuery?->total ?? 0),
            'completed' => (int) ($onboardingCompletionQuery?->completed ?? 0),
            'incomplete' => (int) ($onboardingCompletionQuery?->incomplete ?? 0),
            'rate' => $onboardingCompletionQuery && $onboardingCompletionQuery->total > 0
                ? (int) round(($onboardingCompletionQuery->completed / $onboardingCompletionQuery->total) * 100)
                : 0,
        ];

        $engagementPipeline = collect();

        $pendingReferral = ChurchInvitation::query()
            ->with('invitee.memberProfile')
            ->whereNull('validated_at')
            ->orderByDesc('registered_at')
            ->first();

        if ($pendingReferral) {
            $member = $pendingReferral->invitee?->memberProfile;
            $name = trim(($member?->first_name ?? '') . ' ' . ($member?->last_name ?? '')) ?: ($pendingReferral->invitee?->name ?? 'Pending invitee');

            $engagementPipeline->push([
                'task_type' => 'pending_referral_follow_up',
                'priority' => 'high',
                'priority_rank' => 3,
                'name' => $name,
                'details' => 'Follow up and complete the referral conversion.',
                'updated_at' => $pendingReferral->registered_at?->toISOString() ?? now()->toISOString(),
            ]);
        }

        $incompleteOnboarding = MemberProfile::query()
            ->with('user')
            ->where('is_active', true)
            ->whereNull('profile_completed_at')
            ->orderByDesc('updated_at')
            ->first();

        if ($incompleteOnboarding) {
            $name = trim(($incompleteOnboarding->first_name ?? '') . ' ' . ($incompleteOnboarding->last_name ?? '')) ?: ($incompleteOnboarding->user?->name ?? 'Member');

            $engagementPipeline->push([
                'task_type' => 'incomplete_onboarding',
                'priority' => 'medium',
                'priority_rank' => 2,
                'name' => $name,
                'details' => 'Complete onboarding and profile setup.',
                'updated_at' => $incompleteOnboarding->updated_at?->toISOString() ?? now()->toISOString(),
            ]);
        }

        $inactiveMember = MemberProfile::query()
            ->with('user')
            ->where('is_active', false)
            ->orderByDesc('updated_at')
            ->first();

        if ($inactiveMember) {
            $name = trim(($inactiveMember->first_name ?? '') . ' ' . ($inactiveMember->last_name ?? '')) ?: ($inactiveMember->user?->name ?? 'Inactive member');

            $engagementPipeline->push([
                'task_type' => 'inactive_member_recovery',
                'priority' => 'medium',
                'priority_rank' => 1,
                'name' => $name,
                'details' => 'Recover the member and restore connection.',
                'updated_at' => $inactiveMember->updated_at?->toISOString() ?? now()->toISOString(),
            ]);
        }

        $engagementPipeline = $engagementPipeline
            ->sortByDesc(function (array $task) {
                return [$task['priority_rank'], $task['updated_at']];
            })
            ->values()
            ->all();

        $followUpQueue = MemberProfile::query()
            ->with('user')
            ->where(function ($query) {
                $query->where('is_active', false)
                    ->orWhere(function ($firstTimerQuery) {
                        $firstTimerQuery->where('membership_status', 'first_timer')->where('is_active', true);
                    });
            })
            ->orderByRaw("CASE WHEN membership_status = 'first_timer' THEN 0 ELSE 1 END ASC")
            ->orderBy('updated_at', 'desc')
            ->limit(8)
            ->get()
            ->map(function (MemberProfile $member) {
                $name = trim(($member->first_name ?? '') . ' ' . ($member->last_name ?? '')) ?: ($member->user?->name ?? 'Unknown member');

                if ($member->is_active === false) {
                    return [
                        'id' => $member->id,
                        'name' => $name,
                        'reason' => 'inactive_member_follow_up',
                        'department' => $member->department ?? 'General',
                        'status' => 'inactive',
                    ];
                }

                return [
                    'id' => $member->id,
                    'name' => $name,
                    'reason' => 'first_timer_follow_up',
                    'department' => $member->department ?? 'General',
                    'status' => 'first_timer',
                ];
            })
            ->values()
            ->all();

        $upcomingBirthdays = MemberProfile::whereNotNull('date_of_birth')
            ->get()
            ->map(function ($member) {
                $dateOfBirth = $member->date_of_birth;

                if (!$dateOfBirth) {
                    return null;
                }

                $currentYear = now()->year;
                $nextBirthday = $dateOfBirth->copy()->setYear($currentYear);

                if ($nextBirthday->isPast()) {
                    $nextBirthday = $dateOfBirth->copy()->setYear($currentYear + 1);
                }

                return [
                    'id' => $member->id,
                    'name' => trim(($member->first_name ?? '') . ' ' . ($member->last_name ?? '')) ?: 'Unknown member',
                    'date_of_birth' => $dateOfBirth->format('Y-m-d'),
                    'next_birthday' => $nextBirthday->format('Y-m-d'),
                    'department' => $member->department,
                ];
            })
            ->filter()
            ->sortBy('next_birthday')
            ->take(5)
            ->values()
            ->all();

        return Inertia::render('Church/AdminDashboard', [
            'churchData' => [
                'totalMembers' => $memberCount,
                'totalUsers' => $userCount,
                'attendanceToday' => $attendanceToday,
                'firstTimersToday' => $firstTimersToday,
                'serviceName' => 'Sunday Worship Service',
                'memberLifecycle' => $memberLifecycle,
                'referralConversion' => $referralConversion,
                'onboardingCompletion' => $onboardingCompletion,
                'engagementPipeline' => $engagementPipeline,
                'followUpQueue' => $followUpQueue,
                'upcomingBirthdays' => $upcomingBirthdays,
            ],
            'user' => $request->user(),
        ]);
    }

    public function members(Request $request)
    {
        $query = MemberProfile::with('user')->latest();

        if ($request->filled('search')) {
            $search = trim($request->input('search'));
            $query->where(function ($memberQuery) use ($search) {
                $memberQuery->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhereRaw("LOWER(CONCAT(first_name, ' ', last_name)) LIKE ?", ['%' . strtolower($search) . '%'])
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('department', 'like', "%{$search}%")
                    ->orWhere('unit', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $status = $request->input('status');

            if ($status === 'active') {
                $query->where('is_active', true);
            } elseif ($status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        if ($request->filled('department')) {
            $query->where('department', $request->input('department'));
        }

        $members = $query->get()->map(function ($member) {
            return [
                'id' => $member->id,
                'first_name' => $member->first_name,
                'last_name' => $member->last_name,
                'name' => trim(($member->first_name ?? '') . ' ' . ($member->last_name ?? '')) ?: ($member->user?->name ?? 'Unknown'),
                'phone' => $member->phone,
                'membership_status' => $member->membership_status,
                'department' => $member->department,
                'unit' => $member->unit,
                'is_active' => (bool) $member->is_active,
                'email' => $member->user?->email,
                'avatar_url' => $member->avatar_path ? route('member-profile.photo', $member) : null,
            ];
        });

        $departments = MemberProfile::query()
            ->whereNotNull('department')
            ->where('department', '!=', '')
            ->distinct()
            ->orderBy('department')
            ->pluck('department');

        return Inertia::render('Church/MemberDirectory', [
            'members' => $members,
            'filters' => [
                'search' => $request->input('search'),
                'status' => $request->input('status'),
                'department' => $request->input('department'),
            ],
            'departments' => $departments,
            'flash' => [
                'success' => $request->session()->get('success'),
            ],
        ]);
    }

    public function storeMember(Request $request)
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'gender' => ['nullable', 'string', 'max:20'],
            'membership_status' => ['required', 'string', 'max:50'],
            'department' => ['nullable', 'string', 'max:100'],
            'unit' => ['nullable', 'string', 'max:100'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        MemberProfile::create([
            'user_id' => $request->user()->id,
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'phone' => $validated['phone'] ?? null,
            'gender' => $validated['gender'] ?? null,
            'membership_status' => $validated['membership_status'],
            'department' => $validated['department'] ?? null,
            'unit' => $validated['unit'] ?? null,
            'is_active' => (bool) ($validated['is_active'] ?? true),
        ]);

        return redirect()->route('church-admin.members')->with('success', 'Member profile created successfully.');
    }

    public function attendance(Request $request)
    {
        $latestServiceDate = AttendanceRecord::max('service_date');
        $latestServiceDateOnly = $latestServiceDate ? Carbon::parse($latestServiceDate)->format('Y-m-d') : null;
        $attendanceStats = [
            'total' => AttendanceRecord::count(),
            'present_or_late' => AttendanceRecord::whereIn('status', ['present', 'late'])->count(),
            'first_timers' => AttendanceRecord::where('first_timer', true)->whereIn('status', ['present', 'late'])->count(),
            'sunday_school' => AttendanceRecord::where('service_type', 'sunday_school')->whereIn('status', ['present', 'late'])->count(),
            'main_service' => AttendanceRecord::where('service_type', 'main_service')->whereIn('status', ['present', 'late'])->count(),
            'latest_service_date' => $latestServiceDateOnly,
            'latest_service_total' => $latestServiceDateOnly
                ? AttendanceRecord::whereDate('service_date', $latestServiceDateOnly)->whereIn('status', ['present', 'late'])->count()
                : 0,
        ];
        $records = AttendanceRecord::with(['user', 'memberProfile'])
            ->orderByDesc('service_date')
            ->limit(20)
            ->get()
            ->map(function ($record) {
                return [
                    'id' => $record->id,
                    'member' => $record->memberProfile ? trim(($record->memberProfile->first_name ?? '') . ' ' . ($record->memberProfile->last_name ?? '')) : ($record->user?->name ?? 'Unknown'),
                    'service_type' => $record->service_type,
                    'status' => $record->status,
                    'first_timer' => $record->first_timer,
                    'service_date' => $record->service_date->format('Y-m-d'),
                ];
            });

        $members = MemberProfile::query()
            ->select(['id', 'first_name', 'last_name'])
            ->orderBy('first_name')
            ->get()
            ->map(fn ($member) => [
                'id' => $member->id,
                'name' => trim(($member->first_name ?? '') . ' ' . ($member->last_name ?? '')) ?: 'Unknown member',
            ]);

        return Inertia::render('Church/AttendanceBoard', [
            'attendance' => $records,
            'attendanceStats' => $attendanceStats,
            'members' => $members,
            'flash' => [
                'success' => $request->session()->get('success'),
            ],
        ]);
    }

    public function serviceRegister(Request $request)
    {
        $month = $request->validate([
            'month' => ['nullable', 'date_format:Y-m'],
        ])['month'] ?? now()->format('Y-m');
        $selectedMonth = Carbon::createFromFormat('Y-m', $month)->startOfMonth();
        $sundays = $this->monthSundays($selectedMonth);

        $memberProfiles = MemberProfile::query()
            ->with('user:id,name,referral_code')
            ->where('is_active', true)
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->get();
        $attendance = AttendanceRecord::query()
            ->where('service_type', 'main_service')
            ->whereBetween('service_date', [$selectedMonth->copy()->startOfMonth(), $selectedMonth->copy()->endOfMonth()])
            ->get()
            ->keyBy(fn (AttendanceRecord $record) => $record->member_profile_id . ':' . $record->service_date->format('Y-m-d'));

        $rows = $memberProfiles->map(function (MemberProfile $member) use ($sundays, $attendance) {
            return [
                'id' => $member->id,
                'name' => trim(($member->first_name ?? '') . ' ' . ($member->last_name ?? '')) ?: ($member->user?->name ?? 'Unknown member'),
                'referral_code' => $member->user?->referral_code,
                'weeks' => collect($sundays)->map(function (Carbon $sunday) use ($member, $attendance) {
                    $record = $attendance->get($member->id . ':' . $sunday->format('Y-m-d'));

                    return [
                        'date' => $sunday->format('Y-m-d'),
                        'status' => $record?->status,
                    ];
                })->values()->all(),
            ];
        });

        return Inertia::render('Church/ServiceRegister', [
            'month' => $selectedMonth->format('Y-m'),
            'monthLabel' => $selectedMonth->format('F Y'),
            'sundays' => collect($sundays)->map(fn (Carbon $sunday) => $sunday->format('Y-m-d'))->values(),
            'rows' => $rows,
            'flash' => ['success' => $request->session()->get('success')],
        ]);
    }

    public function storeServiceRegisterAttendance(Request $request)
    {
        $validated = $request->validate([
            'member_profile_id' => ['required', 'exists:member_profiles,id'],
            'month' => ['required', 'date_format:Y-m'],
            'week' => ['required', 'integer', 'between:1,5'],
            'status' => ['nullable', 'in:present,late,absent,excused'],
        ]);

        $selectedMonth = Carbon::createFromFormat('Y-m', $validated['month'])->startOfMonth();
        $sundays = $this->monthSundays($selectedMonth);
        $sunday = $sundays[$validated['week'] - 1] ?? null;
        abort_unless($sunday, 422, 'That week does not contain a Sunday service.');

        $memberProfile = MemberProfile::findOrFail($validated['member_profile_id']);
        $record = AttendanceRecord::query()
            ->where('member_profile_id', $memberProfile->id)
            ->where('service_type', 'main_service')
            ->whereDate('service_date', $sunday->format('Y-m-d'))
            ->first();

        $attributes = [
            'user_id' => $memberProfile->user_id ?? $request->user()->id,
            'status' => $validated['status'] ?? 'present',
            'first_timer' => false,
            'recorded_by' => $request->user()->id,
        ];

        if ($record) {
            $record->update($attributes);
        } else {
            $record = AttendanceRecord::create([
                'member_profile_id' => $memberProfile->id,
                'service_type' => 'main_service',
                'service_date' => $sunday->format('Y-m-d'),
                ...$attributes,
            ]);
        }

        $this->syncServiceAbsentees($sunday->format('Y-m-d'), 'main_service', $request->user()->id);
        $this->validateInvitationAttendance($record, $memberProfile);

        return redirect()->route('church-admin.service-register', ['month' => $selectedMonth->format('Y-m')])->with('success', 'Service register updated successfully.');
    }

    private function syncServiceAbsentees(string $serviceDate, string $serviceType, int $recordedBy): void
    {
        $activeMembers = MemberProfile::query()
            ->where('is_active', true)
            ->with('user:id,name')
            ->get();

        $recordsByMember = AttendanceRecord::query()
            ->where('service_type', $serviceType)
            ->whereDate('service_date', $serviceDate)
            ->get()
            ->keyBy('member_profile_id');

        foreach ($activeMembers as $member) {
            if ($recordsByMember->has($member->id)) {
                continue;
            }

            AttendanceRecord::query()->updateOrCreate(
                [
                    'member_profile_id' => $member->id,
                    'service_type' => $serviceType,
                    'service_date' => $serviceDate,
                ],
                [
                    'user_id' => $member->user_id ?? $recordedBy,
                    'status' => 'absent',
                    'first_timer' => false,
                    'recorded_by' => $recordedBy,
                    'notes' => 'Auto-generated as absent from service register.',
                ]
            );
        }

        $generatedRecords = AttendanceRecord::query()
            ->where('service_type', $serviceType)
            ->whereDate('service_date', $serviceDate)
            ->with('memberProfile.user')
            ->get();

        \App\Models\ChurchAbsentee::query()
            ->where('service_type', $serviceType)
            ->whereDate('service_date', $serviceDate)
            ->delete();

        foreach ($generatedRecords as $record) {
            if (! in_array($record->status, ['absent', 'excused'], true)) {
                continue;
            }

            $memberName = $record->memberProfile
                ? trim(($record->memberProfile->first_name ?? '') . ' ' . ($record->memberProfile->last_name ?? ''))
                : ($record->user?->name ?? 'Unknown member');

            \App\Models\ChurchAbsentee::query()->updateOrCreate(
                [
                    'member_name' => $memberName,
                    'service_type' => $serviceType,
                    'service_date' => $serviceDate,
                ],
                [
                    'reason' => $record->notes ?? null,
                    'status' => $record->status,
                ]
            );
        }
    }

    private function monthSundays(Carbon $month): array
    {
        $sundays = [];
        $cursor = $month->copy()->startOfMonth();

        if ($cursor->dayOfWeek !== Carbon::SUNDAY) {
            $cursor->next(Carbon::SUNDAY);
        }

        while ($cursor->month === $month->month) {
            $sundays[] = $cursor->copy();
            $cursor->addWeek();
        }

        return $sundays;
    }

    public function storeAttendance(Request $request)
    {
        $validated = $request->validate([
            'member_profile_id' => ['required', 'exists:member_profiles,id'],
            'service_type' => ['required', 'in:main_service,sunday_school,workers_meeting,prayer_meeting'],
            'service_date' => ['required', 'date', 'date_format:Y-m-d'],
            'status' => ['required', 'in:present,late,absent,excused'],
            'first_timer' => ['nullable', 'boolean'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $memberProfile = MemberProfile::findOrFail($validated['member_profile_id']);

        $attendance = AttendanceRecord::query()
            ->where('member_profile_id', $memberProfile->id)
            ->where('service_type', $validated['service_type'])
            ->whereDate('service_date', $validated['service_date'])
            ->first();
        $attributes = [
            'user_id' => $memberProfile->user_id ?? $request->user()->id,
            'status' => $validated['status'],
            'first_timer' => (bool) ($validated['first_timer'] ?? false),
            'recorded_by' => $request->user()->id,
            'notes' => $validated['notes'] ?? null,
        ];

        if ($attendance) {
            $attendance->update($attributes);
        } else {
            $attendance = AttendanceRecord::create([
                'member_profile_id' => $memberProfile->id,
                'service_type' => $validated['service_type'],
                'service_date' => $validated['service_date'],
                ...$attributes,
            ]);
        }

        $this->validateInvitationAttendance($attendance, $memberProfile);

        return redirect()->route('church-admin.attendance')->with('success', 'Attendance recorded successfully.');
    }

    private function validateInvitationAttendance(AttendanceRecord $attendance, MemberProfile $memberProfile): void
    {
        if ($attendance->service_type === 'main_service'
            && in_array($attendance->status, ['present', 'late'], true)
            && $attendance->service_date->isSunday()) {
            ChurchInvitation::query()
                ->where('invitee_id', $memberProfile->user_id)
                ->whereNull('validated_at')
                ->first()
                ?->update([
                    'validated_at' => now(),
                    'validation_attendance_id' => $attendance->id,
                ]);
        }
    }
}
