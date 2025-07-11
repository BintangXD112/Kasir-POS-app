import React from "react";
import { PageProps } from '../types/index';

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

interface Transaksi {
  id: number;
  kode_transaksi: string;
  total: number;
  metode_pembayaran: string;
  status: string;
  waktu_bayar: string | null;
  detail: DetailTransaksi[];
}

interface TransaksiPageProps extends PageProps {
  transaksi: Transaksi[];
}

const TransaksiPage: React.FC<TransaksiPageProps> = ({ transaksi }) => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Data Semua Transaksi</h1>
      <table className="min-w-full table-auto border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border">Kode Transaksi</th>
            <th className="px-4 py-2 border">Total</th>
            <th className="px-4 py-2 border">Metode</th>
            <th className="px-4 py-2 border">Status</th>
            <th className="px-4 py-2 border">Waktu Bayar</th>
            <th className="px-4 py-2 border">Detail Produk</th>
          </tr>
        </thead>
        <tbody>
          {transaksi.map((trx) => (
            <tr key={trx.id} className="border-b">
              <td className="px-4 py-2 border">{trx.kode_transaksi}</td>
              <td className="px-4 py-2 border">Rp {trx.total.toLocaleString('id-ID')}</td>
              <td className="px-4 py-2 border">{trx.metode_pembayaran}</td>
              <td className="px-4 py-2 border">{trx.status}</td>
              <td className="px-4 py-2 border">{trx.waktu_bayar ? new Date(trx.waktu_bayar).toLocaleString('id-ID') : '-'}</td>
              <td className="px-4 py-2 border">
                <ul className="list-disc ml-4">
                  {trx.detail.map((d) => (
                    <li key={d.id}>
                      {d.qty}x {d.produk.nama} @ Rp {d.harga.toLocaleString('id-ID')}
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransaksiPage; 