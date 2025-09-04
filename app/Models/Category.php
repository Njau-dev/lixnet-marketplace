<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $fillable = ['name', 'slug'];

    // categpory products relationship
    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
