<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Target;
use App\Models\Contribution;
use App\Models\Faculty;

class TargetController extends Controller
{
    public function index(Request $request)
    {
        if (!in_array($request->user()->role, ['super_admin', 'faculty_admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        if ($request->user()->role === 'faculty_admin') {
            return Target::where('faculty_id', $request->user()->faculty_id)->with('faculty')->get();
        }
        return Target::with('faculty')->get();
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'year' => 'required|integer|min:2000|max:2100',
            'faculty_id' => 'nullable|exists:faculties,id',
            'target_amount' => 'required|numeric|min:0',
        ]);

        $target = Target::create($validated);
        return response()->json(['message' => 'Target created', 'target' => $target], 201);
    }

    public function update(Request $request, $id)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $target = Target::findOrFail($id);
        $validated = $request->validate([
            'year' => 'sometimes|integer|min:2000|max:2100',
            'faculty_id' => 'nullable|exists:faculties,id',
            'target_amount' => 'sometimes|numeric|min:0',
        ]);
        $target->update($validated);
        return response()->json(['message' => 'Target updated', 'target' => $target]);
    }

    public function destroy(Request $request, $id)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $target = Target::findOrFail($id);
        $target->delete();
        return response()->json(['message' => 'Target deleted']);
    }

    public function progress(Request $request)
    {
        $user = $request->user();
        $year = $request->get('year', date('Y'));

        // Check authorization
        if (!in_array($user->role, ['super_admin', 'faculty_admin', 'member'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Overall target: only the one with faculty_id = null (global)
        $overallTarget = Target::where('year', $year)->whereNull('faculty_id')->first();
        $overallTargetAmount = $overallTarget ? (float) $overallTarget->target_amount : 0;
        $totalRaised = Contribution::whereYear('contribution_date', $year)->sum('amount');
        $overallRaised = (float) $totalRaised;
        $overallPercentage = $overallTargetAmount > 0 ? round(($overallRaised / $overallTargetAmount) * 100, 2) : 0;

        $overall = [
            'target' => $overallTargetAmount,
            'raised' => $overallRaised,
            'percentage' => $overallPercentage,
        ];

        // Faculty targets: all targets with faculty_id not null
        $facultyTargets = Target::where('year', $year)->whereNotNull('faculty_id')->with('faculty')->get();
        $progress = [];

        foreach ($facultyTargets as $target) {
            $query = Contribution::whereYear('contribution_date', $year);
            if ($target->faculty_id) {
                $query->where('faculty_id', $target->faculty_id);
            }
            $raised = $query->sum('amount');
            $percentage = $target->target_amount > 0 ? round(($raised / $target->target_amount) * 100, 2) : 0;
            $progress[] = [
                'target' => $target,
                'raised' => (float) $raised,
                'percentage' => $percentage,
            ];
        }

        return response()->json([
            'year' => $year,
            'overall' => $overall,
            'progress' => $progress,
        ]);
    }
}
