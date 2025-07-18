<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetailTabungan extends Model
{
    protected $table = 'detail_tabungan';
    protected $fillable = ['tabungan_id', 'tipe', 'nominal', 'keterangan','kode_transaksi'];


    public function tabungan()
    {
        return $this->belongsTo(Tabungan::class);
    }
}

