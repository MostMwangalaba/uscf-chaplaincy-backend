<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Broadcast;
use App\Models\Message;
use App\Models\User;
use App\Models\Faculty;
use Illuminate\Support\Facades\Log;

class BroadcastController extends Controller
{
    public function index(Request $request)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        return Broadcast::with('sender', 'faculty')->orderBy('created_at', 'desc')->get();
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'type' => 'required|in:sms,email,both',
            'recipients' => 'required|in:all,faculty',
            'faculty_id' => 'nullable|exists:faculties,id',
        ]);

        $recipients = [];
        if ($validated['recipients'] === 'all') {
            $users = User::where('is_active', true)->get();
            $recipients = $users->pluck('id')->toArray();
        } elseif ($validated['recipients'] === 'faculty' && $validated['faculty_id']) {
            $users = User::where('faculty_id', $validated['faculty_id'])->where('is_active', true)->get();
            $recipients = $users->pluck('id')->toArray();
        } else {
            return response()->json(['message' => 'Invalid recipients'], 422);
        }

        // Store in broadcasts table
        $broadcast = Broadcast::create([
            'subject' => $validated['subject'],
            'message' => $validated['message'],
            'type' => $validated['type'],
            'recipients' => $recipients,
            'sent_by' => $request->user()->id,
            'faculty_id' => $validated['recipients'] === 'faculty' ? $validated['faculty_id'] : null,
            'sent_at' => now(),
        ]);

        // Also store in messages table so members see it in announcements
        $messageData = [
            'user_id' => $request->user()->id,
            'message' => $validated['message'],
            'type' => 'broadcast',
            'faculty_id' => $validated['recipients'] === 'faculty' ? $validated['faculty_id'] : null,
        ];
        $message = Message::create($messageData);

        // Log SMS/email sending (placeholder)
        Log::info("Broadcast sent: {$validated['subject']} to " . count($recipients) . " recipients");

        // Here you would integrate with Africa's Talking or Mailgun
        // For now, just log the recipients
        Log::info("Recipients: " . implode(',', $recipients));

        return response()->json([
            'message' => 'Broadcast sent successfully',
            'broadcast' => $broadcast,
            'message_record' => $message,
        ], 201);
    }

    public function show(Request $request, $id)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        return Broadcast::with('sender')->findOrFail($id);
    }

    public function destroy(Request $request, $id)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $broadcast = Broadcast::findOrFail($id);
        // Also delete related message record (optional)
        Message::where('type', 'broadcast')
               ->where('message', $broadcast->message)
               ->where('user_id', $broadcast->sent_by)
               ->delete();
        $broadcast->delete();
        return response()->json(['message' => 'Broadcast deleted']);
    }

    public function stats(Request $request)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $total = Broadcast::count();
        $sms = Broadcast::where('type', 'sms')->orWhere('type', 'both')->count();
        $email = Broadcast::where('type', 'email')->orWhere('type', 'both')->count();

        return response()->json([
            'total' => $total,
            'sms' => $sms,
            'email' => $email,
        ]);
    }

    // Faculty Admin broadcast
    public function facultyBroadcast(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'faculty_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'type' => 'required|in:sms,email,both',
        ]);

        $members = User::where('faculty_id', $user->faculty_id)
                       ->where('is_active', true)
                       ->get();

        if ($members->isEmpty()) {
            return response()->json(['message' => 'No active members in your faculty'], 422);
        }

        $recipients = $members->pluck('id')->toArray();

        // Store in broadcasts table
        $broadcast = Broadcast::create([
            'subject' => $validated['subject'],
            'message' => $validated['message'],
            'type' => $validated['type'],
            'recipients' => $recipients,
            'sent_by' => $user->id,
            'faculty_id' => $user->faculty_id,
            'sent_at' => now(),
        ]);

        // Also store in messages table for the announcements page
        $messageData = [
            'user_id' => $user->id,
            'message' => $validated['message'],
            'type' => 'broadcast',
            'faculty_id' => $user->faculty_id,
        ];
        $message = Message::create($messageData);

        Log::info("Faculty Broadcast sent to " . count($recipients) . " members of faculty " . $user->faculty_id);
        Log::info("Recipients: " . implode(',', $recipients));

        return response()->json([
            'message' => 'Broadcast sent to your faculty members successfully',
            'broadcast' => $broadcast,
            'message_record' => $message,
        ], 201);
    }
}
