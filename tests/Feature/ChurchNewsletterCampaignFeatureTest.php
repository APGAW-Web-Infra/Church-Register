<?php

namespace Tests\Feature;

use App\Jobs\SendChurchNewsletterCampaignEmail;
use App\Mail\ChurchNewsletterCampaignMessage;
use App\Models\ChurchNewsletterCampaign;
use App\Models\ChurchNewsletterCampaignRecipient;
use App\Models\ChurchNewsletterSubscriber;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class ChurchNewsletterCampaignFeatureTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create(['email' => 'crownpaysme19@gmail.com']);
    }

    public function test_admin_can_create_a_newsletter_draft(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin)
            ->post('/church-admin/newsletter-campaigns', [
                'subject' => 'This Sunday at APGA',
                'body' => 'Join us for worship and fellowship this Sunday.',
            ])
            ->assertRedirect('/church-admin/newsletter-campaigns');

        $this->assertDatabaseHas('church_newsletter_campaigns', [
            'subject' => 'This Sunday at APGA',
            'status' => 'draft',
            'created_by' => $admin->id,
        ]);
    }

    public function test_only_active_subscribers_receive_one_delivery_job_each(): void
    {
        Queue::fake();
        $admin = $this->admin();
        $active = ChurchNewsletterSubscriber::create(['email' => 'active@example.com', 'unsubscribe_token' => ChurchNewsletterSubscriber::newUnsubscribeToken(), 'status' => 'active', 'subscribed_at' => now()]);
        ChurchNewsletterSubscriber::create(['email' => 'unsubscribed@example.com', 'unsubscribe_token' => ChurchNewsletterSubscriber::newUnsubscribeToken(), 'status' => 'unsubscribed']);
        $campaign = ChurchNewsletterCampaign::create(['created_by' => $admin->id, 'subject' => 'Prayer update', 'body' => 'A prayer update for the church family.', 'status' => 'draft']);

        $this->actingAs($admin)->post('/church-admin/newsletter-campaigns/' . $campaign->id . '/send')
            ->assertRedirect('/church-admin/newsletter-campaigns');

        $this->assertDatabaseHas('church_newsletter_campaign_recipients', ['campaign_id' => $campaign->id, 'subscriber_id' => $active->id, 'status' => 'pending']);
        $this->assertDatabaseCount('church_newsletter_campaign_recipients', 1);
        Queue::assertPushed(SendChurchNewsletterCampaignEmail::class, 1);

        $this->actingAs($admin)->post('/church-admin/newsletter-campaigns/' . $campaign->id . '/send');
        $this->assertDatabaseCount('church_newsletter_campaign_recipients', 1);
        Queue::assertPushed(SendChurchNewsletterCampaignEmail::class, 1);
    }

    public function test_newsletter_job_sends_mailable_and_completes_campaign(): void
    {
        Mail::fake();
        $admin = $this->admin();
        $subscriber = ChurchNewsletterSubscriber::create(['email' => 'member@example.com', 'unsubscribe_token' => ChurchNewsletterSubscriber::newUnsubscribeToken(), 'status' => 'active', 'subscribed_at' => now()]);
        $campaign = ChurchNewsletterCampaign::create(['created_by' => $admin->id, 'subject' => 'Church family update', 'body' => 'Grace and peace to every member.', 'status' => 'sending', 'total_recipients' => 1]);
        $recipient = ChurchNewsletterCampaignRecipient::create(['campaign_id' => $campaign->id, 'subscriber_id' => $subscriber->id, 'status' => 'pending']);

        (new SendChurchNewsletterCampaignEmail($recipient->id))->handle();

        Mail::assertSent(ChurchNewsletterCampaignMessage::class, function (ChurchNewsletterCampaignMessage $mail) use ($subscriber) {
            return $mail->hasTo($subscriber->email) && str_contains($mail->content()->view, 'emails.church-newsletter');
        });
        $this->assertDatabaseHas('church_newsletter_campaign_recipients', ['id' => $recipient->id, 'status' => 'sent']);
        $this->assertDatabaseHas('church_newsletter_campaigns', ['id' => $campaign->id, 'status' => 'sent', 'sent_count' => 1]);
    }

    public function test_newsletter_controller_requires_admin_role_for_direct_access(): void
    {
        $member = User::factory()->create(['email' => 'member@example.com']);

        $request = \Illuminate\Http\Request::create('/church-admin/newsletter-campaigns', 'GET');
        $request->setUserResolver(fn () => $member);

        try {
            app(\App\Http\Controllers\NewsletterCampaignController::class)->index();
            $this->fail('Expected newsletter campaign access to be denied for non-admins.');
        } catch (\Symfony\Component\HttpKernel\Exception\HttpException $exception) {
            $this->assertSame(403, $exception->getStatusCode());
        }
    }

    public function test_non_admin_cannot_access_campaign_management(): void
    {
        /** @var User $member */
        $member = User::factory()->create();

        $this->actingAs($member)->get('/church-admin/newsletter-campaigns')->assertForbidden();
    }
}
