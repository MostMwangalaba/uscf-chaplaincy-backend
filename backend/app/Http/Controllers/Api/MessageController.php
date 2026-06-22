<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Message;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MessageController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'super_admin' || $user->role === 'faculty_admin') {
            $messages = Message::with(['user', 'faculty', 'replies.user'])
                ->orderBy('created_at', 'asc')
                ->get();
        } else {
            $messages = Message::where(function ($q) use ($user) {
                $q->where('type', 'broadcast')
                  ->where(function ($q2) use ($user) {
                      $q2->where('faculty_id', $user->faculty_id)
                         ->orWhereNull('faculty_id');
                  });
            })->orWhere(function ($q) use ($user) {
                $q->where('type', 'advice')
                  ->where('user_id', $user->id);
            })->orWhere(function ($q) use ($user) {
                $q->where('type', 'reply')
                  ->whereHas('parent', function ($pq) use ($user) {
                      $pq->where('user_id', $user->id);
                  });
            })->orWhere(function ($q) use ($user) {
                $q->where('type', 'message')
                  ->where('user_id', $user->id);
            })->with(['user', 'faculty', 'replies.user'])
            ->orderBy('created_at', 'asc')->get();
        }

        return response()->json($messages);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if (!in_array($user->role, ['faculty_admin', 'super_admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $messageText = $request->input('message') ?? $request->get('message');
        $hasFile = $request->hasFile('file');

        if (empty($messageText) && !$hasFile) {
            return response()->json(['message' => 'Message or file is required'], 422);
        }

        $messageData = [
            'user_id' => $user->id,
            'message' => $messageText ?? '',
            'type' => 'message',
            'faculty_id' => $user->role === 'faculty_admin' ? $user->faculty_id : null,
            'parent_id' => null,
        ];

        if ($hasFile) {
            $file = $request->file('file');
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('messages', $filename, 'public');
            $messageData['file_path'] = $path;
            $messageData['file_type'] = $file->getClientMimeType();
        }

        $message = Message::create($messageData);
        return response()->json(['message' => 'Message sent', 'data' => $message->load('user')], 201);
    }

    public function broadcast(Request $request)
    {
        $user = $request->user();
        if (!in_array($user->role, ['faculty_admin', 'super_admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'message' => 'required|string|max:5000',
            'file' => 'nullable|file|max:5120|mimes:jpg,jpeg,png,pdf',
        ]);

        $messageData = [
            'user_id' => $user->id,
            'message' => $validated['message'],
            'type' => 'broadcast',
            'faculty_id' => $user->role === 'faculty_admin' ? $user->faculty_id : null,
        ];

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('messages', $filename, 'public');
            $messageData['file_path'] = $path;
            $messageData['file_type'] = $file->getClientMimeType();
        }

        $message = Message::create($messageData);
        return response()->json(['message' => 'Broadcast sent', 'data' => $message->load('user')], 201);
    }

    public function advice(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'member') {
            return response()->json(['message' => 'Only members can send advice'], 403);
        }

        $validated = $request->validate([
            'message' => 'required|string|max:5000',
            'file' => 'nullable|file|max:5120|mimes:jpg,jpeg,png,pdf',
        ]);

        $messageData = [
            'user_id' => $user->id,
            'message' => $validated['message'],
            'type' => 'advice',
            'faculty_id' => $user->faculty_id,
        ];

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('messages', $filename, 'public');
            $messageData['file_path'] = $path;
            $messageData['file_type'] = $file->getClientMimeType();
        }

        $message = Message::create($messageData);
        return response()->json(['message' => 'Advice sent', 'data' => $message->load('user')], 201);
    }

    public function reply(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'faculty_admin') {
            return response()->json(['message' => 'Only faculty admin can reply'], 403);
        }

        $validated = $request->validate([
            'parent_id' => 'required|exists:messages,id',
            'message' => 'required|string|max:5000',
            'file' => 'nullable|file|max:5120|mimes:jpg,jpeg,png,pdf',
        ]);

        $parent = Message::findOrFail($validated['parent_id']);
        if ($parent->faculty_id != $user->faculty_id && $parent->type !== 'advice') {
            return response()->json(['message' => 'You can only reply to advice messages from your faculty'], 403);
        }

        $messageData = [
            'user_id' => $user->id,
            'message' => $validated['message'],
            'type' => 'reply',
            'faculty_id' => $user->faculty_id,
            'parent_id' => $validated['parent_id'],
        ];

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('messages', $filename, 'public');
            $messageData['file_path'] = $path;
            $messageData['file_type'] = $file->getClientMimeType();
        }

        $message = Message::create($messageData);
        return response()->json(['message' => 'Reply sent', 'data' => $message->load('user')], 201);
    }

    public function markRead(Request $request, $id)
    {
        $user = $request->user();
        $message = Message::findOrFail($id);

        if ($message->type === 'broadcast' && $message->faculty_id !== null && $message->faculty_id != $user->faculty_id && $message->user_id != $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        if ($message->type === 'advice' && $message->user_id != $user->id && $user->role !== 'faculty_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        if ($message->type === 'message' && $message->user_id != $user->id && $user->role !== 'super_admin' && $message->faculty_id != $user->faculty_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $message->read_at = now();
        $message->save();
        return response()->json(['message' => 'Message marked as read']);
    }

    public function destroy(Request $request, $id)
    {
        $message = Message::findOrFail($id);
        if ($request->user()->id !== $message->user_id && $request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        if ($message->file_path) {
            Storage::disk('public')->delete($message->file_path);
        }
        $message->delete();
        return response()->json(['message' => 'Message deleted']);
    }
}
