<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('broadcasts', function (Blueprint $table) {
            if (!Schema::hasColumn('broadcasts', 'subject')) {
                $table->string('subject')->after('id')->nullable();
            }
            if (!Schema::hasColumn('broadcasts', 'message')) {
                $table->text('message')->after('subject');
            }
            if (!Schema::hasColumn('broadcasts', 'type')) {
                $table->string('type')->after('message')->default('sms'); // sms, email, both
            }
            if (!Schema::hasColumn('broadcasts', 'recipients')) {
                $table->json('recipients')->after('type')->nullable();
            }
            if (!Schema::hasColumn('broadcasts', 'sent_by')) {
                $table->foreignId('sent_by')->after('recipients')->constrained('users')->onDelete('cascade');
            }
            if (!Schema::hasColumn('broadcasts', 'faculty_id')) {
                $table->foreignId('faculty_id')->nullable()->after('sent_by')->constrained('faculties')->onDelete('set null');
            }
            if (!Schema::hasColumn('broadcasts', 'sent_at')) {
                $table->timestamp('sent_at')->after('faculty_id')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('broadcasts', function (Blueprint $table) {
            $table->dropColumn(['subject', 'message', 'type', 'recipients', 'sent_by', 'faculty_id', 'sent_at']);
        });
    }
};
