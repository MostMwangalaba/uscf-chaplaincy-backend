<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Faculty;
use App\Models\Contribution;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserController extends Controller
{
    public function index(Request $request)
    {
        if ($request->user()->role === 'super_admin') {
            return User::with('faculty')->get();
        }
        if ($request->user()->role === 'faculty_admin') {
            return User::where('faculty_id', $request->user()->faculty_id)
                ->with('faculty')
                ->get();
        }
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    public function publicProfile($id)
    {
        $member = User::where('member_id', $id)->orWhere('id', $id)->first();
        if (!$member) {
            return response()->json(['message' => 'Member not found'], 404);
        }
        $contributions = Contribution::where('member_id', $member->id)
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
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|unique:users',
            'mobile' => 'required|string|unique:users',
            'password' => 'required|string|min:6',
            'faculty_id' => 'required|exists:faculties,id',
            'role' => 'required|in:member,leader,faculty_admin,super_admin',
        ]);

        $faculty = Faculty::find($validated['faculty_id']);
        $count = User::where('faculty_id', $validated['faculty_id'])->count() + 1;
        $memberId = 'UDOM-' . strtoupper($faculty->name) . '-' . str_pad($count, 3, '0', STR_PAD_LEFT);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'] ?? null,
            'mobile' => $validated['mobile'],
            'password' => Hash::make($validated['password']),
            'faculty_id' => $validated['faculty_id'],
            'member_id' => $memberId,
            'role' => $validated['role'],
            'is_active' => true,
        ]);

        return response()->json(['message' => 'User created successfully', 'user' => $user], 201);
    }

    public function update(Request $request, $id)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $user = User::findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'mobile' => 'sometimes|string|unique:users,mobile,' . $id,
            'faculty_id' => 'sometimes|exists:faculties,id',
            'role' => 'sometimes|in:member,leader,faculty_admin,super_admin',
        ]);
        $user->update($validated);
        return response()->json(['message' => 'User updated', 'user' => $user]);
    }

    public function updateRole(Request $request, $id)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'role' => 'required|in:member,leader,faculty_admin,super_admin',
        ]);

        $user = User::findOrFail($id);
        $user->role = $request->role;
        $user->save();

        return response()->json(['message' => 'Role updated', 'user' => $user]);
    }

    public function destroy(Request $request, $id)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $user = User::findOrFail($id);
        $user->delete();
        return response()->json(['message' => 'User deleted successfully']);
    }
}
