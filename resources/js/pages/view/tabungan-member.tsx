import { router } from '@inertiajs/react';
import React, { useState, useMemo, useEffect } from 'react';

function TabunganTable({ tabungan, currentTheme }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIds, setExpandedIds] = useState(new Set());

  // ====== ⬇️ STATE & LOGIC PAGINATION  ⬇️ ======
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  // Reset ke halaman 1 kalau filter/sort/pageSize berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, pageSize]);
  // ====== ⬆️ STATE & LOGIC PAGINATION  ⬆️ ======

  // Filter data berdasarkan search term
  const filteredTabungan = useMemo(() => {
    if (!searchTerm) return tabungan;
    return tabungan.filter(item =>
      item.member?.nama.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, tabungan]);

  const appBg =
    currentTheme === 'auto' ? 'bg-gray-100 dark:bg-zinc-950'
    : currentTheme === 'Dark' ? 'bg-zinc-950'
    : 'bg-gray-100';

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

  // Toggle expand / collapse
  const toggleExpand = (id) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };
  // ====== ⬇️ DERIVED PAGINATION  ⬇️ ======
  const totalItems = filteredTabungan.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentSafe = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (currentSafe - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const pagedTabungan = filteredTabungan.slice(startIndex, endIndex);

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
    <div className={`px-6 pt-6 relative pb-20 ${appBg} rounded-xl min-h-[75vh]`}>
    <div className="flex justify-between">
        <h1 className="text-3xl font-extrabold mb-6 text-left">Tabungan Member</h1>

        {/* Search Bar */}
        <div className="relative mb-8 max-w-">
            <input
            type="text"
            placeholder="Cari nama member..."
            className={`w-full shadow mx-4 pl-8 rounded-xl p-3 border
            ${currentTheme === 'auto'
              ? 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
              : currentTheme === 'Dark'
              ? 'border-zinc-700 bg-zinc-800 text-zinc-100'
              : 'border-slate-300 bg-white text-zinc-900'}`}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            aria-label="Cari nama member"
            />
            <svg
            className="w-5 h-5 text-gray-400 absolute left-6 top-1/2 transform -translate-y-1/2 pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            {searchTerm && (
            <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label="Clear search"
            >
                &times;
            </button>
            )}
        </div>
    </div>

      {/* List of members */}
      {filteredTabungan.length === 0 ? (
        <p className="text-center text-gray-500 text-lg italic">Tidak ada data</p>
      ) : (
        <div className="space-y-6">
          {pagedTabungan.map(({ id, member, saldo, detail }) => {
            const isExpanded = expandedIds.has(id);
            return (
              <div
                key={id}
                className={`${card} rounded-2xl shadow-md p-6 border border-gray-200`}
                aria-expanded={isExpanded}
              >
                {/* Header */}
                <div
                className="flex items-center cursor-pointer select-none"
                onClick={() => toggleExpand(id)}
                role="button"
                tabIndex={0}
                onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                    toggleExpand(id);
                    }
                }}
                >
                <div className="flex flex-col w-1/2">
                    <span className="text-xs uppercase tracking-wide">Nama Member</span>
                    <h2 className="text-lg font-semibold">{member?.nama ?? '—'}</h2>
                </div>
                <div className="flex flex-col w-1/2 items-end">
                    <span className="text-xs uppercase tracking-wide">Total Saldo</span>
                    <div className="font-bold text-lg">
                    Rp {Number(saldo ?? 0).toLocaleString()}
                    </div>
                </div>
                <button
                    aria-label={isExpanded ? 'Collapse detail transaksi' : 'Expand detail transaksi'}
                    className="ml-4 focus:outline-none"
                >
                    {isExpanded ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                    </svg>
                    ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                    )}
                </button>
                </div>


                {/* Detail transaksi (collapsible) */}
                {isExpanded && (
                  <div className="mt-6 space-y-4">
                    {detail && detail.length > 0 ? (
                      detail.map(({ created_at, tipe, nominal, keterangan }, idx) => (
                        <div
                          key={idx}
                          className={`flex justify-between items-center ${card} ${text} rounded-lg p-4 border border-gray-200`}
                        >
                          <div className="flex flex-col font-mono text-sm w-36 shrink-0">
                            {new Date(created_at).toLocaleString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              tipe === 'deposit'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {tipe === 'deposit' ? 'Deposit' : 'Penarikan'}
                          </div>
                          <div className="flex-1 px-4 italic truncate">
                            {keterangan ?? <span className="text-gray-400">—</span>}
                          </div>
                          <div className="font-semibold whitespace-nowrap">
                            Rp {Number(nominal ?? 0).toLocaleString()}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center italic">Tidak ada transaksi</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {/* pagination */}
        {filteredTabungan.length > 0 && (
          <div className={`flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t ${borderSoft} absolute bottom-0 left-0 right-0 gap-3`}>
            <div className={`text-sm ${subText}`}>
              Menampilkan <span className="font-semibold">{startIndex + 1}</span>–
              <span className="font-semibold">{endIndex}</span> dari
              <span className="font-semibold"> {totalItems}</span> Tabungan Member
            </div>

            <div className="flex items-center gap-2">
              <button
                className={`px-3 py-2 border rounded-lg text-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-50
                  ${currentTheme === 'Dark' ? 'border-zinc-700 hover:bg-zinc-800' : 'border-slate-300 hover:bg-slate-50'}`}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentSafe === 1}
                aria-label="Halaman sebelumnya"
              >
                Prev
              </button>

              {pageNumbers.map((p, idx) =>
                p === '...' ? (
                  <span key={`dots-${idx}`} className={`px-2 select-none ${subText}`}>…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p as number)}
                    aria-current={currentSafe === p ? 'page' : undefined}
                    className={`px-3 py-2 border rounded-lg text-sm transition-all cursor-pointer
                      ${currentSafe === p
                        ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-600/90'
                        : currentTheme === 'Dark'
                        ? 'border-zinc-700 hover:bg-blue-600 hover:text-white'
                        : 'border-slate-300 hover:bg-blue-600 hover:text-white'}`}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                className={`px-3 py-2 border rounded-lg text-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-50
                  ${currentTheme === 'Dark' ? 'border-zinc-700 hover:bg-zinc-800' : 'border-slate-300 hover:bg-slate-50'}`}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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
                className={`px-2 py-2 border rounded-lg text-sm
                  ${currentTheme === 'auto'
                    ? 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800'
                    : currentTheme === 'Dark'
                    ? 'border-zinc-700 bg-zinc-800'
                    : 'border-slate-300 bg-white'}`}
              >
                {[10, 25, 50, 100].map(sz => (
                  <option key={sz} value={sz}>{sz}</option>
                ))}
              </select>
            </div>
          </div>
        )}
    </div>
  );
}

export default TabunganTable;
