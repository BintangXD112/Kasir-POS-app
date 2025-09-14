import React, { useEffect, useState, useMemo } from "react";

export default function VoucherUsage() {
  const [usages, setUsages] = useState<UsageDiskon[]>([]);
  const [vouchers, setVouchers] = useState<Diskon[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // ====== ⬇️ STATE & LOGIC PAGINATION  ⬇️ ======
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  // Reset ke halaman 1 kalau filter/sort/pageSize berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, pageSize]);
  // ====== ⬆️ STATE & LOGIC PAGINATION  ⬆️ ======

  const filteredUsages = useMemo(() => {
    let out = usages;

    if (searchTerm !== "") {
      const q = searchTerm.toLowerCase();
      out = out.filter((item) =>
        item.member.toLowerCase().includes(q) ||
        item.kode_transaksi.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "") {
      out = out.filter((item) =>
        item.kode_voucher.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    return out;
  }, [usages, searchTerm, statusFilter]);
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchUsage();
    fetchVouchers();
    setLoading(false);
  }, []);

  const fetchVouchers = async () => {
    const res = await fetch('/admin/voucher-diskon');
    const data = await res.json();
    setVouchers(data);
  };

  const fetchUsage = async () => {
    const res = await fetch('/admin/voucher-usage');
    if (res.ok) {
      const data = await res.json();
      setUsages(data);
    }
  };

  // ====== ⬇️ DERIVED PAGINATION  ⬇️ ======
  const totalItems = filteredUsages.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentSafe = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (currentSafe - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const pagedDiskon = filteredUsages.slice(startIndex, endIndex);

  // Buat list nomor halaman (dengan "..." bila banyak)
  const getPageNumbers = (current: number, total: number): (number | '...')[] => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
    if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];

    return [1, '...', current - 1, current, current + 1, '...', total];
  };
  const pageNumbers = getPageNumbers(currentSafe, totalPages);
  // ====== ⬆️ DERIVED PAGINATION  ⬆️ ======

  return (
    <div className="px-6 pt-6 pb-20 relative max-w-full min-h-[75vh] mx-auto bg-gray-100 rounded-xl shadow text-black">
      <div className={`flex justify-between items-center`}>
        <h2 className="text-xl font-semibold mb-4 w-1/3">Penggunaan Voucher</h2>
        <div className="flex w-full justify-end gap-8">
          <input type="text" value={searchTerm} onChange={(e)=>{setSearchTerm(e.target.value)}} className={`w-1/2 mx-4 border border-slate-300 bg-white rounded-xl p-4`} placeholder="Cari nama member atau kode transaksi" />
          <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Semua voucher</option>
                {vouchers.map((item, i) => (
                  <option key={i} value={`${item.kode_voucher}`}>{item.kode_voucher}</option>
                  ))}
              </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        {loading ? <div className="text-center py-8">Loading...</div> : (
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 uppercase">
            <tr className="border-b border-gray-200">
              <th className="py-3 px-6">Member</th>
              <th className="py-3 px-6">Kode Voucher</th>
              <th className="py-3 px-6">Kode Transaksi</th>
              <th className="py-3 px-6">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsages.length > 0 && pagedDiskon.map((item, i) => (
              <tr key={i} className="border-b border-gray-200 hover:bg-gray-50 transition">
                <td className="py-3 px-6">{item.member}</td>
                <td className="py-3 px-6">{item.kode_voucher}</td>
                <td className="py-3 px-6">{item.kode_transaksi}</td>
                <td className="py-3 px-6">{new Date(item.waktu_transaksi).toLocaleString('id-ID')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
        {filteredUsages.length === 0 && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-slate-900">Tidak ada Data</h3>
                <p className="mt-1 text-sm text-slate-500">Tidak ada Data yang sesuai dengan filter yang dipilih.</p>
              </div>
            )}
        {/* ====== ⬇️ KONTROL PAGINATION  ⬇️ ====== */}
            {filteredUsages.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t absolute bottom-0 left-0 right-0 border-slate-200 gap-3">
                <div className="text-sm text-slate-600">
                  Menampilkan <span className="font-semibold">{startIndex + 1}</span>–
                  <span className="font-semibold">{endIndex}</span> dari
                  <span className="font-semibold"> {totalItems}</span> voucher diskon
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-2 border rounded-lg cursor-pointer disabled:cursor-not-allowed text-sm hover:bg-slate-50 disabled:opacity-50"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentSafe === 1}
                    aria-label="Halaman sebelumnya"
                  >
                    Prev
                  </button>

                  {pageNumbers.map((p, idx) =>
                    p === '...' ? (
                      <span key={`dots-${idx}`} className="px-2 text-slate-500 select-none">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p as number)}
                        aria-current={currentSafe === p ? 'page' : undefined}
                        className={`px-3 py-2 border rounded-lg text-sm hover:scale-105 transition-all cursor-pointer ${
                          currentSafe === p ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-600/50' : 'hover:text-white hover:bg-blue-600'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}

                  <button
                    className="px-3 py-2 border rounded-lg text-sm hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentSafe === totalPages}
                    aria-label="Halaman berikutnya"
                  >
                    Next
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Per halaman:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="px-2 py-2 border rounded-lg text-sm"
                  >
                    {[10, 25, 50, 100].map(sz => (
                      <option key={sz} value={sz}>{sz}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            {/* ====== ⬆️ KONTROL PAGINATION ⬆️ ====== */}
      </div>
    </div>
  );
} 