import { useState, ReactNode } from 'react';
import { router, Link } from '@inertiajs/react';
import {
    House, HandCoins, PiggyBank, User, Package, Ticket,
    AlertCircle, ShoppingCart, BarChart2, FileText, Truck,
    Users as UsersIcon, LogOut,
} from 'lucide-react';

declare const route: (name: string, params?: any) => string;

interface Props {
    currentTheme?: 'auto' | 'Light' | 'Dark';
    children: ReactNode;
    /** Key yang sesuai dengan URL halaman saat ini, untuk active state */
    activeKey?: string;
}

const navItems = [
    { key: 'home', label: 'Dashboard', icon: House, url: null, adminPage: 'home' },
    { key: 'transaksi', label: 'Riwayat Transaksi', icon: HandCoins, url: null, adminPage: 'transaksi' },
    { key: 'member', label: 'Kelola Member', icon: User, url: null, adminPage: 'member' },
    { key: 'tabungan-member', label: 'Tabungan Member', icon: PiggyBank, url: null, adminPage: 'tabungan-member' },
    { key: 'jenis_produk', label: 'Jenis Produk', icon: Package, url: null, adminPage: 'jenis_produk' },
    { key: 'produk', label: 'Kelola Produk', icon: Package, url: null, adminPage: 'produk' },
    { key: 'voucher-diskon', label: 'Voucher Diskon', icon: Ticket, url: null, adminPage: 'voucher-diskon' },
    { key: 'voucher-usage', label: 'Penggunaan Voucher', icon: Ticket, url: null, adminPage: 'voucher-usage' },
    { key: 'user', label: 'Kelola User', icon: User, url: null, adminPage: 'user' },
    { key: 'hutang', label: 'Rekap Hutang', icon: AlertCircle, url: null, adminPage: 'hutang' },
    { key: 'pembelian-stok', label: 'Pembelian Stok', icon: ShoppingCart, url: null, adminPage: 'pembelian-stok' },
    { key: 'supplier', label: 'Supplier', icon: Truck, url: '/admin/supplier', adminPage: null },
    { key: 'rekap', label: 'Rekap', icon: BarChart2, url: '/admin/rekap', adminPage: null },
    { key: 'laporan-member', label: 'Lap. Transaksi Member', icon: UsersIcon, url: '/admin/laporan-transaksi-member', adminPage: null },
    { key: 'laporan-supplier', label: 'Lap. Keuangan Supplier', icon: FileText, url: '/admin/laporan-keuangan-supplier', adminPage: null },
];

export default function AdminLayout({ currentTheme = 'Light', children, activeKey = '' }: Props) {
    const [nav, setNav] = useState(false);

    // ── Theme helpers (sama persis dengan Admin.tsx) ──────────────────────
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

    const headerBg =
        currentTheme === 'auto'
            ? 'bg-gray-800 dark:bg-zinc-900/80'
            : currentTheme === 'Light'
                ? 'bg-gray-800'
                : 'bg-zinc-900/80';

    const iconBtnHover =
        currentTheme === 'auto'
            ? 'hover:bg-gray-600 dark:hover:bg-zinc-800'
            : currentTheme === 'Light'
                ? 'hover:bg-gray-600'
                : 'hover:bg-zinc-800';

    const bgApp =
        currentTheme === 'auto'
            ? 'bg-gray-50 dark:bg-zinc-950'
            : currentTheme === 'Light'
                ? 'bg-gray-50'
                : 'bg-zinc-950';

    const handleNav = (item: typeof navItems[0]) => {
        if (item.url) {
            router.visit(item.url);
        } else {
            // Kembali ke Admin.tsx dan set page via localStorage
            localStorage.setItem('page', item.adminPage ?? 'home');
            router.visit('/admin');
        }
        setNav(false);
    };

    return (
        <div className={`w-full h-screen ${bgApp} transition-colors`}>
            <div className="w-full h-full flex">
                {/* ── SIDEBAR (persis sama dengan Admin.tsx) ── */}
                <aside className={`${nav ? 'w-64' : 'w-0'} ${sidebarBg} transition-all duration-300 ease-in-out overflow-hidden`}>
                    <div className={`h-screen flex flex-col ${nav ? 'block' : 'hidden'}`}>
                        <div className={`p-[1.1rem] border-b border-transparent/10 ${headerBg}`}>
                            <h3 className="text-lg font-semibold text-white">Menu</h3>
                        </div>
                        <nav className="p-3 space-y-2 overflow-y-auto flex-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeKey === item.key || (item.url ? window.location.pathname.startsWith(item.url) : false);
                                return (
                                    <a
                                        key={item.key}
                                        onClick={() => handleNav(item)}
                                        className={`${sidebarItemBase} ${isActive ? sidebarItemActive : sidebarItemIdle}`}
                                    >
                                        <Icon className="mr-2 size-4" />
                                        {item.label}
                                    </a>
                                );
                            })}
                        </nav>
                        {/* Logout di bawah sidebar */}
                        <div className={`p-3 border-t ${currentTheme === 'Dark' ? 'border-zinc-800' : 'border-zinc-200'}`}>
                            <Link
                                method="post"
                                href={route('logout')}
                                as="button"
                                className={`${sidebarItemBase} text-red-400 hover:bg-red-500 hover:text-white w-full`}
                                onClick={() => { localStorage.removeItem('username'); localStorage.removeItem('page'); }}
                            >
                                <LogOut className="mr-2 size-4" />
                                Log out
                            </Link>
                        </div>
                    </div>
                </aside>

                {/* ── MAIN WRAPPER ── */}
                <div className="flex-1 flex flex-col min-w-0 overflow-auto">
                    {/* Header bar dengan hamburger (persis Admin.tsx) */}
                    <header className={`${headerBg} shadow-lg`}>
                        <div className="flex items-center px-4 py-3 gap-3">
                            <button
                                onClick={() => setNav(v => !v)}
                                className={`p-1 rounded transition-all duration-300 ease-in-out ${iconBtnHover}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 text-white">
                                    <path
                                        fillRule="evenodd"
                                        d={nav
                                            ? 'M7.28 7.72a.75.75 0 0 1 0 1.06l-2.47 2.47H21a.75.75 0 0 1 0 1.5H4.81l2.47 2.47a.75.75 0 1 1-1.06 1.06l-3.75-3.75a.75.75 0 0 1 0-1.06l3.75-3.75a.75.75 0 0 1 1.06 0Z'
                                            : 'M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z'
                                        }
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                            <h2 className="text-2xl md:text-3xl font-bold text-white">Point of Sale</h2>
                            <div className="ml-auto text-sm text-white opacity-75">
                                {typeof localStorage !== 'undefined' && localStorage.getItem('username')}
                            </div>
                        </div>
                    </header>

                    {/* Konten halaman */}
                    <main className="flex-1 overflow-auto w-full">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
