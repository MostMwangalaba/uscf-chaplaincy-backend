<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contributions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('recorded_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('faculty_id')->constrained('faculties')->onDelete('cascade');
            $table->decimal('amount', 15, 2);
            $table->date('contribution_date')->nullable();
            $table->string('description')->nullable();
            $table->timestamps();

            $table->index(['member_id', 'contribution_date']);
            $table->index(['faculty_id', 'contribution_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contributions');
    }
};
