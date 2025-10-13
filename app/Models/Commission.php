<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Commission extends Model
{
    use HasFactory;

    protected $fillable = [
        'agent_id',
        'total_sales',
        'total_commission',
        'tier_id',
        'period_start',
        'period_end',
    ];

    protected $casts = [
        'total_sales' => 'decimal:2',
        'total_commission' => 'decimal:2',
        'period_start' => 'date',
        'period_end' => 'date',
    ];

    public function agent()
    {
        return $this->belongsTo(Agent::class);
    }

    public function tier()
    {
        return $this->belongsTo(AgentTier::class, 'tier_id');
    }
}
