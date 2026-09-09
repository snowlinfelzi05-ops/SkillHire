<?php

namespace Database\Seeders;

use App\Models\Job;
use App\Models\User;
use Illuminate\Database\Seeder;

class JobSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first();

        $jobs = [
            [
                'title' => 'React Developer Needed',
                'description' => 'Need experienced React developer for e-commerce project with Tailwind CSS.',
                'category' => 'Web Development',
                'budget' => 15000,
                'location' => 'Remote',
                'skills' => ['React', 'JavaScript', 'Tailwind'],
                'status' => 'open',
            ],
            [
                'title' => 'Laravel Backend API',
                'description' => 'Build REST API for SkillHire platform with Sanctum auth.',
                'category' => 'Backend Development',
                'budget' => 20000,
                'location' => 'Remote',
                'skills' => ['Laravel', 'PHP', 'MySQL'],
                'status' => 'open',
            ],
            [
                'title' => 'UI/UX Designer for Mobile App',
                'description' => 'Design modern UI for freelance mobile app in Figma.',
                'category' => 'Design',
                'budget' => 12000,
                'location' => 'Chennai',
                'skills' => ['Figma', 'UI/UX', 'Mobile Design'],
                'status' => 'open',
            ],
            [
                'title' => 'MERN Stack Project',
                'description' => 'Full stack MERN project with real-time chat features.',
                'category' => 'Web Development',
                'budget' => 25000,
                'location' => 'Remote',
                'skills' => ['MongoDB', 'Express', 'React', 'Node'],
                'status' => 'open',
            ],
            [
                'title' => 'WordPress Website',
                'description' => 'Create business website using WordPress and Elementor.',
                'category' => 'Web Development',
                'budget' => 8000,
                'location' => 'Remote',
                'skills' => ['WordPress', 'PHP', 'CSS'],
                'status' => 'open',
            ],
            [
                'title' => 'Mobile App - Flutter',
                'description' => 'Build cross-platform mobile app for job portal using Flutter.',
                'category' => 'Mobile Development',
                'budget' => 30000,
                'location' => 'Remote',
                'skills' => ['Flutter', 'Dart', 'Firebase'],
                'status' => 'open',
            ],
            [
                'title' => 'Content Writer Needed',
                'description' => 'Need content writer for tech blogs and documentation.',
                'category' => 'Writing',
                'budget' => 5000,
                'location' => 'Remote',
                'skills' => ['Writing', 'SEO', 'Content'],
                'status' => 'open',
            ],
        ];

        foreach ($jobs as $job) {
            Job::create([
                'user_id' => $user->id,
                'title' => $job['title'],
                'description' => $job['description'],
                'category' => $job['category'],
                'budget' => $job['budget'],
                'location' => $job['location'],
                'skills' => $job['skills'],
                'status' => $job['status'],
            ]);
        }
    }
}
