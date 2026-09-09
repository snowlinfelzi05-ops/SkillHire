<?php

namespace Tests\Feature;

use App\Models\Job;
use App\Models\Project;
use App\Models\Proposal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReviewTest extends TestCase
{
    use RefreshDatabase;

    private function makeCompletedProject(): array
    {
        $client = User::factory()->create(['role' => 'client']);
        $freelancer = User::factory()->create(['role' => 'freelancer']);
        $job = Job::factory()->create(['user_id' => $client->id, 'status' => 'closed']);
        $proposal = Proposal::factory()->create([
            'job_id' => $job->id,
            'user_id' => $freelancer->id,
            'status' => 'accepted',
        ]);
        $project = Project::create([
            'job_id' => $job->id,
            'client_id' => $client->id,
            'freelancer_id' => $freelancer->id,
            'proposal_id' => $proposal->id,
            'budget' => 10000,
            'status' => 'completed',
            'payment_status' => 'paid',
            'start_date' => now(),
        ]);

        return [$project, $client, $freelancer];
    }

    public function test_client_can_review_freelancer(): void
    {
        [$project, $client] = $this->makeCompletedProject();
        $token = $client->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/projects/{$project->id}/reviews", [
                'rating' => 5,
                'comment' => 'Great work!',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('review.reviewer_id', $client->id);
    }

    public function test_review_rejected_when_project_not_completed(): void
    {
        [$project, $client] = $this->makeCompletedProject();
        $project->update(['status' => 'active']);
        $token = $client->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/projects/{$project->id}/reviews", [
                'rating' => 5,
            ]);

        $response->assertStatus(400)
            ->assertJson(['message' => 'Reviews can only be added after project completion.']);
    }

    public function test_rating_must_be_between_1_and_5(): void
    {
        [$project, $client] = $this->makeCompletedProject();
        $token = $client->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/projects/{$project->id}/reviews", [
                'rating' => 6,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('rating');
    }

    public function test_user_cannot_review_twice(): void
    {
        [$project, $client] = $this->makeCompletedProject();
        $token = $client->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/projects/{$project->id}/reviews", [
                'rating' => 5,
            ]);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/projects/{$project->id}/reviews", [
                'rating' => 4,
            ]);

        $response->assertStatus(400)
            ->assertJson(['message' => 'You have already reviewed this user.']);
    }
}
