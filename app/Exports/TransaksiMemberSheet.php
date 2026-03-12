<?php

namespace App\Exports;

use App\Models\Transaksi;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class TransaksiMemberSheet implements FromCollection, WithHeadings
{
    protected $dateFrom;
    protected $dateTo;
    protected $member_id;

    public function __construct($dateFrom, $dateTo, $member_id)
    {
        $this->dateFrom = $dateFrom;
        $this->dateTo = $dateTo;
        $this->member_id = $member_id;
    }

    public function collection()
    {
        $query = Transaksi::with([
            'member:id,nama',
            'users:id,nama_user',
            'detail.produk:id,nama'
        ])->where('jenis','masuk');

        if ($this->dateFrom) {
            $query->whereDate('created_at','>=',$this->dateFrom);
        }

        if ($this->dateTo) {
            $query->whereDate('created_at','<=',$this->dateTo);
        }

        if ($this->member_id) {
            $query->where('member_id',$this->member_id);
        }

        return $query->get()->values()->map(function ($item, $index) {

            $produk = $item->detail->map(function ($d) {
                return $d->produk?->nama;
            })->implode(', ');

            return [
                $index + 1,
                $item->member?->nama ?? 'Non Member',
                $produk,
                $item->user?->nama_user,
                $item->detail->sum('jumlah'),
                $item->total,
                \Carbon\Carbon::parse($item->created_at)->format('d-m-Y H:i')
            ];
        });
    }

    public function headings(): array
    {
        return [
            'No',
            'Member',
            'Produk',
            'User',
            'Jumlah',
            'Total',
            'Tanggal Pembelian'
        ];
    }
}