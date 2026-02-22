<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Produk extends Model
{
    use HasFactory;

    protected $table = 'produk';
    protected $fillable = ['id_jenis_produk', 'nama', 'harga', 'stok', 'gambar'];

    public function jenis_produk()
    {
        return $this->belongsTo(JenisProduk::class, 'id_jenis_produk');
    }

    public function pembelianStok()
    {
        return $this->hasMany(PembelianStok::class, 'produk_id');
    }
}
