<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\MemberVoucher;

class MemberVoucherSeeder extends Seeder
{
    public function run(): void
    {
        MemberVoucher::create([
            'member_id' => 1,
            'voucher_id' => 1,
            'jumlah_pakai' => 0,
        ]);
    }
}
