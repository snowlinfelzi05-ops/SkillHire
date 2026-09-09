<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\Project;
use App\Models\WorkUpdate;
use Illuminate\Http\Request;

class WorkUpdateController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Get Work Updates for a Project
    |--------------------------------------------------------------------------
    */

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

        $updates = WorkUpdate::with('user')
            ->where('project_id', $projectId)
            ->latest()
            ->paginate(20);

        return response()->json([
            'message' => 'Work updates fetched successfully',
            'updates' => $updates->items(),
            'pagination' => [
                'current_page' => $updates->currentPage(),
                'last_page' => $updates->lastPage(),
                'per_page' => $updates->perPage(),
                'total' => $updates->total(),
            ],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Add a Work Update
    |--------------------------------------------------------------------------
    */

    public function store(Request $request, $projectId)
    {
        $request->validate([
            'message' => 'required|string',
            'status' => 'nullable|string|max:50',
        ]);

        $user = $request->user();

        $project = Project::with('job')->find($projectId);

        if (! $project) {
            return response()->json([
                'message' => 'Project not found',
            ], 404);
        }

        if ($project->freelancer_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized. Only the freelancer can add work updates.',
            ], 403);
        }

        if (in_array($project->status, ['completed', 'cancelled'])) {
            return response()->json([
                'message' => 'Cannot add updates to a closed project.',
            ], 400);
        }

        /*
        |--------------------------------------------------------------------------
        | Create Work Update
        |--------------------------------------------------------------------------
        */

        $update = WorkUpdate::create([
            'project_id' => $project->id,
            'user_id' => $user->id,
            'message' => $request->message,
            'status' => $request->status,
        ]);

        /*
        |--------------------------------------------------------------------------
        | Notify Client
        |--------------------------------------------------------------------------
        */

        Notification::create([
            'user_id' => $project->client_id,
            'type' => 'work_update',
            'title' => 'New Work Update',
            'message' => $user->name.
                ' posted a new work update for "'.
                ($project->job->title ?? 'your project').
                '".',
            'reference_type' => 'work_update',
            'reference_id' => $update->id,
            'is_read' => false,
        ]);

        return response()->json([
            'message' => 'Work update added successfully',
            'update' => $update->load('user'),
        ], 201);
    }
}
