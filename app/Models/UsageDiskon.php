<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UsageDiskon extends Model
{
    protected $table = 'usage_diskon';

    protected $fillable = [
        'member_id',
        'transaksi_id',
        'diskon_id',
        'waktu_transaksi',
    ];

    public $timestamps = true;

    // Relasi ke Member
    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class, 'member_id');
    }

    // Relasi ke Transaksi
    public function transaksi(): BelongsTo
    {
        return $this->belongsTo(Transaksi::class, 'transaksi_id');
    }

    // Relasi ke Diskon
    public function diskon(): BelongsTo
    {
        return $this->belongsTo(Diskon::class, 'diskon_id');
    }
}
