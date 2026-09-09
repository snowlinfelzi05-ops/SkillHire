<?php

namespace Tests\Feature;

use App\Models\Job;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    private function adminToken(): string
    {
        $admin = User::factory()->create(['role' => 'admin']);

        return $admin->createToken('test')->plainTextToken;
    }

    public function test_non_admin_cannot_access_stats(): void
    {
        $client = User::factory()->create(['role' => 'client']);
        $token = $client->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/admin/stats');

        $response->assertStatus(403);
    }

    public function test_admin_can_view_stats(): void
    {
        $token = $this->adminToken();

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/admin/stats');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'users', 'jobs', 'projects', 'paid', 'revenue',
                'clients', 'freelancers', 'admins',
            ]);
    }

    public function test_admin_can_view_users(): void
    {
        $token = $this->adminToken();

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/admin/users');

        $response->assertStatus(200)
            ->assertJsonStructure(['users']);
    }

    public function test_admin_can_delete_user(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $admin->createToken('test')->plainTextToken;
        $target = User::factory()->create(['role' => 'freelancer']);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson("/api/admin/users/{$target->id}");

        $response->assertStatus(200)
            ->assertJson(['message' => 'User deleted successfully']);

        $this->assertSoftDeleted('users', ['id' => $target->id]);
    }

    public function test_admin_cannot_delete_self(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson("/api/admin/users/{$admin->id}");

        $response->assertStatus(403);
    }

    public function test_non_admin_cannot_delete_job(): void
    {
        $client = User::factory()->create(['role' => 'client']);
        $token = $client->createToken('test')->plainTextToken;
        $job = Job::factory()->create();

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson("/api/admin/jobs/{$job->id}");

        $response->assertStatus(403);
    }
}
