<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AgentApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'full_name',
        'date_of_birth',
        'phone_number',
        'physical_address',
        'id_type',
        'id_number',
        'id_document_path',
        'university_name',
        'campus',
        'student_id',
        'course',
        'year_of_study',
        'university_email',
        'student_id_document_path',
        'status',
        'rejection_reason',
        'reviewed_at',
        'reviewed_by',
        'terms_accepted',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'reviewed_at' => 'datetime',
        'terms_accepted' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function agent()
    {
        return $this->hasOne(Agent::class, 'application_id');
    }

    public function isPending()
    {
        return $this->status === 'pending';
    }

    public function isApproved()
    {
        return $this->status === 'approved';
    }

    public function isRejected()
    {
        return $this->status === 'rejected';
    }
}
