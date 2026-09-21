<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AttendanceRecord;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;

class AttendanceApiController extends Controller
{
    public function stats(): JsonResponse
    {
        $countUnique = function ($query) {
            $records = $query->whereIn('status', ['present', 'late'])->get();
            $memberIds = $records->pluck('member_profile_id')->filter()->unique()->count();

            return $memberIds > 0
                ? $memberIds
                : $records->pluck('user_id')->filter()->unique()->count();
        };

        $qualifying = AttendanceRecord::query();

        return response()->json([
            'data' => [
                'total' => $countUnique((clone $qualifying)),
                'present' => $countUnique((clone $qualifying)->where('status', 'present')),
                'late' => $countUnique((clone $qualifying)->where('status', 'late')),
                'first_timers' => $countUnique((clone $qualifying)->where('first_timer', true)),
                'by_service' => [
                    'main_service' => $countUnique((clone $qualifying)->where('service_type', 'main_service')),
                    'sunday_school' => $countUnique((clone $qualifying)->where('service_type', 'sunday_school')),
                    'workers_meeting' => $countUnique((clone $qualifying)->where('service_type', 'workers_meeting')),
                    'prayer_meeting' => $countUnique((clone $qualifying)->where('service_type', 'prayer_meeting')),
                ],
            ],
        ]);
    }

    public function trends(): JsonResponse
    {
        $start = now()->startOfWeek()->subWeeks(7);
        $records = AttendanceRecord::query()
            ->whereIn('status', ['present', 'late'])
            ->whereDate('service_date', '>=', $start->toDateString())
            ->whereDate('service_date', '<=', now()->endOfWeek()->toDateString())
            ->get()
            ->groupBy(fn (AttendanceRecord $record) => $record->service_date->copy()->startOfWeek()->toDateString());

        $weeks = collect(range(0, 7))->map(function (int $offset) use ($start, $records): array {
            $week = $start->copy()->addWeeks($offset);
            $weekRecords = $records->get($week->toDateString(), collect());

            return [
                'week_start' => $week->toDateString(),
                'label' => $week->format('M j'),
                'total' => $weekRecords->count(),
                'present' => $weekRecords->where('status', 'present')->count(),
                'late' => $weekRecords->where('status', 'late')->count(),
            ];
        })->values();

        return response()->json(['data' => $weeks]);
    }

    public function report(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'from' => ['nullable', 'date_format:Y-m-d'],
            'to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:from'],
            'service_type' => ['nullable', 'in:main_service,sunday_school,workers_meeting,prayer_meeting'],
            'status' => ['nullable', 'in:present,late,absent,excused'],
        ]);

        $query = AttendanceRecord::query()
            ->with(['memberProfile', 'user'])
            ->orderByDesc('service_date')
            ->orderByDesc('id');

        if (!empty($validated['from'])) {
            $query->whereDate('service_date', '>=', $validated['from']);
        }

        if (!empty($validated['to'])) {
            $query->whereDate('service_date', '<=', $validated['to']);
        }

        if (!empty($validated['service_type'])) {
            $query->where('service_type', $validated['service_type']);
        }

        if (!empty($validated['status'])) {
            $query->where('status', $validated['status']);
        }

        $records = $query->get();
        $qualifying = $records->whereIn('status', ['present', 'late']);

        return response()->json([
            'data' => $records->map(fn (AttendanceRecord $record) => [
                'id' => $record->id,
                'member' => $record->memberProfile
                    ? trim(($record->memberProfile->first_name ?? '') . ' ' . ($record->memberProfile->last_name ?? ''))
                    : ($record->user?->name ?? 'Unknown member'),
                'service_type' => $record->service_type,
                'service_date' => $record->service_date->format('Y-m-d'),
                'status' => $record->status,
                'first_timer' => (bool) $record->first_timer,
            ])->values(),
            'meta' => [
                'total_records' => $records->count(),
                'qualifying_records' => $qualifying->count(),
                'first_timers' => $qualifying->where('first_timer', true)->count(),
                'filters' => $validated,
            ],
        ]);
    }
}
