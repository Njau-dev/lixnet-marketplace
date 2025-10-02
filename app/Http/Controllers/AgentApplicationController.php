<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\AgentApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class AgentApplicationController extends Controller
{
    public function status(Request $request)
    {
        $user = $request->user();

        $application = AgentApplication::where('user_id', $user->id)->first();

        return response()->json([
            'success' => true,
            'data' => [
                'has_application' => $application !== null,
                'application' => $application ? [
                    'id' => $application->id,
                    'status' => $application->status,
                    'created_at' => $application->created_at,
                    'reviewed_at' => $application->reviewed_at,
                ] : null,
            ],
        ]);
    }

    public function submit(Request $request)
    {
        $user = $request->user();

        // Check if user already has an application
        $existingApplication = AgentApplication::where('user_id', $user->id)
            ->whereIn('status', ['pending', 'approved'])
            ->first();


        if ($existingApplication) {
            return response()->json([
                'success' => false,
                'message' => 'You already have a ' . $existingApplication->status . ' application.',
            ], 422);
        }


        // Validation with fixed regex patterns
        $validator = Validator::make($request->all(), [
            'full_name' => 'required|string|max:255',
            'date_of_birth' => 'required|date|before:today',
            'phone_number' => ['required', 'string', 'regex:/^(\+254|0)[17]\d{8}$/'],
            'physical_address' => 'required|string|max:500',
            'id_type' => 'required|in:National ID,Passport',
            'id_number' => 'required|string|max:50',
            'id_document' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'university_name' => 'required|string|max:255',
            'campus' => 'required|string|max:255',
            'student_id' => 'required|string|max:100',
            'course' => 'required|string|max:255',
            'year_of_study' => 'required|string|in:Year 1,Year 2,Year 3,Year 4,Year 5,Year 6',
            'university_email' => ['required', 'email'],
            'student_id_document' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'terms_accepted' => 'required|accepted',
        ]);

        if ($validator->fails()) {
            Log::warning('Validation failed', ['errors' => $validator->errors()->toArray()]);
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            Log::info('Starting file uploads');

            // Log file details before upload
            if ($request->hasFile('id_document')) {
                $idFile = $request->file('id_document');
                Log::info('ID Document details', [
                    'original_name' => $idFile->getClientOriginalName(),
                    'size' => $idFile->getSize(),
                    'mime_type' => $idFile->getMimeType()
                ]);
            }

            if ($request->hasFile('student_id_document')) {
                $studentIdFile = $request->file('student_id_document');
                Log::info('Student ID Document details', [
                    'original_name' => $studentIdFile->getClientOriginalName(),
                    'size' => $studentIdFile->getSize(),
                    'mime_type' => $studentIdFile->getMimeType()
                ]);
            }

            // Store ID document
            $idDocumentPath = $request->file('id_document')->store('agent-applications/id-documents', 'public');
            Log::info('ID document stored', ['path' => $idDocumentPath]);

            // Store Student ID document
            $studentIdDocumentPath = $request->file('student_id_document')->store('agent-applications/student-ids', 'public');
            Log::info('Student ID document stored', ['path' => $studentIdDocumentPath]);

            // Log application data before creation
            Log::info('Creating application with data', [
                'user_id' => $user->id,
                'full_name' => $request->full_name,
                'date_of_birth' => $request->date_of_birth,
                'phone_number' => $request->phone_number,
                'university_email' => $request->university_email,
                // Don't log sensitive data like ID number
            ]);

            // Create application
            $application = AgentApplication::create([
                'user_id' => $user->id,
                'full_name' => $request->full_name,
                'date_of_birth' => $request->date_of_birth,
                'phone_number' => $request->phone_number,
                'physical_address' => $request->physical_address,
                'id_type' => $request->id_type,
                'id_number' => $request->id_number,
                'id_document_path' => $idDocumentPath,
                'university_name' => $request->university_name,
                'campus' => $request->campus,
                'student_id' => $request->student_id,
                'course' => $request->course,
                'year_of_study' => $request->year_of_study,
                'university_email' => $request->university_email,
                'student_id_document_path' => $studentIdDocumentPath,
                'status' => 'pending',
                'terms_accepted' => true,
            ]);

            Log::info('Application created successfully', ['application_id' => $application->id]);

            return response()->json([
                'success' => true,
                'message' => 'Application submitted successfully! We will review your application within 2-3 business days.',
                'data' => [
                    'application_id' => $application->id,
                    'status' => $application->status,
                ],
            ], 201);
        } catch (\Exception $e) {
            Log::error('Application submission failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Clean up uploaded files if application creation fails
            if (isset($idDocumentPath)) {
                Log::info('Cleaning up ID document', ['path' => $idDocumentPath]);
                Storage::disk('public')->delete($idDocumentPath);
            }
            if (isset($studentIdDocumentPath)) {
                Log::info('Cleaning up Student ID document', ['path' => $studentIdDocumentPath]);
                Storage::disk('public')->delete($studentIdDocumentPath);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to submit application. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }
}
