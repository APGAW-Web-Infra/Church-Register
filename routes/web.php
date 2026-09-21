<?php

use App\Enum\RolesEnum;
use App\Http\Controllers\AdminTrainingController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\CommunityController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\TrainingController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\PublicPageController;
use App\Http\Controllers\ChurchAdminController;
use App\Http\Controllers\ChurchOperationsController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\NewsletterController;
use App\Http\Controllers\NewsletterCampaignController;
use App\Http\Controllers\DirectMessageController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public routes
Route::get('/', function () {
    $userTableExists = \Illuminate\Support\Facades\Schema::hasTable('users');
    $attendanceTableExists = \Illuminate\Support\Facades\Schema::hasTable('attendance_records');

    $churchSummary = [
        'member_count' => $userTableExists ? \App\Models\User::query()->count('*') : 0,
        'attendance_total' => $attendanceTableExists ? \App\Models\AttendanceRecord::count() : 0,
        'prayer_requests' => \Illuminate\Support\Facades\Schema::hasTable('church_prayer_requests')
            ? \App\Models\ChurchPrayerRequest::whereIn('status', ['pending', 'prayed'])->count()
            : 0,
        'active_ministries' => \Illuminate\Support\Facades\Schema::hasTable('church_ministries')
            ? \App\Models\ChurchMinistry::where('is_active', true)->count()
            : 0,
        'upcoming_events' => \Illuminate\Support\Facades\Schema::hasTable('events')
            ? \App\Models\Event::query()->where('start_date', '>=', now()->startOfDay())
                ->whereIn('status', ['upcoming', 'registration_open', 'ongoing'])
                ->count()
            : 0,
    ];

    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'churchSummary' => $churchSummary,
    ]);
});

// Public Footer Pages - Church Foundation
Route::get('/about', [PublicPageController::class, 'about'])->name('about');
Route::get('/church-board', [PublicPageController::class, 'churchBoard'])->name('church-board');
Route::get('/church-board/{member}', [PublicPageController::class, 'churchBoardDetail'])->name('church-board.member');
Route::get('/mission', [PublicPageController::class, 'mission'])->name('mission');
Route::get('/leadership', [PublicPageController::class, 'leadership'])->name('leadership');
Route::get('/church-history', [PublicPageController::class, 'churchHistory'])->name('church-history');
Route::get('/governance', [PublicPageController::class, 'governance'])->name('governance');

// Public Footer Pages - Church Life & Ministry
Route::get('/program', [PublicPageController::class, 'program'])->name('program');
Route::get('/small-groups', [PublicPageController::class, 'smallGroups'])->name('small-groups');
Route::middleware('auth')->post('/small-groups/{smallGroup}/join', [PublicPageController::class, 'joinSmallGroup'])->name('small-groups.join');
Route::middleware('auth')->group(function () {
    Route::get('/small-groups/{smallGroup}/messages', [PublicPageController::class, 'smallGroupMessages'])->name('small-groups.messages');
    Route::post('/small-groups/{smallGroup}/messages', [PublicPageController::class, 'storeSmallGroupMessage'])->name('small-groups.messages.store');
});
Route::get('/volunteer', [PublicPageController::class, 'volunteer'])->name('volunteer');
Route::get('/giving', [PublicPageController::class, 'giving'])->name('giving');
Route::get('/partners', [PublicPageController::class, 'partners'])->name('partners');
// Public Footer Pages - Resources
Route::get('/community', [PublicPageController::class, 'community'])->name('community');
Route::get('/units', [PublicPageController::class, 'units'])->name('units');
Route::get('/units/{unit}', [PublicPageController::class, 'unitDetail'])->name('units.detail');
Route::get('/ministries', [PublicPageController::class, 'ministries'])->name('ministries');
Route::get('/ministries/{ministry}', [PublicPageController::class, 'ministryDetail'])->name('ministries.detail');
Route::get('/media', [PublicPageController::class, 'media'])->name('media');
Route::get('/media/{media}', [PublicPageController::class, 'mediaDetail'])->name('media.detail');
Route::post('/prayer-requests', [PublicPageController::class, 'storePrayerRequest'])->name('prayer-requests.store');
Route::get('/events', [PublicPageController::class, 'events'])->name('events');
Route::get('/announcements', [PublicPageController::class, 'announcements'])->name('announcements');
Route::get('/events/{event}/calendar', [PublicPageController::class, 'eventCalendar'])->name('events.calendar');
Route::get('/events/{event}', [PublicPageController::class, 'eventDetail'])->name('events.detail');
Route::post('/events/{event}/register', [PublicPageController::class, 'registerEvent'])->name('events.register');
Route::get('/knowledge-base', [PublicPageController::class, 'knowledgeBase'])->name('knowledge-base');
Route::get('/resources', [PublicPageController::class, 'resources'])->name('resources');
Route::get('/prayer-requests', [PublicPageController::class, 'prayerRequests'])->name('prayer-requests');
Route::get('/support', [PublicPageController::class, 'support'])->name('support');
Route::get('/contact', [PublicPageController::class, 'contact'])->name('contact');
Route::get('/location-hours', [PublicPageController::class, 'locationHours'])->name('location-hours');
Route::get('/send-message', [PublicPageController::class, 'sendMessage'])->name('send-message');
Route::post('/send-message', [PublicPageController::class, 'storeMessage'])->name('send-message.store');
Route::post('/newsletter/subscribe', [NewsletterController::class, 'subscribe'])->name('newsletter.subscribe');
Route::get('/unsubscribe/{token}', [NewsletterController::class, 'unsubscribe'])->name('newsletter.unsubscribe');
Route::get('/faq', [PublicPageController::class, 'faq'])->name('faq');
Route::get('/feedback', [PublicPageController::class, 'feedback'])->name('feedback');

// Public Footer Pages - Legal
Route::get('/privacy', [PublicPageController::class, 'privacy'])->name('privacy');
Route::get('/terms', [PublicPageController::class, 'terms'])->name('terms');
Route::get('/cookies', [PublicPageController::class, 'cookies'])->name('cookies');
Route::get('/disclaimer', [PublicPageController::class, 'disclaimer'])->name('disclaimer');

// Authenticated routes
Route::middleware(['auth'])->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/notifications', [NotificationController::class, 'index'])->name('member.notifications');
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markRead'])->name('member.notifications.read');
    Route::get('/messages', [DirectMessageController::class, 'index'])->name('member.direct-messages');
    Route::get('/messages/{user}', [DirectMessageController::class, 'show'])->name('member.direct-messages.show');
    Route::post('/messages/{user}', [DirectMessageController::class, 'store'])->name('member.direct-messages.store');
    Route::get('/member-profiles/{memberProfile}/photo', [ProfileController::class, 'photo'])->name('member-profile.photo');

    Route::middleware('role:super_admin|admin')->group(function () {
        Route::get('/church-admin', [ChurchAdminController::class, 'index'])->name('church-admin.index');
        Route::get('/church-admin/members', [ChurchAdminController::class, 'members'])->name('church-admin.members');
        Route::post('/church-admin/members', [ChurchAdminController::class, 'storeMember'])->name('church-admin.members.store');
        Route::get('/church-admin/users', [ChurchAdminController::class, 'users'])->name('church-admin.users');
        Route::get('/church-admin/outreach', [ChurchAdminController::class, 'outreach'])->name('church-admin.outreach');
        Route::get('/church-admin/follow-up', [ChurchAdminController::class, 'followUp'])->name('church-admin.follow-up');
        Route::get('/church-admin/birthdays', [ChurchAdminController::class, 'birthdays'])->name('church-admin.birthdays');
        Route::patch('/church-admin/users/{user}', [ChurchAdminController::class, 'updateUser'])->name('church-admin.users.update');
        Route::delete('/church-admin/users/{user}', [ChurchAdminController::class, 'deleteUser'])->name('church-admin.users.delete');
        Route::post('/church-admin/users/{user}/promote', [ChurchAdminController::class, 'promoteUser'])->name('church-admin.users.promote');
        Route::get('/church-admin/attendance', function () {
            return redirect()->route('church-admin.service-register', ['month' => now()->format('Y-m')]);
        })->name('church-admin.attendance');
        Route::post('/church-admin/attendance', [ChurchAdminController::class, 'storeAttendance'])->name('church-admin.attendance.store');
        Route::get('/church-admin/service-register', [ChurchAdminController::class, 'serviceRegister'])->name('church-admin.service-register');
        Route::post('/church-admin/service-register/attendance', [ChurchAdminController::class, 'storeServiceRegisterAttendance'])->name('church-admin.service-register.attendance');
        Route::get('/church-admin/ministries', [ChurchOperationsController::class, 'ministries'])->name('church-admin.ministries');
        Route::post('/church-admin/ministries', [ChurchOperationsController::class, 'storeMinistry'])->name('church-admin.ministries.store');
        Route::get('/church-admin/small-groups', [ChurchOperationsController::class, 'smallGroups'])->name('church-admin.small-groups');
        Route::post('/church-admin/small-groups', [ChurchOperationsController::class, 'storeSmallGroup'])->name('church-admin.small-groups.store');
        Route::post('/church-admin/small-groups/meetings', [ChurchOperationsController::class, 'storeSmallGroupMeeting'])->name('church-admin.small-groups.meetings.store');
        Route::post('/church-admin/small-groups/attendance', [ChurchOperationsController::class, 'storeSmallGroupAttendance'])->name('church-admin.small-groups.attendance.store');
        Route::get('/church-admin/units', [ChurchOperationsController::class, 'churchUnits'])->name('church-admin.units');
        Route::post('/church-admin/units', [ChurchOperationsController::class, 'storeChurchUnit'])->name('church-admin.units.store');
        Route::post('/church-admin/units/{unit}/leaders', [ChurchOperationsController::class, 'storeUnitLeader'])->name('church-admin.units.leaders.store');
        Route::post('/church-admin/units/{unit}/members', [ChurchOperationsController::class, 'storeUnitMember'])->name('church-admin.units.members.store');
        Route::get('/church-admin/leadership', [ChurchOperationsController::class, 'leadership'])->name('church-admin.leadership');
        Route::post('/church-admin/leadership', [ChurchOperationsController::class, 'storeLeadership'])->name('church-admin.leadership.store');
        Route::get('/church-admin/reports', [ChurchOperationsController::class, 'reports'])->name('church-admin.reports');
        Route::post('/church-admin/reports', [ChurchOperationsController::class, 'storeReport'])->name('church-admin.reports.store');
        Route::get('/church-admin/prayer-requests', [ChurchOperationsController::class, 'prayerRequests'])->name('church-admin.prayer-requests');
        Route::post('/church-admin/prayer-requests/{prayerRequest}/status', [ChurchOperationsController::class, 'updatePrayerRequestStatus'])->name('church-admin.prayer-requests.status');
        Route::get('/church-admin/scorecards', [ChurchOperationsController::class, 'scorecards'])->name('church-admin.scorecards');
        Route::post('/church-admin/scorecards', [ChurchOperationsController::class, 'storeScorecard'])->name('church-admin.scorecards.store');
        Route::get('/church-admin/absentees', [ChurchOperationsController::class, 'absentees'])->name('church-admin.absentees');
        Route::post('/church-admin/absentees', [ChurchOperationsController::class, 'storeAbsentee'])->name('church-admin.absentees.store');
        Route::get('/church-admin/workers-meetings', [ChurchOperationsController::class, 'workersMeetings'])->name('church-admin.workers-meetings');
        Route::post('/church-admin/workers-meetings', [ChurchOperationsController::class, 'storeWorkersMeeting'])->name('church-admin.workers-meetings.store');
        Route::get('/church-admin/media', [ChurchOperationsController::class, 'media'])->name('church-admin.media');
        Route::post('/church-admin/media', [ChurchOperationsController::class, 'storeMedia'])->name('church-admin.media.store');
        Route::get('/church-admin/messages', [ChurchOperationsController::class, 'messages'])->name('church-admin.messages');
        Route::post('/church-admin/messages/{message}/status', [ChurchOperationsController::class, 'updateMessageStatus'])->name('church-admin.messages.status');
        Route::get('/church-admin/events', [ChurchOperationsController::class, 'events'])->name('church-admin.events');
        Route::post('/church-admin/events', [ChurchOperationsController::class, 'storeEvent'])->name('church-admin.events.store');
        Route::patch('/church-admin/events/{event}', [ChurchOperationsController::class, 'updateEvent'])->name('church-admin.events.update');
        Route::get('/church-admin/announcements', [ChurchOperationsController::class, 'announcements'])->name('church-admin.announcements');
        Route::post('/church-admin/announcements', [ChurchOperationsController::class, 'storeAnnouncement'])->name('church-admin.announcements.store');
        Route::get('/church-admin/newsletter-subscribers', [NewsletterController::class, 'subscribers'])->name('church-admin.newsletter-subscribers');
        Route::get('/church-admin/newsletter-campaigns', [NewsletterCampaignController::class, 'index'])->name('church-admin.newsletter-campaigns');
        Route::post('/church-admin/newsletter-campaigns', [NewsletterCampaignController::class, 'store'])->name('church-admin.newsletter-campaigns.store');
        Route::post('/church-admin/newsletter-campaigns/{campaign}/send', [NewsletterCampaignController::class, 'send'])->name('church-admin.newsletter-campaigns.send');
    });
        Route::get('/my-messages', [ChurchOperationsController::class, 'memberMessages'])->name('member.messages');

    // Profile routes
    Route::prefix('profile')->name('profile.')->group(function () {
        Route::get('/', [ProfileController::class, 'edit'])->name('edit');
        Route::patch('/', [ProfileController::class, 'update'])->name('update');
        Route::delete('/', [ProfileController::class, 'destroy'])->name('destroy');
        Route::get('/export-data', [ProfileController::class, 'export'])->name('export-data');
        Route::post('/apply-for-role', [ProfileController::class, 'applyForRole'])->name('apply-for-role');
        Route::post('/switch-role', [ProfileController::class, 'switchRole'])->name('switch-role');
    });

    // Community routes
    Route::prefix('community')->name('community.')->group(function () {
        // Internal community data endpoint - moved off the public '/community' path
        Route::get('/data', [CommunityController::class, 'index'])->name('index');
        Route::get('/feed', [CommunityController::class, 'feed'])->name('feed');
        Route::post('/posts', [CommunityController::class, 'storePost'])->name('posts.store');
        Route::post('/join/{community}', [CommunityController::class, 'join'])->name('join');
        Route::post('/mentorship/request', [CommunityController::class, 'requestMentorship'])->name('mentorship.request');
    });

    // Training & Courses routes
    Route::prefix('training')->name('training.')->group(function () {
        // Training dashboard
        Route::get('/', [TrainingController::class, 'dashboard'])->name('dashboard');

        // Courses - unified page with Browse/My Courses tabs
        Route::get('/courses', [TrainingController::class, 'coursesPage'])->name('courses');
        // Keep my-courses as an alias to courses (for backward compatibility with named routes)
        Route::get('/courses/my-courses', [TrainingController::class, 'coursesPage'])->name('my-courses');
        // AJAX endpoint for enrolled courses (used by unified courses UI)
        Route::get('/courses/my-courses-data', [TrainingController::class, 'myCoursesData'])->name('my-courses.data');
        Route::post('/courses/{course}/enroll', [TrainingController::class, 'enroll'])->name('courses.enroll');
        Route::get('/course/detail/{id}', [CourseController::class, 'courseDetail'])->name('course.detail');
        Route::get('/course/player/{course}', [CourseController::class, 'coursePlayer'])->name('course.player');
        Route::post('/course/lecture/{lecture}/upload-slides', [CourseController::class, 'uploadSlides'])->name('lecture.upload-slides');
        Route::post('/courses/{course}/lectures/{lecture}/complete', [CourseController::class, 'completeLecture'])->name('course.lecture.complete');

        // Events
        Route::get('/events', [TrainingController::class, 'events'])->name('events');
        Route::post('/events/{event}/register', [TrainingController::class, 'registerEvent'])->name('events.register');

        // Certificates
        Route::get('/certificates', [TrainingController::class, 'certificates'])->name('certificates');
        Route::get('/certificates/api/list', [TrainingController::class, 'certificatesJson'])->name('certificates.api.list');
        Route::get('/certificates/{enrollment}', [TrainingController::class, 'showCertificate'])->name('certificates.show');
        Route::get('/certificates/{enrollment}/verify', [TrainingController::class, 'verifyCertificate'])->name('certificate.verify');

        // Course Favourite
        Route::get('/courses/api/favourites', [CourseController::class, 'getFavourites'])->name('courses.api.favourites');
        Route::post('/courses/{course}/favourite', [CourseController::class, 'toggleFavourite'])->name('courses.favourite');

        // Learning activity API
        Route::get('/activity', [TrainingController::class, 'learningActivity'])->name('activity');
        Route::post('/activity/record', [TrainingController::class, 'recordTime'])->name('activity.record');
    });

Route::middleware(['auth', 'role:super_admin|admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/training', [AdminTrainingController::class, 'index'])->name('training.index');
    Route::get('/training/create', [AdminTrainingController::class, 'create'])->name('training.create');
    Route::post('/training', [AdminTrainingController::class, 'store'])->name('training.store');
    Route::get('/training/{course}/edit', [AdminTrainingController::class, 'edit'])->name('training.edit');
    Route::put('/training/{course}', [AdminTrainingController::class, 'update'])->name('training.update');
    Route::delete('/training/{course}', [AdminTrainingController::class, 'destroy'])->name('training.destroy');
});

Route::middleware(['auth', 'role:super_admin|admin'])->group(function () {
    Route::resource('users', UserController::class);
    Route::post('users/export', [UserController::class, 'export'])->name('users.export');
});

});

// Location API routes (Public - no authentication required)
Route::prefix('api')->group(function () {
    Route::get('/states', [LocationController::class, 'getStates'])->name('api.states');
    Route::get('/lgas', [LocationController::class, 'getLGAs'])->name('api.lgas');
});

// Debug route for cache clearing - available only in local-like environments and only to admins.
Route::get('/debug/clear-cache', function () {
    abort_unless(app()->environment(['local', 'staging']), 404, 'Debug route unavailable in this environment.');
    abort_unless(Auth::check() && Auth::user()?->hasRole(['super_admin', 'admin']), 403, 'Unauthorized.');

    \Illuminate\Support\Facades\Artisan::call('route:clear');
    \Illuminate\Support\Facades\Artisan::call('cache:clear');

    return response()->json([
        'status' => 'success',
        'message' => 'Routes and caches cleared successfully.',
        'environment' => app()->environment(),
    ]);
})->name('debug.clear-cache');

require __DIR__.'/auth.php';
