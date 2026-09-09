<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(Request $request, $projectId)
    {
        $user = $request->user();

        $project = Project::find($projectId);

        if (! $project) {
            return response()->json([
                'message' => 'Project not found',
            ], 404);
        }

        if (
            $project->client_id !== $user->id &&
            $project->freelancer_id !== $user->id
        ) {
            return response()->json([
                'message' => 'Unauthorized. You are not part of this project.',
            ], 403);
        }

        $reviews = Review::with([
            'reviewer',
            'reviewee',
        ])
            ->where('project_id', $projectId)
            ->latest()
            ->paginate(20);

        return response()->json([
            'message' => 'Reviews fetched successfully',
            'reviews' => $reviews->items(),
            'pagination' => [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'per_page' => $reviews->perPage(),
                'total' => $reviews->total(),
            ],
        ]);
    }

    public function store(Request $request, $projectId)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $user = $request->user();

        $project = Project::find($projectId);

        if (! $project) {
            return response()->json([
                'message' => 'Project not found',
            ], 404);
        }

        if (
            $project->client_id !== $user->id &&
            $project->freelancer_id !== $user->id
        ) {
            return response()->json([
                'message' => 'Unauthorized. You are not part of this project.',
            ], 403);
        }

        if ($project->status !== 'completed') {
            return response()->json([
                'message' => 'Reviews can only be added after project completion.',
            ], 400);
        }

        $revieweeId = $project->client_id === $user->id
            ? $project->freelancer_id
            : $project->client_id;

        $existingReview = Review::where('project_id', $projectId)
            ->where('reviewer_id', $user->id)
            ->where('reviewee_id', $revieweeId)
            ->exists();

        if ($existingReview) {
            return response()->json([
                'message' => 'You have already reviewed this user.',
            ], 400);
        }

        $review = Review::create([
            'project_id' => $projectId,
            'reviewer_id' => $user->id,
            'reviewee_id' => $revieweeId,
            'rating' => $request->rating,
            'comment' => $request->comment,
        ]);

        return response()->json([
            'message' => 'Review added successfully',
            'review' => $review->load([
                'reviewer',
                'reviewee',
            ]),
        ], 201);
    }
}
