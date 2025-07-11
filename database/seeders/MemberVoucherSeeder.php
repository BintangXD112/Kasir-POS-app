<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Member;
use App\Models\Voucher;
use App\Models\MemberVoucher;
use Illuminate\Support\Carbon;

class MemberVoucherSeeder extends Seeder
{
    public function run(): void
    {
        $member = Member::where('nama', 'Budi')->first();
        $voucher = Voucher::where('persentase', 2.5)->first();

        $start = Carbon::today();
        $end = $start->copy()->addDays($voucher->masa_aktif_hari);

        MemberVoucher::create([
            'member_id' => $member->id,
            'voucher_id' => $voucher->id,
            'mulai_berlaku' => $start,
            'berakhir' => $end,
            'sudah_digunakan' => false,
        ]);
    }
}
