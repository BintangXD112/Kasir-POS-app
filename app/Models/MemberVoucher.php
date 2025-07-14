<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class MemberVoucher extends Model
{
    use HasFactory;

    protected $table = 'member_voucher';

    protected $fillable = [
        'member_id',
        'voucher_id',
        'jumlah_pakai',
    ];

    public function member()
    {
        return $this->belongsTo(Member::class);
    }

    public function voucher()
    {
        return $this->belongsTo(Voucher::class);
    }
}
