<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CourseSection extends Model
{
    protected $fillable = [
        'course_id',
        'title',
        'description',
        'order'
    ];

    protected $casts = [
        'order' => 'integer'
    ];

    /**
     * Relationship: Section belongs to a course
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Relationship: Section has many lectures
     */
    public function lectures(): HasMany
    {
        return $this->hasMany(CourseLecture::class)->orderBy('order');
    }

    /**
     * Get total duration of all lectures in this section
     */
    public function getTotalDurationAttribute(): int
    {
        return $this->lectures()->sum('duration_minutes');
    }

    /**
     * Get count of lectures in this section
     */
    public function getLectureCountAttribute(): int
    {
        return $this->lectures()->count();
    }

    /**
     * Get completed lectures count for a user
     */
    public function getCompletedLecturesCount(int $userId): int
    {
        return $this->lectures()
            ->whereHas('progress', function($query) use ($userId) {
                $query->where('user_id', $userId)
                      ->where('is_completed', true);
            })
            ->count();
    }

    /**
     * Check if section is completed by user
     */
    public function isCompletedBy(int $userId): bool
    {
        $totalLectures = $this->lectures()->count();
        $completedLectures = $this->getCompletedLecturesCount($userId);

        return $totalLectures > 0 && $totalLectures === $completedLectures;
    }

    /**
     * Scope: Order sections by order field
     */
    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('order');
    }
}
