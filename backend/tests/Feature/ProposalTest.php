<?php

namespace Tests\Feature;

use App\Models\Job;
use App\Models\Project;
use App\Models\Proposal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProposalTest extends TestCase
{
    use RefreshDatabase;

    private function makeClient(): User
    {
        return User::factory()->create(['role' => 'client']);
    }

    private function makeFreelancer(): User
    {
        return User::factory()->create([
            'role' => 'freelancer',
            'skills' => ['React', 'Laravel'],
        ]);
    }

    public function test_freelancer_can_submit_a_proposal(): void
    {
        $client = $this->makeClient();
        $freelancer = $this->makeFreelancer();
        $job = Job::factory()->create([
            'user_id' => $client->id,
            'status' => 'open',
        ]);
        $token = $freelancer->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/proposals', [
                'job_id' => $job->id,
                'cover_letter' => 'I can do this job well.',
                'proposed_budget' => 4000,
            ]);

        $response->assertStatus(201)
            ->assertJson(['message' => 'Proposal submitted successfully'])
            ->assertJsonPath('proposal.status', 'pending');

        $this->assertDatabaseHas('proposals', [
            'job_id' => $job->id,
            'user_id' => $freelancer->id,
        ]);
    }

    public function test_freelancer_cannot_apply_twice(): void
    {
        $client = $this->makeClient();
        $freelancer = $this->makeFreelancer();
        $job = Job::factory()->create(['user_id' => $client->id, 'status' => 'open']);
        Proposal::factory()->create([
            'job_id' => $job->id,
            'user_id' => $freelancer->id,
        ]);
        $token = $freelancer->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/proposals', [
                'job_id' => $job->id,
                'cover_letter' => 'Second attempt.',
                'proposed_budget' => 3000,
            ]);

        $response->assertStatus(400)
            ->assertJson(['message' => 'You already applied for this job']);
    }

    public function test_accepting_proposal_creates_project_and_closes_job(): void
    {
        $client = $this->makeClient();
        $freelancer = $this->makeFreelancer();
        $job = Job::factory()->create(['user_id' => $client->id, 'status' => 'open']);
        $proposal = Proposal::factory()->create([
            'job_id' => $job->id,
            'user_id' => $freelancer->id,
            'status' => 'pending',
            'proposed_budget' => 5000,
        ]);
        $token = $client->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/proposals/{$proposal->id}/status", [
                'status' => 'accepted',
            ]);

        $response->assertStatus(200);

        // Proposal accepted
        $this->assertDatabaseHas('proposals', [
            'id' => $proposal->id,
            'status' => 'accepted',
        ]);

        // Job closed
        $this->assertDatabaseHas('jobs', [
            'id' => $job->id,
            'status' => 'closed',
        ]);

        // Project auto-created with the right parties
        $this->assertDatabaseHas('projects', [
            'job_id' => $job->id,
            'client_id' => $client->id,
            'freelancer_id' => $freelancer->id,
            'proposal_id' => $proposal->id,
            'status' => 'active',
        ]);
    }

    public function test_accepting_rejects_other_pending_proposals(): void
    {
        $client = $this->makeClient();
        $freelancerA = $this->makeFreelancer();
        $freelancerB = $this->makeFreelancer();
        $job = Job::factory()->create(['user_id' => $client->id, 'status' => 'open']);

        $accepted = Proposal::factory()->create([
            'job_id' => $job->id,
            'user_id' => $freelancerA->id,
            'status' => 'pending',
        ]);
        $other = Proposal::factory()->create([
            'job_id' => $job->id,
            'user_id' => $freelancerB->id,
            'status' => 'pending',
        ]);
        $token = $client->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/proposals/{$accepted->id}/status", ['status' => 'accepted']);

        $this->assertDatabaseHas('proposals', [
            'id' => $other->id,
            'status' => 'rejected',
        ]);
    }

    public function test_accepting_proposal_creates_notifications(): void
    {
        $client = $this->makeClient();
        $freelancer = $this->makeFreelancer();
        $job = Job::factory()->create(['user_id' => $client->id, 'status' => 'open']);
        $proposal = Proposal::factory()->create([
            'job_id' => $job->id,
            'user_id' => $freelancer->id,
            'status' => 'pending',
        ]);
        $token = $client->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/proposals/{$proposal->id}/status", ['status' => 'accepted']);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $client->id,
            'type' => 'project_created',
        ]);
        $this->assertDatabaseHas('notifications', [
            'user_id' => $freelancer->id,
            'type' => 'proposal_accepted',
        ]);
    }

    public function test_only_client_can_process_proposal(): void
    {
        $client = $this->makeClient();
        $freelancerA = $this->makeFreelancer();
        $freelancerB = $this->makeFreelancer();
        $job = Job::factory()->create(['user_id' => $client->id, 'status' => 'open']);
        $proposal = Proposal::factory()->create([
            'job_id' => $job->id,
            'user_id' => $freelancerA->id,
            'status' => 'pending',
        ]);
        $token = $freelancerB->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/proposals/{$proposal->id}/status", ['status' => 'accepted']);

        $response->assertStatus(403);
    }

    public function test_rejected_proposal_cannot_populate_project(): void
    {
        $client = $this->makeClient();
        $freelancer = $this->makeFreelancer();
        $job = Job::factory()->create(['user_id' => $client->id, 'status' => 'open']);
        $proposal = Proposal::factory()->create([
            'job_id' => $job->id,
            'user_id' => $freelancer->id,
            'status' => 'rejected',
        ]);
        $token = $client->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/proposals/{$proposal->id}/status", ['status' => 'accepted']);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/projects', [
                'proposal_id' => $proposal->id,
            ]);

        $response->assertStatus(400)
            ->assertJson(['message' => 'Project can only be created from an accepted proposal.']);
    }
}
