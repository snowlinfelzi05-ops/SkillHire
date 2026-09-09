<?php

namespace Database\Seeders;

use App\Models\Job;
use App\Models\Proposal;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProjectSeeder extends Seeder
{
    public function run(): void
    {
        $proposals = Proposal::with('job')->get();

        if ($proposals->isEmpty()) {
            echo "No proposals found\n";

            return;
        }

        $users = User::all();
        if ($users->count() < 2) {
            echo "Not enough users\n";

            return;
        }

        foreach ($proposals->take(5) as $proposal) {
            $job = $proposal->job ?? Job::find($proposal->job_id);

            $clientId = $job ? $job->user_id : $users->random()->id;

            // pick another user if the freelancer is missing
            $freelancerId = $proposal->user_id;
            if (! $freelancerId) {
                $freelancerId = $users->where('id', '!=', $clientId)->first()->id ?? $users->random()->id;
            }

            DB::table('projects')->insert([
                'proposal_id' => $proposal->id,
                'job_id' => $proposal->job_id,
                'client_id' => $clientId,
                'freelancer_id' => $freelancerId,
                'budget' => rand(8000, 35000),
                'status' => collect(['active', 'completed', 'cancelled'])->random(),
                'start_date' => now()->subDays(rand(1, 15)),
                'end_date' => now()->addDays(rand(15, 45)),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        echo "5 Projects Added\n";
    }
}
