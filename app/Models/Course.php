<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;
use Carbon\Carbon;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'short_description',
        'course_category_id',
        'skill_type_id',
        'instructor_id',
        'created_by',
        'duration_hours',
        'duration_minutes',
        'difficulty_level',
        'price',
        'discount_price',
        'prerequisites',
        'learning_objectives',
        'curriculum',
        'skills_gained',
        'tools_software',
        'thumbnail',
        'video_preview',
        'course_materials',
        'offers_certificate',
        'certificate_template',
        'certificate_criteria',
        'max_students',
        'enrolled_count',
        'rating',
        'reviews_count',
        'completion_rate',
        'is_active',
        'is_featured',
        'is_premium',
        'status',
        'published_at',
        'enrollment_starts_at',
        'enrollment_ends_at',
        'course_starts_at',
        'course_ends_at',
        'meta_title',
        'meta_description',
        'tags'
    ];

    protected $casts = [
        'prerequisites' => 'array',
        'learning_objectives' => 'array',
        'curriculum' => 'array',
        'skills_gained' => 'array',
        'tools_software' => 'array',
        'course_materials' => 'array',
        'certificate_criteria' => 'array',
        'tags' => 'array',
        'offers_certificate' => 'boolean',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'is_premium' => 'boolean',
        'duration_hours' => 'integer',
        'duration_minutes' => 'integer',
        'enrolled_count' => 'integer',
        'reviews_count' => 'integer',
        'completion_rate' => 'integer',
        'max_students' => 'integer',
        'price' => 'decimal:2',
        'discount_price' => 'decimal:2',
        'rating' => 'decimal:2',
        'published_at' => 'datetime',
        'enrollment_starts_at' => 'datetime',
        'enrollment_ends_at' => 'datetime',
        'course_starts_at' => 'datetime',
        'course_ends_at' => 'datetime'
    ];

    // Constants
    const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'];
    const STATUSES = ['draft', 'published', 'archived'];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($course) {
            if (empty($course->slug)) {
                $course->slug = Str::slug($course->title);
            }
        });
    }

    // Relationships
    public function courseCategory(): BelongsTo
    {
        return $this->belongsTo(CourseCategory::class);
    }

    public function skillType(): BelongsTo
    {
        return $this->belongsTo(SkillType::class);
    }

    public function instructor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(CourseEnrollment::class);
    }

    public function activeEnrollments(): HasMany
    {
        return $this->enrollments()->whereIn('status', ['not_started', 'in_progress']);
    }

    public function completedEnrollments(): HasMany
    {
        return $this->enrollments()->where('status', 'completed');
    }

    public function favourites()
    {
        return $this->hasMany(CourseFavourite::class);
    }

    public function isFavouredBy(int $userId): bool
    {
        return $this->favourites()->where('user_id', $userId)->exists();
    }

    // Scopes
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published')
                    ->where('is_active', true)
                    ->whereNotNull('published_at')
                    ->where('published_at', '<=', now());
    }

    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }

    public function scopeByCategory(Builder $query, int $categoryId): Builder
    {
        return $query->where('course_category_id', $categoryId);
    }

    public function scopeBySkillType(Builder $query, int $skillTypeId): Builder
    {
        return $query->where('skill_type_id', $skillTypeId);
    }

    public function scopeByDifficulty(Builder $query, string $difficulty): Builder
    {
        return $query->where('difficulty_level', $difficulty);
    }

    public function scopeByPriceRange(Builder $query, ?float $min = null, ?float $max = null): Builder
    {
        if ($min !== null) {
            $query->where('price', '>=', $min);
        }
        if ($max !== null) {
            $query->where('price', '<=', $max);
        }
        return $query;
    }

    public function scopeFree(Builder $query): Builder
    {
        return $query->where('price', 0);
    }

    public function scopePaid(Builder $query): Builder
    {
        return $query->where('price', '>', 0);
    }

    public function scopeEnrollmentOpen(Builder $query): Builder
    {
        return $query->where(function($q) {
            $q->whereNull('enrollment_starts_at')
              ->orWhere('enrollment_starts_at', '<=', now());
        })->where(function($q) {
            $q->whereNull('enrollment_ends_at')
              ->orWhere('enrollment_ends_at', '>=', now());
        });
    }

    public function scopeAvailableSpots(Builder $query): Builder
    {
        return $query->where(function($q) {
            $q->whereNull('max_students')
              ->orWhereRaw('enrolled_count < max_students');
        });
    }

    // Accessors
    public function getEffectivePriceAttribute(): float
    {
        return $this->discount_price ?? $this->price;
    }

    public function getHasDiscountAttribute(): bool
    {
        return $this->discount_price !== null && $this->discount_price < $this->price;
    }

    public function getDiscountPercentageAttribute(): int
    {
        if (!$this->has_discount || $this->price == 0) {
            return 0;
        }

        return (int) round((($this->price - $this->discount_price) / $this->price) * 100);
    }

    public function getTotalDurationMinutesAttribute(): int
    {
        return ($this->duration_hours * 60) + $this->duration_minutes;
    }

    public function getFormattedDurationAttribute(): string
    {
        $hours = $this->duration_hours;
        $minutes = $this->duration_minutes;

        if ($hours && $minutes) {
            return "{$hours}h {$minutes}m";
        } elseif ($hours) {
            return "{$hours}h";
        } else {
            return "{$minutes}m";
        }
    }

    public function getIsEnrollmentOpenAttribute(): bool
    {
        $now = now();

        $startCheck = !$this->enrollment_starts_at || $this->enrollment_starts_at <= $now;
        $endCheck = !$this->enrollment_ends_at || $this->enrollment_ends_at >= $now;

        return $startCheck && $endCheck;
    }

    public function getHasAvailableSpotsAttribute(): bool
    {
        return !$this->max_students || $this->enrolled_count < $this->max_students;
    }

    public function getCanEnrollAttribute(): bool
    {
        return $this->is_active &&
               $this->status === 'published' &&
               $this->is_enrollment_open &&
               $this->has_available_spots;
    }

    public function getIsFreeAttribute(): bool
    {
        return $this->effective_price == 0;
    }

    // Methods
    public function incrementEnrollmentCount(): void
    {
        $this->increment('enrolled_count', 1, []);
    }

    public function decrementEnrollmentCount(): void
    {
        $this->decrement('enrolled_count', 1, []);
    }

    public function updateRating(): void
    {
        // This would be implemented with a reviews system
        // For now, just a placeholder
    }

    public function isUserEnrolled($userId): bool
    {
        return $this->enrollments()->where('user_id', $userId)->exists();
    }

    public function getUserEnrollment($userId): ?CourseEnrollment
    {
        return $this->enrollments()->where('user_id', $userId)->first();
    }

    // Route key name for model binding
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(CourseReview::class);
    }

    public function approvedReviews(): HasMany
    {
        return $this->reviews()->where('is_approved', true);
    }

    public function sections(): HasMany
    {
        return $this->hasMany(CourseSection::class)->orderBy('order');
    }

}
