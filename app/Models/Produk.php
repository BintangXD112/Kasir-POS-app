<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Produk extends Model
{
    protected $table = 'produk'; // override karena default-nya 'produks'
    protected $fillable = ['nama', 'harga', 'gambar'];
}
