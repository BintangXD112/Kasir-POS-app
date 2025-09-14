<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'nama_user' => 'Admin',
            'tipe_user' => 'admin',
            'kode_user' => 'admin123',
            'account' => 'active',
            'status' => 'Offline',
        ]);
        User::factory()->create([
            'nama_user' => 'Kasir',
            'tipe_user' => 'kasir',
            'kode_user' => 'kasir123',
            'account' => 'active',
            'status' => 'Offline',
        ]);
        $this->call([
            KategoriSeeder::class,
            ProdukSeeder::class,
            DiskonSeeder::class,
            MemberSeeder::class,
            TransaksiSeeder::class,
            DetailTransaksiSeeder::class,
            TabunganSeeder::class,
        ]);
    }
}
