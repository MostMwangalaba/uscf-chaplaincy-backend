<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Faculty;

class FacultySeeder extends Seeder
{
    public function run(): void
    {
        $faculties = [
            'CIVE',
            'COED',
            'TIBA',
            'SOCIAL',
            'HUMANITY'
        ];

        foreach ($faculties as $name) {
            Faculty::firstOrCreate(['name' => $name]);
        }
    }
}
