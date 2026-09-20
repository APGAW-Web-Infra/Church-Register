<?php

namespace Tests\Feature;

use App\Models\AttendanceRecord;
use App\Models\ChurchInvitation;
use App\Models\MemberProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class ChurchInvitationReferralFeatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_users_receive_unique_referral_codes_and_dashboard_link(): void
    {
        /** @var User $first */
        $first = User::factory()->create();
        /** @var User $second */
        $second = User::factory()->create();

        $this->assertNotEmpty($first->referral_code);
        $this->assertNotSame($first->referral_code, $second->referral_code);

        $this->actingAs($first)
            ->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('user.referral.code', $first->referral_code)
                ->where('user.referral.pending', 0)
                ->where('user.referral.validated', 0)
            );
    }

    public function test_registration_through_referral_link_creates_pending_invitation(): void
    {
        $inviter = User::factory()->create();

        $this->get('/register?ref=' . $inviter->referral_code)
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('referralCode', $inviter->referral_code));

        $this->post('/register', [
            'name' => 'New Member',
            'email' => 'new-member@example.com',
            'membership_status' => '2',
            'gender' => '1',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'referral_code' => $inviter->referral_code,
            'profile_photo' => UploadedFile::fake()->image('new-member.jpg'),
        ])->assertRedirect('/dashboard');

        $invitee = User::query()->where('email', 'new-member@example.com')->firstOrFail();
        $this->assertDatabaseHas('church_invitations', [
            'inviter_id' => $inviter->id,
            'invitee_id' => $invitee->id,
            'validated_at' => null,
        ]);
    }

    public function test_registration_without_referral_code_is_allowed(): void
    {
        $this->post('/register', [
            'name' => 'Unreferred Member',
            'email' => 'unreferred-member@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ])->assertRedirect('/dashboard');

        $this->assertDatabaseHas('users', ['email' => 'unreferred-member@example.com']);
        $this->assertDatabaseCount('church_invitations', 0);
    }

    public function test_member_can_set_and_change_referrer_from_profile(): void
    {
        $firstInviter = User::factory()->create(['name' => 'First Inviter']);
        $secondInviter = User::factory()->create(['name' => 'Second Inviter']);
        /** @var User $member */
        $member = User::factory()->create(['name' => 'Referred Member']);

        $this->actingAs($member)
            ->patch('/profile', [
                'name' => $member->name,
                'email' => $member->email,
                'referral_code' => $firstInviter->referral_code,
            ])
            ->assertRedirect('/profile');

        $this->assertDatabaseHas('church_invitations', [
            'inviter_id' => $firstInviter->id,
            'invitee_id' => $member->id,
            'referral_code' => $firstInviter->referral_code,
        ]);
        $this->assertSame(1, $firstInviter->sentChurchInvitations()->count());

        $this->actingAs($member)
            ->patch('/profile', [
                'name' => $member->name,
                'email' => $member->email,
                'referral_code' => $secondInviter->referral_code,
            ])
            ->assertRedirect('/profile');

        $this->assertDatabaseMissing('church_invitations', [
            'inviter_id' => $firstInviter->id,
            'invitee_id' => $member->id,
        ]);
        $this->assertDatabaseHas('church_invitations', [
            'inviter_id' => $secondInviter->id,
            'invitee_id' => $member->id,
        ]);
        $this->assertSame(0, $firstInviter->sentChurchInvitations()->count());
        $this->assertSame(1, $secondInviter->sentChurchInvitations()->count());
    }

    public function test_registration_alone_does_not_validate_invitation_and_only_sunday_attendance_does(): void
    {
        /** @var User $admin */
        $admin = User::factory()->create(['email' => 'crownpaysme19@gmail.com']);
        /** @var User $invitee */
        $invitee = User::factory()->create();
        $invitee->memberProfile()->create([
            'first_name' => 'Invited',
            'last_name' => 'Member',
            'membership_status' => 'first_timer',
            'is_active' => true,
        ]);
        $invitation = ChurchInvitation::create([
            'inviter_id' => $admin->id,
            'invitee_id' => $invitee->id,
            'referral_code' => $admin->referral_code,
            'registered_at' => now(),
        ]);

        $this->actingAs($admin)->post('/church-admin/attendance', [
            'member_profile_id' => $invitee->memberProfile->id,
            'service_type' => 'main_service',
            'service_date' => '2026-09-05',
            'status' => 'present',
            'first_timer' => true,
        ]);
        $this->assertNull($invitation->fresh()->validated_at);

        $this->actingAs($admin)->post('/church-admin/attendance', [
            'member_profile_id' => $invitee->memberProfile->id,
            'service_type' => 'main_service',
            'service_date' => '2026-09-06',
            'status' => 'absent',
            'first_timer' => true,
        ]);
        $this->assertNull($invitation->fresh()->validated_at);

        $this->actingAs($admin)->post('/church-admin/attendance', [
            'member_profile_id' => $invitee->memberProfile->id,
            'service_type' => 'main_service',
            'service_date' => '2026-09-06',
            'status' => 'present',
            'first_timer' => true,
        ])->assertRedirect('/church-admin/service-register?month=2026-09&service_type=main_service');

        $this->assertNotNull($invitation->fresh()->validated_at);
        $this->assertSame(1, $admin->sentChurchInvitations()->whereNotNull('validated_at')->count());
    }

    public function test_invalid_referral_code_is_rejected(): void
    {
        $this->from('/register')->post('/register', [
            'name' => 'Invalid Referral',
            'email' => 'invalid-referral@example.com',
            'membership_status' => '2',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'referral_code' => 'NOTREAL99',
        ])->assertSessionHasErrors('referral_code');

        $this->assertDatabaseMissing('users', ['email' => 'invalid-referral@example.com']);
    }

    public function test_invitation_league_uses_validated_records_only(): void
    {
        $inviter = User::factory()->create(['name' => 'League Member']);
        $pendingInvitee = User::factory()->create();
        $validatedInvitee = User::factory()->create();

        ChurchInvitation::create([
            'inviter_id' => $inviter->id,
            'invitee_id' => $pendingInvitee->id,
            'referral_code' => $inviter->referral_code,
            'registered_at' => now(),
        ]);
        ChurchInvitation::create([
            'inviter_id' => $inviter->id,
            'invitee_id' => $validatedInvitee->id,
            'referral_code' => $inviter->referral_code,
            'registered_at' => now(),
            'validated_at' => now(),
        ]);

        /** @var User $admin */
        $admin = User::factory()->create(['email' => 'crownpaysme19@gmail.com']);

        $this->actingAs($admin)
            ->get('/church-admin/scorecards')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('validatedInvitationCounts.0.inviter.name', 'League Member')
                ->where('validatedInvitationCounts.0.validated_count', 1)
            );
    }

    public function test_admin_invitation_api_returns_stats_and_validated_leaderboard(): void
    {
        /** @var User $inviter */
        $inviter = User::factory()->create(['name' => 'League Member']);
        $secondInviter = User::factory()->create(['name' => 'Second Member']);
        $inviteeOne = User::factory()->create();
        $inviteeTwo = User::factory()->create();
        $inviteeThree = User::factory()->create();

        ChurchInvitation::create([
            'inviter_id' => $inviter->id,
            'invitee_id' => $inviteeOne->id,
            'referral_code' => $inviter->referral_code,
            'registered_at' => '2026-09-01 10:00:00',
            'validated_at' => '2026-09-06 10:00:00',
        ]);
        ChurchInvitation::create([
            'inviter_id' => $inviter->id,
            'invitee_id' => $inviteeTwo->id,
            'referral_code' => $inviter->referral_code,
            'registered_at' => '2026-09-02 10:00:00',
            'validated_at' => '2026-09-07 10:00:00',
        ]);
        ChurchInvitation::create([
            'inviter_id' => $secondInviter->id,
            'invitee_id' => $inviteeThree->id,
            'referral_code' => $secondInviter->referral_code,
            'registered_at' => '2026-09-03 10:00:00',
        ]);

        /** @var User $admin */
        $admin = User::factory()->create(['email' => 'crownpaysme19@gmail.com']);

        $this->actingAs($admin)
            ->getJson('/api/invitations/stats?from=2026-09-01&to=2026-09-03')
            ->assertOk()
            ->assertJsonPath('data.total', 3)
            ->assertJsonPath('data.pending', 1)
            ->assertJsonPath('data.validated', 2)
            ->assertJsonPath('data.validation_rate', 67);

        $this->actingAs($admin)
            ->getJson('/api/invitations/leaderboard?from=2026-09-06&to=2026-09-07')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.rank', 1)
            ->assertJsonPath('data.0.name', 'League Member')
            ->assertJsonPath('data.0.validated_count', 2);
    }

    public function test_regular_member_cannot_access_invitation_api(): void
    {
        /** @var User $member */
        $member = User::factory()->create(['email' => 'invitation-api-member@example.com']);

        $this->actingAs($member)
            ->getJson('/api/invitations/stats')
            ->assertForbidden();
    }
}
