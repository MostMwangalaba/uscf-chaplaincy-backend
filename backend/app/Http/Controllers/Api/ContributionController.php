<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Contribution;
use Illuminate\Validation\ValidationException;

class ContributionController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();
        if (!in_array($user->role, ['faculty_admin', 'super_admin'])) {
            throw ValidationException::withMessages([
                'role' => ['You are not authorized to record contributions.'],
            ]);
        }

        $validated = $request->validate([
            'member_id' => 'required|exists:users,id',
            'amount' => 'required|numeric|min:1',
            'contribution_date' => 'nullable|date',
            'description' => 'nullable|string|max:255',
        ]);

        $member = User::findOrFail($validated['member_id']);

        $contribution = Contribution::create([
            'member_id' => $member->id,
            'recorded_by' => $user->id,
            'faculty_id' => $member->faculty_id,
            'amount' => $validated['amount'],
            'contribution_date' => $validated['contribution_date'] ?? now()->toDateString(),
            'description' => $validated['description'] ?? null,
        ]);

        return response()->json([
            'message' => 'Contribution recorded successfully',
            'contribution' => $contribution,
            'member' => $member,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();
        $contribution = Contribution::findOrFail($id);
        if (!in_array($user->role, ['faculty_admin', 'super_admin']) || $user->faculty_id !== $contribution->faculty_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'amount' => 'sometimes|numeric|min:1',
            'contribution_date' => 'nullable|date',
            'description' => 'nullable|string|max:255',
        ]);

        $contribution->update($validated);
        return response()->json(['message' => 'Contribution updated', 'contribution' => $contribution]);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $contribution = Contribution::findOrFail($id);
        if (!in_array($user->role, ['faculty_admin', 'super_admin']) || $user->faculty_id !== $contribution->faculty_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $contribution->delete();
        return response()->json(['message' => 'Contribution deleted']);
    }

    public function index(Request $request)
    {
        $user = $request->user();
        if ($user->role === 'super_admin') {
            $contributions = Contribution::with(['member', 'recorder'])->get();
        } elseif ($user->role === 'faculty_admin') {
            $contributions = Contribution::where('faculty_id', $user->faculty_id)
                ->with(['member', 'recorder'])
                ->get();
        } else {
            // member
            $contributions = Contribution::where('member_id', $user->id)
                ->with(['member', 'recorder'])
                ->get();
        }
        return response()->json($contributions);
    }

    public function total(Request $request)
    {
        $user = $request->user();
        if ($user->role === 'super_admin') {
            $total = Contribution::sum('amount');
        } elseif ($user->role === 'faculty_admin') {
            $total = Contribution::where('faculty_id', $user->faculty_id)->sum('amount');
        } else {
            $total = Contribution::where('member_id', $user->id)->sum('amount');
        }
        return response()->json(['total' => (float) $total]);
    }
}
