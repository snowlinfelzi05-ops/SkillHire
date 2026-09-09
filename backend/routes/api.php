<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\JobController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ProposalController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\WorkUpdateController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::get('/test', function () {
    return response()->json([
        'message' => 'SkillHire API is working!',
    ]);
});

Route::middleware('throttle:5,1')->post('/register', [AuthController::class, 'register']);

Route::middleware('throttle:5,1')->post('/login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Public Jobs
|--------------------------------------------------------------------------
*/

Route::get('/jobs', [JobController::class, 'index']);

Route::get('/jobs/{id}', [JobController::class, 'show']);

/*
|--------------------------------------------------------------------------
| Protected Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Authentication
    |--------------------------------------------------------------------------
    */

    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    /*
    |--------------------------------------------------------------------------
    | Notifications
    |--------------------------------------------------------------------------
    */

    Route::get('/notifications', [
        NotificationController::class,
        'index',
    ]);

    Route::get('/notifications/unread-count', [
        NotificationController::class,
        'unreadCount',
    ]);

    Route::put('/notifications/{id}/read', [
        NotificationController::class,
        'markAsRead',
    ]);

    Route::put('/notifications/read-all', [
        NotificationController::class,
        'markAllAsRead',
    ]);

    Route::delete('/notifications/{id}', [
        NotificationController::class,
        'destroy',
    ]);

    /*
    |--------------------------------------------------------------------------
    | Jobs
    |--------------------------------------------------------------------------
    */

    Route::post('/jobs', [
        JobController::class,
        'store',
    ]);

    Route::get('/my-jobs', [
        JobController::class,
        'myJobs',
    ]);

    Route::put('/jobs/{id}', [
        JobController::class,
        'update',
    ]);

    Route::delete('/jobs/{id}', [
        JobController::class,
        'destroy',
    ]);

    Route::get('/jobs/{id}/match-skills', [
        JobController::class,
        'matchSkills',
    ]);

    /*
    |--------------------------------------------------------------------------
    | Proposals
    |--------------------------------------------------------------------------
    */

    Route::post('/proposals', [
        ProposalController::class,
        'store',
    ]);

    Route::get('/proposals', [
        ProposalController::class,
        'index',
    ]);

    Route::get('/proposals/received', [
        ProposalController::class,
        'receivedAll',
    ]);

    Route::get('/jobs/{jobId}/proposals', [
        ProposalController::class,
        'received',
    ]);

    Route::put('/proposals/{proposalId}/status', [
        ProposalController::class,
        'updateStatus',
    ]);

    /*
    |--------------------------------------------------------------------------
    | Projects
    |--------------------------------------------------------------------------
    */

    Route::post('/projects', [
        ProjectController::class,
        'store',
    ]);

    Route::get('/projects', [
        ProjectController::class,
        'index',
    ]);

    Route::get('/projects/{id}', [
        ProjectController::class,
        'show',
    ]);

    Route::put('/projects/{id}/status', [
        ProjectController::class,
        'updateStatus',
    ]);

    Route::post('/projects/{id}/pay', [
        ProjectController::class,
        'pay',
    ]);

    /*
    |--------------------------------------------------------------------------
    | Work Updates
    |--------------------------------------------------------------------------
    */

    Route::get('/projects/{projectId}/work-updates', [
        WorkUpdateController::class,
        'index',
    ]);

    Route::post('/projects/{projectId}/work-updates', [
        WorkUpdateController::class,
        'store',
    ]);

    /*
    |--------------------------------------------------------------------------
    | Reviews
    |--------------------------------------------------------------------------
    */

    Route::get('/projects/{projectId}/reviews', [
        ReviewController::class,
        'index',
    ]);

    Route::post('/projects/{projectId}/reviews', [
        ReviewController::class,
        'store',
    ]);

    /*
    |--------------------------------------------------------------------------
    | Admin
    |--------------------------------------------------------------------------
    */

    Route::middleware('admin')->group(function () {
        Route::get('/admin/stats', [AdminController::class, 'stats']);
        Route::get('/admin/users', [AdminController::class, 'users']);
        Route::get('/admin/jobs', [AdminController::class, 'jobs']);
        Route::delete('/admin/jobs/{id}', [AdminController::class, 'deleteJob']);
        Route::delete('/admin/users/{id}', [AdminController::class, 'deleteUser']);
        Route::get('/admin/projects', [AdminController::class, 'projects']);
    });

    /*
    |--------------------------------------------------------------------------
    | Profile
    |--------------------------------------------------------------------------
    */

    Route::get('/profile', [
        ProfileController::class,
        'show',
    ]);

    Route::put('/profile', [
        ProfileController::class,
        'update',
    ]);

    Route::post('/profile/photo', [
        ProfileController::class,
        'uploadPhoto',
    ]);
    Route::delete('/profile/photo', [ProfileController::class, 'deletePhoto']);
    /*
    |--------------------------------------------------------------------------
    | Account (Settings)
    |--------------------------------------------------------------------------
    */

    Route::middleware('throttle:5,1')->post('/change-password', [
        AuthController::class,
        'changePassword',
    ]);

    Route::delete('/account', [
        AuthController::class,
        'destroy',
    ]);
});
