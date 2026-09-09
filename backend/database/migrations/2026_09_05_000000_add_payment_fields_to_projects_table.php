<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            if (! Schema::hasColumn('projects', 'payment_status')) {
                $table->enum('payment_status', ['pending', 'paid'])->default('pending');
            }
            if (! Schema::hasColumn('projects', 'payment_amount')) {
                $table->decimal('payment_amount', 10, 2)->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn(['payment_status', 'payment_amount']);
        });
    }
};
