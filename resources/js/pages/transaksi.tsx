import React, { useState } from "react";
import { PageProps } from '../types/index';
import { router } from '@inertiajs/react';
import Swal from 'sweetalert2';

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
  created_at: string | null;
  waktu_bayar: string | null;
  detail: DetailTransaksi[];
}

interface TransaksiPageProps extends PageProps {
  transaksi: Transaksi[];
}

const TransaksiPage: React.FC<TransaksiPageProps> = ({ transaksi }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printDateFrom, setPrintDateFrom] = useState('');
  const [printDateTo, setPrintDateTo] = useState('');

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      pending: 'bg-amber-100 text-amber-800 border-amber-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
    };
    return statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'cash':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'card':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        );
    }
  };

  const filteredTransaksi = transaksi
    .filter(trx => {
      const matchesSearch = trx.kode_transaksi.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (trx.member?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
      const matchesStatus = statusFilter === 'all' || trx.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy as keyof Transaksi];
      let bValue: any = b[sortBy as keyof Transaksi];
      
      if (sortBy === 'total') {
        aValue = a.total;
        bValue = b.total;
      } else if (sortBy === 'created_at') {
        aValue = new Date(a.created_at || '').getTime();
        bValue = new Date(b.created_at || '').getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handlePrint = () => {
    // Filter transaksi berdasarkan tanggal yang dipilih
    let dataToPrint = filteredTransaksi;
    
    if (printDateFrom) {
      dataToPrint = dataToPrint.filter(trx => {
        const trxDate = new Date(trx.created_at || '');
        const fromDate = new Date(printDateFrom);
        return trxDate >= fromDate;
      });
    }
    
    if (printDateTo) {
      dataToPrint = dataToPrint.filter(trx => {
        const trxDate = new Date(trx.created_at || '');
        const toDate = new Date(printDateTo);
        toDate.setHours(23, 59, 59, 999); // Set ke akhir hari
        return trxDate <= toDate;
      });
    }

    // Buat window baru untuk print
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laporan Transaksi</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { text-align: center; color: #333; }
          .header { text-align: center; margin-bottom: 30px; }
          .date-range { text-align: center; margin-bottom: 20px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .total { font-weight: bold; }
          .summary { margin-top: 20px; padding: 15px; background-color: #f9f9f9; }
          .status-paid { color: #059669; }
          .status-pending { color: #d97706; }
          .status-cancelled { color: #dc2626; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Laporan Transaksi</h1>
          <div class="date-range">
            ${printDateFrom || printDateTo ? 
              `Periode: ${printDateFrom ? new Date(printDateFrom).toLocaleDateString('id-ID') : 'Awal'} - ${printDateTo ? new Date(printDateTo).toLocaleDateString('id-ID') : 'Akhir'}` : 
              'Semua Transaksi'
            }
          </div>
          <p>Dicetak pada: ${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID')}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Kode Transaksi</th>
              <th>Member</th>
              <th>Total</th>
              <th>Metode Pembayaran</th>
              <th>Status</th>
              <th>Tanggal</th>
              <th>Items</th>
            </tr>
          </thead>
          <tbody>
            ${dataToPrint.map((trx, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${trx.kode_transaksi}</td>
                <td>${trx.member?.nama || 'Guest'}</td>
                <td class="total">${formatCurrency(trx.total)}</td>
                <td>${trx.metode_pembayaran}</td>
                <td class="status-${trx.status}">${trx.status}</td>
                <td>${trx.created_at ? new Date(trx.created_at).toLocaleDateString('id-ID') : '-'}</td>
                <td>${trx.detail.length}&nbsp;item(s)</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="summary">
          <h3>Ringkasan</h3>
          <p><strong>Total Transaksi:</strong> ${dataToPrint.length}</p>
<p><strong>Total Pendapatan:</strong> Rp ${dataToPrint.reduce((sum, trx) => Number(sum) + Number(trx.total), 0).toLocaleString('id-ID')}</p>
          <p><strong>Transaksi Paid:</strong> ${dataToPrint.filter(trx => trx.status === 'paid').length}</p>
          <p><strong>Transaksi Pending:</strong> ${dataToPrint.filter(trx => trx.status === 'pending').length}</p>
          <p><strong>Transaksi Cancelled:</strong> ${dataToPrint.filter(trx => trx.status === 'cancelled').length}</p>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
            setTimeout(() => window.close(), 100);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    setShowPrintModal(false);
  };



  // klik untuk melunasi
  const handleLunas = (id) => {
    Swal.fire({
      title: 'Tandai Lunas?',
      text: 'Transaksi ini akan ditandai sebagai sudah dibayar.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Lunas',
      cancelButtonText: 'Batal',
    }).then((result) => {
      if (result.isConfirmed) {
        router.post(route('transaksi.lunas', id), {}, {
          onSuccess: () => {
            Swal.fire('Sukses!', 'Transaksi berhasil ditandai lunas.', 'success');
          },
          onError: () => {
            Swal.fire('Gagal!', 'Terjadi kesalahan saat memproses.', 'error');
          }
        });
      }
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-700">
      {/* Navbar */}
      <nav className="bg-gray-800 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.visit('/kasir')}
                className="flex items-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors duration-200 font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                Kembali ke Kasir
              </button>
              <div className="h-6 w-px bg-slate-300"></div>
              <h1 className="text-2xl font-bold text-white">Riwayat Transaksi</h1>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {filteredTransaksi.length} transaksi
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 p-6">
        {/* Filter & Search */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Cari kode transaksi atau member..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="all">Semua Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>

              {/* Print Button */}
              <button
                onClick={() => setShowPrintModal(true)}
                className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Print
              </button>
              
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-black text-slate-700">Urutkan:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              >
                <option value="created_at">Tanggal</option>
                <option value="total">Total</option>
                <option value="kode_transaksi">Kode</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Print Modal */}
        {showPrintModal && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Print Laporan Transaksi</h3>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tanggal Dari (Opsional)
                  </label>
                  <input
                    type="date"
                    value={printDateFrom}
                    onChange={(e) => setPrintDateFrom(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tanggal Sampai (Opsional)
                  </label>
                  <input
                    type="date"
                    value={printDateTo}
                    onChange={(e) => setPrintDateTo(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex items-center gap-3 pt-4">
                  <button
                    onClick={handlePrint}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors duration-200 font-medium"
                  >
                    Print Sekarang
                  </button>
                  <button
                    onClick={() => setShowPrintModal(false)}
                    className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-2 px-4 rounded-lg transition-colors duration-200 font-medium"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modern Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Transaksi
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Member
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Pembayaran
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Produk
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Waktu
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filteredTransaksi.map((trx, index) => (
                    <tr
                      key={trx.id}
                      className={`hover:bg-slate-50 transition-colors duration-150 ${
                        trx.status === 'pending' ? 'cursor-pointer' : ''
                      }`}
                      onClick={() => {
                        if (trx.status === 'pending') {
                          handleLunas(trx.id);
                        }
                      }}
                    >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="font-mono text-sm font-semibold text-slate-900">
                          {trx.kode_transaksi}
                        </div>
                        <div className="text-xs text-slate-500">
                          ID: {trx.id}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold mr-3">
                          {trx.member?.nama?.charAt(0) || 'G'}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">
                            {trx.member?.nama || 'Guest'}
                          </div>
                          <div className="text-xs text-slate-500">
                            {trx.member ? 'Member' : 'Non Member'}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-lg font-bold text-slate-900">
                        {formatCurrency(trx.total)}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="text-slate-500">
                          {getPaymentMethodIcon(trx.metode_pembayaran)}
                        </div>
                        <span className="text-sm font-medium text-slate-700 capitalize">
                          {trx.metode_pembayaran}
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(trx.status)}`}>
                        {trx.status}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {trx.detail.slice(0, 3).map((d, idx) => (
                            <img
                              key={d.id}
                              src={`/logo/${d.produk.gambar}`}
                              alt={d.produk.nama}
                              className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                            />
                          ))}
                          {trx.detail.length > 3 && (
                            <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-semibold text-slate-600">
                              +{trx.detail.length - 3}
                            </div>
                          )}
                        </div>
                        <div className="ml-2">
                          <div className="text-sm font-medium text-slate-900">
                            {trx.detail.length} item{trx.detail.length > 1 ? 's' : ''}
                          </div>
                          <div className="text-xs text-slate-500">
                            {trx.detail.reduce((sum, d) => sum + d.qty, 0)} qty total
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="text-sm font-medium text-slate-900">
                          
                          {trx.status === "pending" ? trx.created_at && new Date(trx.created_at).toLocaleDateString('id-ID') : trx.waktu_bayar && new Date(trx.waktu_bayar).toLocaleDateString('id-ID')}
                        </div>
                        <div className="text-xs text-slate-500">
                          {trx.status === "pending" ? trx.created_at && new Date(trx.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : trx.waktu_bayar && new Date(trx.waktu_bayar).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </div>                        
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredTransaksi.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-slate-900">Tidak ada transaksi</h3>
              <p className="mt-1 text-sm text-slate-500">Tidak ada transaksi yang sesuai dengan filter yang dipilih.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransaksiPage;