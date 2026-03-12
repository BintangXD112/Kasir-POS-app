<?php

namespace App\Exports;

use App\Models\DetailTabungan;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class TabunganMemberSheet implements FromCollection, WithHeadings
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
        $query = DetailTabungan::with([
            'tabungan.member:id,nama'
        ]);

        if ($this->dateFrom) {
            $query->whereDate('created_at','>=',$this->dateFrom);
        }

        if ($this->dateTo) {
            $query->whereDate('created_at','<=',$this->dateTo);
        }

        if ($this->member_id) {
            $query->whereHas('tabungan', function($q){
                $q->where('member_id',$this->member_id);
            });
        }

        return $query->get()->values()->map(function ($item, $index) {

            return [
                $index + 1,
                $item->tabungan?->member?->nama ?? '-',
                $item->nominal,
                $item->keterangan,
                \Carbon\Carbon::parse($item->created_at)->format('d-m-Y H:i')
            ];
        });
    }

    public function headings(): array
    {
        return [
            'No',
            'Member',
            'Nominal',
            'Keterangan',
            'Tanggal'
        ];
    }
}