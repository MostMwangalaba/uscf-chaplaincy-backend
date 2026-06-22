<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('targets', function (Blueprint $table) {
            if (!Schema::hasColumn('targets', 'year')) {
                $table->year('year')->after('id')->nullable();
            }
            if (!Schema::hasColumn('targets', 'faculty_id')) {
                $table->foreignId('faculty_id')->nullable()->after('year')->constrained('faculties')->onDelete('cascade');
            }
            if (!Schema::hasColumn('targets', 'target_amount')) {
                $table->decimal('target_amount', 15, 2)->after('faculty_id')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('targets', function (Blueprint $table) {
            $table->dropColumn(['year', 'faculty_id', 'target_amount']);
        });
    }
};
