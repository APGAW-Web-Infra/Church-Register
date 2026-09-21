<?php

require __DIR__ . '/vendor/autoload.php';

$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\DirectMessage;
use App\Models\User;

$member = User::factory()->create();
$oldPeer = User::factory()->create(['name' => 'Older Contact']);
$newPeer = User::factory()->create(['name' => 'Newest Contact']);

DirectMessage::create([
    'sender_id' => $oldPeer->id,
    'recipient_id' => $member->id,
    'body' => 'Older message',
    'created_at' => now()->subDays(3),
]);

DirectMessage::create([
    'sender_id' => $newPeer->id,
    'recipient_id' => $member->id,
    'body' => 'Newest message',
    'created_at' => now()->subMinutes(5),
]);

$messages = DirectMessage::query()
    ->where('sender_id', $member->id)
    ->orWhere('recipient_id', $member->id)
    ->with(['sender:id,name', 'recipient:id,name'])
    ->latest()
    ->get();

$threads = $messages
    ->groupBy(fn (DirectMessage $message) => $message->sender_id === $member->id ? $message->recipient_id : $message->sender_id)
    ->map(function ($thread) use ($member) {
        $latest = $thread->sortByDesc('created_at')->first();
        $peer = $latest->sender_id === $member->id ? $latest->recipient : $latest->sender;

        return [
            'peer' => ['id' => $peer->id, 'name' => $peer->name],
            'latest_message' => ['body' => $latest->body, 'created_at' => $latest->created_at],
            'sort_stamp' => $latest->created_at?->getTimestamp() ?? strtotime((string) $latest->created_at),
            'unread_count' => $thread->where('recipient_id', $member->id)->whereNull('read_at')->count(),
        ];
    })
    ->sortByDesc('sort_stamp')
    ->map(function ($thread) {
        unset($thread['sort_stamp']);
        return $thread;
    })
    ->values();

var_dump($threads->toArray());
