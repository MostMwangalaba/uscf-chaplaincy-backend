<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Broadcast extends Model
{
    use HasFactory;

    protected $fillable = [
        'subject',
        'message',
        'type',
        'recipients',
        'sent_by',
        'faculty_id',
        'sent_at',
    ];

    protected $casts = [
        'recipients' => 'array',
        'sent_at' => 'datetime',
    ];

    public function sender()
    {
        return $this->belongsTo(User::class, 'sent_by');
    }

    public function faculty()
    {
        return $this->belongsTo(Faculty::class);
    }
}
