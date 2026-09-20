<?php

namespace App\Http\Controllers;

use App\Models\ChurchAbsentee;
use App\Models\ChurchAnnouncement;
use App\Models\ChurchContactMessage;
use App\Models\ChurchLeadershipProfile;
use App\Models\ChurchMediaContent;
use App\Models\ChurchMinistry;
use App\Models\ChurchPrayerRequest;
use App\Models\ChurchReport;
use App\Models\ChurchScorecard;
use App\Models\ChurchUnit;
use App\Models\ChurchUnitLeader;
use App\Models\ChurchUnitMember;
use App\Models\ChurchWorkersMeeting;
use App\Models\ChurchInvitation;
use App\Models\AttendanceRecord;
use App\Models\Event;
use App\Models\MemberProfile;
use Illuminate\Support\Collection;
use App\Models\SmallGroup;
use App\Models\SmallGroupAttendance;
use App\Models\SmallGroupMembership;
use App\Models\SmallGroupMeeting;
use App\Notifications\ContactMessageResolved;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class ChurchOperationsController extends Controller
{
    public function ministries(Request $request)
    {
        $ministries = ChurchMinistry::query()
            ->orderByDesc('is_active')
            ->orderBy('name')
            ->get();

        return Inertia::render('Church/MinistryManagement', [
            'ministries' => $ministries,
            'flash' => [
                'success' => $request->session()->get('success'),
            ],
        ]);
    }

    public function smallGroups(Request $request)
    {
        return Inertia::render('Church/SmallGroupManagement', [
            'groups' => SmallGroup::query()
                ->withCount(['memberships as active_member_count' => fn ($query) => $query->where('status', 'active')])
                ->with(['meetings' => fn ($query) => $query->orderByDesc('starts_at')->limit(5)])
                ->with(['memberships' => fn ($query) => $query->where('status', 'active')->with('user')])
                ->orderByDesc('is_active')
                ->orderBy('name')
                ->get(),
            'flash' => ['success' => $request->session()->get('success')],
        ]);
    }

    public function storeSmallGroup(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'meeting_day' => ['nullable', 'string', 'max:50'],
            'meeting_time' => ['nullable', 'string', 'max:50'],
            'location' => ['nullable', 'string', 'max:255'],
            'leader_name' => ['nullable', 'string', 'max:255'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        SmallGroup::create([
            ...$validated,
            'is_active' => (bool) ($validated['is_active'] ?? true),
        ]);

        return redirect()->route('church-admin.small-groups')->with('success', 'Small group saved successfully.');
    }

    public function storeSmallGroupMeeting(Request $request)
    {
        $validated = $request->validate([
            'small_group_id' => ['required', 'exists:small_groups,id'],
            'title' => ['required', 'string', 'max:255'],
            'starts_at' => ['required', 'date'],
            'ends_at' => ['nullable', 'date', 'after:starts_at'],
            'location' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'status' => ['required', 'in:scheduled,completed,cancelled'],
        ]);

        SmallGroupMeeting::create([
            ...$validated,
            'ends_at' => $validated['ends_at'] ?? null,
            'location' => $validated['location'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->route('church-admin.small-groups')->with('success', 'Small group meeting scheduled successfully.');
    }

    public function storeSmallGroupAttendance(Request $request)
    {
        $validated = $request->validate([
            'small_group_meeting_id' => ['required', 'exists:small_group_meetings,id'],
            'small_group_membership_id' => ['required', 'exists:small_group_memberships,id'],
            'status' => ['required', 'in:present,absent,excused'],
            'notes' => ['nullable', 'string'],
        ]);

        $meeting = SmallGroupMeeting::findOrFail($validated['small_group_meeting_id']);
        $membership = SmallGroupMembership::findOrFail($validated['small_group_membership_id']);
        abort_unless($meeting->small_group_id === $membership->small_group_id, 422, 'Attendance member does not belong to this group.');

        SmallGroupAttendance::updateOrCreate(
            [
                'small_group_meeting_id' => $meeting->id,
                'small_group_membership_id' => $membership->id,
            ],
            [
                'status' => $validated['status'],
                'notes' => $validated['notes'] ?? null,
                'recorded_by' => $request->user()->id,
            ]
        );

        return redirect()->route('church-admin.small-groups')->with('success', 'Small group attendance saved successfully.');
    }

    public function storeMinistry(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'leader_name' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        ChurchMinistry::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'leader_name' => $validated['leader_name'] ?? null,
            'is_active' => (bool) ($validated['is_active'] ?? true),
        ]);

        return redirect()->route('church-admin.ministries')->with('success', 'Ministry created successfully.');
    }

    public function churchUnits(Request $request)
    {
        $units = ChurchUnit::query()
            ->with(['leaders', 'members'])
            ->orderBy('category')
            ->orderBy('name')
            ->get();

        return Inertia::render('Church/UnitManagement', [
            'units' => $units,
            'flash' => [
                'success' => $request->session()->get('success'),
            ],
        ]);
    }

    public function storeChurchUnit(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:255'],
            'summary' => ['nullable', 'string'],
            'aim' => ['nullable', 'string'],
            'objectives' => ['nullable', 'string'],
            'duties' => ['nullable', 'string'],
            'highlights' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $slug = str($validated['name'])
            ->slug()
            ->toString();

        $unit = ChurchUnit::query()->firstOrCreate(
            ['slug' => $slug],
            [
                'name' => $validated['name'],
                'category' => $validated['category'],
                'summary' => $validated['summary'] ?? null,
                'aim' => $validated['aim'] ?? null,
                'objectives' => $this->parseList($validated['objectives'] ?? ''),
                'duties' => $this->parseList($validated['duties'] ?? ''),
                'highlights' => $this->parseList($validated['highlights'] ?? ''),
                'is_active' => (bool) ($validated['is_active'] ?? true),
            ]
        );

        return redirect()->route('church-admin.units')->with('success', $unit->wasRecentlyCreated ? 'Church unit created successfully.' : 'Church unit saved successfully.');
    }

    public function storeUnitLeader(Request $request, ChurchUnit $unit)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'role' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        ChurchUnitLeader::create([
            'church_unit_id' => $unit->id,
            'name' => $validated['name'],
            'role' => $validated['role'] ?? null,
            'is_active' => (bool) ($validated['is_active'] ?? true),
        ]);

        return redirect()->route('church-admin.units')->with('success', 'Unit leader added successfully.');
    }

    public function storeUnitMember(Request $request, ChurchUnit $unit)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'role' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        ChurchUnitMember::create([
            'church_unit_id' => $unit->id,
            'name' => $validated['name'],
            'role' => $validated['role'] ?? null,
            'is_active' => (bool) ($validated['is_active'] ?? true),
        ]);

        return redirect()->route('church-admin.units')->with('success', 'Unit member added successfully.');
    }

    public function leadership(Request $request)
    {
        $leadership = ChurchLeadershipProfile::with('ministry')
            ->orderBy('name')
            ->get();

        $ministries = ChurchMinistry::query()->orderBy('name')->get();

        return Inertia::render('Church/LeadershipProfiles', [
            'leadership' => $leadership,
            'ministries' => $ministries,
            'flash' => [
                'success' => $request->session()->get('success'),
            ],
        ]);
    }

    public function storeLeadership(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'title' => ['required', 'string', 'max:255'],
            'ministry_id' => ['nullable', 'exists:church_ministries,id'],
            'bio' => ['nullable', 'string'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        ChurchLeadershipProfile::create([
            'church_ministry_id' => $validated['ministry_id'] ?? null,
            'name' => $validated['name'],
            'title' => $validated['title'],
            'bio' => $validated['bio'] ?? null,
            'email' => $validated['email'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'is_active' => (bool) ($validated['is_active'] ?? true),
        ]);

        return redirect()->route('church-admin.leadership')->with('success', 'Leadership profile created successfully.');
    }

    public function storeReport(Request $request)
    {
        $validated = $request->validate([
            'period_type' => ['required', 'in:weekly,monthly,quarterly,annual'],
            'title' => ['required', 'string', 'max:255'],
            'report_date' => ['required', 'date'],
            'summary' => ['nullable', 'string'],
            'attendance_count' => ['nullable', 'integer', 'min:0'],
            'first_timers_count' => ['nullable', 'integer', 'min:0'],
            'new_members_count' => ['nullable', 'integer', 'min:0'],
            'prayer_requests_count' => ['nullable', 'integer', 'min:0'],
        ]);

        $reportDate = Carbon::parse($validated['report_date']);
        $liveSummary = $this->liveAttendanceReportSummary($validated['period_type'], $reportDate);
        $hasManualSummary = !empty(trim((string) ($validated['summary'] ?? '')));

        $attendanceCount = $hasManualSummary && array_key_exists('attendance_count', $validated)
            ? ($validated['attendance_count'] ?? $liveSummary['attendance_count'])
            : $liveSummary['attendance_count'];
        $firstTimersCount = $hasManualSummary && array_key_exists('first_timers_count', $validated)
            ? ($validated['first_timers_count'] ?? $liveSummary['first_timers_count'])
            : $liveSummary['first_timers_count'];
        $newMembersCount = $hasManualSummary && array_key_exists('new_members_count', $validated)
            ? ($validated['new_members_count'] ?? $liveSummary['new_members_count'])
            : $liveSummary['new_members_count'];
        $prayerRequestsCount = $hasManualSummary && array_key_exists('prayer_requests_count', $validated)
            ? ($validated['prayer_requests_count'] ?? $liveSummary['prayer_requests_count'])
            : $liveSummary['prayer_requests_count'];

        ChurchReport::create([
            'period_type' => $validated['period_type'],
            'title' => $validated['title'],
            'report_date' => $validated['report_date'],
            'summary' => $validated['summary'] ?? $this->buildReportSummary($validated['period_type'], $reportDate, $liveSummary),
            'attendance_count' => $attendanceCount,
            'first_timers_count' => $firstTimersCount,
            'new_members_count' => $newMembersCount,
            'prayer_requests_count' => $prayerRequestsCount,
        ]);

        return redirect()->route('church-admin.reports')->with('success', 'Church report saved successfully.');
    }

    public function reports(Request $request)
    {
        $periodType = $request->validate([
            'period_type' => ['nullable', 'in:all,weekly,monthly,quarterly,annual'],
        ])['period_type'] ?? 'all';

        $reportsQuery = ChurchReport::query()
            ->orderByDesc('report_date');

        if ($periodType !== 'all') {
            $reportsQuery->where('period_type', $periodType);
        }

        $reports = $reportsQuery->get();
        $scorecardsQuery = ChurchScorecard::query()->orderByDesc('report_date');

        if ($periodType !== 'all') {
            $scorecardsQuery->where('period_type', $periodType);
        }

        $analytics = $this->reportAnalytics($reports, $scorecardsQuery->get(), $periodType);
        $liveReport = null;

        if ($periodType !== 'all' && $reports->isEmpty()) {
            $liveReport = [
                'id' => 0,
            'period_type' => $periodType,
            'title' => 'Live ' . ucfirst($periodType) . ' summary',
                'report_date' => now()->toDateString(),
            'summary' => 'Live summary generated from qualifying attendance records for the current ' . $periodType . ' scope.',
                'attendance_count' => $analytics['totalAttendance'],
                'first_timers_count' => $analytics['totalFirstTimers'],
                'new_members_count' => $analytics['totalNewMembers'],
                'prayer_requests_count' => $analytics['totalPrayerRequests'],
                'is_live' => true,
            ];
        }

        return Inertia::render('Church/ReportsDashboard', [
            'reports' => $reports,
            'analytics' => $analytics,
            'liveReport' => $liveReport,
            'periodType' => $periodType,
            'analyticsLabels' => [
                'attendanceTrend' => 'Attendance trend',
                'weeklyGrowth' => 'Weekly growth',
                'strongestPeriod' => 'Strongest period',
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
            ],
        ]);
    }

    private function reportAnalytics(Collection $reports, Collection $scorecards, string $periodType = 'all'): array
    {
        $sorted = $reports->sortBy('report_date')->values();
        $weekly = $reports->where('period_type', 'weekly')->sortBy('report_date')->values();

        $liveAttendanceQuery = AttendanceRecord::query()
            ->whereIn('status', ['present', 'late']);
        $liveMemberQuery = MemberProfile::query();
        $livePrayerQuery = ChurchPrayerRequest::query();
        $liveStartDate = null;
        $liveEndDate = null;

        if ($periodType !== 'all') {
            [$scopeStart, $scopeEnd] = $this->reportDateRange($periodType, now());
            $liveStartDate = $scopeStart->toDateString();
            $liveEndDate = $scopeEnd->toDateString();
            $liveAttendanceQuery->whereBetween('service_date', [$liveStartDate, $liveEndDate]);
            $liveMemberQuery->whereBetween('created_at', [$scopeStart, $scopeEnd]);
            $livePrayerQuery->whereBetween('created_at', [$scopeStart, $scopeEnd]);
        }

        $liveAttendance = $liveAttendanceQuery->get()->groupBy('service_type');
        $liveAttendanceTotal = $liveAttendance->flatten(1)->count();
        $liveFirstTimers = (clone $liveAttendanceQuery)
            ->where('first_timer', true)
            ->count();
        $liveNewMembers = $liveMemberQuery->count();
        $livePrayerRequests = $livePrayerQuery->count();

        $reportedAttendanceTotal = (int) $reports->sum('attendance_count');
        $reportedFirstTimersTotal = (int) $reports->sum('first_timers_count');
        $reportedNewMembersTotal = (int) $reports->sum('new_members_count');
        $reportedPrayerRequestsTotal = (int) $reports->sum('prayer_requests_count');
        $totalAttendance = ($reports->isEmpty() || $reportedAttendanceTotal === 0) ? $liveAttendanceTotal : $reportedAttendanceTotal;
        $totalFirstTimers = ($reports->isEmpty() || $reportedFirstTimersTotal === 0) ? $liveFirstTimers : $reportedFirstTimersTotal;
        $totalNewMembers = ($reports->isEmpty() || $reportedNewMembersTotal === 0) ? $liveNewMembers : $reportedNewMembersTotal;
        $totalPrayerRequests = ($reports->isEmpty() || $reportedPrayerRequestsTotal === 0) ? $livePrayerRequests : $reportedPrayerRequestsTotal;

        $previous = $weekly->count() > 1 ? (int) $weekly->get($weekly->count() - 2)->attendance_count : (int) ($weekly->first()->attendance_count ?? 0);
        $latest = $weekly->count() > 1 ? (int) $weekly->last()->attendance_count : (int) ($sorted->last()->attendance_count ?? 0);
        $growth = $previous > 0 ? (int) round((($latest - $previous) / $previous) * 100) : 0;
        $periodTotals = $reports->groupBy('period_type')->map(fn ($periodReports) => (int) $periodReports->sum('attendance_count'));
        $strongest = $periodTotals->sortDesc()->keys()->first();
        $trend = $sorted->count() > 1
            ? (int) $sorted->last()->attendance_count - (int) $sorted->first()->attendance_count
            : (int) ($sorted->first()->attendance_count ?? 0);
        $scorecardsSorted = $scorecards->sortBy('report_date')->values();
        $totalInvitations = (int) $scorecards->sum('invitation_count');
        $totalVisitors = (int) $scorecards->sum('new_visitors_count');
        $totalConversions = (int) $scorecards->sum('conversion_count');
        $scoreTrend = $scorecardsSorted->count() > 1
            ? (int) $scorecardsSorted->last()->score - (int) $scorecardsSorted->first()->score
            : (int) ($scorecardsSorted->first()->score ?? 0);
        $latestReport = $sorted->last();
        $previousReport = $sorted->count() > 1 ? $sorted->get($sorted->count() - 2) : null;
        $attendanceComparison = $previousReport
            ? (int) $latestReport->attendance_count - (int) $previousReport->attendance_count
            : 0;
        $latestScorecard = $scorecardsSorted->last();
        $previousScorecard = $scorecardsSorted->count() > 1 ? $scorecardsSorted->get($scorecardsSorted->count() - 2) : null;
        $invitationComparison = $previousScorecard
            ? (int) $latestScorecard->invitation_count - (int) $previousScorecard->invitation_count
            : 0;
        $newMembersTrend = $previousReport
            ? (int) $latestReport->new_members_count - (int) $previousReport->new_members_count
            : ($reports->isEmpty() || $reportedNewMembersTotal === 0 ? $liveNewMembers : (int) ($latestReport->new_members_count ?? 0));
        $firstTimerTrend = $previousReport
            ? (int) $latestReport->first_timers_count - (int) $previousReport->first_timers_count
            : ($reports->isEmpty() || $reportedFirstTimersTotal === 0 ? $liveFirstTimers : (int) ($latestReport->first_timers_count ?? 0));
        $prayerMomentum = $previousReport
            ? (int) $latestReport->prayer_requests_count - (int) $previousReport->prayer_requests_count
            : ($reports->isEmpty() || $reportedPrayerRequestsTotal === 0 ? $livePrayerRequests : (int) ($latestReport->prayer_requests_count ?? 0));
        $engagementRate = $totalAttendance > 0 ? (int) round((($totalFirstTimers / $totalAttendance) * 100)) : 0;
        $leadershipSummary = $latestReport
            ? "Latest church pulse: {$latestReport->title} (" . Carbon::parse($latestReport->report_date)->format('Y-m-d') . ") - attendance {$latestReport->attendance_count}, first timers {$latestReport->first_timers_count}, prayer requests {$latestReport->prayer_requests_count}."
            : "Latest live church pulse: attendance {$liveAttendanceTotal}, first timers {$liveFirstTimers}, prayer requests {$livePrayerRequests}.";
        $leadershipInsight = $strongest
            ? 'The strongest reporting period is ' . strtolower($strongest) . ' with ' . $periodTotals->get($strongest) . ' recorded attendees.'
            : 'No attendance trend data yet.';
        if ($periodType === 'annual') {
            $annualTrendStart = Carbon::parse($liveStartDate)->startOfMonth();
            $annualTrend = (clone $liveAttendanceQuery)
                ->get()
                ->groupBy(fn ($record) => $record->service_date->copy()->startOfMonth()->format('Y-m'));
            $liveTrendSeries = collect(range(0, 11))->map(function (int $offset) use ($annualTrendStart, $annualTrend): array {
                $month = $annualTrendStart->copy()->addMonths($offset);

                return [
                    'label' => $month->format('M'),
                    'value' => $annualTrend->get($month->format('Y-m'), collect())->count(),
                ];
            })->all();
            $liveTrendLabel = 'Twelve-month service rhythm';
            $liveTrendDescription = 'Raw present and late records by service month';
        } else {
            $trendStart = now()->startOfWeek()->subWeeks(7);
            $liveWeeklyTrendQuery = AttendanceRecord::query()
                ->whereIn('status', ['present', 'late'])
                ->whereDate('service_date', '>=', $trendStart->toDateString())
                ->whereDate('service_date', '<=', now()->endOfWeek()->toDateString());
            if ($liveStartDate && $liveEndDate) {
                $liveWeeklyTrendQuery
                    ->whereDate('service_date', '>=', $liveStartDate)
                    ->whereDate('service_date', '<=', $liveEndDate);
            }
            $liveWeeklyTrend = $liveWeeklyTrendQuery->get()
                ->groupBy(fn ($record) => $record->service_date->copy()->startOfWeek()->toDateString());
            $liveTrendSeries = collect(range(0, 7))->map(function (int $offset) use ($trendStart, $liveWeeklyTrend): array {
                $week = $trendStart->copy()->addWeeks($offset);

                return [
                    'label' => $week->format('M j'),
                    'value' => $liveWeeklyTrend->get($week->toDateString(), collect())->count(),
                ];
            })->all();
            $liveTrendLabel = 'Eight-week service rhythm';
            $liveTrendDescription = 'Raw present and late records by service week';
        }

        return [
            'totalAttendance' => $totalAttendance,
            'totalFirstTimers' => $totalFirstTimers,
            'totalNewMembers' => $totalNewMembers,
            'totalPrayerRequests' => $totalPrayerRequests,
            'averageAttendance' => $reports->count() ? (int) round($totalAttendance / $reports->count()) : ($totalAttendance > 0 ? $totalAttendance : 0),
            'attendanceTrend' => $trend >= 0 ? "+{$trend}" : (string) $trend,
            'weeklyGrowth' => ($growth >= 0 ? '+' : '') . "{$growth}%",
            'strongestPeriod' => $strongest ? ucfirst($strongest) . ' (' . $periodTotals->get($strongest) . ')' : 'No data',
            'weeklyReports' => $weekly->count(),
            'monthlyReports' => $reports->where('period_type', 'monthly')->count(),
            'quarterlyReports' => $reports->where('period_type', 'quarterly')->count(),
            'annualReports' => $reports->where('period_type', 'annual')->count(),
            'totalInvitations' => $totalInvitations,
            'totalVisitors' => $totalVisitors,
            'totalConversions' => $totalConversions,
            'conversionRate' => $totalVisitors > 0 ? (int) round(($totalConversions / $totalVisitors) * 100) . '%' : '0%',
            'scoreTrend' => $scoreTrend >= 0 ? "+{$scoreTrend}" : (string) $scoreTrend,
            'attendanceComparison' => $attendanceComparison >= 0 ? "+{$attendanceComparison}" : (string) $attendanceComparison,
            'invitationComparison' => $invitationComparison >= 0 ? "+{$invitationComparison}" : (string) $invitationComparison,
            'newMembersTrend' => $newMembersTrend >= 0 ? "+{$newMembersTrend}" : (string) $newMembersTrend,
            'firstTimerTrend' => $firstTimerTrend >= 0 ? "+{$firstTimerTrend}" : (string) $firstTimerTrend,
            'prayerMomentum' => $prayerMomentum >= 0 ? "+{$prayerMomentum}" : (string) $prayerMomentum,
            'engagementRate' => $engagementRate . '%',
            'leadershipSummary' => $leadershipSummary,
            'leadershipInsight' => $leadershipInsight,
            'liveAttendance' => [
                'total' => $liveAttendanceTotal,
                'present' => (clone $liveAttendanceQuery)->where('status', 'present')->count(),
                'late' => (clone $liveAttendanceQuery)->where('status', 'late')->count(),
                'byService' => [
                    'main_service' => $liveAttendance->get('main_service', collect())->count(),
                    'sunday_school' => $liveAttendance->get('sunday_school', collect())->count(),
                    'workers_meeting' => $liveAttendance->get('workers_meeting', collect())->count(),
                    'prayer_meeting' => $liveAttendance->get('prayer_meeting', collect())->count(),
                ],
                'trend' => $liveTrendSeries,
                'weeklyTrend' => $liveTrendSeries,
                'trendLabel' => $liveTrendLabel,
                'trendDescription' => $liveTrendDescription,
            ],
        ];
    }

    public function prayerRequests(Request $request)
    {
        $prayerRequests = ChurchPrayerRequest::query()
            ->latest()
            ->get();

        return Inertia::render('Church/PrayerRequestsBoard', [
            'prayerRequests' => $prayerRequests,
            'flash' => [
                'success' => $request->session()->get('success'),
            ],
        ]);
    }

    public function announcements(Request $request)
    {
        return Inertia::render('Church/AnnouncementsBoard', [
            'announcements' => ChurchAnnouncement::query()->latest('published_at')->latest()->get(),
            'flash' => ['success' => $request->session()->get('success')],
        ]);
    }

    public function storeAnnouncement(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'published_at' => ['nullable', 'date'],
            'status' => ['required', 'in:draft,published,archived'],
        ]);

        ChurchAnnouncement::create($validated);

        return redirect()->route('church-admin.announcements')->with('success', 'Announcement saved successfully.');
    }

    public function updatePrayerRequestStatus(Request $request, ChurchPrayerRequest $prayerRequest)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:pending,prayed,closed'],
        ]);

        $prayerRequest->update(['status' => $validated['status']]);

        return redirect()->route('church-admin.prayer-requests')->with('success', 'Prayer request status updated successfully.');
    }

    private function liveAttendanceReportSummary(string $periodType, Carbon $reportDate): array
    {
        [$start, $end] = $this->reportDateRange($periodType, $reportDate);

        $qualifyingRecords = AttendanceRecord::query()
            ->whereIn('status', ['present', 'late'])
            ->whereDate('service_date', '>=', $start->toDateString())
            ->whereDate('service_date', '<=', $end->toDateString())
            ->get();

        $newMembersCount = MemberProfile::query()
            ->whereBetween('created_at', [$start->startOfDay()->toDateTimeString(), $end->endOfDay()->toDateTimeString()])
            ->count();

        $prayerRequestsCount = ChurchPrayerRequest::query()
            ->whereBetween('created_at', [$start->startOfDay()->toDateTimeString(), $end->endOfDay()->toDateTimeString()])
            ->count();

        return [
            'attendance_count' => $qualifyingRecords->count(),
            'first_timers_count' => $qualifyingRecords->filter(fn ($record) => (bool) $record->first_timer)->count(),
            'new_members_count' => $newMembersCount,
            'prayer_requests_count' => $prayerRequestsCount,
        ];
    }

    private function buildReportSummary(string $periodType, Carbon $reportDate, array $liveSummary): string
    {
        return sprintf(
            '%s report for %s: %d qualifying attendance records and %d first timers recorded.',
            ucfirst($periodType),
            $reportDate->format('F Y'),
            $liveSummary['attendance_count'],
            $liveSummary['first_timers_count']
        );
    }

    private function reportDateRange(string $periodType, Carbon $reportDate): array
    {
        return match ($periodType) {
            'weekly' => [$reportDate->copy()->startOfWeek(Carbon::SUNDAY), $reportDate->copy()->endOfWeek(Carbon::SUNDAY)],
            'monthly' => [$reportDate->copy()->startOfMonth(), $reportDate->copy()->endOfMonth()],
            'quarterly' => [$reportDate->copy()->startOfQuarter(), $reportDate->copy()->endOfQuarter()],
            'annual' => [$reportDate->copy()->startOfYear(), $reportDate->copy()->endOfYear()],
            default => [$reportDate->copy()->startOfDay(), $reportDate->copy()->endOfDay()],
        };
    }

    private function parseList(string $value): array
    {
        $lines = preg_split('/\r\n|\n|\r/', trim($value));

        if (!$lines) {
            return [];
        }

        return collect($lines)
            ->map(fn ($line) => trim((string) $line))
            ->filter(fn ($line) => $line !== '')
            ->values()
            ->all();
    }

    public function scorecards(Request $request)
    {
        $scorecards = ChurchScorecard::query()
            ->orderByDesc('report_date')
            ->get();

        $validatedInvitationCounts = ChurchInvitation::query()
            ->whereNotNull('validated_at')
            ->selectRaw('inviter_id, COUNT(*) as validated_count')
            ->groupBy('inviter_id')
            ->with([
                'inviter:id,name,referral_code',
            ])
            ->with([
                'inviter.memberProfile:id,user_id,avatar_path',
            ])
            ->orderByDesc('validated_count')
            ->get()
            ->map(function (ChurchInvitation $invitation) {
                $inviter = $invitation->inviter;
                $memberProfile = $inviter?->memberProfile;
                $avatarUrl = $memberProfile?->avatar_path
                    ? route('member-profile.photo', $memberProfile)
                    : null;

                return [
                    'inviter_id' => $invitation->inviter_id,
                    'validated_count' => (int) $invitation->validated_count,
                    'avatar_url' => $avatarUrl,
                    'inviter' => $inviter ? [
                        'id' => $inviter->id,
                        'name' => $inviter->name,
                        'referral_code' => $inviter->referral_code,
                        'memberProfile' => $memberProfile ? [
                            'id' => $memberProfile->id,
                            'user_id' => $memberProfile->user_id,
                            'avatar_path' => $memberProfile->avatar_path,
                        ] : null,
                    ] : null,
                ];
            });

        return Inertia::render('Church/ScorecardsDashboard', [
            'scorecards' => $scorecards,
            'validatedInvitationCounts' => $validatedInvitationCounts,
            'flash' => [
                'success' => $request->session()->get('success'),
            ],
        ]);
    }

    public function absentees(Request $request)
    {
        $validated = $request->validate([
            'period' => ['nullable', 'in:week,month'],
            'date' => ['nullable', 'date'],
        ]);
        $period = $validated['period'] ?? 'week';
        $latestDate = AttendanceRecord::query()
            ->where('service_type', 'main_service')
            ->whereIn('status', ['absent', 'excused'])
            ->orderByDesc('service_date')
            ->value('service_date');
        $selectedDate = Carbon::parse($validated['date'] ?? $latestDate ?? now());
        [$periodStart, $periodEnd] = $period === 'month'
            ? [$selectedDate->copy()->startOfMonth(), $selectedDate->copy()->endOfMonth()]
            : [$selectedDate->copy()->startOfWeek(Carbon::SUNDAY), $selectedDate->copy()->endOfWeek(Carbon::SATURDAY)];

        $periodDates = AttendanceRecord::query()
            ->where('service_type', 'main_service')
            ->whereIn('status', ['absent', 'excused'])
            ->whereBetween('service_date', [$periodStart->toDateString(), $periodEnd->toDateString()])
            ->selectRaw('DISTINCT DATE(service_date) as service_date')
            ->orderByDesc('service_date')
            ->pluck('service_date');

        $absentees = collect();

        foreach ($periodDates as $serviceDate) {
            $records = AttendanceRecord::query()
                ->where('service_type', 'main_service')
                ->whereDate('service_date', $serviceDate)
                ->whereIn('status', ['absent', 'excused'])
                ->with('memberProfile')
                ->get();

            foreach ($records as $record) {
                $memberProfile = $record->memberProfile;
                $memberName = $memberProfile
                    ? trim(($memberProfile->first_name ?? '') . ' ' . ($memberProfile->last_name ?? ''))
                    : ($record->user?->name ?? 'Unknown member');

                $photoUrl = $memberProfile && $memberProfile->avatar_path
                    ? route('member-profile.photo', $memberProfile)
                    : null;

                $absentees->push([
                    'id' => $record->id,
                    'member_name' => $memberName,
                    'reason' => $record->notes,
                    'service_type' => $record->service_type,
                    'service_date' => $record->service_date->format('Y-m-d'),
                    'status' => $record->status,
                    'photo_url' => $photoUrl,
                ]);
            }
        }

        $savedWeeks = AttendanceRecord::query()
            ->where('service_type', 'main_service')
            ->whereIn('status', ['absent', 'excused'])
            ->get(['service_date', 'status'])
            ->groupBy(fn ($record) => Carbon::parse($record->service_date)->startOfWeek(Carbon::SUNDAY)->toDateString())
            ->map(function ($records, $weekStart) {
                $start = Carbon::parse($weekStart);

                return [
                    'start' => $start->toDateString(),
                    'label' => $start->format('M j') . ' - ' . $start->copy()->addDays(6)->format('M j, Y'),
                    'records' => $records->count(),
                    'excused' => $records->where('status', 'excused')->count(),
                ];
            })
            ->sortByDesc('start')
            ->take(26)
            ->values()
            ->all();

        return Inertia::render('Church/AbsenteeBoard', [
            'absentees' => $absentees->sortByDesc('service_date')->values()->all(),
            'period' => $period,
            'selectedDate' => $selectedDate->toDateString(),
            'periodLabel' => $period === 'month'
                ? $selectedDate->format('F Y')
                : $periodStart->format('M j') . ' - ' . $periodEnd->format('M j, Y'),
            'savedWeeks' => $savedWeeks,
            'flash' => [
                'success' => $request->session()->get('success'),
            ],
        ]);
    }

    public function storeAbsentee(Request $request)
    {
        return redirect()->route('church-admin.absentees')->with(
            'success',
            'Absentee records are generated automatically from the service register. No manual absentee entry is required.'
        );
    }

    public function workersMeetings(Request $request)
    {
        $meetings = ChurchWorkersMeeting::query()
            ->orderByDesc('meeting_date')
            ->get();

        return Inertia::render('Church/WorkersMeetingBoard', [
            'meetings' => $meetings,
            'flash' => [
                'success' => $request->session()->get('success'),
            ],
        ]);
    }

    public function storeWorkersMeeting(Request $request)
    {
        $validated = $request->validate([
            'topic' => ['required', 'string', 'max:255'],
            'meeting_date' => ['required', 'date'],
            'leader_name' => ['required', 'string', 'max:255'],
            'summary' => ['nullable', 'string'],
            'status' => ['required', 'in:scheduled,completed,cancelled'],
        ]);

        ChurchWorkersMeeting::create([
            'topic' => $validated['topic'],
            'meeting_date' => $validated['meeting_date'],
            'leader_name' => $validated['leader_name'],
            'summary' => $validated['summary'] ?? null,
            'status' => $validated['status'],
        ]);

        return redirect()->route('church-admin.workers-meetings')->with('success', 'Workers meeting saved successfully.');
    }

    public function media(Request $request)
    {
        $media = ChurchMediaContent::query()
            ->orderByDesc('published_at')
            ->get();

        return Inertia::render('Church/MediaContentBoard', [
            'media' => $media,
            'flash' => [
                'success' => $request->session()->get('success'),
            ],
        ]);
    }

    public function messages(Request $request)
    {
        return Inertia::render('Church/MessagesBoard', [
            'messages' => ChurchContactMessage::query()->latest()->get(),
            'flash' => [
                'success' => $request->session()->get('success'),
            ],
        ]);
    }

    public function updateMessageStatus(Request $request, ChurchContactMessage $message)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:open,resolved'],
        ]);

        $wasResolved = $message->status === 'resolved';
        $message->update(['status' => $validated['status']]);

        if (!$wasResolved && $message->status === 'resolved' && $message->user) {
            $message->user->notify(new ContactMessageResolved($message));
        }

        return redirect()->route('church-admin.messages')->with('success', 'Message status updated successfully.');
    }

    public function memberMessages(Request $request)
    {
        return Inertia::render('Member/Messages', [
            'messages' => $request->user()->churchContactMessages()->latest()->get(),
        ]);
    }

    public function events(Request $request)
    {
        $events = Event::query()
            ->with('registrations.user')
            ->orderBy('start_date')
            ->get()
            ->map(function (Event $event) {
                $event->registration_summary = $event->registrations
                    ->groupBy('status')
                    ->map(fn ($registrations) => $registrations->count())
                    ->all();
                $event->registrants = $event->registrations
                    ->sortBy('registered_at')
                    ->map(fn ($registration) => [
                        'name' => $registration->user?->name ?? 'Unknown member',
                        'email' => $registration->user?->email,
                        'status' => $registration->status,
                    ])
                    ->values()
                    ->all();

                return $event;
            });

        return Inertia::render('Church/EventManagement', [
            'events' => $events,
            'flash' => ['success' => $request->session()->get('success')],
        ]);
    }

    public function storeEvent(Request $request)
    {
        $validated = $request->validate($this->eventValidationRules());

        Event::create([
            ...$validated,
            'is_virtual' => (bool) ($validated['is_virtual'] ?? false),
            'status' => $validated['status'],
        ]);

        return redirect()->route('church-admin.events')->with('success', 'Church event created successfully.');
    }

    public function updateEvent(Request $request, Event $event)
    {
        $validated = $request->validate($this->eventValidationRules());

        $event->update([
            ...$validated,
            'is_virtual' => (bool) ($validated['is_virtual'] ?? false),
        ]);

        return redirect()->route('church-admin.events')->with('success', 'Church event updated successfully.');
    }

    private function eventValidationRules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'event_type' => ['required', 'in:workshop,conference,competition,bootcamp,hackathon'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'location' => ['nullable', 'string', 'max:255'],
            'is_virtual' => ['nullable', 'boolean'],
            'max_participants' => ['nullable', 'integer', 'min:1'],
            'registration_deadline' => ['required', 'date', 'before_or_equal:start_date'],
            'status' => ['required', 'in:upcoming,registration_open,ongoing,cancelled'],
        ];
    }

    public function storeMedia(Request $request)
    {
        $validated = $request->validate([
            'content_type' => ['required', 'in:interview,sermon,testimony,highlight,music'],
            'title' => ['required', 'string', 'max:255'],
            'speaker_name' => ['nullable', 'string', 'max:255'],
            'published_at' => ['required', 'date'],
            'video_url' => ['nullable', 'url', 'max:255'],
            'summary' => ['nullable', 'string'],
            'scripture_reference' => ['nullable', 'string', 'max:255'],
            'featured' => ['nullable', 'boolean'],
            'status' => ['required', 'in:draft,published,archived'],
        ]);

        ChurchMediaContent::create([
            'content_type' => $validated['content_type'],
            'title' => $validated['title'],
            'speaker_name' => $validated['speaker_name'] ?? null,
            'published_at' => $validated['published_at'],
            'video_url' => $validated['video_url'] ?? null,
            'summary' => $validated['summary'] ?? null,
            'scripture_reference' => $validated['scripture_reference'] ?? null,
            'featured' => (bool) ($validated['featured'] ?? false),
            'status' => $validated['status'],
        ]);

        return redirect()->route('church-admin.media')->with('success', 'Media content saved successfully.');
    }
}
