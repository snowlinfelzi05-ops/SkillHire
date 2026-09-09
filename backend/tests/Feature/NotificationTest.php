<?php

namespace Tests\Feature;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_fetch_own_notifications(): void
    {
        $user = User::factory()->create(['role' => 'freelancer']);
        Notification::create([
            'user_id' => $user->id,
            'type' => 'proposal_received',
            'title' => 'Hello',
            'message' => 'A new proposal arrived',
            'is_read' => false,
        ]);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/notifications');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'notifications')
            ->assertJsonPath('unread_count', 1);
    }

    public function test_user_cannot_see_other_users_notifications(): void
    {
        $owner = User::factory()->create(['role' => 'freelancer']);
        $other = User::factory()->create(['role' => 'freelancer']);
        Notification::create([
            'user_id' => $owner->id,
            'type' => 'proposal_received',
            'title' => 'Secret',
            'message' => 'Only for owner',
            'is_read' => false,
        ]);
        $token = $other->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/notifications');

        $response->assertStatus(200)
            ->assertJsonCount(0, 'notifications');
    }

    public function test_user_can_mark_all_as_read(): void
    {
        $user = User::factory()->create(['role' => 'freelancer']);
        Notification::create([
            'user_id' => $user->id,
            'type' => 'proposal_received',
            'title' => 'Hello',
            'message' => 'Message',
            'is_read' => false,
        ]);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson('/api/notifications/read-all');

        $response->assertStatus(200)
            ->assertJson(['message' => 'All notifications marked as read.']);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $user->id,
            'is_read' => true,
        ]);
    }

    public function test_user_cannot_mark_read_others_notification(): void
    {
        $owner = User::factory()->create(['role' => 'freelancer']);
        $other = User::factory()->create(['role' => 'freelancer']);
        $notification = Notification::create([
            'user_id' => $owner->id,
            'type' => 'proposal_received',
            'title' => 'Secret',
            'message' => 'Private',
            'is_read' => false,
        ]);
        $token = $other->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/notifications/{$notification->id}/read");

        $response->assertStatus(404);
    }
}
