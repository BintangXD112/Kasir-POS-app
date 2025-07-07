<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'nama_user' => 'Admin',
            'tipe_user' => 'admin',
            'kode_user' => 'admin123',
        ]);
        User::factory()->create([
            'nama_user' => 'Kasir',
            'tipe_user' => 'kasir',
            'kode_user' => 'kasir123',
        ]);
    }
}
