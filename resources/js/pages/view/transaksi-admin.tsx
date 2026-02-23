import React, { useState, useEffect, useMemo } from "react";
import { PageProps } from "@/types/index";
import { router } from "@inertiajs/react";
import Swal from "sweetalert2";


interface Supplier { id: number; nama_supplier: string; }
interface Produk { id: number; nama: string; harga: number; gambar: string; }
interface DetailTransaksi { id: number; produk: Produk; qty: number; harga: number; }
interface Member { id: number; nama: string; }
interface Transaksi {
  id: number;
  jenis: string;
  kode_transaksi: string;
  supplier: Supplier | null;
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
  currentTheme: "auto" | "Light" | "Dark";
}

const TransaksiPage: React.FC<TransaksiPageProps> = ({ transaksi, currentTheme }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<keyof Transaksi | "total">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printDateFrom, setPrintDateFrom] = useState("");
  const [printDateTo, setPrintDateTo] = useState("");

  // ===== Pagination =====
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter, sortBy, sortOrder, pageSize]);

  // ===== THEME HELPERS =====
  const appBg =
    currentTheme === "auto" ? "bg-gray-50 dark:bg-zinc-950"
    : currentTheme === "Light" ? "bg-gray-50"
    : "bg-zinc-950";
  const cardBg =
    currentTheme === "auto"
      ? "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
      : currentTheme === "Light"
      ? "bg-white border border-zinc-200"
      : "bg-zinc-900 border border-zinc-800";
  const bodyText =
    currentTheme === "auto"
      ? "text-zinc-900 dark:text-zinc-100"
      : currentTheme === "Light"
      ? "text-zinc-900"
      : "text-zinc-100";
  const subText =
    currentTheme === "auto"
      ? "text-zinc-500 dark:text-zinc-400"
      : currentTheme === "Light"
      ? "text-zinc-500"
      : "text-zinc-400";
  const softBg =
    currentTheme === "auto"
      ? "bg-slate-50 dark:bg-zinc-800/60"
      : currentTheme === "Light"
      ? "bg-slate-50"
      : "bg-zinc-800/60";
  const rowHover =
    currentTheme === "auto"
      ? "hover:bg-slate-50 dark:hover:bg-zinc-800/60"
      : currentTheme === "Light"
      ? "hover:bg-slate-50"
      : "hover:bg-zinc-800/60";
  const borderSoft = currentTheme === "Dark" ? "border-zinc-800" : "border-slate-200";

  // ===== Utils =====
  const formatCurrency = (amount: number): string =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const getStatusBadge = (status: string) => {
    const base = "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border";
    const map: Record<string, string> = {
      lunas: `${base} bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800`,
      pending: `${base} bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800`,
      cancelled: `${base} bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800`,
    };
    return map[status] || `${base} bg-gray-100 text-gray-800 border-gray-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700`;
  };

  const getJenisBadge = (jenis: string) => {
    const base = "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border";
    if (!jenis) return `${base} bg-gray-100 text-gray-800 border-gray-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700`;
    switch (jenis.toLowerCase()) {
      case "masuk":
        return `${base} bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800`;
      case "keluar":
        return `${base} bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800`;
      default:
        return `${base} bg-gray-100 text-gray-800 border-gray-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700`;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case "cash":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case "card":
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

  // ===== Filter + Sort + Memo =====
  const filteredTransaksi = useMemo(() => {
    const filtered = transaksi.filter((trx) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        trx.kode_transaksi.toLowerCase().includes(q) ||
        (trx.member?.nama?.toLowerCase().includes(q) || false);
      const matchesStatus = statusFilter === "all" || trx.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    const sorted = filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Transaksi];
      let bValue: any = b[sortBy as keyof Transaksi];
      if (sortBy === "total") { aValue = a.total; bValue = b.total; }
      if (sortBy === "created_at") {
        aValue = new Date(a.created_at || "").getTime();
        bValue = new Date(b.created_at || "").getTime();
      }
      return sortOrder === "asc" ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
    });

    return sorted;
  }, [transaksi, searchTerm, statusFilter, sortBy, sortOrder]);

  // ===== Derived Pagination =====
  const totalItems = filteredTransaksi.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentSafe = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (currentSafe - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const pagedTransaksi = filteredTransaksi.slice(startIndex, endIndex);
  const getPageNumbers = (current: number, total: number): (number | "...")[] => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
    if (current >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
    return [1, "...", current - 1, current, current + 1, "...", total];
  };
  const pageNumbers = getPageNumbers(currentSafe, totalPages);

  // ===== Print =====
  const handlePrint = () => {
    let dataToPrint = filteredTransaksi;
    if (printDateFrom) {
      dataToPrint = dataToPrint.filter(trx => new Date(trx.created_at || "") >= new Date(printDateFrom));
    }
    if (printDateTo) {
      const toDate = new Date(printDateTo); toDate.setHours(23, 59, 59, 999);
      dataToPrint = dataToPrint.filter(trx => new Date(trx.created_at || "") <= toDate);
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html><html><head><meta charset="utf-8"/>
      <title>Laporan Transaksi</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; color:#111; }
        h1 { text-align:center; color:#333; }
        .header { text-align:center; margin-bottom: 30px; }
        .date-range { text-align:center; margin-bottom: 20px; color:#666; }
        table { width:100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .total { font-weight: bold; }
        .summary { margin-top: 20px; padding: 15px; background-color: #f9f9f9; }
        .status-lunas { color: #059669; }
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
              <th>No</th><th>Kode Transaksi</th><th>Member</th><th>Supplier</th><th>Total</th>
              <th>Metode Pembayaran</th><th>Status</th><th>Tanggal</th><th>Items</th>
            </tr>
          </thead>
          <tbody>
            ${dataToPrint.map((trx, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${trx.kode_transaksi}</td>
                <td>${trx.member?.nama || 'Guest'}</td>
                <td>${trx.supplier?.nama_supplier || '-'}</td>
                <td class="total">${formatCurrency(trx.total)}</td>
                <td>${trx.metode_pembayaran}</td>
                <td class="status-${trx.status}">${trx.status}</td>
                <td>${trx.created_at ? new Date(trx.created_at).toLocaleDateString('id-ID') : '-'}</td>
                <td>${trx.detail.length}&nbsp;item(s)</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <div class="summary">
          <h3>Ringkasan</h3>
          <p><strong>Total Transaksi:</strong> ${dataToPrint.length}</p>
          <p><strong>Total Pendapatan:</strong> Rp ${dataToPrint.reduce((sum, trx) => Number(sum) + Number(trx.total), 0).toLocaleString('id-ID')}</p>
          <p><strong>Transaksi lunas:</strong> ${dataToPrint.filter(trx => trx.status === 'lunas').length}</p>
          <p><strong>Transaksi Pending:</strong> ${dataToPrint.filter(trx => trx.status === 'pending').length}</p>
          <p><strong>Transaksi Cancelled:</strong> ${dataToPrint.filter(trx => trx.status === 'cancelled').length}</p>
        </div>

        <script>window.onload = function(){ window.print(); setTimeout(()=>window.close(), 100); }</script>
      </body></html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    setShowPrintModal(false);
  };

  // klik untuk melunasi
  const handleLunas = (id: number) => {
    Swal.fire({
      title: "Tandai Lunas?",
      text: "Transaksi ini akan ditandai sebagai sudah dibayar.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Lunas",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        router.post(route("transaksi.lunas", id), {}, {
          onSuccess: () => Swal.fire("Sukses!", "Transaksi berhasil ditandai lunas.", "success"),
          onError: () => Swal.fire("Gagal!", "Terjadi kesalahan saat memproses.", "error"),
        });
      }
    });
  };

  return (
    <div className={`rounded-xl shadow ${appBg}`}>
      {/* Header */}
      <div className="pl-6 pt-6 flex items-center">
        <h2 className={`text-xl font-semibold ${bodyText}`}>Riwayat Transaksi</h2>
      </div>

      <div className="flex-1 pb-6 pt-4 px-6">
        {/* Filter & Search */}
        <div className={`${cardBg} ${bodyText} rounded-xl shadow-sm p-6 mb-6`}>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${subText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Cari kode transaksi atau member..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                    ${currentTheme === "auto"
                      ? "border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      : currentTheme === "Light"
                      ? "border-zinc-300 bg-zinc-50 text-zinc-900"
                      : "border-zinc-700 bg-zinc-800 text-zinc-100"}`}
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                  ${currentTheme === "auto"
                    ? "border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    : currentTheme === "Light"
                    ? "border-zinc-300 bg-zinc-50 text-zinc-900"
                    : "border-zinc-700 bg-zinc-800 text-zinc-100"}`}
              >
                <option value="all">Semua Status</option>
                <option value="lunas">lunas</option>
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
              <label className={`text-sm font-medium ${bodyText}`}>Urutkan:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className={`px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                  ${currentTheme === "auto"
                    ? "border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    : currentTheme === "Light"
                    ? "border-zinc-300 bg-zinc-50 text-zinc-900"
                    : "border-zinc-700 bg-zinc-800 text-zinc-100"}`}
              >
                <option value="created_at">Tanggal</option>
                <option value="total">Total</option>
                <option value="kode_transaksi">Kode</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className={`p-2 rounded-lg border transition-colors ${currentTheme === "Dark" ? "border-zinc-700 hover:bg-zinc-800" : "border-slate-300 hover:bg-slate-50"}`}
                aria-label="Toggle sort order"
                title="Toggle sort order"
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>
        </div>

        {/* Print Modal */}
        {showPrintModal && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
            <div className={`${cardBg} ${bodyText} rounded-xl shadow-xl p-6 w-full max-w-md mx-4`}>
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

        {/* Table */}
        <div className={`${cardBg} relative pb-20 rounded-xl shadow-sm overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className={`${softBg}`}>
                <tr className={`border-b ${borderSoft}`}>
                  {["Transaksi", "Nama Mitra", "Jenis Transaksi", "Total", "Pembayaran", "Status", "Produk", "Waktu"].map((h) => (
                    <th key={h} className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${subText}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedTransaksi.map((trx) => (
                  <tr
                    key={trx.id}
                    className={`${rowHover} transition-colors duration-150 ${trx.status === "pending" ? "cursor-pointer" : ""} border-b ${currentTheme === "Dark" ? "border-zinc-800" : "border-slate-100"}`}
                    onClick={() => { console.log(trx); if (trx.status === "pending") handleLunas(trx.id); }}
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
                          {(trx.member?.nama || trx.supplier?.nama_supplier || "G").charAt(0)}
                        </div>
                        <div>
                          <div className={`font-medium ${bodyText}`}>{trx.member?.nama || trx.supplier?.nama_supplier || "Guest"}</div>
                          <div className={`text-xs ${subText}`}>
                            {trx.member ? "Member" : trx.supplier ? "Supplier" : "Guest"}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div>
                          <span className={getJenisBadge(trx.jenis)}>{trx.jenis}</span>
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
                <svg className={`mx-auto h-12 w-12 ${subText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className={`mt-2 text-sm font-medium ${bodyText}`}>Tidak ada transaksi</h3>
                <p className={`mt-1 text-sm ${subText}`}>Tidak ada transaksi yang sesuai dengan filter yang dipilih.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
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
        </div>
      </div>
    </div>
  );
};

export default TransaksiPage;
