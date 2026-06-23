<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

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
        usort($backups, fn($a, $b) => $b['created_at'] - $a['created_at']);
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

        // Get all table names
        $tables = Schema::getTableListing();
        $data = [];

        foreach ($tables as $table) {
            $rows = DB::table($table)->get();
            $data[$table] = $rows;
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
            ->header('Content-Disposition', "attachment; filename={$id}");
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
