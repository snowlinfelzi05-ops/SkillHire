<?php

namespace App\Http\Controllers;

use App\Models\Job;
use Illuminate\Http\Request;

class JobController extends Controller
{
    public function index(Request $request)
    {
        $query = Job::with('user')->where('status', 'open');

        if ($request->has('search') && $request->search != '') {
            $search = $this->escapeLike($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('skills', 'like', "%{$search}%");
            });
        }

        if ($request->has('category') && $request->category != '' && $request->category != 'All') {
            $query->where('category', $request->category);
        }

        $jobs = $query->latest()->paginate(20);

        return response()->json([
            'message' => 'Jobs fetched successfully',
            'jobs' => $jobs->items(),
            'pagination' => [
                'current_page' => $jobs->currentPage(),
                'last_page' => $jobs->lastPage(),
                'per_page' => $jobs->perPage(),
                'total' => $jobs->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|string|max:255',
            'budget' => 'required|numeric|min:0',
            'location' => 'nullable|string|max:255',
            'skills' => 'nullable|array',
            'skills.*' => 'string',
        ]);

        $job = Job::create([
            'user_id' => $request->user()->id,
            'title' => $request->title,
            'description' => $request->description,
            'category' => $request->category,
            'budget' => $request->budget,
            'location' => $request->location,
            'skills' => $request->skills ?? [],
            'status' => 'open',
        ]);

        return response()->json(['message' => 'Job created successfully', 'job' => $job], 201);
    }

    public function show($id)
    {
        $job = Job::with('user')->find($id);
        if (! $job) {
            return response()->json(['message' => 'Job not found'], 404);
        }

        return response()->json(['message' => 'Job fetched successfully', 'job' => $job]);
    }

    public function update(Request $request, $id)
    {
        $job = Job::find($id);
        if (! $job) {
            return response()->json(['message' => 'Job not found'], 404);
        }
        if ($job->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'category' => 'sometimes|string|max:255',
            'budget' => 'sometimes|numeric|min:0',
            'location' => 'nullable|string|max:255',
            'status' => 'sometimes|in:open,closed',
            'skills' => 'sometimes|array',
            'skills.*' => 'string',
        ]);

        $job->update($request->only(['title', 'description', 'category', 'budget', 'location', 'status', 'skills']));

        return response()->json(['message' => 'Job updated successfully', 'job' => $job]);
    }

    public function destroy(Request $request, $id)
    {
        $job = Job::find($id);
        if (! $job) {
            return response()->json(['message' => 'Job not found'], 404);
        }
        if ($job->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $job->delete();

        return response()->json(['message' => 'Job deleted successfully']);
    }

    public function myJobs(Request $request)
    {
        $jobs = Job::with('user')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(20);

        return response()->json([
            'message' => 'My jobs fetched successfully',
            'jobs' => $jobs->items(),
            'pagination' => [
                'current_page' => $jobs->currentPage(),
                'last_page' => $jobs->lastPage(),
                'per_page' => $jobs->perPage(),
                'total' => $jobs->total(),
            ],
        ]);
    }

    public function matchSkills(Request $request, $id)
    {
        $job = Job::find($id);
        if (! $job) {
            return response()->json(['message' => 'Job not found'], 404);
        }

        $freelancerSkills = $request->skills ?? $request->user()->skills ?? [];
        if (is_string($freelancerSkills)) {
            $freelancerSkills = array_map('trim', explode(',', $freelancerSkills));
        }

        $jobSkills = $job->skills ?? [];
        if (is_string($jobSkills)) {
            $jobSkills = json_decode($jobSkills, true) ?? [];
        }

        $jobSkills = array_values(array_filter($jobSkills));
        $jobSkillsLower = array_map('strtolower', $jobSkills);
        $freelancerSkillsLower = array_map('strtolower', (array) $freelancerSkills);

        $matchedSkills = [];
        foreach ($jobSkillsLower as $jSkill) {
            foreach ($freelancerSkillsLower as $fSkill) {
                if ($jSkill === $fSkill || str_contains($fSkill, $jSkill) || str_contains($jSkill, $fSkill)) {
                    $matchedSkills[] = $jSkill;
                    break;
                }
            }
        }
        $matchedSkills = array_unique($matchedSkills);

        $totalSkills = count($jobSkills);
        $matchedCount = count($matchedSkills);
        $matchPercentage = $totalSkills > 0 ? round(($matchedCount / $totalSkills) * 100) : 0;
        if ($matchPercentage == 0 && $totalSkills > 0) {
            $matchPercentage = 15;
        }

        $matchLabel = $matchPercentage >= 80
            ? 'Perfect Match'
            : ($matchPercentage >= 50 ? 'Good Match' : 'Low Match');

        return response()->json([
            'message' => 'Skill match calculated successfully',
            'job_id' => $job->id,
            'job_title' => $job->title,
            'job_skills' => $jobSkills,
            'freelancer_skills' => $freelancerSkillsLower,
            'matched_skills' => array_values($matchedSkills),
            'match_percentage' => $matchPercentage,
            'match_label' => $matchLabel,
        ]);
    }

    private function escapeLike(string $value): string
    {
        return str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $value);
    }
}
