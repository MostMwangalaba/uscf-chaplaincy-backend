<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            if (!Schema::hasColumn('messages', 'type')) {
                $table->enum('type', ['broadcast', 'advice'])->default('advice')->after('message');
            }
            if (!Schema::hasColumn('messages', 'faculty_id')) {
                $table->foreignId('faculty_id')->nullable()->after('type')->constrained('faculties')->onDelete('set null');
            }
        });
    }

    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropColumn(['type', 'faculty_id']);
        });
    }
};
