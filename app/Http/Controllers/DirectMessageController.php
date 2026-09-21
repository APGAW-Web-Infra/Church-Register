<?php

namespace App\Http\Controllers;

use App\Models\DirectMessage;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DirectMessageController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $messages = DirectMessage::query()
            ->where('sender_id', $user->id)
            ->orWhere('recipient_id', $user->id)
            ->with(['sender:id,name', 'recipient:id,name'])
            ->latest()
            ->get();

        $threads = $messages
            ->groupBy(fn (DirectMessage $message) => $message->sender_id === $user->id ? $message->recipient_id : $message->sender_id)
            ->map(function ($thread) use ($user) {
                $latest = $thread->sortByDesc('created_at')->first();
                $peer = $latest->sender_id === $user->id ? $latest->recipient : $latest->sender;

                return [
                    'peer' => ['id' => $peer->id, 'name' => $peer->name],
                    'latest_message' => ['body' => $latest->body, 'created_at' => $latest->created_at],
                    'sort_stamp' => $latest->created_at?->getTimestamp() ?? strtotime((string) $latest->created_at),
                    'unread_count' => $thread->where('recipient_id', $user->id)->whereNull('read_at')->count(),
                ];
            })
            ->sortByDesc('sort_stamp')
            ->map(function ($thread) {
                unset($thread['sort_stamp']);
                return $thread;
            })
            ->values();

        $search = trim((string) $request->query('search', ''));
        $searchResults = $search === '' ? collect() : User::query()
            ->whereKeyNot($user->id)
            ->where('name', 'like', '%' . $search . '%')
            ->orderBy('name')
            ->limit(10)
            ->get(['id', 'name']);

        return Inertia::render('Member/DirectMessages', [
            'threads' => $threads,
            'search' => $search,
            'searchResults' => $searchResults,
            'activeUser' => null,
            'messages' => [],
        ]);
    }

    public function show(Request $request, User $user)
    {
        abort_if($request->user()->is($user), 404);
        $authUser = $request->user();

        $messages = DirectMessage::query()
            ->where(function ($query) use ($authUser, $user) {
                $query->where('sender_id', $authUser->id)->where('recipient_id', $user->id);
            })
            ->orWhere(function ($query) use ($authUser, $user) {
                $query->where('sender_id', $user->id)->where('recipient_id', $authUser->id);
            })
            ->with(['sender:id,name', 'recipient:id,name'])
            ->oldest('created_at')
            ->oldest('id')
            ->get();

        DirectMessage::query()
            ->where('sender_id', $user->id)
            ->where('recipient_id', $authUser->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return Inertia::render('Member/DirectMessages', [
            'threads' => [],
            'search' => '',
            'searchResults' => [],
            'activeUser' => ['id' => $user->id, 'name' => $user->name],
            'messages' => $messages->map(fn (DirectMessage $message) => [
                'id' => $message->id,
                'sender_id' => $message->sender_id,
                'body' => $message->body,
                'created_at' => $message->created_at,
                'read_at' => $message->read_at,
            ]),
        ]);
    }

    public function store(Request $request, User $user)
    {
        abort_if($request->user()->is($user), 404);
        $validated = $request->validate([
            'body' => ['required', 'string', 'min:1', 'max:5000'],
        ]);

        DirectMessage::create([
            'sender_id' => $request->user()->id,
            'recipient_id' => $user->id,
            'body' => $validated['body'],
        ]);

        return redirect()->route('member.direct-messages.show', $user);
    }
}
