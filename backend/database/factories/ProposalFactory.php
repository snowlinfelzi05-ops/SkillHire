<?php

namespace Database\Factories;

use App\Models\Job;
use App\Models\Proposal;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Proposal>
 */
class ProposalFactory extends Factory
{
    protected $model = Proposal::class;

    public function definition(): array
    {
        return [
            'job_id' => Job::factory(),
            'user_id' => User::factory(),
            'cover_letter' => fake()->paragraph(),
            'proposed_budget' => fake()->numberBetween(1000, 10000),
            'status' => 'pending',
        ];
    }
}
