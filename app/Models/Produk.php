<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Produk extends Model
{
    use HasFactory;

    protected $table = 'produk';
    protected $fillable = ['id_kategori', 'nama', 'harga', 'stok', 'gambar'];

    public function kategori()
    {
        return $this->belongsTo(Kategori::class, 'id_kategori');
    }

    public function pembelianStok()
    {
        return $this->hasMany(PembelianStok::class, 'produk_id');
    }
}
