<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Only run raw ALTER statements on MySQL (SQLite in-memory used for tests doesn't support MODIFY)
        if (Schema::getConnection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY primary_role ENUM('individual', 'sunday_school_teacher', 'super_admin', 'admin') DEFAULT 'individual'");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Restore to original enum only on MySQL
        if (Schema::getConnection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY primary_role ENUM('individual', 'sunday_school_teacher', 'super_admin', 'admin') DEFAULT 'individual'");
        }
    }
};
