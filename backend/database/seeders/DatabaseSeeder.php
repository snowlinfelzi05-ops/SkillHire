<?php

namespace Database\Seeders;

use App\Models\Job;
use App\Models\Project;
use App\Models\Proposal;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        Project::truncate();
        Proposal::truncate();
        Job::truncate();
        User::truncate();
        Schema::enableForeignKeyConstraints();

        $client = User::create([
            'name' => 'snowlin',
            'email' => 'snowlin@test.com',
            'password' => Hash::make('123456'),
            'role' => 'admin',
        ]);

        $freelancers = [
            ['name' => 'snow', 'email' => 'snow@test.com'],
            ['name' => 'Arun Kumar', 'email' => 'arun@test.com'],
            ['name' => 'Priya Sharma', 'email' => 'priya@test.com'],
            ['name' => 'Vijay M', 'email' => 'vijay@test.com'],
            ['name' => 'Muthu Selvi', 'email' => 'muthu@test.com'],
            ['name' => 'Karthi Raja', 'email' => 'karthi@test.com'],
            ['name' => 'Anjali S', 'email' => 'anjali@test.com'],
        ];

        $freelancerUsers = [];
        foreach ($freelancers as $f) {
            $freelancerUsers[] = User::create([
                'name' => $f['name'],
                'email' => $f['email'],
                'password' => Hash::make('123456'),
                'role' => 'freelancer',
            ]);
        }

        $jobData = [
            ['title' => 'React Developer', 'skills' => ['React', 'JavaScript'], 'category' => 'Web Development'],
            ['title' => 'Laravel API Developer', 'skills' => ['Laravel', 'PHP', 'MySQL'], 'category' => 'Backend Development'],
            ['title' => 'UI/UX Designer', 'skills' => ['Figma', 'UI/UX', 'Design'], 'category' => 'Design'],
            ['title' => 'Full Stack Developer', 'skills' => ['React', 'Node', 'MongoDB'], 'category' => 'Web Development'],
            ['title' => 'Mobile App Developer', 'skills' => ['Flutter', 'Dart'], 'category' => 'Mobile Development'],
            ['title' => 'Python Developer', 'skills' => ['Python', 'Django'], 'category' => 'Backend Development'],
            ['title' => 'WordPress Expert', 'skills' => ['WordPress', 'PHP'], 'category' => 'Web Development'],
        ];

        foreach ($jobData as $index => $j) {
            $freelancer = $freelancerUsers[$index];

            $job = Job::create([
                'user_id' => $client->id,
                'title' => $j['title'],
                'description' => 'Need an experienced '.$j['title'].' for our SkillHire platform. Must have 2+ years experience.',
                'budget' => rand(10000, 25000),
                'skills' => $j['skills'],
                'category' => $j['category'],
                'status' => 'open',
                'location' => 'Remote',
            ]);

            $proposal = Proposal::create([
                'job_id' => $job->id,
                'user_id' => $freelancer->id,
                'cover_letter' => 'I am expert in '.$j['title'],
                'proposed_budget' => $job->budget,
                'status' => 'accepted',
            ]);

            Project::create([
                'job_id' => $job->id,
                'client_id' => $client->id,
                'freelancer_id' => $freelancer->id,
                'proposal_id' => $proposal->id,
                'budget' => $job->budget,
                'status' => ['active', 'completed', 'cancelled'][rand(0, 2)],
                'start_date' => now()->subDays(rand(1, 20)),
                'end_date' => now()->addDays(rand(10, 30)),
            ]);
        }
    }
}
