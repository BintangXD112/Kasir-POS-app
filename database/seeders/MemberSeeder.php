<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MemberSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('members')->insert([
            [
                'nama' => 'Ali Mustofa',
                'diskon_id' => 1, // pastikan ID ini ada di tabel diskons
                'total_transaksi' => 15,
                'tanggal_daftar' => now(),
            ],
            [
                'nama' => 'Siti Rahma',
                'diskon_id' => 2,
                'total_transaksi' => 30,
                'tanggal_daftar' => now()->subDays(10),
            ],
            [
                'nama' => 'Budi Santoso',
                'diskon_id' => null, // tidak dapat diskon
                'total_transaksi' => 5,
                'tanggal_daftar' => now()->subMonths(1),
            ],
        ]);
    }
}
