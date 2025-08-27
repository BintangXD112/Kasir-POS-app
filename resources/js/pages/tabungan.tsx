import { router } from '@inertiajs/react';
import { PageProps } from '../types/index';
import React, { useState, useMemo, useEffect } from 'react';

interface TabunganPageProps extends PageProps {
  tabungan: Tabungan[];
}

const TabunganPage: React.FC<TabunganPageProps> = ({ tabungan }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIds, setExpandedIds] = useState(new Set());

  // Filter data berdasarkan search term
  const filteredTabungan = useMemo(() => {
    if (!searchTerm) return tabungan;
    return tabungan.filter(item =>
      item.member?.nama.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, tabungan]);

  // Toggle expand / collapse
  const toggleExpand = (id) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };
  useEffect(() => {
        if (localStorage.getItem("tipe_user") !== "kasir") {
            window.location.href = "/login";
        }
    },[])
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
              <h1 className="text-2xl font-bold text-white">Tabungan Member</h1>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {filteredTabungan.length} tabungan
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 p-6">
        {/* Modern Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6">
          <div className="flex justify-between">
            <h1 className="text-3xl font-extrabold mb-6 text-gray-900 text-left">Tabungan</h1>
              {/* Search Bar */}
              <div className="relative mb-8 max-w-">
                  <input
                  type="text"
                  placeholder="Cari nama member..."
                  className="w-full pl-12 pr-10 py-3 rounded-xl border border-indigo-500 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-600 transition" 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  aria-label="Cari nama member"
                  />
                  <svg
                  className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none"
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
                {filteredTabungan.map(({ id, member, saldo, detail }) => {
                  const isExpanded = expandedIds.has(id);
                  return (
                    <div
                      key={id}
                      className="bg-white rounded-2xl shadow-md p-6 border border-gray-200"
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
                          <span className="text-xs text-gray-500 uppercase tracking-wide">Nama Member</span>
                          <h2 className="text-lg font-semibold text-gray-900">{member?.nama ?? '—'}</h2>
                      </div>
                      <div className="flex flex-col w-1/2 items-end">
                          <span className="text-xs text-gray-500 uppercase tracking-wide">Total Saldo</span>
                          <div className="text-indigo-600 font-bold text-lg">
                          Rp {Number(saldo ?? 0).toLocaleString()}
                          </div>
                      </div>
                      <button
                          aria-label={isExpanded ? 'Collapse detail transaksi' : 'Expand detail transaksi'}
                          className="ml-4 text-indigo-600 hover:text-indigo-800 focus:outline-none"
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
                                className="flex justify-between items-center bg-gray-50 rounded-lg p-4 border border-gray-200"
                              >
                                <div className="flex flex-col text-gray-600 font-mono text-sm w-36 shrink-0">
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
                                <div className="flex-1 px-4 text-gray-700 italic truncate">
                                  {keterangan ?? <span className="text-gray-400">—</span>}
                                </div>
                                <div className="font-semibold text-gray-900 whitespace-nowrap">
                                  Rp {Number(nominal ?? 0).toLocaleString()}
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-center text-gray-400 italic">Tidak ada transaksi</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TabunganPage;
