
import { router } from '@inertiajs/react';
import { PageProps } from '../types/index';
import React, { useState, useMemo, useEffect } from 'react';

interface TabunganDetail {
  id: number;
  created_at: string;
  tipe: string;
  nominal: number;
  keterangan: string;
}

interface Tabungan {
  id: number;
  member?: { nama: string };
  saldo: number;
  detail?: TabunganDetail[];
}

interface TabunganPageProps extends PageProps {
  tabungan: Tabungan[];
}

const TabunganPage: React.FC<TabunganPageProps> = ({ tabungan }) => {
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

  // Toggle expand / collapse
  const toggleExpand = (id: number) => {
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
  }, [])
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

  return (
    <div className={`flex flex-col min-h-screen ${bgApp}`}>
      {/*Tema*/}
      <div className={`${currentTheme === 'auto' ? 'bg-zinc-50 shadow-gray-800 dark:shadow-gray-500 dark:bg-zinc-900 dark:text-white' : currentTheme === 'Light' ? 'bg-zinc-50 text-zinc-900 shadow-gray-800' : currentTheme === 'Dark' && 'bg-zinc-900 text-white shadow-gray-500'} rounded-xl transition-all py-2 gap-2 ${theme ? 'h-30 justify-end' : 'h-12 justify-center'} w-12 fixed bottom-4 right-4 shadow border-slate-100 flex flex-col items-center z-10`}>
        {theme && (
          <>
            <svg onClick={() => setTheme(false)} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
              <path fillRule="evenodd" d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z" clipRule="evenodd" />
            </svg>
            {currentTheme === "auto" ? (
              <>
                <svg onClick={() => setCurrentTheme("Dark")} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 rounded hover:bg-gray-500 transition-all">
                  <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z" clipRule="evenodd" />
                </svg>
                <svg onClick={() => setCurrentTheme("Light")} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 rounded hover:bg-gray-500 transition-all">
                  <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" />
                </svg>
              </>
            ) : currentTheme === "Light" ? (
              <>
                <svg onClick={() => setCurrentTheme("Dark")} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 rounded hover:bg-gray-500 transition-all">
                  <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z" clipRule="evenodd" />
                </svg>
                <svg onClick={() => setCurrentTheme("auto")} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 rounded hover:bg-gray-500 transition-all">
                  <path fillRule="evenodd" d="M11.828 2.25c-.916 0-1.699.663-1.85 1.567l-.091.549a.798.798 0 0 1-.517.608 7.45 7.45 0 0 0-.478.198.798.798 0 0 1-.796-.064l-.453-.324a1.875 1.875 0 0 0-2.416.2l-.243.243a1.875 1.875 0 0 0-.2 2.416l.324.453a.798.798 0 0 1 .064.796 7.448 7.448 0 0 0-.198.478.798.798 0 0 1-.608.517l-.55.092a1.875 1.875 0 0 0-1.566 1.849v.344c0 .916.663 1.699 1.567 1.85l.549.091c.281.047.508.25.608.517.06.162.127.321.198.478a.798.798 0 0 1-.064.796l-.324.453a1.875 1.875 0 0 0 .2 2.416l.243.243c.648.648 1.67.733 2.416.2l.453-.324a.798.798 0 0 1 .796-.064c.157.071.316.137.478.198.267.1.47.327.517.608l.092.55c.15.903.932 1.566 1.849 1.566h.344c.916 0 1.699-.663 1.85-1.567l.091-.549a.798.798 0 0 1 .517-.608 7.52 7.52 0 0 0 .478-.198.798.798 0 0 1 .796.064l.453.324a1.875 1.875 0 0 0 2.416-.2l.243-.243c.648-.648.733-1.67.2-2.416l-.324-.453a.798.798 0 0 1-.064-.796c.071-.157.137-.316.198-.478.1-.267.327-.47.608-.517l.55-.091a1.875 1.875 0 0 0 1.566-1.85v-.344c0-.916-.663-1.699-1.567-1.85l-.549-.091a.798.798 0 0 1-.608-.517 7.507 7.507 0 0 0-.198-.478.798.798 0 0 1 .064-.796l.324-.453a1.875 1.875 0 0 0-.2-2.416l-.243-.243a1.875 1.875 0 0 0-2.416-.2l-.453.324a.798.798 0 0 1-.796.064 7.462 7.462 0 0 0-.478-.198.798.798 0 0 1-.517-.608l-.091-.55a1.875 1.875 0 0 0-1.85-1.566h-.344ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" clipRule="evenodd" />
                </svg>
              </>
            ) : currentTheme === "Dark" && (
              <>
                <svg onClick={() => setCurrentTheme("auto")} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 rounded hover:bg-gray-500 transition-all">
                  <path fillRule="evenodd" d="M11.828 2.25c-.916 0-1.699.663-1.85 1.567l-.091.549a.798.798 0 0 1-.517.608 7.45 7.45 0 0 0-.478.198.798.798 0 0 1-.796-.064l-.453-.324a1.875 1.875 0 0 0-2.416.2l-.243.243a1.875 1.875 0 0 0-.2 2.416l.324.453a.798.798 0 0 1 .064.796 7.448 7.448 0 0 0-.198.478.798.798 0 0 1-.608.517l-.55.092a1.875 1.875 0 0 0-1.566 1.849v.344c0 .916.663 1.699 1.567 1.85l.549.091c.281.047.508.25.608.517.06.162.127.321.198.478a.798.798 0 0 1-.064.796l-.324.453a1.875 1.875 0 0 0 .2 2.416l.243.243c.648.648 1.67.733 2.416.2l.453-.324a.798.798 0 0 1 .796-.064c.157.071.316.137.478.198.267.1.47.327.517.608l.092.55c.15.903.932 1.566 1.849 1.566h.344c.916 0 1.699-.663 1.85-1.567l.091-.549a.798.798 0 0 1 .517-.608 7.52 7.52 0 0 0 .478-.198.798.798 0 0 1 .796.064l.453.324a1.875 1.875 0 0 0 2.416-.2l.243-.243c.648-.648.733-1.67.2-2.416l-.324-.453a.798.798 0 0 1-.064-.796c.071-.157.137-.316.198-.478.1-.267.327-.47.608-.517l.55-.091a1.875 1.875 0 0 0 1.566-1.85v-.344c0-.916-.663-1.699-1.567-1.85l-.549-.091a.798.798 0 0 1-.608-.517 7.507 7.507 0 0 0-.198-.478.798.798 0 0 1 .064-.796l.324-.453a1.875 1.875 0 0 0-.2-2.416l-.243-.243a1.875 1.875 0 0 0-2.416-.2l-.453.324a.798.798 0 0 1-.796.064 7.462 7.462 0 0 0-.478-.198.798.798 0 0 1-.517-.608l-.091-.55a1.875 1.875 0 0 0-1.85-1.566h-.344ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" clipRule="evenodd" />
                </svg>
                <svg onClick={() => setCurrentTheme("Light")} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 rounded hover:bg-gray-500 transition-all">
                  <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" />
                </svg>
              </>
            )}
          </>
        )}
        {currentTheme === 'auto' ? (
          <svg onClick={() => setTheme(true)} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
            <path fillRule="evenodd" d="M11.828 2.25c-.916 0-1.699.663-1.85 1.567l-.091.549a.798.798 0 0 1-.517.608 7.45 7.45 0 0 0-.478.198.798.798 0 0 1-.796-.064l-.453-.324a1.875 1.875 0 0 0-2.416.2l-.243.243a1.875 1.875 0 0 0-.2 2.416l.324.453a.798.798 0 0 1 .064.796 7.448 7.448 0 0 0-.198.478.798.798 0 0 1-.608.517l-.55.092a1.875 1.875 0 0 0-1.566 1.849v.344c0 .916.663 1.699 1.567 1.85l.549.091c.281.047.508.25.608.517.06.162.127.321.198.478a.798.798 0 0 1-.064.796l-.324.453a1.875 1.875 0 0 0 .2 2.416l.243.243c.648.648 1.67.733 2.416.2l.453-.324a.798.798 0 0 1 .796-.064c.157.071.316.137.478.198.267.1.47.327.517.608l.092.55c.15.903.932 1.566 1.849 1.566h.344c.916 0 1.699-.663 1.85-1.567l.091-.549a.798.798 0 0 1 .517-.608 7.52 7.52 0 0 0 .478-.198.798.798 0 0 1 .796.064l.453.324a1.875 1.875 0 0 0 2.416-.2l.243-.243c.648-.648.733-1.67.2-2.416l-.324-.453a.798.798 0 0 1-.064-.796c.071-.157.137-.316.198-.478.1-.267.327-.47.608-.517l.55-.091a1.875 1.875 0 0 0 1.566-1.85v-.344c0-.916-.663-1.699-1.567-1.85l-.549-.091a.798.798 0 0 1-.608-.517 7.507 7.507 0 0 0-.198-.478.798.798 0 0 1 .064-.796l.324-.453a1.875 1.875 0 0 0-.2-2.416l-.243-.243a1.875 1.875 0 0 0-2.416-.2l-.453.324a.798.798 0 0 1-.796.064 7.462 7.462 0 0 0-.478-.198.798.798 0 0 1-.517-.608l-.091-.55a1.875 1.875 0 0 0-1.85-1.566h-.344ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" clipRule="evenodd" />
          </svg>
        ) : currentTheme === 'Light' ? (
          <svg onClick={() => setTheme(true)} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
            <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" />
          </svg>
        ) : currentTheme === 'Dark' && (
          <svg onClick={() => setTheme(true)} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
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
        <div className={`${card} ${text} relative pb-20 rounded-xl shadow-sm min-h-[80vh] border overflow-hidden`}>
          <div className="p-6">
            <div className="flex justify-between">
              <h1 className="text-3xl font-extrabold mb-6 text-left">Tabungan</h1>
              {/* Search Bar */}
              <div className="relative mb-8">
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
                      className={`${card} ${text} rounded-2xl shadow-md p-6 border border-gray-200`}
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
                            detail.map(({ created_at, tipe, nominal, keterangan }: TabunganDetail, idx: number) => (
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
                                  className={`px-3 py-1 rounded-full text-xs font-semibold ${tipe === 'deposit'
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
          </div>
          {/* ====== ⬇️ KONTROL PAGINATION  ⬇️ ====== */}
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
      </div>
    </div>
  );
}

export default TabunganPage;
