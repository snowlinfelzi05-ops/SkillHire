<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Project extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'job_id',
        'client_id',
        'freelancer_id',
        'proposal_id',
        'budget',
        'status',
        'payment_status',
        'start_date',
        'end_date',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function job()
    {
        return $this->belongsTo(Job::class);
    }

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function freelancer()
    {
        return $this->belongsTo(User::class, 'freelancer_id');
    }

    public function proposal()
    {
        return $this->belongsTo(Proposal::class);
    }

    public function workUpdates()
    {
        return $this->hasMany(WorkUpdate::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}
