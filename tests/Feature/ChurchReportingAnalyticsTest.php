<?php

namespace Tests\Feature;

use App\Models\AttendanceRecord;
use App\Models\User;
use App\Models\ChurchScorecard;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChurchReportingAnalyticsTest extends TestCase
{
    use RefreshDatabase;

    public function test_church_reports_dashboard_shows_trend_analytics(): void
    {
        /** @var User $user */
        $user = User::factory()->create(['email' => 'crownpaysme19@gmail.com']);

        foreach (range(1, 120) as $index) {
            AttendanceRecord::create([
                'user_id' => $user->id,
                'service_type' => 'main_service',
                'service_date' => '2026-09-06',
                'status' => 'present',
                'first_timer' => $index <= 15,
                'recorded_by' => $user->id,
            ]);
        }

        foreach (range(1, 160) as $index) {
            AttendanceRecord::create([
                'user_id' => $user->id,
                'service_type' => 'main_service',
                'service_date' => '2026-09-13',
                'status' => 'present',
                'first_timer' => $index <= 18,
                'recorded_by' => $user->id,
            ]);
        }

        $this->actingAs($user)
            ->post('/church-admin/reports', [
                'period_type' => 'weekly',
                'title' => 'Week 1 Worship Report',
                'report_date' => '2026-09-01',
                'summary' => 'Strong worship attendance with more youth involvement.',
                'attendance_count' => 120,
                'first_timers_count' => 15,
                'new_members_count' => 5,
                'prayer_requests_count' => 8,
            ]);

        $this->actingAs($user)
            ->post('/church-admin/reports', [
                'period_type' => 'weekly',
                'title' => 'Week 2 Worship Report',
                'report_date' => '2026-09-08',
                'summary' => 'Another strong week with growing attendance and prayer support.',
                'attendance_count' => 160,
                'first_timers_count' => 18,
                'new_members_count' => 7,
                'prayer_requests_count' => 10,
            ]);

        ChurchScorecard::create([
            'period_type' => 'weekly',
            'title' => 'Week 1 Outreach Scorecard',
            'report_date' => '2026-09-01',
            'invitation_count' => 20,
            'new_visitors_count' => 10,
            'conversion_count' => 2,
            'score' => 70,
        ]);
        ChurchScorecard::create([
            'period_type' => 'weekly',
            'title' => 'Week 2 Outreach Scorecard',
            'report_date' => '2026-09-08',
            'invitation_count' => 30,
            'new_visitors_count' => 15,
            'conversion_count' => 6,
            'score' => 82,
        ]);

        $response = $this->actingAs($user)->get('/church-admin/reports');

        $response->assertOk();
        $response->assertSee('Attendance trend');
        $response->assertSee('Weekly growth');
        $response->assertSee('Strongest period');
        $response->assertInertia(fn ($page) => $page
            ->where('reports.0.attendance_count', 160)
            ->where('reports.1.attendance_count', 120)
            ->where('analytics.totalAttendance', 280)
            ->where('analytics.attendanceTrend', '+40')
            ->where('analytics.weeklyGrowth', '+33%')
            ->where('analytics.strongestPeriod', 'Weekly (280)')
            ->where('analytics.totalInvitations', 50)
            ->where('analytics.totalVisitors', 25)
            ->where('analytics.totalConversions', 8)
            ->where('analytics.conversionRate', '32%')
            ->where('analytics.scoreTrend', '+12')
            ->where('analytics.attendanceComparison', '+40')
            ->where('analytics.invitationComparison', '+10')
            ->where('analytics.liveAttendance.total', 280)
            ->where('analytics.liveAttendance.present', 280)
            ->where('analytics.liveAttendance.late', 0)
            ->where('analytics.liveAttendance.byService.main_service', 280)
            ->has('analytics.liveAttendance.weeklyTrend', 8)
        );
    }

    public function test_church_reports_dashboard_exposes_server_summary_insights(): void
    {
        /** @var User $user */
        $user = User::factory()->create(['email' => 'crownpaysme19@gmail.com']);

        foreach (range(1, 120) as $index) {
            AttendanceRecord::create([
                'user_id' => $user->id,
                'service_type' => 'main_service',
                'service_date' => '2026-09-06',
                'status' => 'present',
                'first_timer' => $index <= 15,
                'recorded_by' => $user->id,
            ]);
        }

        foreach (range(1, 160) as $index) {
            AttendanceRecord::create([
                'user_id' => $user->id,
                'service_type' => 'main_service',
                'service_date' => '2026-09-13',
                'status' => 'present',
                'first_timer' => $index <= 18,
                'recorded_by' => $user->id,
            ]);
        }

        $this->actingAs($user)->post('/church-admin/reports', [
            'period_type' => 'weekly',
            'title' => 'Week 1 Worship Report',
            'report_date' => '2026-09-01',
            'summary' => 'Strong worship attendance with more youth involvement.',
            'new_members_count' => 5,
            'prayer_requests_count' => 8,
        ]);

        $this->actingAs($user)->post('/church-admin/reports', [
            'period_type' => 'weekly',
            'title' => 'Week 2 Worship Report',
            'report_date' => '2026-09-08',
            'summary' => 'A second week of strong growth and prayer coverage.',
            'new_members_count' => 7,
            'prayer_requests_count' => 10,
        ]);

        $this->actingAs($user)
            ->get('/church-admin/reports')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('analytics.leadershipSummary', 'Latest church pulse: Week 2 Worship Report (2026-09-08) - attendance 280, first timers 33, prayer requests 10.')
                ->where('analytics.leadershipInsight', 'The strongest reporting period is weekly with 400 recorded attendees.')
            );
    }

    public function test_church_reports_dashboard_can_filter_analytics_by_period_type(): void
    {
        /** @var User $user */
        $user = User::factory()->create(['email' => 'crownpaysme19@gmail.com']);

        $this->actingAs($user)->post('/church-admin/reports', [
            'period_type' => 'weekly',
            'title' => 'Weekly Worship Report',
            'report_date' => '2026-09-08',
            'attendance_count' => 160,
        ]);

        $this->actingAs($user)->post('/church-admin/reports', [
            'period_type' => 'monthly',
            'title' => 'Monthly Worship Report',
            'report_date' => '2026-09-30',
            'attendance_count' => 620,
        ]);

        $response = $this->actingAs($user)->get('/church-admin/reports?period_type=weekly');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('periodType', 'weekly')
            ->has('reports', 1)
            ->where('reports.0.title', 'Weekly Worship Report')
        );
    }

    public function test_report_generation_uses_period_boundaries_and_qualifying_statuses(): void
    {
        /** @var User $user */
        $user = User::factory()->create(['email' => 'crownpaysme19@gmail.com']);

        foreach ([
            ['2026-08-30', 'present', false],
            ['2026-09-01', 'present', true],
            ['2026-09-06', 'late', true],
            ['2026-09-06', 'absent', true],
            ['2026-09-07', 'excused', false],
        ] as [$serviceDate, $status, $firstTimer]) {
            AttendanceRecord::create([
                'user_id' => $user->id,
                'service_type' => 'main_service',
                'service_date' => $serviceDate,
                'status' => $status,
                'first_timer' => $firstTimer,
                'recorded_by' => $user->id,
            ]);
        }

        $this->actingAs($user)
            ->post('/church-admin/reports', [
                'period_type' => 'weekly',
                'title' => 'Boundary Report',
                'report_date' => '2026-09-03',
                'attendance_count' => 999,
                'first_timers_count' => 999,
            ])
            ->assertRedirect('/church-admin/reports');

        $this->assertDatabaseHas('church_reports', [
            'title' => 'Boundary Report',
            'attendance_count' => 3,
            'first_timers_count' => 2,
        ]);
    }
}
