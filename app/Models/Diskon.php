<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Diskon extends Model
{
    protected $table = 'diskons';

    protected $fillable = [
        'kode_voucher',
        'deskripsi',
        'jumlah_diskon',
    ];

    public $timestamps = true;

    /**
     * Relasi ke member: satu diskon bisa dimiliki banyak member
     */
    public function members(): HasMany
    {
        return $this->hasMany(Member::class, 'diskon_id');
    }
}
