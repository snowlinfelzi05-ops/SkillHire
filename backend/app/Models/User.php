<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'headline',
        'bio',
        'skills',
        'experience',
        'portfolio_url',
        'profile_photo',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'skills' => 'array',
    ];

    public function profile()
    {
        return $this->hasOne(Profile::class);
    }

    public function jobs()
    {
        return $this->hasMany(Job::class);
    }

    public function proposals()
    {
        return $this->hasMany(Proposal::class);
    }

    public function clientProjects()
    {
        return $this->hasMany(Project::class, 'client_id');
    }

    public function freelancerProjects()
    {
        return $this->hasMany(Project::class, 'freelancer_id');
    }

    public function reviewsGiven()
    {
        return $this->hasMany(Review::class, 'reviewer_id');
    }

    public function reviewsReceived()
    {
        return $this->hasMany(Review::class, 'reviewee_id');
    }

    public function workUpdates()
    {
        return $this->hasMany(WorkUpdate::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }
}
