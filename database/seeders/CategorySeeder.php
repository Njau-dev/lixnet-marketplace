<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Payroll & HR',     'slug' => 'payroll-hr'],
            ['name' => 'SACCO Management', 'slug' => 'sacco'],
            ['name' => 'School Management', 'slug' => 'school'],
            ['name' => 'POS Systems',      'slug' => 'pos'],
            ['name' => 'Accounting',       'slug' => 'accounting'],
            ['name' => 'Inventory',        'slug' => 'inventory'],
        ];

        foreach ($categories as $c) {
            Category::firstOrCreate(['slug' => $c['slug']], $c);
        }
    }
}
