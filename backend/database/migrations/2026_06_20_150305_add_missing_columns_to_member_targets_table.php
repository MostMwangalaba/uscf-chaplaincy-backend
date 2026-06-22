<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('member_targets', function (Blueprint $table) {
            if (!Schema::hasColumn('member_targets', 'faculty_id')) {
                $table->foreignId('faculty_id')->after('id')->constrained('faculties')->onDelete('cascade');
            }
            if (!Schema::hasColumn('member_targets', 'year')) {
                $table->year('year')->after('faculty_id');
            }
            if (!Schema::hasColumn('member_targets', 'target_amount')) {
                $table->decimal('target_amount', 15, 2)->after('year');
            }
        });
    }

    public function down(): void
    {
        Schema::table('member_targets', function (Blueprint $table) {
            $table->dropColumn(['faculty_id', 'year', 'target_amount']);
        });
    }
};
