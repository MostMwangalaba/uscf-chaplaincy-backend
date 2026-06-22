<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE messages MODIFY type ENUM('broadcast', 'advice', 'reply', 'message') DEFAULT 'message'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE messages MODIFY type ENUM('broadcast', 'advice', 'reply') DEFAULT 'advice'");
    }
};
