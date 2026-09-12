<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChurchOperationsExpansionTest extends TestCase
{
    use RefreshDatabase;

    public function test_service_register_generates_absentees_automatically_for_unmarked_members(): void
    {
        $user = User::factory()->create([
            'email' => 'crownpaysme19@gmail.com',
        ]);

        $presentMember = \App\Models\MemberProfile::create([
            'user_id' => $user->id,
            'first_name' => 'Grace',
            'last_name' => 'James',
            'membership_status' => 'member',
            'is_active' => true,
        ]);

        $absentMember = \App\Models\MemberProfile::create([
            'user_id' => $user->id,
            'first_name' => 'John',
            'last_name' => 'Smith',
            'membership_status' => 'member',
            'is_active' => true,
        ]);

        $this->actingAs($user)
            ->post('/church-admin/service-register/attendance', [
                'member_profile_id' => $presentMember->id,
                'month' => '2026-09',
                'week' => 1,
                'status' => 'present',
            ])
            ->assertRedirect('/church-admin/service-register?month=2026-09');

        $this->assertDatabaseHas('attendance_records', [
            'member_profile_id' => $presentMember->id,
            'service_type' => 'main_service',
            'status' => 'present',
        ]);

        $this->assertDatabaseHas('attendance_records', [
            'member_profile_id' => $absentMember->id,
            'service_type' => 'main_service',
            'status' => 'absent',
        ]);

        $this->assertDatabaseHas('church_absentees', [
            'member_name' => 'John Smith',
            'service_type' => 'main_service',
            'status' => 'absent',
        ]);

        $this->actingAs($user)
            ->post('/church-admin/workers-meetings', [
                'topic' => 'Youth volunteer planning',
                'meeting_date' => '2026-09-03',
                'leader_name' => 'Pastor Johnson',
                'summary' => 'Volunteers finalized the prep schedule.',
                'status' => 'scheduled',
            ])
            ->assertRedirect('/church-admin/workers-meetings');

        $this->assertDatabaseHas('church_workers_meetings', [
            'topic' => 'Youth volunteer planning',
            'leader_name' => 'Pastor Johnson',
            'status' => 'scheduled',
        ]);
    }
}
