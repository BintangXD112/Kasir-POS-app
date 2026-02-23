<?php

namespace App\Http\Controllers;

use App\Models\Transaksi;
use Inertia\Inertia;
use App\Models\DetailTransaksi;
use App\Models\UsageDiskon;
use App\Models\Produk;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\Member;



class TransaksiController extends Controller
{
    public function index()
    {
        $transaksi = Transaksi::with([
            'detail.produk:id,nama,harga,gambar',
            'member:id,nama',
            'supplier:id,nama_supplier'
        ])->latest()->get();

        return Inertia::render('Transaksi', [
            'transaksi' => $transaksi,
        ]);
    }
    public function store(Request $request)
    {
        $request->validate([
            'kode_transaksi' => 'required|string|unique:transaksi,kode_transaksi',
            'total' => 'required|numeric',
            'metode' => 'required|in:tunai,non-tunai,qris',
            'status' => 'required|in:lunas,pending',
            'member_id' => 'nullable|exists:members,id',
            'detail' => 'required|array|min:1',
            'detail.*.produk_id' => 'required|exists:produk,id',
            'detail.*.jumlah' => 'required|integer|min:1',
            'detail.*.harga' => 'required|numeric|min:0',
            'nama_member' => 'nullable|string',
        ]);

        DB::beginTransaction();

        try {
            $member = null;
            if ($request->filled('nama_member')) {
                $member = Member::where('nama', $request->nama_member)->first();
                if (!$member) {
                    return back()->withErrors(['nama_member' => 'Nama member tidak ditemukan.']);
                }
            }

            // Ambil produk sekaligus
            $produkIds = collect($request->detail)->pluck('produk_id')->unique();
            $produkList = Produk::whereIn('id', $produkIds)->lockForUpdate()->get()->keyBy('id'); // Lock untuk safety transaksi

            // Cek stok dulu semua
            foreach ($request->detail as $item) {
                $produk = $produkList->get($item['produk_id']);
                if (!$produk) {
                    throw new \Exception("Produk dengan ID {$item['produk_id']} tidak ditemukan.");
                }
                if ($produk->stok < $item['jumlah']) {
                    throw new \Exception("Stok tidak cukup untuk produk: {$produk->nama}");
                }
            }

            // Buat transaksi
            $transaksi = Transaksi::create([
                'kode_transaksi' => $request->kode_transaksi,
                'total' => $request->total,
                'user_id' => Auth::id(),
                'member_id' => $member?->id,
                'diskon_id' => $member?->diskon_id ?? null,
                'metode_pembayaran' => $request->metode,
                'status' => $request->status,
                'created_at' => in_array($request->status, ['lunas', 'pending']) ? now() : null,
                'waktu_bayar' => $request->status === 'lunas' ? now() : null,
            ]);

            $details = [];
            foreach ($request->detail as $item) {
                $produk = $produkList->get($item['produk_id']);

                // Kurangi stok di DB dan update model agar sesuai
                $produk->stok -= $item['jumlah'];
                if ($produk->stok < 0) {
                    throw new \Exception("Stok produk {$produk->nama} tidak mencukupi saat pengurangan.");
                }

                $produk->save();

                $details[] = [
                    'transaksi_id' => $transaksi->id,
                    'produk_id' => $item['produk_id'],
                    'qty' => $item['jumlah'],
                    'harga' => $item['harga'],
                    'created_at' => now(),
                    'waktu_bayar' => $request->status === 'lunas' ? now() : null,
                ];
            }

            DetailTransaksi::insert($details);



            // Setelah insert detail transaksi, hapus produk yang stoknya 0
            foreach ($produkList as $produk) {
                if ($produk->stok === 0) {
                    $produk->delete();
                }
            }

            if ($member) {
                // hitung total transaksi member dari tabel transaksi
                $totalTransaksiMember = Transaksi::where('member_id', $member->id)->count('member_id');

                // update kolom total_transaksi di member
                $member->total_transaksi = $totalTransaksiMember;
                $member->save();
            }

            if ($member?->diskon_id != 0) {
                $usagediskon = UsageDiskon::create([
                    'member_id' => $member->id,
                    'transaksi_id' => $transaksi->id,
                    'diskon_id' => $member->diskon_id,
                    'waktu_transaksi' => now(),
                ]);
            }

            DB::commit();

            return redirect()->route('kasir')->with('message', 'Transaksi berhasil!');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function lunas($id)
    {
        $trx = Transaksi::findOrFail($id);
        $trx->status = 'lunas';
        $trx->waktu_bayar = now();
        $trx->save();

        return back()->with('success', 'Transaksi berhasil ditandai lunas.');
    }
}
