<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Support\Facades\Storage;

class CourseLecture extends Model
{
    protected $fillable = [
        'course_section_id',
        'title',
        'type',
        'content',
        'video_url',
        'duration_minutes',
        'order',
        'resources',
        'is_preview',
    ];

    protected $casts = [
        'resources' => 'array',
        'is_preview' => 'boolean',
        'duration_minutes' => 'integer',
        'order' => 'integer',
    ];

    protected $appends = ['duration', 'slides', 'document_url', 'parsed_resources'];

    /**
     * Relationship: Lecture belongs to a section
     */
    public function section(): BelongsTo
    {
        return $this->belongsTo(CourseSection::class, 'course_section_id');
    }

    /**
     * Relationship: Lecture has many progress records
     */
    public function progress(): HasMany
    {
        return $this->hasMany(LectureProgress::class, 'course_lecture_id');
    }

    /**
     * Get user's progress for this lecture
     */
    public function userProgress(int $userId): ?LectureProgress
    {
        return $this->progress()->where('user_id', $userId)->first();
    }

    /**
     * Check if user has completed this lecture
     */
    public function isCompletedBy(int $userId): bool
    {
        $progress = $this->userProgress($userId);
        return $progress && $progress->is_completed;
    }

    /**
     * Get formatted duration
     */
    protected function duration(): Attribute
    {
        return Attribute::make(
            get: function () {
                if ($this->duration_minutes < 60) {
                    return "{$this->duration_minutes}m";
                }

                $hours = floor($this->duration_minutes / 60);
                $minutes = $this->duration_minutes % 60;

                if ($minutes === 0) {
                    return "{$hours}h";
                }

                return "{$hours}h {$minutes}m";
            }
        );
    }

    /**
     * Get slides array from resources with full URLs
     */
    protected function slides(): Attribute
    {
        return Attribute::make(
            get: function () {
                if ($this->type !== 'slide' || !is_array($this->resources)) {
                    return [];
                }

                $slides = $this->resources['slides'] ?? [];

                return array_map(function ($slide) {
                    if (is_array($slide)) {
                        $url = $slide['url'] ?? '';
                    } else {
                        $url = $slide;
                    }

                    return [
                        'url' => $this->getFullUrl($url),
                        'order' => is_array($slide) ? ($slide['order'] ?? 0) : 0,
                    ];
                }, $slides);
            }
        );
    }

    /**
     * Get document URL with full path
     */
    protected function documentUrl(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (!in_array($this->type, ['document', 'pdf', 'video'])) {
                    return null;
                }

                // Check video_url field first (where documents are stored)
                if ($this->video_url) {
                    return $this->getFullUrl($this->video_url);
                }

                // Check resources
                if (is_array($this->resources) && isset($this->resources['file']['url'])) {
                    return $this->getFullUrl($this->resources['file']['url']);
                }

                return null;
            }
        );
    }

    /**
     * Get parsed resources with full URLs
     */
    protected function parsedResources(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (!is_array($this->resources)) {
                    return [
                        'slides' => [],
                        'documents' => [],
                        'file' => null,
                        'additional_links' => [],
                    ];
                }

                $resources = $this->resources;

                return [
                    'slides' => $this->processSlides($resources['slides'] ?? []),
                    'documents' => $this->processDocuments($resources['documents'] ?? []),
                    'file' => isset($resources['file']) ? $this->processFile($resources['file']) : null,
                    'additional_links' => $resources['additional_links'] ?? [],
                ];
            }
        );
    }

    /**
     * Process slides to full URLs
     */
    private function processSlides(array $slides): array
    {
        return array_map(function ($slide) {
            if (is_array($slide)) {
                return [
                    'url' => $this->getFullUrl($slide['url'] ?? ''),
                    'order' => $slide['order'] ?? 0,
                ];
            }

            return [
                'url' => $this->getFullUrl($slide),
                'order' => 0,
            ];
        }, $slides);
    }

    /**
     * Process documents to include metadata
     */
    private function processDocuments(array $documents): array
    {
        return array_map(function ($doc) {
            if (is_string($doc)) {
                return [
                    'name' => basename($doc),
                    'url' => $this->getFullUrl($doc),
                    'type' => pathinfo($doc, PATHINFO_EXTENSION),
                ];
            }

            return [
                'name' => $doc['name'] ?? 'Document',
                'url' => $this->getFullUrl($doc['url'] ?? ''),
                'type' => $doc['type'] ?? pathinfo($doc['url'] ?? '', PATHINFO_EXTENSION),
                'size' => $doc['size'] ?? null,
            ];
        }, $documents);
    }

    /**
     * Process file metadata
     */
    private function processFile(array $file): array
    {
        return [
            'url' => $this->getFullUrl($file['url'] ?? ''),
            'name' => $file['name'] ?? 'File',
            'size' => $file['size'] ?? null,
            'mime_type' => $file['mime_type'] ?? null,
        ];
    }

    /**
     * Convert storage path to full URL
     */
    private function getFullUrl(string $path): string
    {
        if (empty($path)) {
            return '';
        }

        if (filter_var($path, FILTER_VALIDATE_URL)) {
            return $path;
        }

        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk('public');

        if ($disk->exists($path)) {
            return $disk->url($path);
        }

        return asset('storage/' . ltrim($path, '/'));
    }

    /**
     * Scope: Get lectures by type
     */
    public function scopeByType(Builder $query, string $type): Builder
    {
        return $query->where('type', $type);
    }

    /**
     * Scope: Get preview lectures
     */
    public function scopePreview(Builder $query): Builder
    {
        return $query->where('is_preview', true);
    }

    /**
     * Scope: Order by lecture order
     */
    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('order');
    }

    /**
     * Get the course through the section
     */
    public function getCourseAttribute()
    {
        return $this->section?->course;
    }
}
