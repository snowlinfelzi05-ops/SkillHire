<?php

namespace Database\Factories;

use App\Models\Job;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Job>
 */
class JobFactory extends Factory
{
    protected $model = Job::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'title' => fake()->jobTitle(),
            'description' => fake()->paragraph(),
            'category' => fake()->randomElement([
                'Web Development',
                'Backend Development',
                'Design',
                'Mobile Development',
            ]),
            'budget' => fake()->numberBetween(1000, 50000),
            'location' => null,
            'status' => 'open',
            'skills' => ['React', 'Laravel'],
        ];
    }

    public function closed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'closed',
        ]);
    }
}
