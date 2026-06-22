<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // For MySQL, we need to modify the ENUM column
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('member', 'leader', 'admin', 'faculty_admin', 'super_admin') DEFAULT 'member'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('member', 'leader', 'admin') DEFAULT 'member'");
    }
};
