<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class LaporanMemberExport implements WithMultipleSheets
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

    public function sheets(): array
    {
        return [
            new TransaksiMemberSheet($this->dateFrom, $this->dateTo, $this->member_id),
            new TabunganMemberSheet($this->dateFrom, $this->dateTo, $this->member_id),
        ];
    }
}