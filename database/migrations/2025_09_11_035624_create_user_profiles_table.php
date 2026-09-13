<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('user_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            $table->string('business_name')->nullable();
            $table->text('description')->nullable();
            $table->string('website')->nullable();
            $table->text('bio')->nullable();
            $table->string('linkedin_profile')->nullable();
            $table->json('skills_of_interest')->nullable();
            $table->string('profession')->nullable();
            $table->string('experience_level')->nullable();
            $table->string('availability')->nullable();

            $table->boolean('profile_complete')->default(false);
            $table->timestamp('profile_completed_at')->nullable();

            $table->timestamps();

            $table->index('profile_complete');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_profiles');
    }
};
