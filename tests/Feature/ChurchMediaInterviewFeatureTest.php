<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChurchMediaInterviewFeatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_record_interview_and_media_content(): void
    {
        /** @var User $user */
        $user = User::factory()->create([
            'email' => 'crownpaysme19@gmail.com',
        ]);

        $this->actingAs($user)
            ->post('/church-admin/media', [
                'content_type' => 'interview',
                'title' => 'Pastor Interview: Discipleship and Prayer',
                'speaker_name' => 'Pastor A. Johnson',
                'published_at' => '2026-09-01',
                'video_url' => 'https://example.com/video',
                'summary' => 'A powerful teaching on prayer and discipleship.',
                'scripture_reference' => 'Matthew 28:19-20',
                'featured' => true,
                'status' => 'published',
            ])
            ->assertRedirect('/church-admin/media');

        $this->assertDatabaseHas('church_media_content', [
            'content_type' => 'interview',
            'title' => 'Pastor Interview: Discipleship and Prayer',
            'speaker_name' => 'Pastor A. Johnson',
            'scripture_reference' => 'Matthew 28:19-20',
            'status' => 'published',
        ]);
    }
}
