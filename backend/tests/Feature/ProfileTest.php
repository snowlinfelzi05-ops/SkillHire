<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_view_own_profile(): void
    {
        $user = User::factory()->create(['role' => 'freelancer']);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/profile');

        $response->assertStatus(200)
            ->assertJsonPath('user.id', $user->id);
    }

    public function test_user_can_update_partial_profile_without_wiping_other_fields(): void
    {
        $user = User::factory()->create(['role' => 'freelancer']);
        $user->update(['headline' => 'Senior Developer', 'bio' => 'Existing bio']);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson('/api/profile', [
                'bio' => 'Updated bio',
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'headline' => 'Senior Developer',
            'bio' => 'Updated bio',
        ]);
    }

    public function test_profile_update_rejects_invalid_portfolio_url(): void
    {
        $user = User::factory()->create(['role' => 'freelancer']);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson('/api/profile', [
                'portfolio_url' => 'not-a-url',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('portfolio_url');
    }
}
