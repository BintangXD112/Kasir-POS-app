<?php

namespace App\Exports;

use App\Models\Pengeluaran;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;


class LaporanPengeluaranExport implements FromCollection, WithHeadings
{
    protected $dateFrom;
    protected $dateTo;
    protected $keyword;

    public function __construct($dateFrom, $dateTo, $keyword)
    {
        $this->dateFrom = $dateFrom;
        $this->dateTo = $dateTo;
        $this->keyword = $keyword;
    }

    public function collection()
    {
        $query = Pengeluaran::query();

        if ($this->dateFrom) {
            $query->whereDate('created_at','>=',$this->dateFrom);
        }

        if ($this->dateTo) {
            $query->whereDate('created_at','<=',$this->dateTo);
        }

        if ($this->keyword) {
            $query->where('supplier_id',$this->keyword);
        }

        return $query->get()->values()->map(function ($item, $index) {
            return [
                $index + 1,
                $item->keterangan,
                $item->total,
                \Carbon\Carbon::parse($item->created_at)->format('d-m-Y H:i'),
            ];
        });
    }

    public function headings(): array
    {
        return [
            'No',
            'Keterangan',
            'Total',
            'Tanggal'
        ];
    }
}
