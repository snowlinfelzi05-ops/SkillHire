<?php

namespace Tests\Feature;

use App\Models\Job;
use App\Models\Project;
use App\Models\Proposal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectTest extends TestCase
{
    use RefreshDatabase;

    private function makeProject(array $overrides = []): Project
    {
        $client = User::factory()->create(['role' => 'client']);
        $freelancer = User::factory()->create(['role' => 'freelancer']);
        $job = Job::factory()->create(['user_id' => $client->id, 'status' => 'closed']);
        $proposal = Proposal::factory()->create([
            'job_id' => $job->id,
            'user_id' => $freelancer->id,
            'status' => 'accepted',
            'proposed_budget' => 8000,
        ]);

        return Project::create(array_merge([
            'job_id' => $job->id,
            'client_id' => $client->id,
            'freelancer_id' => $freelancer->id,
            'proposal_id' => $proposal->id,
            'budget' => 8000,
            'status' => 'active',
            'payment_status' => 'pending',
            'start_date' => now(),
        ], $overrides));
    }

    public function test_project_is_visible_to_its_participants(): void
    {
        $project = $this->makeProject();
        $freelancer = User::find($project->freelancer_id);
        $token = $freelancer->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/projects/{$project->id}");

        $response->assertStatus(200)
            ->assertJsonPath('project.id', $project->id);
    }

    public function test_project_hidden_from_non_participants(): void
    {
        $project = $this->makeProject();
        $outsider = User::factory()->create(['role' => 'freelancer']);
        $token = $outsider->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/projects/{$project->id}");

        $response->assertStatus(403);
    }

    public function test_client_can_complete_project(): void
    {
        $project = $this->makeProject();
        $client = User::find($project->client_id);
        $token = $client->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/projects/{$project->id}/status", [
                'status' => 'completed',
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('projects', [
            'id' => $project->id,
            'status' => 'completed',
        ]);
    }

    public function test_completed_project_cannot_be_changed(): void
    {
        $project = $this->makeProject(['status' => 'completed']);
        $client = User::find($project->client_id);
        $token = $client->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/projects/{$project->id}/status", [
                'status' => 'cancelled',
            ]);

        $response->assertStatus(400)
            ->assertJson(['message' => 'This project has already been closed.']);
    }

    public function test_client_can_pay_for_completed_project(): void
    {
        $project = $this->makeProject([
            'status' => 'completed',
            'payment_status' => 'pending',
        ]);
        $client = User::find($project->client_id);
        $token = $client->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/projects/{$project->id}/pay");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Payment successful'])
            ->assertJsonPath('project.payment_status', 'paid');

        $this->assertDatabaseHas('projects', [
            'id' => $project->id,
            'payment_status' => 'paid',
        ]);
    }

    public function test_unofficial_parties_cannot_pay(): void
    {
        $project = $this->makeProject([
            'status' => 'completed',
            'payment_status' => 'pending',
        ]);
        $freelancer = User::find($project->freelancer_id);
        $token = $freelancer->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/projects/{$project->id}/pay");

        $response->assertStatus(403)
            ->assertJson(['message' => 'Only client can pay']);
    }
}
