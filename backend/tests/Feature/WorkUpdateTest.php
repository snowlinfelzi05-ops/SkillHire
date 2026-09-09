<?php

namespace Tests\Feature;

use App\Models\Job;
use App\Models\Project;
use App\Models\Proposal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WorkUpdateTest extends TestCase
{
    use RefreshDatabase;

    private function makeProject(): array
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
            'status' => 'active',
            'payment_status' => 'pending',
            'start_date' => now(),
        ]);

        return [$project, $client, $freelancer];
    }

    public function test_only_freelancer_can_add_work_update(): void
    {
        [$project, $client] = $this->makeProject();
        $token = $client->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/projects/{$project->id}/work-updates", [
                'message' => 'Progress update',
            ]);

        $response->assertStatus(403)
            ->assertJson(['message' => 'Unauthorized. Only the freelancer can add work updates.']);
    }

    public function test_freelancer_can_add_work_update(): void
    {
        [$project, , $freelancer] = $this->makeProject();
        $token = $freelancer->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/projects/{$project->id}/work-updates", [
                'message' => 'Completed the landing page',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('update.user_id', $freelancer->id);

        $this->assertDatabaseHas('work_updates', [
            'project_id' => $project->id,
            'message' => 'Completed the landing page',
        ]);
    }

    public function test_cannot_add_update_to_closed_project(): void
    {
        [$project, , $freelancer] = $this->makeProject();
        $project->update(['status' => 'completed']);
        $token = $freelancer->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/projects/{$project->id}/work-updates", [
                'message' => 'Too late update',
            ]);

        $response->assertStatus(400)
            ->assertJson(['message' => 'Cannot add updates to a closed project.']);
    }
}
