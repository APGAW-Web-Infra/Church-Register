<?php

namespace Tests\Feature;

use App\Models\AttendanceRecord;
use App\Models\ChurchMediaContent;
use App\Models\ChurchMinistry;
use App\Models\ChurchContactMessage;
use App\Models\ChurchPrayerRequest;
use App\Models\Event;
use App\Models\EventRegistration;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChurchPublicEngagementFeatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_media_detail_page_reads_church_media_content(): void
    {
        $media = ChurchMediaContent::create([
            'content_type' => 'sermon',
            'title' => 'The Power of Persistent Prayer',
            'speaker_name' => 'Pastor Grace',
            'published_at' => '2026-09-01',
            'video_url' => 'https://example.com/sermon',
            'summary' => 'A powerful sermon on prayer and faith.',
            'scripture_reference' => 'Luke 18:1',
            'featured' => true,
            'status' => 'published',
        ]);

        $response = $this->get('/media/' . $media->id);

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('media.title', 'The Power of Persistent Prayer')
            ->where('media.speaker_name', 'Pastor Grace')
            ->where('media.scripture_reference', 'Luke 18:1')
        );
    }

    public function test_unpublished_media_is_not_available_on_public_detail_pages(): void
    {
        $media = ChurchMediaContent::create([
            'content_type' => 'sermon',
            'title' => 'Unpublished Message',
            'published_at' => '2026-09-01',
            'status' => 'draft',
        ]);

        $this->get('/media/' . $media->id)->assertNotFound();
    }

    public function test_public_media_detail_prefers_published_related_content_and_excludes_drafts(): void
    {
        $media = ChurchMediaContent::create([
            'content_type' => 'sermon',
            'title' => 'Faith for the Journey',
            'published_at' => '2026-09-01',
            'status' => 'published',
        ]);
        $related = ChurchMediaContent::create([
            'content_type' => 'sermon',
            'title' => 'Walking in Hope',
            'published_at' => '2026-09-02',
            'status' => 'published',
        ]);
        ChurchMediaContent::create([
            'content_type' => 'sermon',
            'title' => 'Draft Teaching',
            'published_at' => '2026-09-03',
            'status' => 'draft',
        ]);
        ChurchMediaContent::create([
            'content_type' => 'testimony',
            'title' => 'A Published Testimony',
            'published_at' => '2026-09-04',
            'status' => 'published',
        ]);

        $this->get('/media/' . $media->id)
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('relatedMedia', 1)
                ->where('relatedMedia.0.id', $related->id)
                ->where('relatedMedia.0.title', 'Walking in Hope')
            );
    }

    public function test_public_media_gallery_uses_latest_published_stories_when_no_featured_items_are_marked(): void
    {
        ChurchMediaContent::create([
            'content_type' => 'sermon',
            'title' => 'Earliest Story',
            'published_at' => '2026-09-01',
            'status' => 'published',
            'featured' => false,
        ]);
        ChurchMediaContent::create([
            'content_type' => 'testimony',
            'title' => 'Middle Story',
            'published_at' => '2026-09-05',
            'status' => 'published',
            'featured' => false,
        ]);
        ChurchMediaContent::create([
            'content_type' => 'interview',
            'title' => 'Latest Story',
            'published_at' => '2026-09-08',
            'status' => 'published',
            'featured' => false,
        ]);

        $this->get('/media')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('featuredMedia', 3)
                ->where('featuredMedia.0.title', 'Latest Story')
                ->where('featuredMedia.2.title', 'Earliest Story')
            );
    }

    public function test_public_homepage_uses_live_church_summary_data(): void
    {
        /** @var User $user */
        $user = User::factory()->create();

        AttendanceRecord::create([
            'user_id' => $user->id,
            'member_profile_id' => null,
            'service_type' => 'main_service',
            'service_date' => '2026-09-01',
            'status' => 'present',
            'first_timer' => false,
            'recorded_by' => $user->id,
            'notes' => 'Sunday service attendance',
        ]);

        ChurchPrayerRequest::create([
            'user_id' => $user->id,
            'full_name' => 'Joy Adebayo',
            'email' => 'joy@example.com',
            'request_type' => 'healing',
            'message' => 'Please pray for strength and wisdom in my family.',
            'is_public' => false,
            'status' => 'pending',
        ]);

        ChurchMinistry::create([
            'name' => 'Youth Ministry',
            'description' => 'Youth discipleship and outreach.',
            'leader_name' => 'Pastor Joy',
            'is_active' => true,
        ]);

        Event::create([
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

        $response = $this->get('/');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('churchSummary.attendance_total', 1)
            ->where('churchSummary.prayer_requests', 1)
            ->where('churchSummary.active_ministries', 1)
            ->where('churchSummary.upcoming_events', 1)
        );
    }

    public function test_public_prayer_request_form_can_be_submitted(): void
    {
        /** @var User $user */
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->from('/prayer-requests')
            ->post('/prayer-requests', [
                'full_name' => 'Joy Adebayo',
                'email' => 'joy@example.com',
                'request_type' => 'healing',
                'message' => 'Please pray for strength and wisdom in my family.',
                'is_public' => false,
            ]);

        $response->assertRedirect('/prayer-requests');
        $this->assertDatabaseHas('church_prayer_requests', [
            'full_name' => 'Joy Adebayo',
            'request_type' => 'healing',
        ]);
    }

    public function test_public_prayer_requests_page_is_available_with_flash_data(): void
    {
        $this->withSession(['success' => 'Prayer request received.'])
            ->get('/prayer-requests')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('flash.success', 'Prayer request received.')
            );
    }

    public function test_public_contact_message_can_be_submitted(): void
    {
        $response = $this
            ->from('/send-message')
            ->post('/send-message', [
                'full_name' => 'Grace Member',
                'email' => 'grace@example.com',
                'subject' => 'Ministry enquiry',
                'message' => 'Please share more information about joining a ministry.',
            ]);

        $response->assertRedirect('/send-message');
        $this->assertDatabaseHas('church_contact_messages', [
            'email' => 'grace@example.com',
            'subject' => 'Ministry enquiry',
            'status' => 'open',
        ]);
    }


    public function test_public_events_page_lists_upcoming_church_events(): void
    {
        Event::create([
            'title' => 'Youth Revival Night',
            'description' => 'An evening of worship and spiritual renewal.',
            'event_type' => 'workshop',
            'start_date' => now()->addDays(4),
            'end_date' => now()->addDays(4)->addHours(3),
            'status' => 'upcoming',
            'max_participants' => 200,
            'registration_deadline' => now()->addDays(2),
        ]);

        $response = $this->get('/events');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('events.0.title', 'Youth Revival Night')
            ->where('events.0.status', 'upcoming')
        );
    }

    public function test_public_events_page_hides_past_and_cancelled_events(): void
    {
        Event::create([
            'title' => 'Past Service',
            'description' => 'A past service.',
            'event_type' => 'workshop',
            'start_date' => now()->subDay(),
            'end_date' => now()->subDay()->addHours(2),
            'registration_deadline' => now()->subDays(2),
            'status' => 'upcoming',
        ]);
        Event::create([
            'title' => 'Cancelled Gathering',
            'description' => 'A cancelled gathering.',
            'event_type' => 'workshop',
            'start_date' => now()->addDay(),
            'end_date' => now()->addDay()->addHours(2),
            'registration_deadline' => now()->addHours(12),
            'status' => 'cancelled',
        ]);

        $this->get('/events')
            ->assertInertia(fn ($page) => $page->has('events', 0));
    }

    public function test_contact_page_receives_configured_contact_details(): void
    {
        config()->set('church.contact', [
            'email' => 'office@example.com',
            'phone' => '+2348000000000',
            'office_hours' => 'Tuesday - Saturday, 10:00 AM - 4:00 PM',
        ]);

        $this->get('/contact')
            ->assertInertia(fn ($page) => $page
                ->where('contact.email', 'office@example.com')
                ->where('contact.phone', '+2348000000000')
                ->where('contact.office_hours', 'Tuesday - Saturday, 10:00 AM - 4:00 PM')
            );
    }

    public function test_public_event_detail_page_and_registration_flow_work(): void
    {
        /** @var User $user */
        $user = User::factory()->create();
        $event = Event::create([
            'title' => 'Neighborhood Prayer Gathering',
            'description' => 'A citywide prayer and worship gathering.',
            'event_type' => 'conference',
            'start_date' => now()->addDays(8),
            'end_date' => now()->addDays(8)->addHours(2),
            'location' => 'Faith Centre Hall',
            'max_participants' => 150,
            'registration_deadline' => now()->addDays(6),
            'status' => 'registration_open',
        ]);

        $detailResponse = $this->get('/events/' . $event->id);
        $detailResponse->assertOk();
        $detailResponse->assertInertia(fn ($page) => $page
            ->where('event.title', 'Neighborhood Prayer Gathering')
            ->where('event.location', 'Faith Centre Hall')
        );

        $registerResponse = $this
            ->actingAs($user)
            ->post('/events/' . $event->id . '/register');

        $registerResponse->assertRedirect();
        $this->assertDatabaseHas('event_registrations', [
            'user_id' => $user->id,
            'event_id' => $event->id,
            'status' => 'registered',
        ]);
    }

    public function test_event_registration_rejects_expired_deadline(): void
    {
        /** @var User $user */
        $user = User::factory()->create();
        $event = Event::create([
            'title' => 'Closed Registration Event',
            'description' => 'Registration is closed.',
            'event_type' => 'workshop',
            'start_date' => now()->addDay(),
            'end_date' => now()->addDay()->addHours(2),
            'registration_deadline' => now()->subMinute(),
            'status' => 'registration_open',
        ]);

        $this->actingAs($user)->post('/events/' . $event->id . '/register')
            ->assertRedirect('/events/' . $event->id);

        $this->assertDatabaseMissing('event_registrations', ['event_id' => $event->id, 'user_id' => $user->id]);
    }

    public function test_event_registration_rejects_full_capacity_but_ignores_cancelled_registrations(): void
    {
        /** @var User $existingUser */
        $existingUser = User::factory()->create();
        /** @var User $newUser */
        $newUser = User::factory()->create();
        $event = Event::create([
            'title' => 'Limited Seating Event',
            'description' => 'A limited seating gathering.',
            'event_type' => 'conference',
            'start_date' => now()->addDay(),
            'end_date' => now()->addDay()->addHours(2),
            'registration_deadline' => now()->addHours(12),
            'max_participants' => 1,
            'status' => 'registration_open',
        ]);

        EventRegistration::create(['event_id' => $event->id, 'user_id' => $existingUser->id, 'status' => 'cancelled', 'registered_at' => now()]);

        $this->actingAs($newUser)->post('/events/' . $event->id . '/register')
            ->assertRedirect('/events/' . $event->id);

        $this->assertDatabaseHas('event_registrations', ['event_id' => $event->id, 'user_id' => $newUser->id, 'status' => 'registered']);

        /** @var User $anotherUser */
        $anotherUser = User::factory()->create();
        $this->actingAs($anotherUser)->post('/events/' . $event->id . '/register')
            ->assertRedirect('/events/' . $event->id);

        $this->assertDatabaseMissing('event_registrations', ['event_id' => $event->id, 'user_id' => $anotherUser->id]);
    }

    public function test_event_calendar_download_contains_event_details(): void
    {
        $event = Event::create([
            'title' => 'Worship Night, Main Campus',
            'description' => 'An evening of worship and prayer.',
            'event_type' => 'workshop',
            'start_date' => '2026-09-20 18:00:00',
            'end_date' => '2026-09-20 20:00:00',
            'location' => 'Main sanctuary',
            'registration_deadline' => '2026-09-20 17:00:00',
            'status' => 'upcoming',
        ]);

        $response = $this->get('/events/' . $event->id . '/calendar');

        $response->assertOk();
        $response->assertHeader('Content-Type', 'text/calendar; charset=UTF-8');
        $response->assertHeader('Content-Disposition', 'attachment; filename="event-' . $event->id . '.ics"');
        $response->assertSee('SUMMARY:Worship Night\\, Main Campus');
        $response->assertSee('DTSTART:20260920T180000Z');
        $response->assertSee('DTEND:20260920T200000Z');
    }
}
