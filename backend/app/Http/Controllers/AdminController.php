<?php

namespace App\Http\Controllers;

use App\Models\Job;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function stats(Request $request)
    {
        $monthExpr = $this->monthExpression('created_at');

        $monthlyRevenue = Project::where('payment_status', 'paid')
            ->selectRaw("{$monthExpr} as month, SUM(budget) as total")
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $monthlyJobs = Job::selectRaw("{$monthExpr} as month, COUNT(*) as count")
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $monthlyUsers = User::selectRaw("{$monthExpr} as month, COUNT(*) as count")
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return response()->json([
            'users' => User::count(),
            'jobs' => Job::count(),
            'projects' => Project::count(),
            'paid' => Project::where('payment_status', 'paid')->count(),
            'revenue' => Project::where('payment_status', 'paid')->sum('budget'),
            'clients' => User::where('role', 'client')->count(),
            'freelancers' => User::where('role', 'freelancer')->count(),
            'admins' => User::where('role', 'admin')->count(),
            'monthlyRevenue' => $monthlyRevenue,
            'monthlyJobs' => $monthlyJobs,
            'monthlyUsers' => $monthlyUsers,
        ]);
    }

    private function monthExpression(string $column): string
    {
        $driver = DB::connection()->getDriverName();

        if ($driver === 'sqlite') {
            return "CAST(strftime('%m', {$column}) AS INTEGER)";
        }

        if ($driver === 'pgsql') {
            return "EXTRACT(MONTH FROM {$column})";
        }

        return "MONTH({$column})";
    }

    public function users(Request $request)
    {
        $users = User::latest()->paginate(20);

        return response()->json([
            'users' => $users->items(),
            'pagination' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    public function jobs(Request $request)
    {
        $jobs = Job::with('user')
            ->latest()
            ->paginate(20);

        return response()->json([
            'jobs' => $jobs->items(),
            'pagination' => [
                'current_page' => $jobs->currentPage(),
                'last_page' => $jobs->lastPage(),
                'per_page' => $jobs->perPage(),
                'total' => $jobs->total(),
            ],
        ]);
    }

    public function deleteJob(Request $request, $id)
    {
        $job = Job::find($id);

        if (! $job) {
            return response()->json([
                'message' => 'Job not found',
            ], 404);
        }

        $job->delete();

        return response()->json([
            'message' => 'Job deleted successfully',
        ]);
    }

    public function deleteUser(Request $request, $id)
    {
        $user = User::find($id);

        if (! $user) {
            return response()->json([
                'message' => 'User not found',
            ], 404);
        }

        if ($user->id === $request->user()->id) {
            return response()->json([
                'message' => 'You cannot delete your own admin account',
            ], 403);
        }

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully',
        ]);
    }

    public function projects(Request $request)
    {
        $projects = Project::with([
            'client',
            'freelancer',
            'job',
        ])
            ->latest()
            ->paginate(20);

        return response()->json([
            'projects' => $projects->items(),
            'pagination' => [
                'current_page' => $projects->currentPage(),
                'last_page' => $projects->lastPage(),
                'per_page' => $projects->perPage(),
                'total' => $projects->total(),
            ],
        ]);
    }
}
