<?php

use App\Http\Controllers\Api\AttendanceApiController;
use App\Http\Controllers\Api\InvitationApiController;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    $databaseConnected = false;
    $cacheConnected = false;
    $queueEnabled = false;
    $schedulerConfigured = false;
    $mailConfigured = false;
    $mailDeliveryReady = false;

    try {
        DB::connection()->getPdo();
        $databaseConnected = true;
    } catch (\Throwable $exception) {
        $databaseConnected = false;
    }

    try {
        Cache::put('health-check', 'ok', 10);
        $cacheConnected = Cache::get('health-check') === 'ok';
    } catch (\Throwable $exception) {
        $cacheConnected = false;
    }

    try {
        $queueDriver = config('queue.default');
        $queueEnabled = is_string($queueDriver) && $queueDriver !== '';
    } catch (\Throwable $exception) {
        $queueEnabled = false;
    }

    try {
        $consoleKernel = app(\Illuminate\Contracts\Console\Kernel::class);
        $schedulerConfigured = method_exists($consoleKernel, 'schedule');
    } catch (\Throwable $exception) {
        $schedulerConfigured = false;
    }

    try {
        $mailDriver = config('mail.default');
        $mailConfigured = is_string($mailDriver) && $mailDriver !== '';
        $mailDeliveryReady = $mailConfigured && ! in_array(strtolower((string) $mailDriver), ['log', 'array'], true);
    } catch (\Throwable $exception) {
        $mailConfigured = false;
        $mailDeliveryReady = false;
    }

    $overallHealthy = $databaseConnected && $cacheConnected && $queueEnabled && $schedulerConfigured && $mailConfigured;

    return response()->json([
        'status' => $overallHealthy ? 'ok' : 'error',
        'database' => [
            'connected' => $databaseConnected,
        ],
        'cache' => [
            'connected' => $cacheConnected,
        ],
        'queue' => [
            'enabled' => $queueEnabled,
            'driver' => config('queue.default'),
        ],
        'mail' => [
            'configured' => $mailConfigured,
            'delivery_ready' => $mailDeliveryReady,
            'driver' => config('mail.default'),
        ],
        'scheduler' => [
            'configured' => $schedulerConfigured,
            'command' => 'php artisan schedule:run',
        ],
        'app' => [
            'env' => config('app.env'),
        ],
        'timestamp' => now()->toIso8601String(),
    ], $overallHealthy ? 200 : 503);
})->name('api.health');

Route::middleware(['auth', 'role:super_admin|admin'])->prefix('attendance')->group(function () {
    Route::get('/stats', [AttendanceApiController::class, 'stats'])->name('api.attendance.stats');
    Route::get('/trends', [AttendanceApiController::class, 'trends'])->name('api.attendance.trends');
    Route::get('/report', [AttendanceApiController::class, 'report'])->name('api.attendance.report');
});

Route::middleware(['auth', 'role:super_admin|admin'])->prefix('invitations')->group(function () {
    Route::get('/stats', [InvitationApiController::class, 'stats'])->name('api.invitations.stats');
    Route::get('/leaderboard', [InvitationApiController::class, 'leaderboard'])->name('api.invitations.leaderboard');
});
