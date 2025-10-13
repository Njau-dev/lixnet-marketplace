<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AgentTier extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'min_sales',
        'max_sales',
        'commission_rate',
    ];

    protected $casts = [
        'min_sales' => 'decimal:2',
        'max_sales' => 'decimal:2',
        'commission_rate' => 'decimal:2',
    ];

    public function commissions()
    {
        return $this->hasMany(Commission::class, 'tier_id');
    }
}
