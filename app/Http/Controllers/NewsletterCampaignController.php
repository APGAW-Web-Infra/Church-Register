<?php

namespace App\Http\Controllers;

use App\Jobs\SendChurchNewsletterCampaignEmail;
use App\Models\ChurchNewsletterCampaign;
use App\Models\ChurchNewsletterCampaignRecipient;
use App\Models\ChurchNewsletterSubscriber;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class NewsletterCampaignController extends Controller
{
    public function index()
    {
    $this->authorizeAdmin();

        return Inertia::render('Church/NewsletterCampaignsBoard', [
            'campaigns' => ChurchNewsletterCampaign::query()
                ->withCount([
                    'recipients as pending_count' => fn ($query) => $query->where('status', 'pending'),
                    'recipients as sent_count_current' => fn ($query) => $query->where('status', 'sent'),
                    'recipients as failed_count_current' => fn ($query) => $query->where('status', 'failed'),
                ])
                ->latest()
                ->get(),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'subject' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string', 'max:10000'],
            'scheduled_at' => ['nullable', 'date'],
        ]);

        ChurchNewsletterCampaign::create([
            ...$validated,
            'created_by' => $request->user()->id,
            'status' => 'draft',
        ]);

        return redirect()->route('church-admin.newsletter-campaigns')->with('success', 'Newsletter draft saved.');
    }

    public function send(ChurchNewsletterCampaign $campaign)
    {
        $this->authorizeAdmin(request());

        abort_unless($campaign->status === 'draft', 422, 'Only draft campaigns can be sent.');

        DB::transaction(function () use ($campaign) {
            $subscriberIds = ChurchNewsletterSubscriber::query()
                ->where('status', 'active')
                ->pluck('id');

            foreach ($subscriberIds as $subscriberId) {
                ChurchNewsletterCampaignRecipient::firstOrCreate([
                    'campaign_id' => $campaign->id,
                    'subscriber_id' => $subscriberId,
                ], ['status' => 'pending']);
            }

            $campaign->update([
                'status' => $subscriberIds->isEmpty() ? 'sent' : 'sending',
                'total_recipients' => $subscriberIds->count(),
                'sent_at' => $subscriberIds->isEmpty() ? now() : null,
            ]);
        });

        $recipientIds = $campaign->recipients()->where('status', 'pending')->pluck('id');
        foreach ($recipientIds as $recipientId) {
            SendChurchNewsletterCampaignEmail::dispatch($recipientId);
        }

        return redirect()->route('church-admin.newsletter-campaigns')->with('success', 'Newsletter campaign queued for delivery.');
    }

    private function authorizeAdmin(?Request $request = null): void
    {
        $user = ($request ?? request())->user();

        abort_unless($user && $user->hasRole(['super_admin', 'admin']), 403, 'Unauthorized access to newsletter campaigns.');
    }
}
