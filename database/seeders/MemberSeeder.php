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
                'alamat' => 'Kampung beh ditu',
                'telepon' => '08512345678',
                'diskon_id' => 1, // pastikan ID ini ada di tabel diskons
                'total_transaksi' => 15,
                'tanggal_daftar' => now(),
            ],
            [
                'nama' => 'Siti Rahma',
                'alamat' => 'Kampung beh ditu',
                'telepon' => '08512345678',
                'diskon_id' => 2,
                'total_transaksi' => 30,
                'tanggal_daftar' => now()->subDays(10),
            ],
            [
                'nama' => 'Budi Santoso',
                'alamat' => 'Kampung beh ditu',
                'telepon' => '08512345678',
                'diskon_id' => null, // tidak dapat diskon
                'total_transaksi' => 5,
                'tanggal_daftar' => now()->subMonths(1),
            ],
        ]);
    }
}
