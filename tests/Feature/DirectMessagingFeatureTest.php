<?php

namespace Tests\Feature;

use App\Models\DirectMessage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DirectMessagingFeatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_from_direct_messages(): void
    {
        $this->get('/messages')->assertRedirect('/login');
    }

    public function test_member_can_search_other_members_without_private_fields(): void
    {
        /** @var User $member */
        $member = User::factory()->create(['name' => 'Current Member']);
        User::factory()->create(['name' => 'Grace Member', 'email' => 'grace@example.com']);

        $this->actingAs($member)
            ->get('/messages?search=Grace')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('searchResults', 1)
                ->where('searchResults.0.name', 'Grace Member')
                ->missing('searchResults.0.email')
            );
    }

    public function test_member_can_send_a_direct_message(): void
    {
        /** @var User $sender */
        $sender = User::factory()->create();
        /** @var User $recipient */
        $recipient = User::factory()->create();

        $this->actingAs($sender)
            ->post('/messages/' . $recipient->id, ['body' => 'Hello, can we speak after service?'])
            ->assertRedirect('/messages/' . $recipient->id);

        $this->assertDatabaseHas('direct_messages', [
            'sender_id' => $sender->id,
            'recipient_id' => $recipient->id,
            'body' => 'Hello, can we speak after service?',
        ]);
    }

    public function test_member_cannot_message_themselves(): void
    {
        /** @var User $member */
        $member = User::factory()->create();

        $this->actingAs($member)
            ->post('/messages/' . $member->id, ['body' => 'This should fail.'])
            ->assertNotFound();

        $this->assertDatabaseCount('direct_messages', 0);
    }

    public function test_thread_is_private_and_opening_it_marks_received_messages_read(): void
    {
        /** @var User $member */
        $member = User::factory()->create();
        /** @var User $peer */
        $peer = User::factory()->create();
        /** @var User $outsider */
        $outsider = User::factory()->create();
        DirectMessage::create(['sender_id' => $peer->id, 'recipient_id' => $member->id, 'body' => 'Private hello']);
        $outgoing = DirectMessage::create(['sender_id' => $member->id, 'recipient_id' => $peer->id, 'body' => 'Private reply']);
        DirectMessage::create(['sender_id' => $outsider->id, 'recipient_id' => $peer->id, 'body' => 'Other conversation']);

        $this->actingAs($member)
            ->get('/messages/' . $peer->id)
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('messages', 2)
                ->where('messages.0.body', 'Private hello')
            );

        $this->assertNotNull(DirectMessage::where('sender_id', $peer->id)->where('recipient_id', $member->id)->first()->fresh()->read_at);
        $this->assertNull($outgoing->fresh()->read_at);
        $this->assertDatabaseHas('direct_messages', ['body' => 'Other conversation']);
    }

    public function test_inbox_orders_threads_by_latest_message_and_reports_unread_counts(): void
    {
        /** @var User $member */
        $member = User::factory()->create();
        /** @var User $oldPeer */
        $oldPeer = User::factory()->create(['name' => 'Older Contact']);
        /** @var User $newPeer */
        $newPeer = User::factory()->create(['name' => 'Newest Contact']);

        DirectMessage::create(['sender_id' => $oldPeer->id, 'recipient_id' => $member->id, 'body' => 'Older message', 'created_at' => now()->subDays(3)]);
        DirectMessage::create(['sender_id' => $newPeer->id, 'recipient_id' => $member->id, 'body' => 'Newest message', 'created_at' => now()->subMinutes(5)]);

        $this->actingAs($member)
            ->get('/messages')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('threads', 2)
                ->where('threads.0.peer.name', 'Newest Contact')
                ->where('threads.0.unread_count', 1)
                ->where('threads.1.peer.name', 'Older Contact')
            );
    }

    public function test_inbox_groups_threads_and_reports_unread_counts(): void
    {
        /** @var User $member */
        $member = User::factory()->create();
        /** @var User $peer */
        $peer = User::factory()->create(['name' => 'Grace Member']);
        DirectMessage::create(['sender_id' => $peer->id, 'recipient_id' => $member->id, 'body' => 'Unread message']);

        $this->actingAs($member)
            ->get('/messages')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('threads', 1)
                ->where('threads.0.peer.name', 'Grace Member')
                ->where('threads.0.unread_count', 1)
            );
    }
}
