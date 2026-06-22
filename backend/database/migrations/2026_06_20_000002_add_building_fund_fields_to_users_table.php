<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('member_id')->unique()->nullable()->after('id');
            $table->string('mobile')->unique()->after('email');
            $table->foreignId('faculty_id')->nullable()->constrained('faculties')->onDelete('set null');
            $table->string('qr_code_url')->nullable();
            $table->boolean('is_active')->default(true);
            $table->enum('role', ['member', 'leader', 'admin'])->default('member')->after('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['member_id', 'mobile', 'faculty_id', 'qr_code_url', 'is_active', 'role']);
        });
    }
};
