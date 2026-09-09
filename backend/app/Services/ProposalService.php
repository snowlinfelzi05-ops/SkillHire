<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\Project;
use App\Models\Proposal;

class ProposalService
{
    /**
     * Process a proposal status change (accept/reject).
     *
     * @return array{project?: Project, message: string}
     */
    public function processStatus(Proposal $proposal, string $status): array
    {
        $proposal->status = $status;
        $proposal->save();

        $project = null;
        $message = 'Proposal '.$status;

        if ($status === 'accepted') {
            $project = $this->acceptProposal($proposal);
            $message = 'Proposal accepted successfully! Project created.';
        }

        if ($status === 'rejected') {
            $this->notifyFreelancerOfRejection($proposal);
            $message = 'Proposal rejected successfully.';
        }

        return ['project' => $project, 'message' => $message];
    }

    private function acceptProposal(Proposal $proposal): ?Project
    {
        $proposal->job->update(['status' => 'closed']);

        $existingProject = Project::where('job_id', $proposal->job_id)->first();

        if ($existingProject) {
            return $existingProject;
        }

        $project = Project::create([
            'job_id' => $proposal->job_id,
            'client_id' => $proposal->job->user_id,
            'freelancer_id' => $proposal->user_id,
            'proposal_id' => $proposal->id,
            'budget' => $proposal->proposed_budget ?? $proposal->job->budget,
            'status' => 'active',
            'payment_status' => 'pending',
            'start_date' => now(),
        ]);

        Notification::create([
            'user_id' => $proposal->user_id,
            'type' => 'proposal_accepted',
            'title' => 'Proposal Accepted',
            'message' => 'Congratulations! Your proposal for "'.
                $proposal->job->title.'" has been accepted.',
            'reference_type' => 'project',
            'reference_id' => $project->id,
            'is_read' => false,
        ]);

        Notification::create([
            'user_id' => $proposal->job->user_id,
            'type' => 'project_created',
            'title' => 'Project Created',
            'message' => 'Your project "'.
                $proposal->job->title.'" has been created successfully.',
            'reference_type' => 'project',
            'reference_id' => $project->id,
            'is_read' => false,
        ]);

        $this->rejectOtherPendingProposals($proposal);

        return $project;
    }

    private function rejectOtherPendingProposals(Proposal $proposal): void
    {
        $otherProposals = Proposal::where('job_id', $proposal->job_id)
            ->where('id', '!=', $proposal->id)
            ->where('status', 'pending')
            ->get();

        foreach ($otherProposals as $otherProposal) {
            $otherProposal->update(['status' => 'rejected']);

            Notification::create([
                'user_id' => $otherProposal->user_id,
                'type' => 'proposal_rejected',
                'title' => 'Proposal Not Selected',
                'message' => 'Your proposal for "'.
                    $proposal->job->title.
                    '" was not selected. Another freelancer was hired.',
                'reference_type' => 'proposal',
                'reference_id' => $otherProposal->id,
                'is_read' => false,
            ]);
        }
    }

    private function notifyFreelancerOfRejection(Proposal $proposal): void
    {
        Notification::create([
            'user_id' => $proposal->user_id,
            'type' => 'proposal_rejected',
            'title' => 'Proposal Rejected',
            'message' => 'Your proposal for "'.
                $proposal->job->title.'" has been rejected by the client.',
            'reference_type' => 'proposal',
            'reference_id' => $proposal->id,
            'is_read' => false,
        ]);
    }
}
