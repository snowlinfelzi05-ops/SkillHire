<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\Project;
use App\Models\Proposal;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'proposal_id' => 'required|exists:proposals,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $proposal = Proposal::with('job')->findOrFail($request->proposal_id);

        $user = $request->user();

        if ($proposal->job->user_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        if ($proposal->status !== 'accepted') {
            return response()->json([
                'message' => 'Project can only be created from an accepted proposal.',
            ], 400);
        }

        if (Project::where('proposal_id', $proposal->id)->exists()) {
            return response()->json([
                'message' => 'A project already exists for this proposal.',
            ], 400);
        }

        $project = Project::create([
            'job_id' => $proposal->job_id,
            'client_id' => $user->id,
            'freelancer_id' => $proposal->user_id,
            'proposal_id' => $proposal->id,
            'budget' => $proposal->proposed_budget ?? $proposal->job->budget,
            'status' => 'active',
            'payment_status' => 'pending',
            'start_date' => $request->start_date ?? now(),
            'end_date' => $request->end_date,
        ]);

        return response()->json([
            'message' => 'Project created successfully',
            'project' => $project->load([
                'job',
                'client',
                'freelancer',
                'proposal',
            ]),
        ], 201);
    }

    /*
    |--------------------------------------------------------------------------
    | Get My Projects
    |--------------------------------------------------------------------------
    */

    public function index(Request $request)
    {
        $user = $request->user();

        $projects = Project::with([
            'job',
            'client',
            'freelancer',
            'proposal',
        ])
            ->where(function ($q) use ($user) {
                $q->where('client_id', $user->id)
                    ->orWhere('freelancer_id', $user->id);
            })
            ->latest()
            ->paginate(20);

        return response()->json([
            'message' => 'Projects fetched successfully',
            'projects' => $projects->items(),
            'pagination' => [
                'current_page' => $projects->currentPage(),
                'last_page' => $projects->lastPage(),
                'per_page' => $projects->perPage(),
                'total' => $projects->total(),
            ],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Project Details
    |--------------------------------------------------------------------------
    */

    public function show(Request $request, $id)
    {
        $user = $request->user();

        $project = Project::with([
            'job',
            'client',
            'freelancer',
            'proposal',
        ])->find($id);

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
                'message' => 'Unauthorized',
            ], 403);
        }

        return response()->json([
            'message' => 'Project details fetched',
            'project' => $project,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Update Project Status
    |--------------------------------------------------------------------------
    */

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:active,completed,cancelled',
        ]);

        $user = $request->user();

        $project = Project::findOrFail($id);

        if (
            $project->client_id !== $user->id &&
            $project->freelancer_id !== $user->id
        ) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        if (in_array($project->status, ['completed', 'cancelled'])) {
            return response()->json([
                'message' => 'This project has already been closed.',
            ], 400);
        }

        $oldStatus = $project->status;

        $project->status = $request->status;

        if (in_array($request->status, ['completed', 'cancelled'])) {
            $project->end_date = now();
        }

        $project->save();

        /*
        |--------------------------------------------------------------------------
        | Project Completed Notification
        |--------------------------------------------------------------------------
        */

        if ($request->status === 'completed') {

            // Notify client
            Notification::create([
                'user_id' => $project->client_id,
                'type' => 'project_completed',
                'title' => 'Project Completed',
                'message' => 'The project "'.
                    ($project->job->title ?? 'Your project').
                    '" has been completed successfully.',
                'reference_type' => 'project',
                'reference_id' => $project->id,
                'is_read' => false,
            ]);

            // Notify freelancer
            Notification::create([
                'user_id' => $project->freelancer_id,
                'type' => 'project_completed',
                'title' => 'Project Completed',
                'message' => 'The project "'.
                    ($project->job->title ?? 'Your project').
                    '" has been marked as completed.',
                'reference_type' => 'project',
                'reference_id' => $project->id,
                'is_read' => false,
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Project Cancelled Notification
        |--------------------------------------------------------------------------
        */

        if ($request->status === 'cancelled') {

            // Notify the other member
            $notifyUserId =
                $user->id === $project->client_id
                ? $project->freelancer_id
                : $project->client_id;

            Notification::create([
                'user_id' => $notifyUserId,
                'type' => 'project_cancelled',
                'title' => 'Project Cancelled',
                'message' => 'The project "'.
                    ($project->job->title ?? 'Your project').
                    '" has been cancelled.',
                'reference_type' => 'project',
                'reference_id' => $project->id,
                'is_read' => false,
            ]);
        }

        return response()->json([
            'message' => 'Project status updated',
            'project' => $project->load([
                'job',
                'client',
                'freelancer',
                'proposal',
            ]),
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Payment
    |--------------------------------------------------------------------------
    */

    public function pay(Request $request, $id)
    {
        $user = $request->user();

        $project = Project::findOrFail($id);

        if ($project->client_id !== $user->id) {
            return response()->json([
                'message' => 'Only client can pay',
            ], 403);
        }

        if ($project->status !== 'completed') {
            return response()->json([
                'message' => 'Project must be completed before payment',
            ], 400);
        }

        if ($project->payment_status === 'paid') {
            return response()->json([
                'message' => 'Already paid',
            ], 400);
        }

        $project->update([
            'payment_status' => 'paid',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Payment Notification - Freelancer
        |--------------------------------------------------------------------------
        */

        $currency = config('app.currency_symbol', '₹');

        Notification::create([
            'user_id' => $project->freelancer_id,
            'type' => 'payment_received',
            'title' => 'Payment Received',
            'message' => 'Payment of '.
                $currency.
                number_format($project->budget, 2).
                ' has been completed for "'.
                ($project->job->title ?? 'your project').
                '".',
            'reference_type' => 'project',
            'reference_id' => $project->id,
            'is_read' => false,
        ]);

        return response()->json([
            'message' => 'Payment successful',
            'project' => $project->load([
                'job',
                'client',
                'freelancer',
            ]),
        ]);
    }
}
