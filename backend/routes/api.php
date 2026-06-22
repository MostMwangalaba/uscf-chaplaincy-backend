<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContributionController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\TargetController;
use App\Http\Controllers\Api\BackupController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\BroadcastController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\MemberTargetController;

// Public routes (no authentication required)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/faculties', function () {
    return \App\Models\Faculty::all();
});

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/user', [AuthController::class, 'update']);

    // Contributions
    Route::get('/contributions', [ContributionController::class, 'index']);
    Route::post('/contributions', [ContributionController::class, 'store']);
    Route::put('/contributions/{id}', [ContributionController::class, 'update']);
    Route::delete('/contributions/{id}', [ContributionController::class, 'destroy']);
    Route::get('/contributions/total', [ContributionController::class, 'total']);

    // Users
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::put('/users/{id}/role', [UserController::class, 'updateRole']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);

    // Public profile (no auth needed, but we keep it outside? Actually keep inside for now)
    Route::get('/public/member/{id}', [UserController::class, 'publicProfile']);

    // Targets
    Route::get('/targets', [TargetController::class, 'index']);
    Route::post('/targets', [TargetController::class, 'store']);
    Route::put('/targets/{id}', [TargetController::class, 'update']);
    Route::delete('/targets/{id}', [TargetController::class, 'destroy']);
    Route::get('/targets/progress', [TargetController::class, 'progress']);

    // Member Targets
    Route::get('/member-targets', [MemberTargetController::class, 'index']);
    Route::post('/member-targets', [MemberTargetController::class, 'store']);

    // Backups
    Route::get('/backups', [BackupController::class, 'index']);
    Route::post('/backups', [BackupController::class, 'store']);
    Route::get('/backups/{id}/download', [BackupController::class, 'download']);
    Route::delete('/backups/{id}', [BackupController::class, 'destroy']);

    // Audit Logs
    Route::get('/audit-logs', [AuditLogController::class, 'index']);
    Route::get('/audit-logs/actions', [AuditLogController::class, 'actions']);

    // Broadcasts
    Route::get('/broadcasts', [BroadcastController::class, 'index']);
    Route::post('/broadcasts', [BroadcastController::class, 'store']);
    Route::get('/broadcasts/{id}', [BroadcastController::class, 'show']);
    Route::delete('/broadcasts/{id}', [BroadcastController::class, 'destroy']);
    Route::get('/broadcasts/stats', [BroadcastController::class, 'stats']);
    Route::post('/faculty/broadcast', [BroadcastController::class, 'facultyBroadcast']);

    // Messages
    Route::get('/messages', [MessageController::class, 'index']);
    Route::post('/messages', [MessageController::class, 'store']);
    Route::post('/messages/broadcast', [MessageController::class, 'broadcast']);
    Route::post('/messages/advice', [MessageController::class, 'advice']);
    Route::post('/messages/reply', [MessageController::class, 'reply']);
    Route::post('/messages/{id}/read', [MessageController::class, 'markRead']);
    Route::delete('/messages/{id}', [MessageController::class, 'destroy']);
});

// Public member profile (outside auth)
Route::get('/member/{id}', function ($id) {
    $member = \App\Models\User::where('member_id', $id)->orWhere('id', $id)->first();
    if (!$member) {
        return response()->json(['message' => 'Member not found'], 404);
    }
    $contributions = \App\Models\Contribution::where('member_id', $member->id)
        ->orderBy('contribution_date', 'desc')
        ->get(['amount', 'contribution_date', 'description']);
    $total = $contributions->sum('amount');
    return response()->json([
        'name' => $member->name,
        'faculty' => $member->faculty?->name ?? 'N/A',
        'total' => (float) $total,
        'contributions' => $contributions->map(function ($c) {
            return [
                'date' => $c->contribution_date,
                'amount' => (float) $c->amount,
                'description' => $c->description ?? 'Building Fund',
            ];
        }),
    ]);
});
