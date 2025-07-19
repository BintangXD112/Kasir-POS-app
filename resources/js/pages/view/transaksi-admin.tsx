import React, { useEffect, useState } from "react";
import { useMobileNavigation } from '@/hooks/use-mobile-navigation.js';
import { Link, router } from '@inertiajs/react';
import { LogOut } from 'lucide-react';
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

interface TransaksiPageProps {
  transaksi: Transaksi[];
}

const TransaksiAdminPage: React.FC<TransaksiPageProps> = ({ transaksi }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printDateFrom, setPrintDateFrom] = useState('');
  const [printDateTo, setPrintDateTo] = useState('');
  const [showLogOut, setShowLogOut] = useState(false);
  const funcShowLogOut = () => setShowLogOut(!showLogOut);
  const cleanup = useMobileNavigation();
  const handleLogout = () => {
    cleanup();
    router.flushAll();
    localStorage.removeItem("username");
    window.location.href = "/login";
  };
  const [nav, setNav] = useState(false);
  const funcNav = () => setNav(!nav);

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

  // Helper format rupiah
  const formatRupiah = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

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
                <td class="total">Rp ${trx.total.toLocaleString('id-ID')}</td>
                <td>${trx.metode_pembayaran}</td>
                <td class="status-${trx.status}">${trx.status}</td>
                <td>${trx.created_at ? new Date(trx.created_at).toLocaleDateString('id-ID') : '-'}</td>
                <td>${trx.detail.length} item(s)</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="summary">
          <h3>Ringkasan</h3>
          <p><strong>Total Transaksi:</strong> ${dataToPrint.length}</p>
          <p><strong>Total Pendapatan:</strong> Rp ${dataToPrint.reduce((sum, trx) => sum + trx.total, 0).toLocaleString('id-ID')}</p>
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
    <div className='w-full h-screen bg-gray-700 flex'>
      {/* Sidebar */}
      <div className={`${nav ? 'w-64' : 'w-0'} transition-all duration-300 ease-in-out bg-gray-800 overflow-hidden`}>
        <div className="p-4">
          <h3 className="text-white text-lg font-semibold mb-4">Menu</h3>
          <nav className="space-y-2 pt-2">
            <a href="/admin" className={`flex items-center hover:scale-105 gap-1 text-gray-300 hover:text-white hover:bg-gray-700 rounded px-3 py-2 transition-all duration-300 ease-in-out`}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
                <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
                <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
              </svg>
              Dashboard
            </a>
            <a href="/admin/transaksi" className={`flex bg-gray-700 text-white scale-105 items-center gap-1 hover:scale-105 hover:text-white hover:bg-gray-700 rounded px-3 py-2 transition-all duration-300 ease-in-out`}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
                <path fillRule="evenodd" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Riwayat Transaksi
            </a>
            <a href="/admin/member" className={`flex items-center gap-1 hover:scale-105 text-gray-300 hover:text-white hover:bg-gray-700 rounded px-3 py-2 transition-all duration-300 ease-in-out`}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
                <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM15.75 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM2.25 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM6.31 15.117A6.745 6.745 0 0 1 12 12a6.745 6.745 0 0 1 6.709 7.498.75.75 0 0 1-.372.568A12.696 12.696 0 0 1 12 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 0 1-.372-.568 6.787 6.787 0 0 1 1.019-4.38Z" clipRule="evenodd" />
                <path d="M5.082 14.254a8.287 8.287 0 0 0-1.308 5.135 9.687 9.687 0 0 1-1.764-.44l-.115-.04a.563.563 0 0 1-.373-.487l-.01-.121a3.75 3.75 0 0 1 3.57-4.047ZM20.226 19.389a8.287 8.287 0 0 0-1.308-5.135 3.75 3.75 0 0 1 3.57 4.047l-.01.121a.563.563 0 0 1-.373.486l-.115.04c-.567.2-1.156.349-1.764.441Z" />
              </svg>
              Kelola Member
            </a>
            <a href="/admin/produk" className={`flex items-center gap-1 hover:scale-105 text-gray-300 hover:text-white hover:bg-gray-700 rounded px-3 py-2 transition-all duration-300 ease-in-out`}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
                <path d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v.75c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875v-.75C22.5 3.839 21.66 3 20.625 3H3.375Z" />
                <path fillRule="evenodd" d="m3.087 9 .54 9.176A3 3 0 0 0 6.62 21h10.757a3 3 0 0 0 2.995-2.824L20.913 9H3.087Zm6.163 3.75A.75.75 0 0 1 10 12h4a.75.75 0 0 1 0 1.5h-4a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
              </svg>
              Products
            </a>
            <a href="/admin/voucher-diskon" className={`flex items-center gap-1 hover:scale-105 text-gray-300 hover:text-white hover:bg-gray-700 rounded px-3 py-2 transition-all duration-300 ease-in-out`}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
                <path fillRule="evenodd" d="M1.5 6.375c0-1.036.84-1.875 1.875-1.875h17.25c1.035 0 1.875.84 1.875 1.875v3.026a.75.75 0 0 1-.375.65 2.249 2.249 0 0 0 0 3.898.75.75 0 0 1 .375.65v3.026c0 1.035-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 0 1 1.5 17.625v-3.026a.75.75 0 0 1 .374-.65 2.249 2.249 0 0 0 0-3.898.75.75 0 0 1-.374-.65V6.375Zm15-1.125a.75.75 0 0 1 .75.75v.75a.75.75 0 0 1-1.5 0V6a.75.75 0 0 1 .75-.75Zm.75 4.5a.75.75 0 0 0-1.5 0v.75a.75.75 0 0 0 1.5 0v-.75Zm-.75 3a.75.75 0 0 1 .75.75v.75a.75.75 0 0 1-1.5 0v-.75a.75.75 0 0 1 .75-.75Zm.75 4.5a.75.75 0 0 0-1.5 0V18a.75.75 0 0 0 1.5 0v-.75ZM6 12a.75.75 0 0 1 .75-.75H12a.75.75 0 0 1 0 1.5H6.75A.75.75 0 0 1 6 12Zm.75 2.25a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3Z" clipRule="evenodd" />
              </svg>
              Voucher Diskon
            </a>
            <a href="/admin/voucher-usage" className={`flex items-center gap-1 hover:scale-105 text-gray-300 hover:text-white hover:bg-gray-700 rounded px-3 py-2 transition-all duration-300 ease-in-out`}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
                <path fillRule="evenodd" d="M7.502 6h7.128A3.375 3.375 0 0 1 18 9.375v9.375a3 3 0 0 0 3-3V6.108c0-1.505-1.125-2.811-2.664-2.94a48.972 48.972 0 0 0-.673-.05A3 3 0 0 0 15 1.5h-1.5a3 3 0 0 0-2.663 1.618c-.225.015-.45.032-.673.05C8.662 3.295 7.554 4.542 7.502 6ZM13.5 3A1.5 1.5 0 0 0 12 4.5h4.5A1.5 1.5 0 0 0 15 3h-1.5Z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M3 9.375C3 8.339 3.84 7.5 4.875 7.5h9.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 0 1 3 20.625V9.375Zm9.586 4.594a.75.75 0 0 0-1.172-.938l-2.476 3.096-.908-.907a.75.75 0 0 0-1.06 1.06l1.5 1.5a.75.75 0 0 0 1.116-.062l3-3.75Z" clipRule="evenodd" />
              </svg>
              Penggunaan Voucher
            </a>
            <a href="/admin/user" className={`flex items-center gap-1 hover:scale-105 text-gray-300 hover:text-white hover:bg-gray-700 rounded px-3 py-2 transition-all duration-300 ease-in-out`}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
                <path fillRule="evenodd" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" clipRule="evenodd" />
              </svg>
              Kelola User
            </a>
            <a href="/admin/user-logs" className={`flex items-center gap-1 hover:scale-105 text-gray-300 hover:text-white hover:bg-gray-700 rounded px-3 py-2 transition-all duration-300 ease-in-out`}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
                <path fillRule="evenodd" d="M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5zm2 2h10a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm5 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-3 4a1 1 0 1 1 2 0v2a1 1 0 1 1-2 0v-2zm4 0a1 1 0 1 1 2 0v2a1 1 0 1 1-2 0v-2z" clipRule="evenodd" />
              </svg>
              Log Aktivitas
            </a>
          </nav>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="w-full bg-gray-800 shadow-lg">
          <div className="flex justify-between items-center px-4 py-3">
            <div className='flex gap-3 items-center'>
              <button 
                onClick={funcNav}
                className="p-1 hover:bg-gray-600 hover:scale-150 rounded transition-all duration-300 ease-in-out"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 text-white">
                  <path fillRule="evenodd" d={`${nav ? 
                    `M7.28 7.72a.75.75 0 0 1 0 1.06l-2.47 2.47H21a.75.75 0 0 1 0 1.5H4.81l2.47 2.47a.75.75 0 1 1-1.06 1.06l-3.75-3.75a.75.75 0 0 1 0-1.06l3.75-3.75a.75.75 0 0 1 1.06 0Z` 
                    : `M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z`
                  }`} clipRule="evenodd" />
                </svg>
              </button>
              <h2 className="text-2xl md:text-3xl text-white font-bold">Point of Sale</h2>
            </div>
            <div className="flex justify-end items-center">
              <div className='relative'>
                <button 
                  onClick={funcShowLogOut}
                  className='flex items-center cursor-pointer gap-2 text-white hover:bg-gray-600 rounded px-3 py-2 transition-colors'
                >
                  <span className='text-sm md:text-base'>{localStorage.getItem("username")}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`${showLogOut && 'rotate-180'} transition-all duration-300 ease-in-out size-4`}>
                    <path fillRule="evenodd" d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z" clipRule="evenodd" />
                  </svg>
                </button>
                {showLogOut && (
                  <div className={`transition-all duration-150 ease-in-out absolute top-10 right-0 bg-red-500 cursor-pointer hover:opacity-50 rounded-md shadow-lg p-0 w-36 z-20 animate-fade-in`}>
                    <ul className="text-white m-0 p-0">
                      <li className="py-2 px-2 transition-colors rounded-md">
                        <Link className="flex cursor-pointer w-full" method="post" href={route('logout')} as="button" onClick={handleLogout}>
                          <LogOut className='mr-2' />
                          Log out
                        </Link>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Main Content Area */}
        <div className="flex-1 overflow-auto w-full h-screen p-6">
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
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
                  />
                </div>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
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
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
                >
                  <option value="created_at">Tanggal</option>
                  <option value="total">Total</option>
                  <option value="kode_transaksi">Kode</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-black"
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
                          {formatRupiah(trx.total)}
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
    </div>
  );
};

export default TransaksiAdminPage; 