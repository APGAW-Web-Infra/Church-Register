<?php

namespace Tests\Feature;

use App\Models\ChurchPrayerRequest;
use App\Models\ChurchContactMessage;
use App\Models\AttendanceRecord;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class ChurchAdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create(['email' => 'crownpaysme19@gmail.com']);
    }

    public function test_church_admin_dashboard_is_accessible_to_authenticated_users(): void
    {
        $user = $this->admin();

        $response = $this
            ->actingAs($user)
            ->get('/church-admin');

        $response->assertOk();
    }

    public function test_church_admin_dashboard_reports_member_lifecycle_breakdown(): void
    {
        $user = $this->admin();

        \App\Models\MemberProfile::create([
            'user_id' => $user->id,
            'first_name' => 'Ada',
            'last_name' => 'Member',
            'membership_status' => 'member',
            'is_active' => true,
        ]);

        \App\Models\MemberProfile::create([
            'user_id' => $user->id,
            'first_name' => 'Ben',
            'last_name' => 'Visitor',
            'membership_status' => 'first_timer',
            'is_active' => true,
        ]);

        \App\Models\MemberProfile::create([
            'user_id' => $user->id,
            'first_name' => 'Cora',
            'last_name' => 'Inactive',
            'membership_status' => 'member',
            'is_active' => false,
        ]);

        $response = $this
            ->actingAs($user)
            ->get('/church-admin');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('churchData.memberLifecycle.total_active_members', 1)
            ->where('churchData.memberLifecycle.total_first_timers', 1)
            ->where('churchData.memberLifecycle.total_inactive_members', 1)
            ->where('churchData.memberLifecycle.needs_follow_up', 2)
        );
    }

    public function test_church_admin_dashboard_lists_member_follow_up_queue(): void
    {
        $user = $this->admin();

        \App\Models\MemberProfile::create([
            'user_id' => $user->id,
            'first_name' => 'First',
            'last_name' => 'Timer',
            'membership_status' => 'first_timer',
            'is_active' => true,
            'department' => 'Youth',
        ]);

        \App\Models\MemberProfile::create([
            'user_id' => $user->id,
            'first_name' => 'Away',
            'last_name' => 'Member',
            'membership_status' => 'member',
            'is_active' => false,
            'department' => 'Prayer',
        ]);

        $response = $this
            ->actingAs($user)
            ->get('/church-admin');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('churchData.followUpQueue.0.name', 'First Timer')
            ->where('churchData.followUpQueue.0.reason', 'first_timer_follow_up')
            ->where('churchData.followUpQueue.1.name', 'Away Member')
            ->where('churchData.followUpQueue.1.reason', 'inactive_member_follow_up')
        );
    }

    public function test_church_admin_dashboard_reports_referral_conversion_and_onboarding_completion(): void
    {
        $user = $this->admin();

        $completedInvitee = User::factory()->create(['email' => 'completed-invitee@example.com']);
        $pendingInvitee = User::factory()->create(['email' => 'pending-invitee@example.com']);

        $completedInvitee->memberProfile()->create([
            'first_name' => 'Completed',
            'last_name' => 'Member',
            'membership_status' => 'member',
            'is_active' => true,
            'profile_completed_at' => now(),
        ]);

        $pendingInvitee->memberProfile()->create([
            'first_name' => 'Pending',
            'last_name' => 'Member',
            'membership_status' => 'member',
            'is_active' => true,
        ]);

        \App\Models\ChurchInvitation::create([
            'inviter_id' => $user->id,
            'invitee_id' => $completedInvitee->id,
            'referral_code' => $user->referral_code,
            'registered_at' => now()->subDay(),
            'validated_at' => now(),
        ]);

        \App\Models\ChurchInvitation::create([
            'inviter_id' => $user->id,
            'invitee_id' => $pendingInvitee->id,
            'referral_code' => $user->referral_code,
            'registered_at' => now()->subDay(),
        ]);

        $response = $this
            ->actingAs($user)
            ->get('/church-admin');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('churchData.referralConversion.total', 2)
            ->where('churchData.referralConversion.validated', 1)
            ->where('churchData.referralConversion.pending', 1)
            ->where('churchData.referralConversion.rate', 50)
            ->where('churchData.onboardingCompletion.total', 2)
            ->where('churchData.onboardingCompletion.completed', 1)
            ->where('churchData.onboardingCompletion.incomplete', 1)
            ->where('churchData.onboardingCompletion.rate', 50)
        );
    }

    public function test_church_admin_dashboard_lists_member_engagement_pipeline_tasks(): void
    {
        $user = $this->admin();

        $newInvitee = User::factory()->create(['email' => 'new-invitee@example.com']);
        $newInvitee->memberProfile()->create([
            'first_name' => 'New',
            'last_name' => 'Invitee',
            'membership_status' => 'member',
            'is_active' => true,
        ]);

        $incompleteMember = \App\Models\MemberProfile::create([
            'user_id' => $user->id,
            'first_name' => 'Incomplete',
            'last_name' => 'Member',
            'membership_status' => 'member',
            'is_active' => true,
        ]);

        \App\Models\MemberProfile::create([
            'user_id' => $user->id,
            'first_name' => 'Away',
            'last_name' => 'Member',
            'membership_status' => 'member',
            'is_active' => false,
            'department' => 'Prayer',
        ]);

        \App\Models\ChurchInvitation::create([
            'inviter_id' => $user->id,
            'invitee_id' => $newInvitee->id,
            'referral_code' => $user->referral_code,
            'registered_at' => now()->subDay(),
        ]);

        $response = $this
            ->actingAs($user)
            ->get('/church-admin');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('churchData.engagementPipeline.0.task_type', 'pending_referral_follow_up')
            ->where('churchData.engagementPipeline.0.priority', 'high')
            ->where('churchData.engagementPipeline.1.task_type', 'incomplete_onboarding')
            ->where('churchData.engagementPipeline.2.task_type', 'inactive_member_recovery')
        );
    }

    public function test_dashboard_summary_cards_are_driven_by_real_church_data(): void
    {
        $user = $this->admin();

        \App\Models\AttendanceRecord::create([
            'user_id' => $user->id,
            'member_profile_id' => null,
            'service_type' => 'main_service',
            'service_date' => '2026-09-01',
            'status' => 'present',
            'first_timer' => false,
            'recorded_by' => $user->id,
            'notes' => 'Sunday service attendance',
        ]);

        \App\Models\AttendanceRecord::create([
            'user_id' => $user->id,
            'member_profile_id' => null,
            'service_type' => 'main_service',
            'service_date' => '2026-09-02',
            'status' => 'present',
            'first_timer' => true,
            'recorded_by' => $user->id,
            'notes' => 'First timer service',
        ]);

        \App\Models\ChurchPrayerRequest::create([
            'user_id' => $user->id,
            'full_name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'request_type' => 'healing',
            'message' => 'Please pray for my family.',
            'is_public' => true,
            'status' => 'pending',
        ]);

        \App\Models\ChurchMinistry::create([
            'name' => 'Prayer Ministry',
            'description' => 'Intercession and pastoral support.',
            'leader_name' => 'Pastor Faith',
            'is_active' => true,
        ]);

        \App\Models\Event::create([
            'title' => 'Community Prayer Night',
            'description' => 'A prayer and worship gathering.',
            'event_type' => 'workshop',
            'start_date' => now()->addDays(4),
            'end_date' => now()->addDays(4)->addHours(3),
            'location' => 'Main Hall',
            'is_virtual' => false,
            'registration_deadline' => now()->addDays(2),
            'status' => 'registration_open',
        ]);

        $response = $this
            ->actingAs($user)
            ->get('/dashboard');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('churchSummary.attendance_total', 2)
            ->where('churchSummary.prayer_requests', 1)
            ->where('churchSummary.active_ministries', 1)
            ->where('churchSummary.upcoming_events', 1)
        );
    }

    public function test_dashboard_handles_missing_church_prayer_requests_table_gracefully(): void
    {
        $user = $this->admin();

        Schema::dropIfExists('church_prayer_requests');

        $response = $this
            ->actingAs($user)
            ->get('/dashboard');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('churchSummary.prayer_requests', 0)
        );
    }

    public function test_admin_attendance_stats_api_returns_live_json_metrics(): void
    {
        $admin = $this->admin();

        foreach ([
            ['present', false, 'main_service'],
            ['late', true, 'main_service'],
            ['absent', false, 'main_service'],
            ['present', false, 'sunday_school'],
        ] as [$status, $firstTimer, $serviceType]) {
            AttendanceRecord::create([
                'user_id' => $admin->id,
                'service_type' => $serviceType,
                'service_date' => now()->format('Y-m-d'),
                'status' => $status,
                'first_timer' => $firstTimer,
                'recorded_by' => $admin->id,
            ]);
        }

        $this->actingAs($admin)
            ->getJson('/api/attendance/stats')
            ->assertOk()
            ->assertJsonPath('data.total', 3)
            ->assertJsonPath('data.present', 2)
            ->assertJsonPath('data.late', 1)
            ->assertJsonPath('data.first_timers', 1)
            ->assertJsonPath('data.by_service.main_service', 2)
            ->assertJsonPath('data.by_service.sunday_school', 1);
    }

    public function test_regular_member_cannot_access_admin_attendance_api(): void
    {
        /** @var User $member */
        $member = User::factory()->create(['email' => 'member-api@example.com']);

        $this->actingAs($member)
            ->getJson('/api/attendance/stats')
            ->assertForbidden();
    }

    public function test_health_endpoint_reports_app_database_cache_queue_and_scheduler_status(): void
    {
        $this->getJson('/api/health')
            ->assertOk()
            ->assertJsonPath('status', 'ok')
            ->assertJsonPath('database.connected', true)
            ->assertJsonPath('cache.connected', true)
            ->assertJsonPath('queue.enabled', true)
            ->assertJsonPath('scheduler.configured', true)
            ->assertJsonPath('app.env', 'testing');
    }

    public function test_admin_attendance_trends_api_returns_eight_service_weeks(): void
    {
        $admin = $this->admin();

        AttendanceRecord::create([
            'user_id' => $admin->id,
            'service_type' => 'main_service',
            'service_date' => now()->startOfWeek()->format('Y-m-d'),
            'status' => 'present',
            'first_timer' => false,
            'recorded_by' => $admin->id,
        ]);

        $this->actingAs($admin)
            ->getJson('/api/attendance/trends')
            ->assertOk()
            ->assertJsonCount(8, 'data')
            ->assertJsonPath('data.7.total', 1);
    }

    public function test_admin_attendance_report_api_filters_records_and_returns_metadata(): void
    {
        $admin = $this->admin();
        $profile = $admin->memberProfile()->create([
            'first_name' => 'Grace',
            'last_name' => 'Member',
            'membership_status' => 'member',
            'is_active' => true,
        ]);

        foreach ([
            ['2026-09-06', 'present', true, 'main_service'],
            ['2026-09-06', 'absent', false, 'main_service'],
            ['2026-09-13', 'late', false, 'sunday_school'],
        ] as [$serviceDate, $status, $firstTimer, $serviceType]) {
            AttendanceRecord::create([
                'user_id' => $admin->id,
                'member_profile_id' => $profile->id,
                'service_type' => $serviceType,
                'service_date' => $serviceDate,
                'status' => $status,
                'first_timer' => $firstTimer,
                'recorded_by' => $admin->id,
            ]);
        }

        $this->actingAs($admin)
            ->getJson('/api/attendance/report?from=2026-09-01&to=2026-09-10&service_type=main_service')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.member', 'Grace Member')
            ->assertJsonPath('meta.total_records', 2)
            ->assertJsonPath('meta.qualifying_records', 1)
            ->assertJsonPath('meta.first_timers', 1)
            ->assertJsonPath('meta.filters.service_type', 'main_service');
    }

    public function test_member_dashboard_health_counts_qualifying_main_service_attendance_by_service_date(): void
    {
        $user = $this->admin();
        $currentWeek = now()->startOfWeek();
        $previousWeek = $currentWeek->copy()->subWeek();

        foreach (['present', 'late', 'absent'] as $status) {
            AttendanceRecord::create([
                'user_id' => $user->id,
                'service_type' => 'main_service',
                'service_date' => $currentWeek->copy()->addDays(6)->format('Y-m-d'),
                'status' => $status,
                'first_timer' => false,
                'recorded_by' => $user->id,
                'created_at' => now()->subDays(20),
                'updated_at' => now()->subDays(20),
            ]);
        }

        AttendanceRecord::create([
            'user_id' => $user->id,
            'service_type' => 'main_service',
            'service_date' => $previousWeek->copy()->addDays(6)->format('Y-m-d'),
            'status' => 'present',
            'first_timer' => false,
            'recorded_by' => $user->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        AttendanceRecord::create([
            'user_id' => $user->id,
            'service_type' => 'sunday_school',
            'service_date' => $currentWeek->copy()->addDays(6)->format('Y-m-d'),
            'status' => 'present',
            'first_timer' => false,
            'recorded_by' => $user->id,
        ]);

        $this->actingAs($user)
            ->get('/dashboard')
            ->assertInertia(fn ($page) => $page
                ->where('churchHealth.attendance', 3)
                ->where('churchHealth.attendance_change', 100)
            );
    }

    public function test_church_member_directory_is_accessible_to_authenticated_users(): void
    {
        $user = $this->admin();

        $response = $this
            ->actingAs($user)
            ->get('/church-admin/members');

        $response->assertOk();
    }

    public function test_church_admin_can_review_and_update_prayer_request_status(): void
    {
        $user = $this->admin();
        $request = ChurchPrayerRequest::create([
            'full_name' => 'Grace Member',
            'email' => 'grace@example.com',
            'request_type' => 'healing',
            'message' => 'Please pray for healing and renewed strength.',
            'is_public' => false,
            'status' => 'pending',
        ]);

        $this->actingAs($user)
            ->get('/church-admin/prayer-requests')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('prayerRequests.0.full_name', 'Grace Member')
                ->where('prayerRequests.0.status', 'pending')
            );

        $this->actingAs($user)
            ->post('/church-admin/prayer-requests/' . $request->id . '/status', ['status' => 'prayed'])
            ->assertRedirect('/church-admin/prayer-requests');

        $this->assertDatabaseHas('church_prayer_requests', [
            'id' => $request->id,
            'status' => 'prayed',
        ]);
    }

    public function test_church_admin_can_review_and_resolve_contact_messages(): void
    {
        $user = $this->admin();
        $message = ChurchContactMessage::create([
            'full_name' => 'Grace Member',
            'email' => 'grace@example.com',
            'subject' => 'Ministry enquiry',
            'message' => 'Please share more information about joining a ministry.',
            'status' => 'open',
        ]);

        $this->actingAs($user)
            ->get('/church-admin/messages')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('messages.0.subject', 'Ministry enquiry')
                ->where('messages.0.status', 'open')
            );

        $this->actingAs($user)
            ->post('/church-admin/messages/' . $message->id . '/status', ['status' => 'resolved'])
            ->assertRedirect('/church-admin/messages');

        $this->assertDatabaseHas('church_contact_messages', [
            'id' => $message->id,
            'status' => 'resolved',
        ]);
    }

    public function test_church_admin_can_create_a_church_event(): void
    {
        $user = $this->admin();

        $response = $this
            ->actingAs($user)
            ->from('/church-admin/events')
            ->post('/church-admin/events', [
                'title' => 'Sunday Worship Encounter',
                'description' => 'A worship gathering for the whole church.',
                'event_type' => 'workshop',
                'start_date' => '2026-09-13 09:00:00',
                'end_date' => '2026-09-13 12:00:00',
                'location' => 'Main sanctuary',
                'is_virtual' => false,
                'max_participants' => 300,
                'registration_deadline' => '2026-09-13 08:30:00',
                'status' => 'registration_open',
            ]);

        $response->assertRedirect('/church-admin/events');
        $this->assertDatabaseHas('events', [
            'title' => 'Sunday Worship Encounter',
            'description' => 'A worship gathering for the whole church.',
            'event_type' => 'workshop',
            'status' => 'registration_open',
        ]);
    }

    public function test_church_admin_can_update_a_church_event(): void
    {
        $user = $this->admin();
        $event = \App\Models\Event::create([
            'title' => 'Original Service',
            'description' => 'Original event details.',
            'event_type' => 'workshop',
            'start_date' => '2026-09-13 09:00:00',
            'end_date' => '2026-09-13 11:00:00',
            'registration_deadline' => '2026-09-13 08:30:00',
            'status' => 'upcoming',
        ]);

        $response = $this->actingAs($user)->patch('/church-admin/events/' . $event->id, [
            'title' => 'Updated Service',
            'description' => 'Updated event details.',
            'event_type' => 'conference',
            'start_date' => '2026-09-14 10:00:00',
            'end_date' => '2026-09-14 13:00:00',
            'location' => 'Fellowship hall',
            'is_virtual' => false,
            'max_participants' => 250,
            'registration_deadline' => '2026-09-14 09:30:00',
            'status' => 'registration_open',
        ]);

        $response->assertRedirect('/church-admin/events');
        $this->assertDatabaseHas('events', [
            'id' => $event->id,
            'title' => 'Updated Service',
            'event_type' => 'conference',
            'max_participants' => 250,
            'status' => 'registration_open',
        ]);
    }

    public function test_church_admin_event_page_reports_registration_statuses_and_members(): void
    {
        $admin = $this->admin();
        $registrant = User::factory()->create(['name' => 'Grace Member', 'email' => 'grace@example.com']);
        $event = \App\Models\Event::create([
            'title' => 'Leadership Breakfast',
            'description' => 'A leadership gathering.',
            'event_type' => 'conference',
            'start_date' => '2026-09-20 08:00:00',
            'end_date' => '2026-09-20 10:00:00',
            'registration_deadline' => '2026-09-20 07:00:00',
            'status' => 'upcoming',
        ]);
        \App\Models\EventRegistration::create([
            'event_id' => $event->id,
            'user_id' => $registrant->id,
            'status' => 'confirmed',
            'registered_at' => now(),
        ]);

        $this->actingAs($admin)
            ->get('/church-admin/events')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('events.0.registration_summary.confirmed', 1)
                ->where('events.0.registrants.0.name', 'Grace Member')
                ->where('events.0.registrants.0.email', 'grace@example.com')
            );
    }


    public function test_church_admin_can_record_member_attendance(): void
    {
        $user = $this->admin();
        $profile = $user->memberProfile()->create([
            'first_name' => 'Grace',
            'last_name' => 'Member',
            'phone' => '08031234568',
            'gender' => 'female',
            'membership_status' => 'member',
            'is_active' => true,
        ]);

        $response = $this
            ->actingAs($user)
            ->from('/church-admin/attendance')
            ->post('/church-admin/attendance', [
                'member_profile_id' => $profile->id,
                'service_type' => 'main_service',
                'service_date' => '2026-09-01',
                'status' => 'present',
                'first_timer' => false,
                'notes' => 'Joined the morning worship service.',
            ]);

        $response->assertRedirect('/church-admin/attendance');
        $this->assertDatabaseHas('attendance_records', [
            'member_profile_id' => $profile->id,
            'service_type' => 'main_service',
            'status' => 'present',
        ]);

        $this->actingAs($user)
            ->get('/church-admin/attendance')
            ->assertInertia(fn ($page) => $page
                ->where('attendanceStats.latest_service_date', '2026-09-01')
                ->where('attendanceStats.latest_service_total', 1)
            );
    }

    public function test_church_admin_attendance_rejects_unknown_service_types(): void
    {
        $admin = $this->admin();
        $profile = $admin->memberProfile()->create([
            'first_name' => 'Grace',
            'last_name' => 'Member',
            'membership_status' => 'member',
            'is_active' => true,
        ]);

        $this->actingAs($admin)
            ->from('/church-admin/attendance')
            ->post('/church-admin/attendance', [
                'member_profile_id' => $profile->id,
                'service_type' => 'invented_service',
                'service_date' => '2026-09-06',
                'status' => 'present',
            ])
            ->assertSessionHasErrors('service_type');

        $this->assertDatabaseMissing('attendance_records', [
            'member_profile_id' => $profile->id,
            'service_type' => 'invented_service',
        ]);
    }

    public function test_repeated_attendance_submission_updates_the_existing_service_record(): void
    {
        $admin = $this->admin();
        $profile = $admin->memberProfile()->create([
            'first_name' => 'Grace',
            'last_name' => 'Member',
            'membership_status' => 'member',
            'is_active' => true,
        ]);

        foreach (['present', 'late'] as $status) {
            $this->actingAs($admin)->post('/church-admin/attendance', [
                'member_profile_id' => $profile->id,
                'service_type' => 'main_service',
                'service_date' => '2026-09-06',
                'status' => $status,
            ])->assertRedirect('/church-admin/attendance');
        }

        $this->assertDatabaseCount('attendance_records', 1);
        $this->assertTrue(AttendanceRecord::query()
            ->where('member_profile_id', $profile->id)
            ->where('service_type', 'main_service')
            ->whereDate('service_date', '2026-09-06')
            ->where('status', 'late')
            ->exists());
    }

    public function test_church_admin_service_register_lists_active_members_by_sunday_week(): void
    {
        $admin = $this->admin();
        $member = User::factory()->create(['name' => 'Grace Member']);
        $member->memberProfile()->create([
            'first_name' => 'Grace',
            'last_name' => 'Member',
            'membership_status' => 'member',
            'is_active' => true,
        ]);
        $inactive = User::factory()->create(['name' => 'Inactive Member']);
        $inactive->memberProfile()->create([
            'first_name' => 'Inactive',
            'last_name' => 'Member',
            'membership_status' => 'member',
            'is_active' => false,
        ]);

        $this->actingAs($admin)->post('/church-admin/attendance', [
            'member_profile_id' => $member->memberProfile->id,
            'service_type' => 'main_service',
            'service_date' => '2026-09-06',
            'status' => 'present',
            'first_timer' => false,
        ]);

        $this->actingAs($admin)
            ->get('/church-admin/service-register?month=2026-09')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('monthLabel', 'September 2026')
                ->has('sundays', 4)
                ->has('rows', 1)
                ->where('rows.0.name', 'Grace Member')
                ->where('rows.0.referral_code', $member->referral_code)
                ->where('rows.0.weeks.0.date', '2026-09-06')
                ->where('rows.0.weeks.0.status', 'present')
            );
    }

    public function test_regular_member_cannot_access_service_register(): void
    {
        /** @var User $member */
        $member = User::factory()->create(['email' => 'member@example.com']);

        $this->actingAs($member)
            ->get('/church-admin/service-register')
            ->assertForbidden();
    }

    public function test_service_register_attendance_updates_the_same_member_week(): void
    {
        $admin = $this->admin();
        $member = User::factory()->create();
        $profile = $member->memberProfile()->create([
            'first_name' => 'Amina',
            'last_name' => 'James',
            'membership_status' => 'member',
            'is_active' => true,
        ]);

        foreach (['present', 'late'] as $status) {
            $this->actingAs($admin)
                ->post('/church-admin/service-register/attendance', [
                    'member_profile_id' => $profile->id,
                    'month' => '2026-09',
                    'week' => 1,
                    'status' => $status,
                ])
                ->assertRedirect('/church-admin/service-register?month=2026-09');
        }

        $this->assertDatabaseCount('attendance_records', 1);
        $this->assertTrue(AttendanceRecord::query()
            ->where('member_profile_id', $profile->id)
            ->where('service_type', 'main_service')
            ->whereDate('service_date', '2026-09-06')
            ->where('status', 'late')
            ->exists());
    }

    public function test_service_register_attendance_validates_a_qualifying_invitation(): void
    {
        $admin = $this->admin();
        $invitee = User::factory()->create();
        $profile = $invitee->memberProfile()->create([
            'first_name' => 'Invited',
            'last_name' => 'Member',
            'membership_status' => 'first_timer',
            'is_active' => true,
        ]);
        $invitation = \App\Models\ChurchInvitation::create([
            'inviter_id' => $admin->id,
            'invitee_id' => $invitee->id,
            'referral_code' => $admin->referral_code,
            'registered_at' => now(),
        ]);

        $this->actingAs($admin)->post('/church-admin/service-register/attendance', [
            'member_profile_id' => $profile->id,
            'month' => '2026-09',
            'week' => 1,
            'status' => 'present',
        ])->assertRedirect('/church-admin/service-register?month=2026-09');

        $this->assertNotNull($invitation->fresh()->validated_at);
        $this->assertNotNull($invitation->fresh()->validation_attendance_id);
    }

    public function test_church_admin_can_create_a_new_member_profile(): void
    {
        $user = $this->admin();

        $response = $this
            ->actingAs($user)
            ->from('/church-admin/members')
            ->post('/church-admin/members', [
                'first_name' => 'David',
                'last_name' => 'Afolabi',
                'phone' => '08020000001',
                'gender' => 'male',
                'membership_status' => 'member',
                'department' => 'Youth',
                'unit' => 'Media',
                'is_active' => true,
            ]);

        $response->assertRedirect('/church-admin/members');
        $this->assertDatabaseHas('member_profiles', [
            'first_name' => 'David',
            'last_name' => 'Afolabi',
            'phone' => '08020000001',
            'department' => 'Youth',
        ]);
    }

    public function test_church_member_directory_can_filter_and_search_members(): void
    {
        $user = $this->admin();

        $user->memberProfile()->create([
            'first_name' => 'Alice',
            'last_name' => 'Adebayo',
            'phone' => '08030000001',
            'gender' => 'female',
            'membership_status' => 'member',
            'department' => 'Choir',
            'unit' => 'Worship',
            'is_active' => true,
        ]);

        $user->memberProfile()->create([
            'first_name' => 'Bola',
            'last_name' => 'Okafor',
            'phone' => '08030000002',
            'gender' => 'female',
            'membership_status' => 'member',
            'department' => 'Ushering',
            'unit' => 'Reception',
            'is_active' => false,
        ]);

        $response = $this
            ->actingAs($user)
            ->get('/church-admin/members?search=alice&status=active');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('members.0.first_name', 'Alice')
            ->where('members.0.department', 'Choir')
            ->where('members.0.is_active', true)
        );
    }

    public function test_public_ministry_pages_are_available_and_data_driven(): void
    {
        $ministry = \App\Models\ChurchMinistry::create([
            'name' => 'Youth Ministry',
            'description' => 'Youth discipleship and outreach.',
            'leader_name' => 'Pastor Joy',
            'is_active' => true,
        ]);

        \App\Models\ChurchLeadershipProfile::create([
            'church_ministry_id' => $ministry->id,
            'name' => 'Pastor Samuel',
            'title' => 'Youth Pastor',
            'bio' => 'Leads the youth discipleship and outreach team.',
            'email' => 'samuel@example.com',
            'phone' => '08031234567',
            'is_active' => true,
        ]);

        $listing = $this->get('/ministries');
        $listing->assertOk();
        $listing->assertInertia(fn ($page) => $page
            ->where('ministries.0.name', 'Youth Ministry')
            ->where('ministries.0.is_active', true)
        );

        $detail = $this->get('/ministries/' . $ministry->id);
        $detail->assertOk();
        $detail->assertInertia(fn ($page) => $page
            ->where('ministry.name', 'Youth Ministry')
            ->where('ministry.leader_name', 'Pastor Joy')
            ->where('ministry.leadership_profiles.0.name', 'Pastor Samuel')
        );
    }

    public function test_hardcoded_super_admin_email_has_admin_access(): void
    {
        /** @var User $user */
        $user = User::factory()->create([
            'email' => 'crownpaysme19@gmail.com',
            'name' => 'Crown Admin',
        ]);

        $this->assertTrue($user->hasRole('super_admin'));

        $response = $this
            ->actingAs($user)
            ->get('/church-admin');

        $response->assertOk();
    }

    public function test_regular_authenticated_member_cannot_access_church_admin(): void
    {
        /** @var User $member */
        $member = User::factory()->create([
            'email' => 'member@example.com',
        ]);

        $this->actingAs($member)
            ->get('/church-admin')
            ->assertForbidden();
    }

    public function test_church_admin_dashboard_lists_upcoming_birthdays(): void
    {
        $user = $this->admin();

        $user->memberProfile()->create([
            'first_name' => 'Grace',
            'last_name' => 'Member',
            'phone' => '08031234568',
            'gender' => 'female',
            'date_of_birth' => '1990-09-05',
            'membership_status' => 'member',
            'is_active' => true,
        ]);

        $response = $this
            ->actingAs($user)
            ->get('/church-admin');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('churchData.upcomingBirthdays.0.name', 'Grace Member')
            ->where('churchData.upcomingBirthdays.0.date_of_birth', '1990-09-05')
        );
    }

    public function test_church_admin_can_manage_leadership_ministries_and_reports(): void
    {
        $user = $this->admin();

        $ministryResponse = $this
            ->actingAs($user)
            ->post('/church-admin/ministries', [
                'name' => 'Youth Ministry',
                'description' => 'Youth outreach and discipleship.',
                'leader_name' => 'Pastor Joy',
                'is_active' => true,
            ]);

        $ministryResponse->assertRedirect('/church-admin/ministries');
        $this->assertDatabaseHas('church_ministries', [
            'name' => 'Youth Ministry',
            'leader_name' => 'Pastor Joy',
        ]);

        $leadershipResponse = $this
            ->actingAs($user)
            ->post('/church-admin/leadership', [
                'name' => 'Pastor Samuel',
                'title' => 'Youth Pastor',
                'ministry_id' => 1,
                'bio' => 'Leads the youth discipleship and outreach team.',
                'email' => 'samuel@example.com',
                'phone' => '08031234567',
                'is_active' => true,
            ]);

        $leadershipResponse->assertRedirect('/church-admin/leadership');
        $this->assertDatabaseHas('church_leadership_profiles', [
            'name' => 'Pastor Samuel',
            'title' => 'Youth Pastor',
        ]);

        $reportResponse = $this
            ->actingAs($user)
            ->post('/church-admin/reports', [
                'period_type' => 'weekly',
                'title' => 'Weekly Worship Report',
                'report_date' => '2026-09-01',
                'summary' => 'The young adults ministry recorded a strong turnout.',
                'attendance_count' => 120,
                'first_timers_count' => 16,
                'new_members_count' => 5,
                'prayer_requests_count' => 8,
            ]);

        $reportResponse->assertRedirect('/church-admin/reports');
        $this->assertDatabaseHas('church_reports', [
            'title' => 'Weekly Worship Report',
            'period_type' => 'weekly',
        ]);
    }
}
