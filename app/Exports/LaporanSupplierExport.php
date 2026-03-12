<?php

namespace App\Exports;

use App\Models\PembelianStok;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class LaporanSupplierExport implements FromCollection, WithHeadings
{
    protected $dateFrom;
    protected $dateTo;
    protected $supplierId;

    public function __construct($dateFrom, $dateTo, $supplierId)
    {
        $this->dateFrom = $dateFrom;
        $this->dateTo = $dateTo;
        $this->supplierId = $supplierId;
    }

    public function collection()
    {
        $query = PembelianStok::with(['supplier','produk','user']);

        if ($this->dateFrom) {
            $query->whereDate('created_at','>=',$this->dateFrom);
        }

        if ($this->dateTo) {
            $query->whereDate('created_at','<=',$this->dateTo);
        }

        if ($this->supplierId) {
            $query->where('supplier_id',$this->supplierId);
        }

        return $query->get()->values()->map(function ($item, $index) {
            return [
                $index + 1,
                $item->supplier?->nama_supplier,
                $item->produk?->nama,
                $item->user?->nama_user,
                $item->jumlah,
                $item->harga_beli,
                $item->total_harga,
                \Carbon\Carbon::parse($item->created_at)->format('d-m-Y H:i'),
            ];
        });
    }

    public function headings(): array
    {
        return [
            'No',
            'Supplier',
            'Produk',
            'User',
            'Jumlah',
            'Harga Beli',
            'Total',
            'Tanggal'
        ];
    }
}
