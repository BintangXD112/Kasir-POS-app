<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Diskon;

class DiskonSeeder extends Seeder
{
    public function run(): void
    {
        Diskon::insert([
            [
                'jumlah_diskon' => 2.50,
            ],
            [
                'jumlah_diskon' => 4.75,
            ],
        ]);
    }
}
