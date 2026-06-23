<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContributionController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\TargetController;
use App\Http\Controllers\Api\MemberTargetController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\BroadcastController;
use App\Http\Controllers\Api\BackupController;
use App\Http\Controllers\Api\AuditLogController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user', [AuthController::class, 'update']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/contributions', [ContributionController::class, 'index']);
    Route::post('/contributions', [ContributionController::class, 'store']);
    Route::put('/contributions/{id}', [ContributionController::class, 'update']);
    Route::delete('/contributions/{id}', [ContributionController::class, 'destroy']);
    Route::get('/contributions/total', [ContributionController::class, 'total']);
    
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::put('/users/{id}/role', [UserController::class, 'updateRole']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
    
    Route::get('/targets', [TargetController::class, 'index']);
    Route::post('/targets', [TargetController::class, 'store']);
    Route::put('/targets/{id}', [TargetController::class, 'update']);
    Route::delete('/targets/{id}', [TargetController::class, 'destroy']);
    Route::get('/targets/progress', [TargetController::class, 'progress']);
    
    Route::get('/member-targets', [MemberTargetController::class, 'index']);
    Route::post('/member-targets', [MemberTargetController::class, 'store']);
    
    Route::get('/messages', [MessageController::class, 'index']);
    Route::post('/messages', [MessageController::class, 'store']);
    Route::post('/messages/broadcast', [MessageController::class, 'broadcast']);
    Route::post('/messages/advice', [MessageController::class, 'advice']);
    Route::post('/messages/reply', [MessageController::class, 'reply']);
    Route::post('/messages/{id}/read', [MessageController::class, 'markRead']);
    Route::delete('/messages/{id}', [MessageController::class, 'destroy']);
    
    Route::get('/backups', [BackupController::class, 'index']);
    Route::post('/backups', [BackupController::class, 'store']);
    Route::get('/backups/{id}/download', [BackupController::class, 'download']);
    Route::delete('/backups/{id}', [BackupController::class, 'destroy']);
    
    Route::get('/audit-logs', [AuditLogController::class, 'index']);
    Route::get('/audit-logs/actions', [AuditLogController::class, 'actions']);
    
    Route::get('/broadcasts', [BroadcastController::class, 'index']);
    Route::post('/broadcasts', [BroadcastController::class, 'store']);
    Route::post('/faculty/broadcast', [BroadcastController::class, 'facultyBroadcast']);
    Route::delete('/broadcasts/{id}', [BroadcastController::class, 'destroy']);
    Route::get('/broadcasts/stats', [BroadcastController::class, 'stats']);
});

Route::get('/faculties', function () {
    return \App\Models\Faculty::all();
});

Route::get('/public/member/{id}', [UserController::class, 'publicProfile']);
