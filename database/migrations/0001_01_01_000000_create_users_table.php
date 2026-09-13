<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enum\RolesEnum;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();

            // Primary user type for the church system
            $table->enum('primary_role', [
                'individual', 'sunday_school_teacher', 'super_admin', 'admin'
            ])->default('individual');

            // Basic profile information
            $table->string('sector')->nullable();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->enum('education_level', [
                'primary', 'secondary', 'diploma', 'bachelors', 'masters', 'phd'
            ])->nullable();
            $table->json('skills_of_interest')->nullable();
            $table->string('state')->nullable();
            $table->string('lga')->nullable();
            $table->string('nin')->nullable(); // National ID
            $table->string('passport_number')->nullable();

            // Registration and verification
            $table->enum('registration_status', [
                'pending', 'verified', 'suspended', 'rejected'
            ])->default('pending');
            $table->timestamp('verified_at')->nullable();
            $table->string('verification_documents')->nullable(); // JSON path to documents

            // Community and engagement
            $table->integer('community_rank')->default(0);
            $table->json('active_roles')->nullable(); // Track multiple roles user has access to

            // System fields
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });

        // Add indices for performance
        Schema::table('users', function (Blueprint $table) {
            $table->index('primary_role');
            $table->index('registration_status');
            $table->index('sector');
            $table->index(['state', 'lga']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
