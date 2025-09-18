import { useEffect, useState } from 'react';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation.js';
import { Link, router, usePage } from '@inertiajs/react';
import { LogOut } from 'lucide-react';
import Home from './view/home.js';
import Produk from './view/produk.js';
import type { PageProps } from '@/types/type';
import VoucherDiskon from './view/voucher-diskon';
import Member from './view/member';
import VoucherUsage from './view/voucher-usage';
import Users from './view/user';
import TransaksiAdminPage from './view/transaksi-admin.js';
import TabunganMember from './view/tabungan-member.js';
import Kategori from './view/kategori.js';
import { House, HandCoins, PiggyBank, User, Package, Ticket } from 'lucide-react';

export default function Admin() {
  const { users, members, produks, pemasukan_bulan_ini, transaksi, tabungan, kategori } =
    usePage<PageProps & { pemasukan_bulan_ini: number; transaksi: any[]; kategori: Kategori[] }>().props;

  // ====== THEME STATE (sama seperti Login) ======
  const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('theme') || 'auto');
  const [theme, setTheme] = useState(false);

  useEffect(() => {
    localStorage.setItem('theme', currentTheme);
  }, [currentTheme]);

  // ====== PAGE STATE ======
  const [page, setPage] = useState(localStorage.getItem('page') || 'home');
  useEffect(() => {
    localStorage.setItem('page', page);
  }, [page]);

  // ====== USER / LOGOUT ======
  const [showLogOut, setShowLogOut] = useState(false);
  const cleanup = useMobileNavigation();
  const handleLogout = () => {
    cleanup();
    router.flushAll();
    localStorage.removeItem('username');
    localStorage.removeItem('page');
  };

  // ====== NAV (SIDEBAR) ======
  const [nav, setNav] = useState(false);

  // ====== GUARD ADMIN ======
  useEffect(() => {
    if (localStorage.getItem('tipe_user') !== 'admin') {
      window.location.href = '/login';
    }
  }, [handleLogout]);

  // ====== THEME HELPERS (selaras dengan Login) ======
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

  const headerText = 'text-white';

  const sidebarBg =
    currentTheme === 'auto'
      ? 'bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800'
      : currentTheme === 'Light'
      ? 'bg-white border-r border-zinc-200'
      : 'bg-zinc-900 border-r border-zinc-800';

  const sidebarItemBase =
    'flex items-center gap-1 px-3 py-2 rounded transition-all duration-300 ease-in-out cursor-pointer';
  const sidebarItemIdle =
    currentTheme === 'auto'
      ? 'text-zinc-600 hover:text-white hover:bg-gray-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white'
      : currentTheme === 'Light'
      ? 'text-zinc-600 hover:text-white hover:bg-gray-700'
      : 'text-zinc-300 hover:bg-zinc-800 hover:text-white';

  const sidebarItemActive =
    currentTheme === 'auto'
      ? 'bg-gray-700 text-white scale-105 dark:bg-zinc-800'
      : currentTheme === 'Light'
      ? 'bg-gray-700 text-white scale-105'
      : 'bg-zinc-800 text-white scale-105';

  const cardBg =
    currentTheme === 'auto'
      ? 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800'
      : currentTheme === 'Light'
      ? 'bg-white border border-zinc-200'
      : 'bg-zinc-900 border border-zinc-800';

  const contentText =
    currentTheme === 'auto'
      ? 'text-zinc-900 dark:text-zinc-100'
      : currentTheme === 'Light'
      ? 'text-zinc-900'
      : 'text-zinc-100';

  const iconBtnHover =
    currentTheme === 'auto'
      ? 'hover:bg-gray-600 dark:hover:bg-zinc-800'
      : currentTheme === 'Light'
      ? 'hover:bg-gray-600'
      : 'hover:bg-zinc-800';

      const navItems = [
        { key: "home",            label: "Dashboard",          icon: House },
        { key: "transaksi",       label: "Riwayat Transaksi",  icon: HandCoins },
        { key: "member",          label: "Kelola Member",      icon: User },
        { key: "tabungan-member", label: "Tabungan Member",    icon: PiggyBank },
        { key: "kategori",        label: "Kategori Produk",    icon: Package },
        { key: "produk",          label: "Kelola Produk",      icon: Package },
        { key: "voucher-diskon",  label: "Voucher Diskon",     icon: Ticket },
        { key: "voucher-usage",   label: "Penggunaan Voucher", icon: Ticket },
        { key: "user",            label: "Kelola User",        icon: User },
      ];
  return (
    <div className={`w-full h-screen ${bgApp} transition-colors`}>
      <div className="w-full h-full flex">
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

        {/* ====== SIDEBAR (tinggi penuh, tema mengikuti Login) ====== */}
        <aside
          className={`${nav ? 'w-64' : 'w-0'} ${sidebarBg} transition-all duration-300 ease-in-out overflow-hidden`}
        >
          <div className={`h-screen flex flex-col ${nav ? 'block' : 'hidden'}`}>
            <div className={`p-[1.1rem] border-b border-transparent/10 ${headerBg}`}>
              <h3
                className={`text-lg font-semibold text-white`}
              >
                Menu
              </h3>
            </div>
            <nav className="p-3 space-y-2 overflow-y-auto">
              {navItems.map((item) => {
              const Icon = item.icon; // <- ambil referensi dulu
              return (
                <a
                  key={item.key}
                  onClick={() => { setPage(item.key); setNav(false); }}
                  className={`${sidebarItemBase} ${page === item.key ? sidebarItemActive : sidebarItemIdle}`}
                >
                  <Icon className="mr-2 size-4" />
                  {item.label}
                </a>
              );
            })}
            </nav>
          </div>
        </aside>

        {/* ====== MAIN WRAPPER ====== */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* HEADER */}
          <header className={`${headerBg} shadow-lg`}>
            <div className="flex justify-between items-center px-4 py-3">
              <div className="flex gap-3 items-center">
                <button
                  onClick={() => setNav((v) => !v)}
                  className={`p-1 rounded transition-all duration-300 ease-in-out ${iconBtnHover}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className={`size-6 ${headerText}`}
                  >
                    <path
                      fillRule="evenodd"
                      d={
                        nav
                          ? 'M7.28 7.72a.75.75 0 0 1 0 1.06l-2.47 2.47H21a.75.75 0 0 1 0 1.5H4.81l2.47 2.47a.75.75 0 1 1-1.06 1.06l-3.75-3.75a.75.75 0 0 1 0-1.06l3.75-3.75a.75.75 0 0 1 1.06 0Z'
                          : 'M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z'
                      }
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <h2 className={`text-2xl md:text-3xl font-bold ${headerText}`}>Point of Sale</h2>
              </div>

              <div className="flex justify-end items-center">
                <div className="relative">
                  <button
                    onClick={() => setShowLogOut((v) => !v)}
                    className={`flex items-center gap-2 rounded px-3 py-2 transition-colors ${headerText} ${iconBtnHover}`}
                  >
                    <span className="text-sm md:text-base">{localStorage.getItem('username')}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className={`${showLogOut && 'rotate-180'} transition-all duration-300 ease-in-out size-4`}
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {showLogOut && (
                    <div className="transition-all duration-150 ease-in-out absolute top-10 right-0 bg-red-500 cursor-pointer hover:opacity-90 rounded-md shadow-lg p-0 w-40 z-20 animate-fade-in">
                      <ul className="text-white m-0 p-0">
                        <li className="py-2 px-2 transition-colors rounded-md">
                          <Link
                            className="flex cursor-pointer w-full items-center"
                            method="post"
                            href={route('logout')}
                            as="button"
                            onClick={handleLogout}
                          >
                            <LogOut className="mr-2" />
                            Log out
                          </Link>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* CONTENT (yang scroll hanya area kanan) */}
          <main className="flex-1 overflow-auto w-full">
            <div className="p-6">
              <div className={`${cardBg} ${contentText} rounded-lg shadow-lg min-h-[calc(100vh-9rem)] px-6 py-6`}>
                {page === 'home' && (
                  <Home
                    users={users}
                    members={members}
                    produks={produks}
                    pemasukan_bulan_ini={pemasukan_bulan_ini}
                    transaksi={transaksi}
                    currentTheme = {currentTheme}
                  />
                )}
                {page === 'transaksi' && <TransaksiAdminPage transaksi={transaksi} currentTheme={currentTheme}/> }
                {page === 'kategori' && <Kategori kategori={kategori} currentTheme={currentTheme} />}
                {page === 'produk' && <Produk produks={produks} kategori={kategori} currentTheme={currentTheme} />}
                {page === 'voucher-diskon' && <VoucherDiskon currentTheme={currentTheme} />}
                {page === 'member' && <Member members={members} currentTheme={currentTheme} />}
                {page === 'tabungan-member' && <TabunganMember tabungan={tabungan} currentTheme={currentTheme} />}
                {page === 'voucher-usage' && <VoucherUsage currentTheme={currentTheme} />}
                {page === 'user' && <Users users={users} currentTheme={currentTheme} />}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
