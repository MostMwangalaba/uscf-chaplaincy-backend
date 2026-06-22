<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Drop the existing ENUM and recreate it with new values
        DB::statement("ALTER TABLE messages MODIFY type ENUM('advice', 'broadcast', 'reply', 'message') DEFAULT 'message'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE messages MODIFY type ENUM('advice', 'broadcast', 'reply') DEFAULT 'advice'");
    }
};
