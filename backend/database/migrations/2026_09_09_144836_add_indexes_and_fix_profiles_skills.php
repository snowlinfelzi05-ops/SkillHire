<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('jobs', function (Blueprint $table) {
            $table->index('status');
            $table->index('category');
        });

        Schema::table('proposals', function (Blueprint $table) {
            $table->index('status');
            $table->index(['job_id', 'user_id']);
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->index(['client_id', 'freelancer_id']);
            $table->index('status');
            $table->index('payment_status');
        });

        Schema::table('profiles', function (Blueprint $table) {
            if (Schema::hasColumn('profiles', 'skills')) {
                $table->json('skills')->nullable()->change();
            }
        });
    }

    public function down(): void
    {
        Schema::table('jobs', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['category']);
        });

        Schema::table('proposals', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['job_id', 'user_id']);
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->dropIndex(['client_id', 'freelancer_id']);
            $table->dropIndex(['status']);
            $table->dropIndex(['payment_status']);
        });
    }
};
