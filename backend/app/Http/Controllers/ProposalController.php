<?php

namespace App\Http\Controllers;

use App\Models\Job;
use App\Models\Notification;
use App\Models\Proposal;
use App\Services\ProposalService;
use Illuminate\Http\Request;

class ProposalController extends Controller
{
    protected $proposalService;

    public function __construct(ProposalService $proposalService)
    {
        $this->proposalService = $proposalService;
    }

    public function store(Request $request)
    {
        $request->validate([
            'job_id' => 'required|exists:jobs,id',
            'cover_letter' => 'required|string',
            'proposed_budget' => 'required|numeric|min:0',
        ]);

        $existing = Proposal::where('job_id', $request->job_id)
            ->where('user_id', $request->user()->id)
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'You already applied for this job',
            ], 400);
        }

        $job = Job::find($request->job_id);

        $proposal = Proposal::create([
            'job_id' => $request->job_id,
            'user_id' => $request->user()->id,
            'cover_letter' => $request->cover_letter,
            'proposed_budget' => $request->proposed_budget,
            'status' => 'pending',
        ]);

        Notification::create([
            'user_id' => $job->user_id,
            'type' => 'proposal_received',
            'title' => 'New Proposal Received',
            'message' => $request->user()->name.' submitted a proposal for your job "'.$job->title.'".',
            'reference_type' => 'proposal',
            'reference_id' => $proposal->id,
            'is_read' => false,
        ]);

        return response()->json([
            'message' => 'Proposal submitted successfully',
            'proposal' => $proposal,
        ], 201);
    }

    public function index(Request $request)
    {
        $proposals = Proposal::with(['job', 'user'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(20);

        return response()->json([
            'message' => 'Proposals fetched successfully',
            'proposals' => $proposals->items(),
            'pagination' => [
                'current_page' => $proposals->currentPage(),
                'last_page' => $proposals->lastPage(),
                'per_page' => $proposals->perPage(),
                'total' => $proposals->total(),
            ],
        ]);
    }

    public function received($jobId, Request $request)
    {
        $job = Job::find($jobId);

        if (! $job) {
            return response()->json([
                'message' => 'Job not found',
            ], 404);
        }

        if ($job->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $proposals = Proposal::with('user')
            ->where('job_id', $jobId)
            ->latest()
            ->paginate(20);

        return response()->json([
            'message' => 'Received proposals fetched successfully',
            'job' => $job,
            'proposals' => $proposals->items(),
            'pagination' => [
                'current_page' => $proposals->currentPage(),
                'last_page' => $proposals->lastPage(),
                'per_page' => $proposals->perPage(),
                'total' => $proposals->total(),
            ],
        ]);
    }

    public function receivedAll(Request $request)
    {
        $user = $request->user();

        $jobIds = Job::where('user_id', $user->id)->pluck('id');

        $proposals = Proposal::with([
            'job',
            'freelancer',
            'user',
            'job.user',
        ])
            ->whereIn('job_id', $jobIds)
            ->latest()
            ->paginate(20);

        return response()->json([
            'proposals' => $proposals->items(),
            'pagination' => [
                'current_page' => $proposals->currentPage(),
                'last_page' => $proposals->lastPage(),
                'per_page' => $proposals->perPage(),
                'total' => $proposals->total(),
            ],
        ]);
    }

    public function updateStatus(Request $request, $proposalId)
    {
        $request->validate([
            'status' => 'required|in:accepted,rejected',
        ]);

        $proposal = Proposal::with('job')->find($proposalId);

        if (! $proposal) {
            return response()->json([
                'message' => 'Proposal not found',
            ], 404);
        }

        if ($proposal->job->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        if ($proposal->status !== 'pending') {
            return response()->json([
                'message' => 'This proposal has already been processed.',
            ], 400);
        }

        if ($request->status === 'accepted' && $proposal->job->status === 'closed') {
            return response()->json([
                'message' => 'Job already closed! You already hired someone!',
            ], 400);
        }

        $result = $this->proposalService->processStatus($proposal, $request->status);

        return response()->json([
            'message' => $result['message'],
            'proposal' => $proposal,
        ]);
    }
}
