<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'category_id',
        'title',
        'description',
        'price',
        'rating',
        'rating_count',
        'note'
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
