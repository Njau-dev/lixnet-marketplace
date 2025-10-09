<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AgentApplication;
use App\Models\Agent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AgentApplicationController extends Controller
{
    /**
     * Display a listing of agent applications.
     */
    public function index(Request $request)
    {
        $query = AgentApplication::with(['user'])
            ->orderBy('created_at', 'desc');

        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                    ->orWhere('student_id', 'like', "%{$search}%")
                    ->orWhere('university_email', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('email', 'like', "%{$search}%");
                    });
            });
        }

        // Status filter
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // University filter
        if ($request->filled('university') && $request->university !== 'all') {
            $query->where('university_name', $request->university);
        }

        $perPage = $request->input('per_page', 15);
        $applications = $query->paginate($perPage);

        // Get statistics
        $stats = [
            'total' => AgentApplication::count(),
            'pending' => AgentApplication::where('status', 'pending')->count(),
            'approved' => AgentApplication::where('status', 'approved')->count(),
            'rejected' => AgentApplication::where('status', 'rejected')->count(),
        ];

        // Get unique universities for filter
        $universities = AgentApplication::distinct('university_name')
            ->pluck('university_name')
            ->sort()
            ->values();

        return response()->json([
            'applications' => $applications,
            'stats' => $stats,
            'universities' => $universities,
        ]);
    }

    /**
     * Display the specified agent application.
     */
    public function show(Request $request, AgentApplication $application)
    {
        $application->load(['user', 'reviewer', 'agent']);

        return response()->json([
            'application' => $application,
        ]);
    }

    /**
     * Approve an agent application.
     */
    public function approve(Request $request, AgentApplication $application)
    {
        if (!$application->isPending()) {
            return response()->json([
                'message' => 'Only pending applications can be approved.',
            ], 422);
        }

        $request->validate([
            'commission_rate' => 'nullable|numeric|min:0|max:100',
        ]);

        try {
            DB::beginTransaction();

            // Update application status
            $application->update([
                'status' => 'approved',
                'reviewed_at' => now(),
                'reviewed_by' => $request->user()->id,
                'rejection_reason' => null,
            ]);

            // Create agent record
            Agent::create([
                'user_id' => $application->user_id,
                'application_id' => $application->id,
                'commission_rate' => $request->input('commission_rate', 10.00),
                'is_active' => true,
            ]);

            // Update user role to agent if needed
            $application->user->update([
                'role' => 'agent',
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Application approved successfully.',
                'application' => $application->fresh(['user', 'reviewer', 'agent']),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Failed to approve application: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Reject an agent application.
     */
    public function reject(Request $request, AgentApplication $application)
    {
        if (!$application->isPending()) {
            return response()->json([
                'message' => 'Only pending applications can be rejected.',
            ], 422);
        }

        $request->validate([
            'rejection_reason' => 'required|string|min:10|max:1000',
        ]);

        try {
            $application->update([
                'status' => 'rejected',
                'reviewed_at' => now(),
                'reviewed_by' => $request->user()->id,
                'rejection_reason' => $request->rejection_reason,
            ]);

            return response()->json([
                'message' => 'Application rejected successfully.',
                'application' => $application->fresh(['user', 'reviewer']),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to reject application: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Download a document from an application.
     */
    public function downloadDocument(AgentApplication $application, string $documentType)
    {
        $allowedTypes = ['id_document', 'student_id_document'];

        if (!in_array($documentType, $allowedTypes)) {
            abort(404);
        }

        $path = $documentType === 'id_document'
            ? $application->id_document_path
            : $application->student_id_document_path;

        if (!Storage::exists($path)) {
            abort(404);
        }

        return Storage::download($path);
    }
}
