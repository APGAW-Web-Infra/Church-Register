<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Cache;

class LectureProgress extends Model
{
    protected $table = 'lecture_progress';

    protected $fillable = [
        'user_id',
        'course_lecture_id',
        'is_completed',
        'progress_percentage',
        'completed_at',
        'time_spent_seconds',
        'last_position_seconds'
    ];

    protected $casts = [
        'is_completed' => 'boolean',
        'progress_percentage' => 'integer',
        'time_spent_seconds' => 'integer',
        'last_position_seconds' => 'integer',
        'completed_at' => 'datetime'
    ];

    /**
     * Relationship: Progress belongs to a user
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relationship: Progress belongs to a lecture
     */
    public function lecture(): BelongsTo
    {
        return $this->belongsTo(CourseLecture::class, 'course_lecture_id');
    }

    /**
     * Mark lecture as completed
     */
    public function markAsCompleted(): void
    {
        $this->update([
            'is_completed' => true,
            'progress_percentage' => 100,
            'completed_at' => now()
        ]);
    }

    /**
     * Update progress percentage
     */
    public function updateProgress(int $percentage): void
    {
        $this->update([
            'progress_percentage' => min(100, max(0, $percentage)),
            'is_completed' => $percentage >= 100,
            'completed_at' => $percentage >= 100 ? now() : null
        ]);
    }

    /**
     * Scope: Get completed progress records
     */
    public function scopeCompleted(Builder $query): Builder
    {
        return $query->where('is_completed', true);
    }

    /**
     * Scope: Get progress for a specific user
     */
    public function scopeForUser(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    protected static function booted()
    {
        static::saved(function ($model) {
            self::clearLearningActivityCacheForUser($model->user_id);
        });

        static::deleted(function ($model) {
            self::clearLearningActivityCacheForUser($model->user_id);
        });
    }

    public static function clearLearningActivityCacheForUser(int $userId)
    {
        // Known ranges we cache: 7,14,30,90,365
        $ranges = [7, 14, 30, 90, 365];
        foreach ($ranges as $r) {
            try {
                Cache::forget("learning_activity:{$userId}:{$r}");
            } catch (\Exception $e) {
                // ignore cache driver errors
            }
        }
    }
}
