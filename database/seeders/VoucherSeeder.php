<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Voucher;
use Illuminate\Support\Carbon;

class VoucherSeeder extends Seeder
{
    public function run(): void
    {
        $today = Carbon::today();

        Voucher::insert([
            [
                'kode' => 'VOUCHER25',
                'member_level_id' => 1,
                'diskon' => 2.5,
                'masa_aktif_mulai' => $today,
                'masa_aktif_selesai' => $today->copy()->addDay(),
                'maksimal_pakai' => 1,
            ],
            [
                'kode' => 'VOUCHER50',
                'member_level_id' => 2,
                'diskon' => 5,
                'masa_aktif_mulai' => $today,
                'masa_aktif_selesai' => $today->copy()->addWeek(),
                'maksimal_pakai' => 1,
            ],
            [
                'kode' => 'VOUCHER100',
                'member_level_id' => 3,
                'diskon' => 10,
                'masa_aktif_mulai' => $today,
                'masa_aktif_selesai' => $today->copy()->addMonth(),
                'maksimal_pakai' => 1,
            ],
            [
                'kode' => 'DONATUR50',
                'member_level_id' => 4,
                'diskon' => 50,
                'masa_aktif_mulai' => $today,
                'masa_aktif_selesai' => $today->copy()->addDay(),
                'maksimal_pakai' => 1,
            ],
        ]);
    }
}
