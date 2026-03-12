<?php

namespace App\Http\Controllers;

use App\Models\Transaksi;
use App\Models\PembelianStok;
use App\Models\Produk;
use App\Models\Supplier;
use App\Models\Pengeluaran;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\LaporanSupplierExport;
use App\Exports\LaporanMemberExport;
use App\Exports\LaporanPengeluaranExport;
use Illuminate\Http\Request;

class RekapController extends Controller
{
    public function index(Request $request)
    {
        $today = now()->toDateString();
        $startOfMonth = $request->date_from ?? now()->startOfMonth()->format('Y-m-d');
        $endOfMonth = $request->date_to ?? now()->endOfMonth()->format('Y-m-d');

        // Pemasukan hari ini (transaksi lunas)
        $pemasukanHariIni = Transaksi::where('status', 'lunas')
            ->where('jenis', 'masuk')
            ->whereDate('waktu_bayar', $today)
            ->sum('total');

        // Pengeluaran hari ini (pembelian stok)
        $pengeluaranHariIni = Pengeluaran::whereDate('created_at', $today)
            ->sum('total');

        // Rekap stok: semua produk
        $rekapStok = Produk::with('jenis_produk:id,nama_jenis_produk')
            ->select('id', 'nama', 'stok', 'harga', 'id_jenis_produk')
            ->orderBy('nama')
            ->get()
            ->map(function ($p) {
                return [
                    'id'             => $p->id,
                    'nama'           => $p->nama,
                    'stok'           => $p->stok,
                    'harga'          => $p->harga,
                    'nilai_stok'     => $p->stok * $p->harga,
                    'jenis_produk'   => $p->jenis_produk?->nama_jenis_produk ?? '-',
                ];
            });

        // Extra: bulan ini
        $pemasukanBulanIni = Transaksi::where('status', 'lunas')
            ->where('jenis', 'masuk')
            ->whereBetween('waktu_bayar', [now()->startOfMonth(), now()->endOfMonth()])
            ->sum('total');

        $pengeluaranBulanIni = Pengeluaran::whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])
            ->sum('total');

        $query = Pengeluaran::whereBetween('created_at', [$startOfMonth, $endOfMonth]);

        if ($request->filled('keyword')) {
            $query->where('keterangan', 'like', '%' . $request->keyword . '%');
        }

        $pengeluaran = $query
            ->latest()
            ->get();


        return Inertia::render('view/rekap', [
            'pemasukan_hari_ini'    => $pemasukanHariIni,
            'pengeluaran_hari_ini'  => $pengeluaranHariIni,
            'rekap_stok'            => $rekapStok,
            'pemasukan_bulan_ini'   => $pemasukanBulanIni,
            'pengeluaran_bulan_ini' => $pengeluaranBulanIni,
            'tanggal_hari_ini'      => now()->locale('id')->isoFormat('D MMMM YYYY'),
            'auth'                  => ['user' => Auth::user()],
            'pengeluaran' => $pengeluaran,
            'filters' => [
                'date_from' => $startOfMonth,
                'date_to' => $endOfMonth,
                'keyword' => $request->keyword
            ],
        ]);
    }
    public function exportSupplier(Request $request)
    {
        return Excel::download(
            new LaporanSupplierExport(
                $request->date_from,
                $request->date_to,
                $request->supplier_id
            ),
            'Laporan Supplier ' . $request->date_from . ' - ' . $request->date_to . '.xlsx'
        );
    }
    public function exportMember(Request $request)
    {
        return Excel::download(
            new LaporanMemberExport(
                $request->date_from,
                $request->date_to,
                $request->member_id
            ),
            'Laporan Member ' . $request->date_from . ' - ' . $request->date_to . '.xlsx'
        );
    }
    public function exportPengeluaran(Request $request)
    {
        return Excel::download(
            new LaporanPengeluaranExport(
                $request->date_from,
                $request->date_to,
                $request->keyword
            ),
            'Laporan Pengeluaran ' . $request->date_from . ' - ' . $request->date_to . '.xlsx'
        );
    }
    public function catatPengeluaran(Request $request)
    {
        $validated = $request->validate([
            'keterangan' => 'required|string|max:250',
            'total_bayar' => 'required|integer|min:0',
        ]);

        Pengeluaran::create([
            'keterangan' => $validated['keterangan'],
            'total' => $validated['total_bayar']
        ]);

        return redirect()->back()->with('success', 'catatan pengeluaran berhasil ditambahkan');
    }
}
