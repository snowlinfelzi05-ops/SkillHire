<?php

namespace Tests\Feature;

use App\Models\Job;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class JobTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsClient(): User
    {
        $client = User::factory()->create(['role' => 'client']);

        return $client;
    }

    public function test_client_can_post_a_job(): void
    {
        $client = $this->actingAsClient();
        $token = $client->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/jobs', [
                'title' => 'Build a landing page',
                'description' => 'Need a responsive landing page',
                'category' => 'Web Development',
                'budget' => 5000,
                'skills' => ['React', 'CSS'],
            ]);

        $response->assertStatus(201)
            ->assertJson(['message' => 'Job created successfully'])
            ->assertJsonPath('job.user_id', $client->id)
            ->assertJsonPath('job.status', 'open');
    }

    public function test_job_requires_title_and_budget(): void
    {
        $client = $this->actingAsClient();
        $token = $client->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/jobs', [
                'description' => 'missing fields',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['title', 'budget']);
    }

    public function test_client_can_only_update_own_job(): void
    {
        $owner = User::factory()->create(['role' => 'client']);
        $other = User::factory()->create(['role' => 'client']);

        $job = Job::factory()->create(['user_id' => $owner->id]);
        $token = $other->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/jobs/{$job->id}", [
                'title' => 'Hacked title',
            ]);

        $response->assertStatus(403)
            ->assertJson(['message' => 'Unauthorized']);
    }

    public function test_client_can_delete_own_job(): void
    {
        $owner = $this->actingAsClient();
        $job = Job::factory()->create(['user_id' => $owner->id]);
        $token = $owner->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson("/api/jobs/{$job->id}");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Job deleted successfully']);

        $this->assertSoftDeleted('jobs', ['id' => $job->id]);
    }

    public function test_public_job_listing_returns_only_open_jobs(): void
    {
        Job::factory()->create(['status' => 'open']);
        Job::factory()->create(['status' => 'closed']);

        $response = $this->getJson('/api/jobs');

        $response->assertStatus(200);
        $jobs = $response->json('jobs');
        $this->assertCount(1, $jobs);
        $this->assertEquals('open', $jobs[0]['status']);
    }

    public function test_skill_matching_calculates_percentage(): void
    {
        $freelancer = User::factory()->create([
            'role' => 'freelancer',
            'skills' => ['React', 'Laravel', 'MySQL'],
        ]);
        $job = Job::factory()->create([
            'status' => 'open',
            'skills' => ['React', 'Laravel'],
        ]);
        $token = $freelancer->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/jobs/{$job->id}/match-skills");

        $response->assertStatus(200)
            ->assertJsonPath('match_percentage', 100);
    }

    public function test_skill_matching_low_when_no_overlap(): void
    {
        $freelancer = User::factory()->create([
            'role' => 'freelancer',
            'skills' => ['Python', 'Django'],
        ]);
        $job = Job::factory()->create([
            'status' => 'open',
            'skills' => ['React', 'Laravel'],
        ]);
        $token = $freelancer->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/jobs/{$job->id}/match-skills");

        $response->assertStatus(200)
            ->assertJsonPath('match_percentage', 15);
    }
}
