import React from "react";
import { PageProps } from '../types/index';
import { router } from '@inertiajs/react';

interface Produk {
  id: number;
  nama: string;
  harga: number;
  gambar: string;
}

interface DetailTransaksi {
  id: number;
  produk: Produk;
  qty: number;
  harga: number;

}

interface Member {
  id: number;
  nama: string;
}

interface Transaksi {
  id: number;
  kode_transaksi: string;
  member: Member | null;
  total: number;
  metode_pembayaran: string;
  status: string;
  waktu_bayar: string | null;
  created_at: string | null;
  detail: DetailTransaksi[];
}

interface TransaksiPageProps extends PageProps {
  transaksi: Transaksi[];
}

const TransaksiPage: React.FC<TransaksiPageProps> = ({ transaksi }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-600">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 bg-gray-800 shadow-md">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.visit('/kasir')}
            className="flex items-center px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Kembali ke Kasir
          </button>
          <h1 className="text-2xl font-bold text-white ml-4">Data Semua Transaksi</h1>
        </div>
      </nav>
      {/* Content */}
      <div className="flex-1 p-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <table className="min-w-full table-auto border border-gray-300 rounded overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border text-gray-700">Kode Transaksi</th>
                <th className="px-4 py-2 border text-gray-700">Member</th>
                <th className="px-4 py-2 border text-gray-700">Total</th>
                <th className="px-4 py-2 border text-gray-700">Metode</th>
                <th className="px-4 py-2 border text-gray-700">Status</th>
                <th className="px-4 py-2 border text-gray-700">Waktu Bayar</th>
                <th className="px-4 py-2 border text-gray-700">Detail Produk</th>
                <th className="px-4 py-2 border text-gray-700">Tanggal Transaksi</th>
              </tr>
            </thead>
            <tbody>
              {transaksi.map((trx) => (
                <tr key={trx.id} className="odd:bg-white even:bg-gray-50 border-b">
                  <td className="px-4 py-2 border font-semibold text-gray-800">{trx.kode_transaksi}</td>
                  <td className="px-4 py-2 border font-semibold text-gray-800">{trx.member?.nama ?? 'Non Member'}</td>
                  <td className="px-4 py-2 border text-gray-800">Rp {trx.total.toLocaleString('id-ID')}</td>
                  <td className="px-4 py-2 border text-gray-800 capitalize">{trx.metode_pembayaran}</td>
                  <td className={
                    `px-4 py-2 border font-bold ${trx.status === 'paid' ? 'text-green-600' : trx.status === 'pending' ? 'text-yellow-600' : 'text-red-600'}`
                  }>{trx.status}</td>
                  <td className="px-4 py-2 border text-gray-800">{trx.waktu_bayar ? new Date(trx.waktu_bayar).toLocaleString('id-ID') : '-'}</td>
                  <td className="px-4 py-2 border">
                    <ul className="space-y-2">
                      {trx.detail.map((d) => (
                        <li key={d.id} className="flex items-center gap-2">
                          <img src={`/logo/${d.produk.gambar}`} alt={d.produk.nama} className="w-10 h-10 object-cover rounded shadow" />
                          <span className="text-gray-700 font-medium">{d.qty}x {d.produk.nama}</span>
                          <span className="text-gray-500">@ Rp {d.harga.toLocaleString('id-ID')}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-2 border text-gray-800">{trx.created_at ? new Date(trx.created_at).toLocaleString('id-ID') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransaksiPage; 