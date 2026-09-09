<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_with_role(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'John Freelancer',
            'email' => 'john@example.com',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
            'role' => 'freelancer',
        ]);

        $response->assertStatus(201)
            ->assertJson(['message' => 'Registration successful'])
            ->assertJsonPath('user.role', 'freelancer');

        $this->assertDatabaseHas('users', [
            'email' => 'john@example.com',
            'role' => 'freelancer',
        ]);
    }

    public function test_user_can_register_as_client(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Mary Client',
            'email' => 'mary@example.com',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
            'role' => 'client',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('user.role', 'client');
    }

    public function test_registration_rejects_invalid_role(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Bad Role',
            'email' => 'bad@example.com',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
            'role' => 'admin',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('role');
    }

    public function test_registration_requires_unique_email(): void
    {
        User::factory()->create([
            'email' => 'dup@example.com',
        ]);

        $response = $this->postJson('/api/register', [
            'name' => 'Duplicate',
            'email' => 'dup@example.com',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
            'role' => 'freelancer',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('email');
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'login@example.com',
            'password' => bcrypt('secret123'),
            'role' => 'client',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'login@example.com',
            'password' => 'secret123',
        ]);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Login successful'])
            ->assertJsonPath('user.email', 'login@example.com')
            ->assertJsonStructure(['token']);
    }

    public function test_login_rejects_wrong_password(): void
    {
        $user = User::factory()->create([
            'email' => 'wrong@example.com',
            'password' => bcrypt('correct-pass'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'wrong@example.com',
            'password' => 'wrong-pass',
        ]);

        $response->assertStatus(401)
            ->assertJson(['message' => 'Invalid email or password']);
    }

    public function test_logout_revokes_token(): void
    {
        $user = User::factory()->create([
            'email' => 'logout@example.com',
            'password' => bcrypt('secret123'),
        ]);

        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/logout');

        $response->assertStatus(200)
            ->assertJson(['message' => 'Logout successful']);

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_user_can_change_password_with_correct_current_password(): void
    {
        $user = User::factory()->create([
            'email' => 'changepw@example.com',
            'password' => bcrypt('old-password'),
        ]);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/change-password', [
                'current_password' => 'old-password',
                'new_password' => 'new-password',
            ]);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Password changed successfully']);

        $this->assertTrue(Hash::check(
            'new-password',
            $user->fresh()->password
        ));
    }

    public function test_change_password_rejects_wrong_current_password(): void
    {
        $user = User::factory()->create([
            'email' => 'wrongpw@example.com',
            'password' => bcrypt('old-password'),
        ]);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/change-password', [
                'current_password' => 'wrong-password',
                'new_password' => 'new-password',
            ]);

        $response->assertStatus(422)
            ->assertJson(['message' => 'Current password is incorrect']);
    }

    public function test_account_deletion_requires_password_confirmation(): void
    {
        $user = User::factory()->create([
            'email' => 'delete@example.com',
            'password' => bcrypt('secret123'),
        ]);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson('/api/account', [
                'password' => 'secret123',
            ]);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Account deleted successfully']);

        $this->assertSoftDeleted('users', ['id' => $user->id]);
    }

    public function test_account_deletion_rejects_wrong_password(): void
    {
        $user = User::factory()->create([
            'email' => 'delete2@example.com',
            'password' => bcrypt('secret123'),
        ]);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson('/api/account', [
                'password' => 'wrong-password',
            ]);

        $response->assertStatus(422)
            ->assertJson(['message' => 'Password is incorrect']);
    }
}
