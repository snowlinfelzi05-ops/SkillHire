<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Job extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'category',
        'budget',
        'status',
        'skills',
        'location',
    ];

    protected function casts(): array
    {
        return [
            'skills' => 'array',
        ];
    }

    // Relationship to the user who posted the job
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function proposals()
    {
        return $this->hasMany(Proposal::class, 'job_id');
    }

    public function project()
    {
        return $this->hasOne(Project::class, 'job_id');
    }
}
