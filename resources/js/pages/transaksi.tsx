import React, { useEffect, useMemo, useState } from "react";
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

  // ====== ⬇️ STATE & LOGIC PAGINATION  ⬇️ ======
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  // Reset ke halaman 1 kalau filter/sort/pageSize berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortBy, sortOrder, pageSize]);
  // ====== ⬆️ STATE & LOGIC PAGINATION  ⬆️ ======

  const formatCurrency = (amount: number): string =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const getStatusBadge = (status: string) => {
    const base = "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border";
    const map: Record<string, string> = {
      paid: `${base} bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800`,
      pending: `${base} bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800`,
      cancelled: `${base} bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800`,
    };
    return map[status] || `${base} bg-gray-100 text-gray-800 border-gray-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700`;
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

  // Filter + sort
  const filteredTransaksi = useMemo(() => {
    const filtered = transaksi.filter(trx => {
      const matchesSearch =
        trx.kode_transaksi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (trx.member?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
      const matchesStatus = statusFilter === 'all' || trx.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    const sorted = filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Transaksi];
      let bValue: any = b[sortBy as keyof Transaksi];

      if (sortBy === 'total') {
        aValue = a.total;
        bValue = b.total;
      } else if (sortBy === 'created_at') {
        aValue = new Date(a.created_at || '').getTime();
        bValue = new Date(b.created_at || '').getTime();
      }

      if (sortOrder === 'asc') return aValue > bValue ? 1 : -1;
      return aValue < bValue ? 1 : -1;
    });

    return sorted;
  }, [transaksi, searchTerm, statusFilter, sortBy, sortOrder]);

  // ====== ⬇️ DERIVED PAGINATION  ⬇️ ======
  const totalItems = filteredTransaksi.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentSafe = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (currentSafe - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const pagedTransaksi = filteredTransaksi.slice(startIndex, endIndex);

  // Buat list nomor halaman (dengan "..." bila banyak)
  const getPageNumbers = (current: number, total: number): (number | '...')[] => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
    if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];

    return [1, '...', current - 1, current, current + 1, '...', total];
  };
  const pageNumbers = getPageNumbers(currentSafe, totalPages);
  // ====== ⬆️ DERIVED PAGINATION  ⬆️ ======

  const handlePrint = () => {
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
        toDate.setHours(23, 59, 59, 999);
        return trxDate <= toDate;
      });
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
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
          @media print { body { margin: 0; } .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Laporan Transaksi</h1>
          <div class="date-range">
            ${printDateFrom || printDateTo
              ? `Periode: ${printDateFrom ? new Date(printDateFrom).toLocaleDateString('id-ID') : 'Awal'} - ${printDateTo ? new Date(printDateTo).toLocaleDateString('id-ID') : 'Akhir'}`
              : 'Semua Transaksi'}
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

    printWindow.document.write(html);
    printWindow.document.close();
    setShowPrintModal(false);
  };

  const handleLunas = (id: number) => {
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
          onSuccess: () => Swal.fire('Sukses!', 'Transaksi berhasil ditandai lunas.', 'success'),
          onError: () => Swal.fire('Gagal!', 'Terjadi kesalahan saat memproses.', 'error')
        });
      }
    });
  };
  const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('theme') || 'auto');
  const [theme, setTheme] = useState(false);

  const bgApp =
    currentTheme === 'auto'
      ? 'bg-gray-50 dark:bg-zinc-950'
      : currentTheme === 'Light'
      ? 'bg-gray-50'
      : 'bg-zinc-950';

  const headerBg =
    currentTheme === 'auto'
      ? 'bg-gray-800 dark:bg-zinc-900/80'
      : currentTheme === 'Light'
      ? 'bg-gray-800' // header tetap gelap biar kontras
      : 'bg-zinc-900/80';

  const card =
    currentTheme === 'auto'
      ? 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800'
      : currentTheme === 'Dark'
      ? 'bg-zinc-900 border border-zinc-800'
      : 'bg-white border border-zinc-200';

  const text =
    currentTheme === 'auto' ? 'text-zinc-900 dark:text-zinc-100'
    : currentTheme === 'Dark' ? 'text-zinc-100'
    : 'text-zinc-900';
  const subText =
    currentTheme === 'auto' ? 'text-zinc-500 dark:text-zinc-400'
    : currentTheme === 'Dark' ? 'text-zinc-400'
    : 'text-zinc-500';
  const rowHover =
    currentTheme === 'auto' ? 'hover:bg-slate-50 dark:hover:bg-zinc-800/60'
    : currentTheme === 'Dark' ? 'hover:bg-zinc-800/60'
    : 'hover:bg-slate-50';
  const borderSoft = currentTheme === 'Dark' ? 'border-zinc-800' : 'border-slate-200';
  const inputTheme = currentTheme === 'auto' ? 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : currentTheme === 'Dark' ? 'border-zinc-700 bg-zinc-800 text-zinc-100' : 'border-slate-300 bg-white text-zinc-900';
  const bodyText =
    currentTheme === "auto"
      ? "text-zinc-900 dark:text-zinc-100"
      : currentTheme === "Light"
      ? "text-zinc-900"
      : "text-zinc-100";
  const softBg =
    currentTheme === "auto"
      ? "bg-slate-50 dark:bg-zinc-800/60"
      : currentTheme === "Light"
      ? "bg-slate-50"
      : "bg-zinc-800/60";

  return (
    <div className={`flex flex-col min-h-screen ${bgApp}`}>
      {/*Tema*/}
            <div className={`${currentTheme === 'auto' ? 'bg-zinc-50 shadow-gray-800 dark:shadow-gray-500 dark:bg-zinc-900 dark:text-white' : currentTheme === 'Light' ? 'bg-zinc-50 text-zinc-900 shadow-gray-800' : currentTheme === 'Dark' && 'bg-zinc-900 text-white shadow-gray-500'} rounded-xl transition-all py-2 gap-2 ${theme ? 'h-30 justify-end' :'h-12 justify-center'} w-12 fixed bottom-4 right-4 shadow border-slate-100 flex flex-col items-center z-10`}>
                {theme && (
                    <>
                    <svg onClick={()=>setTheme(false)} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                      <path fillRule="evenodd" d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z" clipRule="evenodd" />
                    </svg>
                    {currentTheme === "auto" ? (
                        <>
                        <svg onClick={()=>setCurrentTheme("Dark")} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 rounded hover:bg-gray-500 transition-all">
                          <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z" clipRule="evenodd" />
                        </svg>
                        <svg onClick={()=>setCurrentTheme("Light")} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 rounded hover:bg-gray-500 transition-all">
                          <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" />
                        </svg>
                        </>
                        ): currentTheme === "Light" ? (
                        <>
                        <svg onClick={()=>setCurrentTheme("Dark")} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 rounded hover:bg-gray-500 transition-all">
                          <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z" clipRule="evenodd" />
                        </svg>
                        <svg onClick={()=>setCurrentTheme("auto")} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 rounded hover:bg-gray-500 transition-all">
                          <path fillRule="evenodd" d="M11.828 2.25c-.916 0-1.699.663-1.85 1.567l-.091.549a.798.798 0 0 1-.517.608 7.45 7.45 0 0 0-.478.198.798.798 0 0 1-.796-.064l-.453-.324a1.875 1.875 0 0 0-2.416.2l-.243.243a1.875 1.875 0 0 0-.2 2.416l.324.453a.798.798 0 0 1 .064.796 7.448 7.448 0 0 0-.198.478.798.798 0 0 1-.608.517l-.55.092a1.875 1.875 0 0 0-1.566 1.849v.344c0 .916.663 1.699 1.567 1.85l.549.091c.281.047.508.25.608.517.06.162.127.321.198.478a.798.798 0 0 1-.064.796l-.324.453a1.875 1.875 0 0 0 .2 2.416l.243.243c.648.648 1.67.733 2.416.2l.453-.324a.798.798 0 0 1 .796-.064c.157.071.316.137.478.198.267.1.47.327.517.608l.092.55c.15.903.932 1.566 1.849 1.566h.344c.916 0 1.699-.663 1.85-1.567l.091-.549a.798.798 0 0 1 .517-.608 7.52 7.52 0 0 0 .478-.198.798.798 0 0 1 .796.064l.453.324a1.875 1.875 0 0 0 2.416-.2l.243-.243c.648-.648.733-1.67.2-2.416l-.324-.453a.798.798 0 0 1-.064-.796c.071-.157.137-.316.198-.478.1-.267.327-.47.608-.517l.55-.091a1.875 1.875 0 0 0 1.566-1.85v-.344c0-.916-.663-1.699-1.567-1.85l-.549-.091a.798.798 0 0 1-.608-.517 7.507 7.507 0 0 0-.198-.478.798.798 0 0 1 .064-.796l.324-.453a1.875 1.875 0 0 0-.2-2.416l-.243-.243a1.875 1.875 0 0 0-2.416-.2l-.453.324a.798.798 0 0 1-.796.064 7.462 7.462 0 0 0-.478-.198.798.798 0 0 1-.517-.608l-.091-.55a1.875 1.875 0 0 0-1.85-1.566h-.344ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" clipRule="evenodd" />
                        </svg>
                        </>
                        ): currentTheme === "Dark" && (
                        <>
                        <svg onClick={()=>setCurrentTheme("auto")} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 rounded hover:bg-gray-500 transition-all">
                          <path fillRule="evenodd" d="M11.828 2.25c-.916 0-1.699.663-1.85 1.567l-.091.549a.798.798 0 0 1-.517.608 7.45 7.45 0 0 0-.478.198.798.798 0 0 1-.796-.064l-.453-.324a1.875 1.875 0 0 0-2.416.2l-.243.243a1.875 1.875 0 0 0-.2 2.416l.324.453a.798.798 0 0 1 .064.796 7.448 7.448 0 0 0-.198.478.798.798 0 0 1-.608.517l-.55.092a1.875 1.875 0 0 0-1.566 1.849v.344c0 .916.663 1.699 1.567 1.85l.549.091c.281.047.508.25.608.517.06.162.127.321.198.478a.798.798 0 0 1-.064.796l-.324.453a1.875 1.875 0 0 0 .2 2.416l.243.243c.648.648 1.67.733 2.416.2l.453-.324a.798.798 0 0 1 .796-.064c.157.071.316.137.478.198.267.1.47.327.517.608l.092.55c.15.903.932 1.566 1.849 1.566h.344c.916 0 1.699-.663 1.85-1.567l.091-.549a.798.798 0 0 1 .517-.608 7.52 7.52 0 0 0 .478-.198.798.798 0 0 1 .796.064l.453.324a1.875 1.875 0 0 0 2.416-.2l.243-.243c.648-.648.733-1.67.2-2.416l-.324-.453a.798.798 0 0 1-.064-.796c.071-.157.137-.316.198-.478.1-.267.327-.47.608-.517l.55-.091a1.875 1.875 0 0 0 1.566-1.85v-.344c0-.916-.663-1.699-1.567-1.85l-.549-.091a.798.798 0 0 1-.608-.517 7.507 7.507 0 0 0-.198-.478.798.798 0 0 1 .064-.796l.324-.453a1.875 1.875 0 0 0-.2-2.416l-.243-.243a1.875 1.875 0 0 0-2.416-.2l-.453.324a.798.798 0 0 1-.796.064 7.462 7.462 0 0 0-.478-.198.798.798 0 0 1-.517-.608l-.091-.55a1.875 1.875 0 0 0-1.85-1.566h-.344ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" clipRule="evenodd" />
                        </svg>
                        <svg onClick={()=>setCurrentTheme("Light")} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 rounded hover:bg-gray-500 transition-all">
                          <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" />
                        </svg>
                        </>
                        )}
                    </>
                    )}
                {currentTheme === 'auto' ? (
                    <svg onClick={()=>setTheme(true)} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                      <path fillRule="evenodd" d="M11.828 2.25c-.916 0-1.699.663-1.85 1.567l-.091.549a.798.798 0 0 1-.517.608 7.45 7.45 0 0 0-.478.198.798.798 0 0 1-.796-.064l-.453-.324a1.875 1.875 0 0 0-2.416.2l-.243.243a1.875 1.875 0 0 0-.2 2.416l.324.453a.798.798 0 0 1 .064.796 7.448 7.448 0 0 0-.198.478.798.798 0 0 1-.608.517l-.55.092a1.875 1.875 0 0 0-1.566 1.849v.344c0 .916.663 1.699 1.567 1.85l.549.091c.281.047.508.25.608.517.06.162.127.321.198.478a.798.798 0 0 1-.064.796l-.324.453a1.875 1.875 0 0 0 .2 2.416l.243.243c.648.648 1.67.733 2.416.2l.453-.324a.798.798 0 0 1 .796-.064c.157.071.316.137.478.198.267.1.47.327.517.608l.092.55c.15.903.932 1.566 1.849 1.566h.344c.916 0 1.699-.663 1.85-1.567l.091-.549a.798.798 0 0 1 .517-.608 7.52 7.52 0 0 0 .478-.198.798.798 0 0 1 .796.064l.453.324a1.875 1.875 0 0 0 2.416-.2l.243-.243c.648-.648.733-1.67.2-2.416l-.324-.453a.798.798 0 0 1-.064-.796c.071-.157.137-.316.198-.478.1-.267.327-.47.608-.517l.55-.091a1.875 1.875 0 0 0 1.566-1.85v-.344c0-.916-.663-1.699-1.567-1.85l-.549-.091a.798.798 0 0 1-.608-.517 7.507 7.507 0 0 0-.198-.478.798.798 0 0 1 .064-.796l.324-.453a1.875 1.875 0 0 0-.2-2.416l-.243-.243a1.875 1.875 0 0 0-2.416-.2l-.453.324a.798.798 0 0 1-.796.064 7.462 7.462 0 0 0-.478-.198.798.798 0 0 1-.517-.608l-.091-.55a1.875 1.875 0 0 0-1.85-1.566h-.344ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" clipRule="evenodd" />
                    </svg>
                    ): currentTheme === 'Light' ? (
                    <svg onClick={()=>setTheme(true)} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                      <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" />
                    </svg>
                    ): currentTheme === 'Dark' && (
                    <svg onClick={()=>setTheme(true)} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                      <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z" clipRule="evenodd" />
                    </svg>
                    )}
            </div>
      {/* Navbar */}
      <nav className={`${headerBg} shadow-sm`}>
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
        <div className={`${card} ${text} rounded-xl shadow-sm border border-slate-200 p-6 mb-6`}>
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
                  className={`w-full pl-10 pr-4 py-2 border ${inputTheme} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`px-4 py-2 border ${inputTheme} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
              >
                <option value="all">Semua Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>

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
              <label className="text-sm font-medium">Urutkan:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`px-3 py-2 border ${inputTheme} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm`}
              >
                <option value="created_at">Tanggal</option>
                <option value="total">Total</option>
                <option value="kode_transaksi">Kode</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className={`p-2 border ${inputTheme} rounded-lg transition-colors`}
                aria-label="Toggle sort order"
                title="Toggle sort order"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Print Modal */}
        {showPrintModal && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
            <div className={`${card} ${bodyText} rounded-xl shadow-xl p-6 w-full max-w-md mx-4`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Print Laporan Transaksi</h3>
                <button onClick={() => setShowPrintModal(false)} className={`${subText} hover:opacity-80`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tanggal Dari (Opsional)</label>
                  <input
                    type="date"
                    value={printDateFrom}
                    onChange={(e) => setPrintDateFrom(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      ${currentTheme === "auto"
                        ? "border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                        : currentTheme === "Light"
                        ? "border-zinc-300 bg-zinc-50 text-zinc-900"
                        : "border-zinc-700 bg-zinc-800 text-zinc-100"}`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tanggal Sampai (Opsional)</label>
                  <input
                    type="date"
                    value={printDateTo}
                    onChange={(e) => setPrintDateTo(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      ${currentTheme === "auto"
                        ? "border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                        : currentTheme === "Light"
                        ? "border-zinc-300 bg-zinc-50 text-zinc-900"
                        : "border-zinc-700 bg-zinc-800 text-zinc-100"}`}
                  />
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button onClick={handlePrint} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors font-medium">
                    Print Sekarang
                  </button>
                  <button
                    onClick={() => setShowPrintModal(false)}
                    className={`flex-1 py-2 px-4 rounded-lg transition-colors font-medium
                      ${currentTheme === "Dark" ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-100" : "bg-slate-200 hover:bg-slate-300 text-slate-700"}`}
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabel */}
        <div className={`${card} ${text} relative pb-20 rounded-xl min-h-[65vh] shadow-sm border border-slate-200 overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className={`${softBg}`}>
                <tr className={`border-b ${borderSoft}`}>
                  {["Transaksi", "Member", "Total", "Pembayaran", "Status", "Produk", "Waktu"].map((h) => (
                    <th key={h} className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${subText}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedTransaksi.map((trx) => (
                  <tr
                    key={trx.id}
                    className={`${rowHover} transition-colors duration-150 ${trx.status === "pending" ? "cursor-pointer" : ""} border-b ${currentTheme === "Dark" ? "border-zinc-800" : "border-slate-100"}`}
                    onClick={() => { if (trx.status === "pending") handleLunas(trx.id); }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className={`font-mono text-sm font-semibold ${bodyText}`}>{trx.kode_transaksi}</div>
                        <div className={`text-xs ${subText}`}>ID: {trx.id}</div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold mr-3">
                          {trx.member?.nama?.charAt(0) || "G"}
                        </div>
                        <div>
                          <div className={`font-medium ${bodyText}`}>{trx.member?.nama || "Guest"}</div>
                          <div className={`text-xs ${subText}`}>{trx.member ? "Member" : "Non Member"}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className={`text-lg font-bold ${bodyText}`}>{formatCurrency(trx.total)}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`${subText}`}>{getPaymentMethodIcon(trx.metode_pembayaran)}</div>
                        <span className={`text-sm font-medium capitalize ${bodyText}`}>{trx.metode_pembayaran}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={getStatusBadge(trx.status)}>{trx.status}</span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {trx.detail.slice(0, 3).map((d) => (
                            <img
                              key={d.id}
                              src={`/logo/${d.produk.gambar}`}
                              alt={d.produk.nama}
                              className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                            />
                          ))}
                          {trx.detail.length > 3 && (
                            <div className={`w-8 h-8 rounded-full ${currentTheme === "Dark" ? "bg-zinc-800" : "bg-slate-200"} border-2 border-white flex items-center justify-center text-xs font-semibold ${currentTheme === "Dark" ? "text-zinc-300" : "text-slate-600"}`}>
                              +{trx.detail.length - 3}
                            </div>
                          )}
                        </div>
                        <div className="ml-2">
                          <div className={`text-sm font-medium ${bodyText}`}>
                            {trx.detail.length} item{trx.detail.length > 1 ? "s" : ""}
                          </div>
                          <div className={`text-xs ${subText}`}>
                            {trx.detail.reduce((sum, d) => sum + d.qty, 0)} qty total
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className={`text-sm font-medium ${bodyText}`}>
                          {trx.status === "pending"
                            ? trx.created_at && new Date(trx.created_at).toLocaleDateString("id-ID")
                            : trx.waktu_bayar && new Date(trx.waktu_bayar).toLocaleDateString("id-ID")}
                        </div>
                        <div className={`text-xs ${subText}`}>
                          {trx.status === "pending"
                            ? trx.created_at && new Date(trx.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
                            : trx.waktu_bayar && new Date(trx.waktu_bayar).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Kosong */}
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

          {/* ====== ⬇️ KONTROL PAGINATION  ⬇️ ====== */}
          {filteredTransaksi.length > 0 && (
            <div className={`flex flex-col sm:flex-row absolute bottom-0 left-0 right-0 items-center justify-between px-6 py-4 border-t ${borderSoft} gap-3`}>
              <div className={`text-sm ${subText}`}>
                Menampilkan <span className="font-semibold">{startIndex + 1}</span>–
                <span className="font-semibold">{endIndex}</span> dari
                <span className="font-semibold"> {totalItems}</span> transaksi
              </div>

              <div className="flex items-center gap-2">
                <button
                  className={`px-3 py-2 rounded-lg text-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 border
                    ${currentTheme === "Dark" ? "border-zinc-700 hover:bg-zinc-800" : "border-slate-300 hover:bg-slate-50"}`}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentSafe === 1}
                  aria-label="Halaman sebelumnya"
                >
                  Prev
                </button>

                {pageNumbers.map((p, idx) =>
                  p === "..." ? (
                    <span key={`dots-${idx}`} className={`px-2 select-none ${subText}`}>…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p as number)}
                      aria-current={currentSafe === p ? "page" : undefined}
                      className={`px-3 py-2 rounded-lg text-sm transition-all cursor-pointer border
                        ${currentSafe === p
                          ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-600/90"
                          : currentTheme === "Dark"
                          ? "border-zinc-700 hover:bg-blue-600 hover:text-white"
                          : "border-slate-300 hover:bg-blue-600 hover:text-white"}`}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  className={`px-3 py-2 rounded-lg text-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 border
                    ${currentTheme === "Dark" ? "border-zinc-700 hover:bg-zinc-800" : "border-slate-300 hover:bg-slate-50"}`}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentSafe === totalPages}
                  aria-label="Halaman berikutnya"
                >
                  Next
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-sm ${subText}`}>Per halaman:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className={`px-2 py-2 rounded-lg text-sm border
                    ${currentTheme === "auto"
                      ? "border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      : currentTheme === "Light"
                      ? "border-zinc-300 bg-zinc-50 text-zinc-900"
                      : "border-zinc-700 bg-zinc-800 text-zinc-100"}`}
                >
                  {[10, 25, 50, 100].map((sz) => (
                    <option key={sz} value={sz}>{sz}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
          {/* ====== ⬆️ KONTROL PAGINATION ⬆️ ====== */}
        </div>
      </div>
    </div>
  );
};

export default TransaksiPage;
