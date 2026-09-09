<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // add columns directly, guarding for already existing ones
            if (! Schema::hasColumn('users', 'headline')) {
                $table->string('headline')->nullable();
            }
            if (! Schema::hasColumn('users', 'bio')) {
                $table->text('bio')->nullable();
            }
            if (! Schema::hasColumn('users', 'skills')) {
                $table->json('skills')->nullable();
            }
            if (! Schema::hasColumn('users', 'experience')) {
                $table->string('experience')->nullable();
            }
            if (! Schema::hasColumn('users', 'portfolio_url')) {
                $table->string('portfolio_url')->nullable();
            }
            if (! Schema::hasColumn('users', 'user_type')) {
                $table->string('user_type')->nullable();
            }
            if (! Schema::hasColumn('users', 'role')) {
                $table->string('role')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // no-op rollback to keep the schema intact
        });
    }
};
