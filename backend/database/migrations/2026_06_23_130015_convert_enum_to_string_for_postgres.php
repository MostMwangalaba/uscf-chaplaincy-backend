<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Users table: role column
        if (Schema::hasTable('users') && Schema::hasColumn('users', 'role')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('role')->default('member')->change();
            });
        }

        // Broadcasts table: type column
        if (Schema::hasTable('broadcasts') && Schema::hasColumn('broadcasts', 'type')) {
            Schema::table('broadcasts', function (Blueprint $table) {
                $table->string('type')->default('sms')->change();
            });
        }

        // Messages table: type column
        if (Schema::hasTable('messages') && Schema::hasColumn('messages', 'type')) {
            Schema::table('messages', function (Blueprint $table) {
                $table->string('type')->default('message')->change();
            });
        }
    }

    public function down(): void
    {
        // We don't need to revert as we are moving to PostgreSQL
    }
};
