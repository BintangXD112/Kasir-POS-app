<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Member extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'nama',
        'alamat',
        'telepon',
        'diskon_id',
        'total_transaksi',
        'tanggal_daftar',
    ];

    protected $dates = [
        'tanggal_daftar',
    ];

    // Relasi ke tabel diskon
    public function diskon()
    {
        return $this->belongsTo(Diskon::class, 'diskon_id');
    }

    // Relasi ke tabungan
    public function tabungan()
    {
        return $this->hasOne(Tabungan::class, 'member_id');
    }

    // Relasi ke transaksi
    public function transaksi()
    {
        return $this->hasMany(Transaksi::class, 'member_id');
    }
}
