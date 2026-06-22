<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BackupController extends Controller
{
    public function index(Request $request)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $files = Storage::disk('local')->files('backups');
        $backups = [];
        foreach ($files as $file) {
            $backups[] = [
                'id' => basename($file),
                'filename' => basename($file),
                'size' => Storage::disk('local')->size($file),
                'created_at' => Storage::disk('local')->lastModified($file),
            ];
        }
        usort($backups, function ($a, $b) {
            return $b['created_at'] - $a['created_at'];
        });

        return response()->json($backups);
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!Storage::disk('local')->exists('backups')) {
            Storage::disk('local')->makeDirectory('backups');
        }

        $tables = DB::select('SHOW TABLES');
        $dbName = env('DB_DATABASE');
        $tableKey = "Tables_in_{$dbName}";
        $data = [];

        foreach ($tables as $table) {
            $tableName = $table->$tableKey;
            $rows = DB::table($tableName)->get();
            $data[$tableName] = $rows;
        }

        $filename = 'backup_' . now()->format('Y-m-d_H-i-s') . '.json';
        Storage::disk('local')->put("backups/{$filename}", json_encode($data, JSON_PRETTY_PRINT));

        return response()->json([
            'message' => 'Backup created successfully',
            'filename' => $filename,
        ], 201);
    }

    public function download(Request $request, $id)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $path = "backups/{$id}";
        if (!Storage::disk('local')->exists($path)) {
            return response()->json(['message' => 'Backup not found'], 404);
        }

        $content = Storage::disk('local')->get($path);
        return response($content, 200)
            ->header('Content-Type', 'application/json')
            ->header('Content-Disposition', "attachment; filename=\"{$id}\"")
            ->header('Cache-Control', 'public, must-revalidate, max-age=0')
            ->header('Pragma', 'public')
            ->header('Expires', 'Sat, 01 Jan 2000 00:00:00 GMT');
    }

    public function destroy(Request $request, $id)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $path = "backups/{$id}";
        if (!Storage::disk('local')->exists($path)) {
            return response()->json(['message' => 'Backup not found'], 404);
        }

        Storage::disk('local')->delete($path);
        return response()->json(['message' => 'Backup deleted']);
    }
}
