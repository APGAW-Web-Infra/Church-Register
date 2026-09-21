<?php

namespace App\Http\Controllers;

use App\Enum\RolesEnum;
use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseCategory;
use App\Models\CourseSection;
use App\Models\CourseLecture;
use App\Models\SkillType;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AdminTrainingController extends Controller
{
    /**
     * Display admin training management dashboard
     */
    public function index()
    {
        $this->authorizeAdmin();
        $courses = Course::with(['courseCategory', 'skillType', 'instructor'])
            ->withCount('enrollments')
            ->latest()
            ->paginate(15);

        $stats = [
            'total_courses' => Course::query()->count('*'),
            'published_courses' => Course::query()->where('status', 'published')->count('*'),
            'draft_courses' => Course::query()->where('status', 'draft')->count('*'),
            'total_students' => DB::table('course_enrollments')->distinct('user_id')->count(),
            'total_revenue' => DB::table('course_enrollments')
                ->join('courses', 'course_enrollments.course_id', '=', 'courses.id')
                ->sum('courses.price'),
        ];

        return Inertia::render('Admin/Training/Index', [
            'courses' => $courses,
            'stats' => $stats,
        ]);
    }

    /**
     * Show form to create a new course
     */
    public function create()
    {
        $this->authorizeAdmin();

        $categories = CourseCategory::active()->ordered()->get();
        $skillTypes = SkillType::active()->ordered()->get();
        $instructors = User::query()
            ->role([
                RolesEnum::SundaySchoolTeacher->value,
                RolesEnum::Admin->value,
                RolesEnum::SuperAdmin->value,
            ])
            ->orderBy('name', 'asc')
            ->get(['id', 'name', 'email']);

        return Inertia::render('Admin/Training/CreateCourse', [
            'categories' => $categories,
            'skillTypes' => $skillTypes,
            'instructors' => $instructors,
        ]);
    }

    /**
     * Store a new course
     */
  /**
 * Store a new course with file uploads
 */
public function store(Request $request)
{
    // dd($request->all());
    // Add debug logging
    Log::info('Received request data', [
        'learning_objectives' => $request->input('learning_objectives'),
        'prerequisites' => $request->input('prerequisites'),
        'skills_gained' => $request->input('skills_gained'),
    ]);

    $validated = $request->validate([
        'title' => 'required|string|max:255',
        'description' => 'required|string',
        'short_description' => 'required|string|max:500',
        'course_category_id' => 'required|exists:course_categories,id',
        'skill_type_id' => 'required|exists:skill_types,id',
        'instructor_id' => 'required|exists:users,id',
        'duration_hours' => 'required|integer|min:0',
        'duration_minutes' => 'required|integer|min:0|max:59',
        'difficulty_level' => 'required|in:beginner,intermediate,advanced',
        'price' => 'required|numeric|min:0',
        'discount_price' => 'nullable|numeric|min:0|lt:price',
        'status' => 'required|in:draft,published,archived',
        'is_featured' => 'boolean',
        'learning_objectives' => 'required',
        'prerequisites' => 'required',
        'skills_gained' => 'required',
        'thumbnail' => 'nullable|image|dimensions:min_width=300,min_height=225|max:2048',
        'sections' => 'nullable|array',
        'sections.*.title' => 'required|string',
        'sections.*.description' => 'nullable|string',
        'sections.*.lectures' => 'nullable|array',
        'sections.*.lectures.*.title' => 'required|string',
        'sections.*.lectures.*.type' => 'required|in:video,youtube,slide,document,pdf,text,reading,quiz,assignment',
        'sections.*.lectures.*.content' => 'nullable|string',
        'sections.*.lectures.*.video_url' => 'nullable|string',
        'sections.*.lectures.*.duration_minutes' => 'required|integer|min:0',
        'sections.*.lectures.*.is_preview' => 'boolean',
        'sections.*.lectures.*.slides.*' => 'nullable|image|max:5120',
        'sections.*.lectures.*.document' => 'nullable|file|max:10240|mimes:pdf,doc,docx,mp4,webm,avi',
    ]);

    try {
        DB::beginTransaction();

        // Convert to arrays - handle both JSON strings and arrays
        $learning_objectives = $validated['learning_objectives'] ?? [];
        if (is_string($learning_objectives)) {
            $learning_objectives = json_decode($learning_objectives, true) ?? [];
        }
        if (!is_array($learning_objectives)) {
            $learning_objectives = [];
        }
        // Filter out empty strings
        $learning_objectives = array_filter($learning_objectives, fn($item) => trim($item ?? '') !== '');

        $prerequisites = $validated['prerequisites'] ?? [];
        if (is_string($prerequisites)) {
            $prerequisites = json_decode($prerequisites, true) ?? [];
        }
        if (!is_array($prerequisites)) {
            $prerequisites = [];
        }
        $prerequisites = array_filter($prerequisites, fn($item) => trim($item ?? '') !== '');

        $skills_gained = $validated['skills_gained'] ?? [];
        if (is_string($skills_gained)) {
            $skills_gained = json_decode($skills_gained, true) ?? [];
        }
        if (!is_array($skills_gained)) {
            $skills_gained = [];
        }
        $skills_gained = array_filter($skills_gained, fn($item) => trim($item ?? '') !== '');

        // Validate at least one objective exists
        if (empty($learning_objectives)) {
            return redirect()->back()->withErrors(['learning_objectives' => 'At least one learning objective is required']);
        }
        if (empty($prerequisites)) {
            return redirect()->back()->withErrors(['prerequisites' => 'At least one prerequisite is required']);
        }
        if (empty($skills_gained)) {
            return redirect()->back()->withErrors(['skills_gained' => 'At least one skill is required']);
        }

        $validated['learning_objectives'] = array_values($learning_objectives);
        $validated['prerequisites'] = array_values($prerequisites);
        $validated['skills_gained'] = array_values($skills_gained);

        // Generate slug
        $validated['slug'] = Str::slug($validated['title']);
        $validated['created_by'] = Auth::id();

        // Handle thumbnail upload
        if ($request->hasFile('thumbnail')) {
            $path = $request->file('thumbnail')->store('course-thumbnails', 'public');
            $validated['thumbnail'] = $path;
        }

        // Set published_at if status is published
        if ($validated['status'] === 'published' && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        // Build curriculum from sections (simplified version for course overview)
        $validated['curriculum'] = $this->buildCurriculumFromSections($validated['sections'] ?? []);

        // Create course
        $course = Course::create($validated);

        // Create sections and lectures with file handling
        if (!empty($validated['sections'])) {
            foreach ($validated['sections'] as $sectionIndex => $sectionData) {
                $section = $course->sections()->create([
                    'title' => $sectionData['title'],
                    'description' => $sectionData['description'] ?? null,
                    'order' => $sectionIndex,
                ]);

                if (!empty($sectionData['lectures'])) {
                    foreach ($sectionData['lectures'] as $lectureIndex => $lectureData) {
                        $lectureToStore = [
                            'title' => $lectureData['title'],
                            'type' => $lectureData['type'],
                            'content' => $lectureData['content'] ?? null,
                            'video_url' => $lectureData['video_url'] ?? null,
                            'duration_minutes' => $lectureData['duration_minutes'],
                            'order' => $lectureIndex,
                            'is_preview' => $lectureData['is_preview'] ?? false,
                            'resources' => null,
                        ];

                        // Handle file uploads based on lecture type
                        $resources = [];

                        // Handle slide uploads
                        if ($lectureData['type'] === 'slide' && $request->hasFile("sections.{$sectionIndex}.lectures.{$lectureIndex}.slides")) {
                            $slides = $request->file("sections.{$sectionIndex}.lectures.{$lectureIndex}.slides");
                            $slideUrls = [];

                            foreach ($slides as $slideIndex => $slideFile) {
                                $path = $slideFile->store('course-lectures/slides', 'public');
                                $slideUrls[] = [
                                    'url' => $path,
                                    'order' => $slideIndex,
                                ];
                            }

                            $resources['slides'] = $slideUrls;
                        }

                        // Handle document/video uploads
                        if (in_array($lectureData['type'], ['document', 'pdf', 'video']) &&
                            $request->hasFile("sections.{$sectionIndex}.lectures.{$lectureIndex}.document")) {

                            $file = $request->file("sections.{$sectionIndex}.lectures.{$lectureIndex}.document");
                            $path = $file->store('course-lectures/documents', 'public');

                            // Store the file path in video_url field for easy access
                            $lectureToStore['video_url'] = $path;

                            // Also store in resources with metadata
                            $resources['file'] = [
                                'url' => $path,
                                'name' => $file->getClientOriginalName(),
                                'size' => $file->getSize(),
                                'mime_type' => $file->getMimeType(),
                            ];
                        }

                        // Store resources if any
                        if (!empty($resources)) {
                            $lectureToStore['resources'] = $resources;
                        }

                        $section->lectures()->create($lectureToStore);
                    }
                }
            }
        }

        DB::commit();

        return redirect()
            ->route('admin.training.edit', $course)
            ->with('success', 'Course created successfully!');

    } catch (\Exception $e) {
        DB::rollback();
        Log::error('Course creation failed', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        return back()
            ->withErrors(['error' => 'Failed to create course: ' . $e->getMessage()])
            ->withInput();
    }
}

/**
 * Update a course with file uploads
 */
public function update(Request $request, Course $course)
{
       $validated = $request->validate([
        'title' => 'required|string|max:255',
        'description' => 'required|string',
        'short_description' => 'required|string|max:500',
        'course_category_id' => 'required|exists:course_categories,id',
        'skill_type_id' => 'required|exists:skill_types,id',
        'instructor_id' => 'required|exists:users,id',
        'duration_hours' => 'required|integer|min:0',
        'duration_minutes' => 'required|integer|min:0|max:59',
        'difficulty_level' => 'required|in:beginner,intermediate,advanced',
        'price' => 'required|numeric|min:0',
        'discount_price' => 'nullable|numeric|min:0|lt:price',
        'status' => 'required|in:draft,published,archived',
        'is_featured' => 'boolean',
        'learning_objectives' => 'required',
        'prerequisites' => 'required',
        'skills_gained' => 'required',
        'thumbnail' => 'nullable|image|dimensions:min_width=300,min_height=225|max:2048',
        'sections' => 'nullable|array',
        'sections.*.title' => 'required|string',
        'sections.*.description' => 'nullable|string',
        'sections.*.lectures' => 'nullable|array',
        'sections.*.lectures.*.title' => 'required|string',
        'sections.*.lectures.*.type' => 'required|in:video,youtube,slide,document,pdf,text,reading,quiz,assignment',
        'sections.*.lectures.*.content' => 'nullable|string',
        'sections.*.lectures.*.video_url' => 'nullable|string',
        'sections.*.lectures.*.duration_minutes' => 'required|integer|min:0',
        'sections.*.lectures.*.is_preview' => 'boolean',
        'sections.*.lectures.*.slides.*' => 'nullable|image|max:5120',
        'sections.*.lectures.*.document' => 'nullable|file|max:10240|mimes:pdf,doc,docx,mp4,webm,avi',
    ]);

    try {
        DB::beginTransaction();

        // Convert to arrays - handle both JSON strings and arrays
        $learning_objectives = $validated['learning_objectives'] ?? [];
        if (is_string($learning_objectives)) {
            $learning_objectives = json_decode($learning_objectives, true) ?? [];
        }
        if (!is_array($learning_objectives)) {
            $learning_objectives = [];
        }
        $learning_objectives = array_filter($learning_objectives, fn($item) => trim($item ?? '') !== '');

        $prerequisites = $validated['prerequisites'] ?? [];
        if (is_string($prerequisites)) {
            $prerequisites = json_decode($prerequisites, true) ?? [];
        }
        if (!is_array($prerequisites)) {
            $prerequisites = [];
        }
        $prerequisites = array_filter($prerequisites, fn($item) => trim($item ?? '') !== '');

        $skills_gained = $validated['skills_gained'] ?? [];
        if (is_string($skills_gained)) {
            $skills_gained = json_decode($skills_gained, true) ?? [];
        }
        if (!is_array($skills_gained)) {
            $skills_gained = [];
        }
        $skills_gained = array_filter($skills_gained, fn($item) => trim($item ?? '') !== '');

        // Validate at least one exists
        if (empty($learning_objectives) || empty($prerequisites) || empty($skills_gained)) {
            return redirect()->back()->withErrors([
                'learning_objectives' => empty($learning_objectives) ? 'At least one learning objective is required' : null,
                'prerequisites' => empty($prerequisites) ? 'At least one prerequisite is required' : null,
                'skills_gained' => empty($skills_gained) ? 'At least one skill is required' : null,
            ]);
        }

        $validated['learning_objectives'] = array_values($learning_objectives);
        $validated['prerequisites'] = array_values($prerequisites);
        $validated['skills_gained'] = array_values($skills_gained);

        // Update slug if title changed
        if ($validated['title'] !== $course->title) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        // Build curriculum from sections
        if (isset($validated['sections'])) {
            $validated['curriculum'] = $this->buildCurriculumFromSections($validated['sections']);
        }

        // Handle thumbnail upload
        if ($request->hasFile('thumbnail')) {
            // Delete old thumbnail
            if ($course->thumbnail) {
                Storage::disk('public')->delete($course->thumbnail);
            }
            $path = $request->file('thumbnail')->store('course-thumbnails', 'public');
            $validated['thumbnail'] = $path;
        }

        // Set published_at if status changed to published
        if ($validated['status'] === 'published' && $course->status !== 'published') {
            $validated['published_at'] = now();
        }

        // Update course
        $course->update($validated);

        // Delete old lecture files before recreating sections
        foreach ($course->sections as $section) {
            foreach ($section->lectures as $lecture) {
                $this->deleteLectureFiles($lecture);
            }
        }

        // Delete existing sections (cascade will delete lectures)
        $course->sections()->delete();

        // Create new sections and lectures (same logic as store method)
        if (isset($validated['sections'])) {
            foreach ($validated['sections'] as $sectionIndex => $sectionData) {
                $section = $course->sections()->create([
                    'title' => $sectionData['title'],
                    'description' => $sectionData['description'] ?? null,
                    'order' => $sectionIndex,
                ]);

                if (!empty($sectionData['lectures'])) {
                    foreach ($sectionData['lectures'] as $lectureIndex => $lectureData) {
                        $lectureToStore = [
                            'title' => $lectureData['title'],
                            'type' => $lectureData['type'],
                            'content' => $lectureData['content'] ?? null,
                            'video_url' => $lectureData['video_url'] ?? null,
                            'duration_minutes' => $lectureData['duration_minutes'],
                            'order' => $lectureIndex,
                            'is_preview' => $lectureData['is_preview'] ?? false,
                            'resources' => null,
                        ];

                        $resources = [];

                        // Handle slide uploads
                        if ($lectureData['type'] === 'slide' && $request->hasFile("sections.{$sectionIndex}.lectures.{$lectureIndex}.slides")) {
                            $slides = $request->file("sections.{$sectionIndex}.lectures.{$lectureIndex}.slides");
                            $slideUrls = [];

                            foreach ($slides as $slideIndex => $slideFile) {
                                $path = $slideFile->store('course-lectures/slides', 'public');
                                $slideUrls[] = [
                                    'url' => $path,
                                    'order' => $slideIndex,
                                ];
                            }

                            $resources['slides'] = $slideUrls;
                        }

                        // Handle document/video uploads
                        if (in_array($lectureData['type'], ['document', 'pdf', 'video']) &&
                            $request->hasFile("sections.{$sectionIndex}.lectures.{$lectureIndex}.document")) {

                            $file = $request->file("sections.{$sectionIndex}.lectures.{$lectureIndex}.document");
                            $path = $file->store('course-lectures/documents', 'public');

                            $lectureToStore['video_url'] = $path;

                            $resources['file'] = [
                                'url' => $path,
                                'name' => $file->getClientOriginalName(),
                                'size' => $file->getSize(),
                                'mime_type' => $file->getMimeType(),
                            ];
                        }

                        if (!empty($resources)) {
                            $lectureToStore['resources'] = $resources;
                        }

                        $section->lectures()->create($lectureToStore);
                    }
                }
            }
        }

        DB::commit();

        return back()->with('success', 'Course updated successfully!');

    } catch (\Exception $e) {
        DB::rollback();
        Log::error('Course update failed', [
            'error' => $e->getMessage(),
            'course_id' => $course->id
        ]);
        return back()
            ->withErrors(['error' => 'Failed to update course: ' . $e->getMessage()])
            ->withInput();
    }
}

/**
 * Delete files associated with a lecture
 */
private function deleteLectureFiles(CourseLecture $lecture): void
{
    if ($lecture->resources) {
        $resources = is_string($lecture->resources)
            ? json_decode($lecture->resources, true)
            : $lecture->resources;

        // Delete slides
        if (isset($resources['slides']) && is_array($resources['slides'])) {
            foreach ($resources['slides'] as $slide) {
                if (isset($slide['url']) && Storage::disk('public')->exists($slide['url'])) {
                    Storage::disk('public')->delete($slide['url']);
                }
            }
        }

        // Delete file
        if (isset($resources['file']['url']) && Storage::disk('public')->exists($resources['file']['url'])) {
            Storage::disk('public')->delete($resources['file']['url']);
        }
    }

    // Delete file in video_url field
    if ($lecture->video_url && Storage::disk('public')->exists($lecture->video_url)) {
        Storage::disk('public')->delete($lecture->video_url);
    }
}

/**
 * Build curriculum array from sections
 */
private function buildCurriculumFromSections(array $sections): array
{
    if (empty($sections)) {
        return [];
    }

    return array_map(function($section, $index) {
        $lessons = array_map(function($lecture) {
            return $lecture['title'];
        }, $section['lectures'] ?? []);

        return [
            'module' => $index + 1,
            'title' => $section['title'] ?? "Module " . ($index + 1),
            'lessons' => $lessons
        ];
    }, $sections, array_keys($sections));
}

    /**
     * Show form to edit a course
     */
    public function edit(Course $course)
    {
        $this->authorizeAdmin();

        $course->load(['sections.lectures', 'courseCategory', 'skillType', 'instructor']);

        // Process lectures to include parsed slides/documents
        $course->sections->each(function($section) {
            $section->lectures->each(function($lecture) {
                // Parse slides from resources if type is slide
                if ($lecture->type === 'slide' && $lecture->resources) {
                    $resources = is_string($lecture->resources)
                        ? json_decode($lecture->resources, true)
                        : $lecture->resources;
                    $lecture->slides = $resources['slides'] ?? [];
                }

                // Ensure resources is always an array for frontend
                $lecture->resources = is_string($lecture->resources)
                    ? json_decode($lecture->resources, true)
                    : ($lecture->resources ?? []);
            });
        });

        $categories = CourseCategory::active()->ordered()->get();
        $skillTypes = SkillType::active()->ordered()->get();
        $instructors = User::query()
            ->role([
                RolesEnum::SundaySchoolTeacher->value,
                RolesEnum::Admin->value,
                RolesEnum::SuperAdmin->value,
            ])
            ->orderBy('name', 'asc')
            ->get(['id', 'name', 'email']);

        return Inertia::render('Admin/Training/EditCourse', [
            'course' => $course,
            'categories' => $categories,
            'skillTypes' => $skillTypes,
            'instructors' => $instructors,
        ]);
    }



    /**
     * Delete a course
     */
    public function destroy(Course $course)
    {
        $this->authorizeAdmin(request());

        try {
            // Check if course has enrollments
            if ($course->enrollments()->exists()) {
                return back()->withErrors([
                    'error' => 'Cannot delete course with active enrollments. Archive it instead.'
                ]);
            }

            // Delete thumbnail
            if ($course->thumbnail) {
                Storage::disk('public')->delete($course->thumbnail);
            }

            // Delete lecture resources (slides, documents)
            foreach ($course->sections as $section) {
                foreach ($section->lectures as $lecture) {
                    if ($lecture->type === 'slide' && $lecture->resources) {
                        $resources = is_string($lecture->resources)
                            ? json_decode($lecture->resources, true)
                            : $lecture->resources;

                        if (isset($resources['slides'])) {
                            foreach ($resources['slides'] as $slide) {
                                if (Storage::disk('public')->exists($slide)) {
                                    Storage::disk('public')->delete($slide);
                                }
                            }
                        }
                    }

                    if (in_array($lecture->type, ['document', 'pdf']) && $lecture->video_url) {
                        if (Storage::disk('public')->exists($lecture->video_url)) {
                            Storage::disk('public')->delete($lecture->video_url);
                        }
                    }
                }
            }

            Course::query()->whereKey($course->getKey())->delete();

            return redirect()
                ->route('admin.training.index')
                ->with('success', 'Course deleted successfully!');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete course: ' . $e->getMessage()]);
        }
    }

    /**
     * Bulk update course status
     */
    public function bulkUpdateStatus(Request $request)
    {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'course_ids' => 'required|array',
            'course_ids.*' => 'exists:courses,id',
            'status' => 'required|in:draft,published,archived',
        ]);

        Course::query()
            ->whereIn('id', $validated['course_ids'], 'and', false)
            ->update(['status' => $validated['status']]);

        return back()->with('success', 'Courses updated successfully!');
    }

    /**
     * Get course analytics
     */
    public function analytics(Course $course)
    {
        $this->authorizeAdmin(request());

        $analytics = [
            'total_enrollments' => $course->enrollments()->count(),
            'active_students' => $course->enrollments()->whereIn('status', ['not_started', 'in_progress'])->count(),
            'completed_students' => $course->enrollments()->where('status', 'completed')->count(),
            'completion_rate' => $course->completion_rate,
            'average_progress' => $course->enrollments()->avg('progress_percentage'),
            'revenue' => $course->enrollments()->count() * $course->price,
            'rating' => $course->rating,
            'reviews_count' => $course->reviews_count,
        ];

        return response()->json($analytics);
    }

    private function authorizeAdmin(?Request $request = null): void
    {
        $user = ($request ?? request())->user();

        abort_unless($user && $user->hasRole(['super_admin', 'admin']), 403, 'Unauthorized access to the training admin area.');
    }

}
