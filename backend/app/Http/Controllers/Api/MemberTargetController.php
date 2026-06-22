<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\MemberTarget;
use App\Models\Faculty;

class MemberTargetController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $request->validate([
            'year' => 'required|integer|min:2000',
        ]);

        if ($user->role === 'super_admin') {
            $facultyId = $request->get('faculty_id');
            if (!$facultyId) {
                return response()->json(['message' => 'faculty_id is required for super_admin'], 422);
            }
        } else {
            // faculty_admin or member: use their own faculty_id
            $facultyId = $user->faculty_id;
        }

        $target = MemberTarget::where('faculty_id', $facultyId)
                              ->where('year', $request->year)
                              ->first();

        return response()->json($target);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if (!in_array($user->role, ['super_admin', 'faculty_admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'faculty_id' => 'required|exists:faculties,id',
            'year' => 'required|integer|min:2000|max:2100',
            'target_amount' => 'required|numeric|min:0',
        ]);

        if ($user->role === 'faculty_admin' && $user->faculty_id != $validated['faculty_id']) {
            return response()->json(['message' => 'You can only set targets for your own faculty'], 403);
        }

        $target = MemberTarget::updateOrCreate(
            [
                'faculty_id' => $validated['faculty_id'],
                'year' => $validated['year'],
            ],
            [
                'target_amount' => $validated['target_amount'],
            ]
        );

        return response()->json([
            'message' => 'Member target saved successfully',
            'target' => $target
        ], 201);
    }
}
