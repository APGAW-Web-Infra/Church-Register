<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Event;
use App\Models\Activity;
use App\Models\Course;
use App\Models\Community;
use App\Models\ForumPost;
use App\Models\User;
use App\Models\MemberProfile;
use App\Models\ChurchContactMessage;
use App\Models\ChurchPrayerRequest;
use App\Models\SmallGroup;
use App\Enum\RolesEnum;
use App\Enum\PermissionsEnum;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Schema;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $user->ensureReferralCode();
        $user->load(['profile', 'roles']);

        // Get current role context
        $primaryRole = $user->primary_role ?? RolesEnum::Individual->value;
        $currentRole = RolesEnum::from($primaryRole);
        $dashboardContext = $user->getDashboardContext();

        // Ensure user has CPD access
        if (!$user->can(PermissionsEnum::AccessCPD->value)) {
            $user->initializeWithCPDAccess();
        }

        return Inertia::render('Dashboard', [
            'user' => $this->getUserData($user),
            'dashboardContext' => $dashboardContext,
            'currentRole' => $currentRole->value,
            'roleLabel' => $currentRole->label(),
            'stats' => $this->getDashboardStats($user),
            'recentActivity' => $this->getRecentActivity($user),
            'upcomingEvents' => $this->getUpcomingEvents($user),
            'trainingData' => $this->getTrainingData($user),
            'communityData' => $this->getCommunityData($user),
            'quickActions' => $this->getQuickActions($user, $currentRole),
            'churchSummary' => $this->getChurchSummary(),
            'churchHealth' => $this->getChurchHealth(),
            'churchLeadership' => $this->getChurchLeadership(),
            'churchGroups' => $this->getChurchGroups(),
            'recentChurchActivity' => $this->getRecentChurchActivity(),
        ]);
    }

    /**
     * Handle role switching
     */
    public function switchRole(Request $request)
    {
        $request->validate([
            'role' => 'required|string',
        ]);

        $user = $request->user();

        try {
            $newRole = RolesEnum::from($request->role);

            if ($user->switchToRole($newRole)) {
                return redirect()->route('dashboard')
                    ->with('success', "Switched to {$newRole->label()} dashboard");
            }
        } catch (\ValueError $e) {
            return redirect()->back()->withErrors(['role' => 'Invalid role specified']);
        }

        return redirect()->back()->withErrors(['role' => 'Cannot switch to this role']);
    }

    private function getUserData(User $user): array
    {
        $referralBase = rtrim((string) config('app.url'), '/');
        $referralCode = $user->ensureReferralCode();

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'type' => $user->getUserTypeLabel(),
            'primary_role' => $user->primary_role,
            'sector' => $user->sector ?? 'Technology',
            'registrationStatus' => ucfirst($user->registration_status),
            'isVerified' => $user->isVerified(),
            'needsProfileCompletion' => $user->needsProfileCompletion(),
            'communityRank' => $user->community_rank,
            'profile' => $user->profile,
            'activeRoles' => $user->active_roles ?? [],
            'referral' => [
                'code' => $referralCode,
                'link' => $referralBase . '/register?ref=' . urlencode($referralCode),
                'pending' => $user->sentChurchInvitations()->whereNull('validated_at')->count(),
                'validated' => $user->sentChurchInvitations()->whereNotNull('validated_at')->count(),
                'total' => $user->sentChurchInvitations()->count(),
            ],
        ];
    }

    private function getDashboardStats(User $user): array
    {
        $stats = [
            'trainingCompleted' => $user->enrollments()
                ->where('status', 'completed')
                ->count(),
            'communityRank' => $user->calculateCommunityRank(),
        ];

        // Role-specific stats
        $currentRole = RolesEnum::from($user->primary_role);

        return $stats;
    }

    private function getRecentActivity(User $user): array
    {
        $activities = collect();

        // Get recent training activities
        $trainingActivities = $user->enrollments()
            ->with('course')
            ->whereIn('status', ['completed', 'in_progress'])
            ->latest('updated_at')
            ->take(2)
            ->get()
            ->map(function ($enrollment) {
                return [
                    'type' => 'training',
                    'message' => $enrollment->course->title . ' ' .
                        ($enrollment->status === 'completed' ? 'completed' : 'in progress'),
                    'time' => ($enrollment->completed_at ?? $enrollment->updated_at)->diffForHumans(),
                    'status' => $enrollment->status === 'completed' ? 'success' : 'pending',
                ];
            });

        // Get recent community activities
        $communityActivities = $user->communityMemberships()
            ->with('community')
            ->latest()
            ->take(2)
            ->get()
            ->map(function ($membership) {
                return [
                    'type' => 'community',
                    'message' => 'Joined ' . $membership->community->name . ' community',
                    'time' => $membership->created_at->diffForHumans(),
                    'status' => 'info',
                ];
            });

        // Get role switching activities
        $roleActivities = collect([]);
        $activeRoles = $user->active_roles;

        // Ensure active_roles is an array
        if (is_string($activeRoles)) {
            $activeRoles = json_decode($activeRoles, true) ?? [];
        }
        if (!is_array($activeRoles)) {
            $activeRoles = [];
        }

        if (count($activeRoles) > 1) {
            $roleActivities = collect([
                [
                    'type' => 'role',
                    'message' => 'Applied for additional dashboard access',
                    'time' => $user->updated_at->diffForHumans(),
                    'status' => 'info',
                ]
            ]);
        }

        // Merge and sort all activities
        return $activities
            ->merge($trainingActivities)
            ->merge($communityActivities)
            ->merge($roleActivities)
            ->sortByDesc('time')
            ->take(5)
            ->values()
            ->toArray();
    }

    private function getUpcomingEvents(User $user): array
    {
        return Event::query()->where('start_date', '>', now())
            ->where('status', 'registration_open')
            ->when($user->sector, function($query, $sector) {
                return $query->where(function ($query) use ($sector) {
                    $query->where('target_sector', $sector)
                        ->orWhereNull('target_sector');
                });
            })
            ->orderBy('start_date')
            ->take(3)
            ->get()
            ->map(function ($event) use ($user) {
                $isRegistered = $event->registrations()
                    ->where('user_id', $user->id)
                    ->exists();

                return [
                    'id' => $event->id,
                    'title' => $event->title,
                    'date' => $event->start_date->format('M d, Y'),
                    'type' => ucfirst(str_replace('_', ' ', $event->event_type)),
                    'location' => $event->location,
                    'is_registered' => $isRegistered,
                    'registration_deadline' => $event->registration_deadline?->format('M d, Y'),
                ];
            })
            ->toArray();
    }

    private function getTrainingData(User $user): array
    {
        $enrollments = $user->enrollments()
            ->with('course')
            ->get()
            ->groupBy('course.category');

        $trainingStats = [
            'total_enrolled' => $enrollments->flatten()->count(),
            'completed' => $enrollments->flatten()->where('status', 'completed')->count(),
            'in_progress' => $enrollments->flatten()->where('status', 'in_progress')->count(),
        ];

        // Get upcoming events
        $events = Event::query()->whereIn('event_type', ['hackathon', 'bootcamp'], 'and', false)
            ->where('registration_deadline', '>', now())
            ->orderBy('start_date')
            ->take(4)
            ->get()
            ->map(function ($event) use ($user) {
                $userRegistered = $event->registrations()
                    ->where('user_id', $user->id)
                    ->exists();

                return [
                    'id' => $event->id,
                    'event' => $event->title,
                    'date' => $event->start_date->format('F d') . '-' . $event->end_date->format('d, Y'),
                    'prize' => $event->prize_description ?? ('₦' . number_format($event->prize_amount ?? 0)),
                    'status' => $userRegistered ? 'Registered' : 'Open',
                    'type' => $event->event_type,
                    'location' => $event->location,
                ];
            });

        return [
            'stats' => $trainingStats,
            'enrollments' => [
                'soft_skills' => $enrollments->get('soft_skills', collect())->map($this->formatEnrollment())->toArray(),
                'tech_skills' => $enrollments->get('tech_skills', collect())->map($this->formatEnrollment())->toArray(),
                'vocational_skills' => $enrollments->get('vocational_skills', collect())->map($this->formatEnrollment())->toArray(),
            ],
            'events' => $events->toArray(),
        ];
    }

    private function getCommunityData(User $user): array
    {
        $userCommunities = $user->communityMemberships()
            ->with('community')
            ->get()
            ->map(function ($membership) {
                return [
                    'id' => $membership->community->id,
                    'cluster' => $membership->community->name,
                    'members' => number_format($membership->community->member_count ?? 0),
                    'activity' => ucfirst(str_replace('_', ' ', $membership->community->activity_level ?? 'moderate')),
                    'role' => ucfirst($membership->role ?? 'member'),
                    'joined_at' => $membership->created_at->format('M Y'),
                    'description' => $membership->community->description,
                ];
            });

        $recentPosts = ForumPost::with(['user', 'community'])
            ->whereHas('community.memberships', function($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->latest()
            ->take(4)
            ->get()
            ->map(function ($post) {
                return [
                    'id' => $post->id,
                    'title' => $post->title,
                    'author' => $post->user->name,
                    'community' => $post->community->name,
                    'replies' => $post->reply_count ?? 0,
                    'time' => $post->created_at->diffForHumans(),
                    'excerpt' => Str::limit($post->content, 100),
                ];
            });

        $mentors = $user->mentorships()
            ->with('mentor.user')
            ->where('status', 'active')
            ->take(3)
            ->get()
            ->map(function ($mentorship) {
                $mentor = $mentorship->mentor;
                return [
                    'id' => $mentor->id,
                    'name' => $mentor->user->name,
                    'title' => $mentor->title ?? 'Mentor',
                    'specialization' => implode(', ', $mentor->specialization ?? []),
                    'initials' => $this->getInitials($mentor->user->name),
                    'next_session' => $mentorship->next_session_at?->format('M d, Y'),
                ];
            });

        return [
            'user_communities' => $userCommunities->toArray(),
            'recent_posts' => $recentPosts->toArray(),
            'mentors' => $mentors->toArray(),
            'community_stats' => [
                'total_communities' => $userCommunities->count(),
                'total_posts' => $user->forumPosts()->count(),
                'mentorship_sessions' => $user->mentorships()->where('status', 'completed')->count(),
            ],
        ];
    }

    private function getChurchSummary(): array
    {
        $attendanceTotal = \App\Models\AttendanceRecord::count();

        $prayerRequests = 0;
        if (\Illuminate\Support\Facades\Schema::hasTable('church_prayer_requests')) {
            $prayerRequests = \App\Models\ChurchPrayerRequest::whereIn('status', ['pending', 'prayed'])->count();
        }

        $activeMinistries = \App\Models\ChurchMinistry::where('is_active', true)->count();
        $upcomingEvents = \App\Models\Event::query()->where('start_date', '>', now())
            ->whereIn('status', ['upcoming', 'registration_open', 'ongoing'])
            ->count();

        return [
            'attendance_total' => $attendanceTotal,
            'prayer_requests' => $prayerRequests,
            'active_ministries' => $activeMinistries,
            'upcoming_events' => $upcomingEvents,
        ];
    }

    private function getChurchHealth(): array
    {
        $attendance = Schema::hasTable('attendance_records')
            ? \App\Models\AttendanceRecord::query()
                ->where('service_type', 'main_service')
                ->whereIn('status', ['present', 'late'])
                ->count()
            : 0;
        $prayerRequests = Schema::hasTable('church_prayer_requests')
            ? ChurchPrayerRequest::query()->whereIn('status', ['pending', 'prayed'])->count()
            : 0;
        $newVisits = Schema::hasTable('member_profiles')
            ? MemberProfile::query()->where('created_at', '>=', now()->startOfMonth())->count()
            : 0;
        $nextEvent = Schema::hasTable('events')
            ? Event::query()->where('start_date', '>=', now())->orderBy('start_date')->first()
            : null;
        $currentWeekAttendance = Schema::hasTable('attendance_records')
            ? \App\Models\AttendanceRecord::query()
                ->where('service_type', 'main_service')
                ->whereIn('status', ['present', 'late'])
                ->whereDate('service_date', '>=', now()->startOfWeek()->toDateString())
                ->whereDate('service_date', '<=', now()->endOfWeek()->toDateString())
                ->count()
            : 0;
        $previousWeekAttendance = Schema::hasTable('attendance_records')
            ? \App\Models\AttendanceRecord::query()
                ->where('service_type', 'main_service')
                ->whereIn('status', ['present', 'late'])
                ->whereDate('service_date', '>=', now()->subWeek()->startOfWeek()->toDateString())
                ->whereDate('service_date', '<=', now()->subWeek()->endOfWeek()->toDateString())
                ->count()
            : 0;
        $attendanceChange = $previousWeekAttendance > 0
            ? round((($currentWeekAttendance - $previousWeekAttendance) / $previousWeekAttendance) * 100)
            : null;

        return [
            'attendance' => $attendance,
            'attendance_change' => $attendanceChange,
            'prayer_requests' => $prayerRequests,
            'new_visits' => $newVisits,
            'next_service' => $nextEvent?->title,
            'next_service_date' => $nextEvent?->start_date?->format('l'),
        ];
    }

    private function getChurchLeadership(): array
    {
        return [
            [
                'name' => 'Prophet (Dr.) Samuel Olugbenga Ilesanmi',
                'role' => 'President & General Overseer, APGAW',
                'note' => 'Providing spiritual direction and apostolic oversight for APGAW.',
                'image' => '/images/President_GO.jpeg',
            ],
            [
                'name' => 'Evangelist (Mrs.) Esther Omobolanriwa Ilesanmi',
                'role' => 'Vice-President, APGAW',
                'note' => 'Serving through prayer, evangelism, discipleship, and spiritual care.',
                'image' => '/images/Firstlady.jpeg',
            ],
            [
                'name' => 'Pastor Michael Olanrewaju',
                'role' => 'Senior Pastor, Church Administration',
                'note' => 'Leading pastoral care, teaching, and church administration.',
                'image' => null,
            ],
        ];
    }

    private function getChurchGroups(): array
    {
        if (!Schema::hasTable('small_groups')) {
            return [];
        }

        return SmallGroup::query()
            ->where('is_active', true)
            ->withCount(['memberships as active_member_count' => fn ($query) => $query->where('status', 'active')])
            ->orderBy('name')
            ->limit(6)
            ->get()
            ->map(fn ($group) => [
                'id' => $group->id,
                'name' => $group->name,
                'members' => $group->active_member_count . ' active',
                'time' => trim(($group->meeting_day ?? '') . ' ' . ($group->meeting_time ?? '')) ?: 'Schedule to be announced',
            ])
            ->values()
            ->all();
    }

    private function getRecentChurchActivity(): array
    {
        $activity = collect();

        if (Schema::hasTable('attendance_records')) {
            $activity = $activity->merge(\App\Models\AttendanceRecord::query()->latest()->limit(3)->get()->map(fn ($record) => [
                'title' => 'Attendance recorded',
                'detail' => ucfirst(str_replace('_', ' ', $record->service_type)) . ' service attendance',
                'created_at' => $record->created_at,
                'time' => $record->created_at->diffForHumans(),
                'status' => 'recorded',
                'action_url' => route('dashboard') . '#attendance',
                'action_label' => 'View attendance health',
            ]));
        }

        if (Schema::hasTable('church_prayer_requests')) {
            $activity = $activity->merge(ChurchPrayerRequest::query()->latest()->limit(2)->get()->map(fn ($request) => [
                'title' => 'Prayer request received',
                'detail' => ucfirst((string) $request->request_type) . ' prayer request',
                'created_at' => $request->created_at,
                'time' => $request->created_at->diffForHumans(),
                'status' => $request->status,
                'action_url' => route('prayer-requests'),
                'action_label' => 'View prayer requests',
            ]));
        }

        if (Schema::hasTable('church_contact_messages')) {
            $activity = $activity->merge(ChurchContactMessage::query()->latest()->limit(2)->get()->map(fn ($message) => [
                'title' => 'Church message received',
                'detail' => $message->subject,
                'created_at' => $message->created_at,
                'time' => $message->created_at->diffForHumans(),
                'status' => $message->status,
                'action_url' => route('contact'),
                'action_label' => 'View contact page',
            ]));
        }

        return $activity->sortByDesc('created_at')->take(5)->map(function ($item) {
            unset($item['created_at']);
            return $item;
        })->values()->all();
    }

    private function getQuickActions(User $user, RolesEnum $currentRole): array
    {
        $baseActions = [
            [
                'id' => 'church-community',
                'title' => 'Church Community',
                'description' => 'Connect with members and ministries',
                'icon' => '👥',
                'color' => 'bg-red-500',
                'permission' => PermissionsEnum::ViewDashboard->value,
                'route' => 'community',
            ],
            [
                'id' => 'word-ministry',
                'title' => 'Word Ministry',
                'description' => 'Open Sunday School and Bible Study',
                'icon' => '📖',
                'color' => 'bg-blue-500',
                'permission' => PermissionsEnum::ViewDashboard->value,
                'route' => 'training.dashboard',
            ],
            [
                'id' => 'small-groups',
                'title' => 'Small Groups',
                'description' => 'Connect with a church fellowship',
                'icon' => '🙌',
                'color' => 'bg-teal-500',
                'permission' => PermissionsEnum::ViewDashboard->value,
                'route' => 'small-groups',
            ],
        ];

        // Filter actions based on user permissions
        $allActions = $baseActions;

        return array_values(array_filter($allActions, function ($action) use ($user) {
            return $user->can($action['permission']);
        }));
    }

    private function formatEnrollment(): \Closure
    {
        return function ($enrollment) {
            return [
                'id' => $enrollment->id,
                'course' => $enrollment->course->title,
                'progress' => $enrollment->progress_percentage ?? 0,
                'status' => $enrollment->status,
                'instructor' => $enrollment->course->instructor_name ?? 'Church Instructor',
                'category' => $enrollment->course->category,
                'duration' => $enrollment->course->duration_hours . ' hours',
            ];
        };
    }

    private function getInitials(string $name): string
    {
        $words = explode(' ', $name);
        return strtoupper(substr($words[0], 0, 1) . (isset($words[1]) ? substr($words[1], 0, 1) : ''));
    }

    private function calculateCompletionRate(User $user): string
    {
        $totalEnrollments = $user->enrollments()->count();
        if ($totalEnrollments === 0) return '0%';

        $completed = $user->enrollments()->where('status', 'completed')->count();
        return round(($completed / $totalEnrollments) * 100) . '%';
    }
}
