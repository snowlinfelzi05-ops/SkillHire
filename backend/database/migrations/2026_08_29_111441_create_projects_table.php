
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
        Schema::create('projects', function (Blueprint $table) {
            $table->id();

            $table->foreignId('job_id')
                ->constrained('jobs')
                ->onDelete('cascade');

            $table->foreignId('client_id')
                ->constrained('users')
                ->onDelete('cascade');

            $table->foreignId('freelancer_id')
                ->constrained('users')
                ->onDelete('cascade');

            $table->foreignId('proposal_id')
                ->constrained('proposals')
                ->onDelete('cascade');

            $table->decimal('budget', 10, 2);

            $table->enum('status', [
                'active',
                'completed',
                'cancelled',
            ])->default('active');

            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
