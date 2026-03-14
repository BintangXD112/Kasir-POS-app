import React, { useState, useMemo, useEffect } from "react";
import { router } from "@inertiajs/react";
import Swal from "sweetalert2";
import MenuBar from '@/components/menu-bar';
import { Link } from '@inertiajs/react';
import { LogOut } from 'lucide-react';
import { useMobileNavigation } from '../hooks/use-mobile-navigation';

declare const route: (name: string, params?: any) => string;

type StatusPembelian = "lunas" | "pending";

interface Produk { id: number; nama: string; stok: number; harga: number; }
interface User { id: number; nama_user: string; }
interface Supplier { id: number; nama_supplier: string; }
interface Pembelian {
    id: number;
    produk: Produk;
    user: User;
    supplier?: Supplier | null;
    jumlah: number;
    harga_beli: number;
    ongkir: number;
    total_harga: number;
    nominal_bayar: number;
    status: StatusPembelian;
    keterangan: string | null;
    created_at: string | null;
}

interface Props {
    pembelian: Pembelian[];
    produk: Produk[];
    suppliers: Supplier[];
    total_hari_ini: number;
    total_bulan_ini: number;
}

const formatCurrency = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-";

export default function PembelianStokComponent({
    pembelian = [],
    produk = [],
    suppliers = [],
    total_hari_ini = 0,
    total_bulan_ini = 0,
}: Props) {
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ produk_id: "", jumlah: "", harga_beli: "",ongkir: "",nominal_bayar: "", keterangan: "", supplier_id: "" });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState<number>(10);
    const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('theme') || 'auto');
    const [theme, setTheme] = useState(false);

    useEffect(() => {
      const root = document.documentElement

      if (currentTheme === "Dark") {
        root.classList.add("dark")
        localStorage.setItem('theme', 'Dark')
      } 
      else if (currentTheme === "Light") {
        root.classList.remove("dark")
        localStorage.setItem('theme', 'Light')
      } 
      else if (currentTheme === "auto") {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
        localStorage.setItem('theme', 'auto')
        
        if (prefersDark) {
          root.classList.add("dark")
        } else {
          root.classList.remove("dark")
        }
      }
    }, [currentTheme])

    useEffect(() => { setCurrentPage(1); }, [search, pageSize]);

    // ===== THEME HELPERS =====
    const getStatusBadge = (status: string) => {
    const base = "inline-flex items-center px-3 py-1 rounded-full text-xs text-center font-medium border";
    const theme = currentTheme
    const map: Record<string, string> = {
      lunas: `${base} ${theme === 'auto' ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800' : theme === 'Light' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-emerald-900/30 text-emerald-300 border-emerald-800'}`,
      pending: `${base} ${theme === 'auto' ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800' : theme === 'Light' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-amber-900/30 text-amber-300 border-amber-800'}`,
      cancelled: `${base} ${theme === 'auto' ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800' : theme === 'Light' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-red-900/30 text-red-300 border-red-800'}`,
    };
    return map[status] || `${base} bg-gray-100 text-gray-800 border-gray-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700`;
  };

    const bgApp =
        currentTheme === 'auto'
            ? 'bg-gray-50 dark:bg-zinc-950'
            : currentTheme === 'Light'
                ? 'bg-gray-50'
                : 'bg-zinc-950';

    const card =
        currentTheme === 'auto' ? 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800'
            : currentTheme === 'Dark' ? 'bg-zinc-900 border border-zinc-800'
                : 'bg-white border border-zinc-200';

    const text =
        currentTheme === 'auto' ? 'text-zinc-900 dark:text-zinc-100'
            : currentTheme === 'Dark' ? 'text-zinc-100'
                : 'text-zinc-900';

    const subText =
        currentTheme === 'auto' ? 'text-zinc-500 dark:text-zinc-400'
            : currentTheme === 'Dark' ? 'text-zinc-400'
                : 'text-zinc-500';

    const softBg =
        currentTheme === 'auto' ? 'bg-slate-50 dark:bg-zinc-800/60'
            : currentTheme === 'Dark' ? 'bg-zinc-800/60'
                : 'bg-slate-50';

    const rowHover =
        currentTheme === 'auto' ? 'hover:bg-slate-50 dark:hover:bg-zinc-800/60'
            : currentTheme === 'Dark' ? 'hover:bg-zinc-800/60'
                : 'hover:bg-slate-50';

    const headerBg =
        currentTheme === 'auto'
            ? 'bg-gray-800 dark:bg-zinc-900/80'
            : currentTheme === 'Light'
                ? 'bg-gray-800' // header tetap gelap biar kontras
                : 'bg-zinc-900/80';

    const borderSoft = currentTheme === 'Dark' ? 'border-zinc-800' : 'border-slate-200';

    const inputCls =
        currentTheme === 'auto' ? 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
            : currentTheme === 'Dark' ? 'border-zinc-700 bg-zinc-800 text-zinc-100'
                : 'border-zinc-300 bg-white text-zinc-900';

    // ===== DATA =====
    const filtered = useMemo(() =>
        pembelian.filter(p =>
            p.produk.nama.toLowerCase().includes(search.toLowerCase()) ||
            (p.keterangan?.toLowerCase().includes(search.toLowerCase()) ?? false)
        ), [pembelian, search]
    );

    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const currentSafe = Math.min(Math.max(currentPage, 1), totalPages);
    const startIndex = (currentSafe - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    const paged = filtered.slice(startIndex, endIndex);

    const getPageNumbers = (current: number, total: number): (number | '...')[] => {
        if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
        if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
        if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
        return [1, '...', current - 1, current, current + 1, '...', total];
    };
    const pageNumbers = getPageNumbers(currentSafe, totalPages);

    const totalUnit = pembelian.reduce((s, p) => s + p.jumlah, 0);

    const selectedProduk = produk.find(p => p.id === Number(form.produk_id));
    const estimasiTotal = Number(form.jumlah) * Number(form.harga_beli) + Number(form.ongkir);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const errors: Record<string, string> = {};
        if (!form.produk_id) errors.produk_id = "Pilih produk";
        if (!form.jumlah || Number(form.jumlah) < 1) errors.jumlah = "Jumlah minimal 1";
        if (!form.harga_beli || Number(form.harga_beli) < 0) errors.harga_beli = "Harga tidak valid";
        if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }

        Swal.fire({
            title: "Konfirmasi Pembelian",
            html: `Beli <b>${form.jumlah} unit</b> ${selectedProduk?.nama}<br/>Total: <b>${formatCurrency(estimasiTotal)}</b>`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#2563eb",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Simpan",
            cancelButtonText: "Batal",
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route("stock.store"), {
                    produk_id: Number(form.produk_id),
                    jumlah: Number(form.jumlah),
                    harga_beli: Number(form.harga_beli),
                    ongkir: Number(form.ongkir),
                    nominal_bayar: Number(form.nominal_bayar),
                    keterangan: form.keterangan,
                    supplier_id: form.supplier_id ? Number(form.supplier_id) : null,
                }, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({ icon: "success", title: "Berhasil!", text: "Pembelian stok dicatat.", timer: 1500, showConfirmButton: false });
                        setForm({ produk_id: "", jumlah: "", harga_beli: "",ongkir: "",nominal_bayar: "", keterangan: "", supplier_id: "" });
                        setFormErrors({});
                        setShowForm(false);
                    },
                    onError: (errs) => {
                        console.log(errs)
                        Swal.fire({ icon: "error", title: "Gagal!", text: errs.error || "Terjadi kesalahan." });
                    },
                });
            }
        });
    };

    const [bayar, setBayar] = useState<number | ''>('');
    const [bayarDisplay, setBayarDisplay] = useState('');

    const [beli, setBeli] = useState<number | ''>('');
    const [beliDisplay, setBeliDisplay] = useState('');

    const [ongkir, setOngkir] = useState<number | ''>('');
    const [ongkirDisplay, setOngkirDisplay] = useState('');
    

    const cleanup = useMobileNavigation();
    const handleLogout = () => {
        cleanup();
        router.flushAll();
        localStorage.removeItem("username");
    };
    const [showLogout, setShowLogout] = useState(false);
    const toggleLogout = () => {
        setShowLogout(!showLogout);
    };

    return (

        <div className={`flex min-h-screen w-full ${bgApp} pt-30 flex-col gap-4`}>
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
            {/* Header */}
            <div className={`flex fixed top-0 right-0 left-0 z-10 flex-col ${headerBg} gap-4 px-4 py-4`}>
                <div className={`flex justify-between`}>
                    <div className="w-1/6 items-center flex">
                        <h1 className="text-2xl font-bold text-white">Point Of Sale</h1>
                    </div>
                    <div onClick={toggleLogout} className={`text-white flex items-center relative cursor-pointer`}>
                        {localStorage.getItem("username")}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`size-4 ml-2 ${showLogout ? 'rotate-180' : ''} transition-transform duration-150 ease-in-out`}>
                            <path fillRule="evenodd" d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z" clipRule="evenodd" />
                        </svg>
                        {showLogout && (
                            <div className={`transition-all duration-150 ease-in-out absolute top-8 right-0 bg-red-500 cursor-pointer hover:opacity-50 rounded-md shadow-lg p-0 w-36 z-20 animate-fade-in`}>
                                <ul className="text-white m-0 p-0">
                                    <li className="py-2 px-2 cursor-pointer transition-colors rounded-md">
                                        <Link className="flex w-full" method="post" href={route('logout')} as="button" onClick={handleLogout}>
                                            <LogOut className='mr-2' />
                                            Log out
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
                <MenuBar />
            </div>
            <div className="pl-6 pt-6 flex items-center pr-6">
                <h2 className={`text-xl font-semibold ${text}`}>Rekap Stok Pembelian</h2>
            </div>

            <div className="p-6 space-y-4">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className={`${card} rounded-xl p-5`}>
                        <p className={`text-sm ${subText} mb-1`}>Pengeluaran Hari Ini</p>
                        <p className="text-2xl font-bold text-blue-500">{formatCurrency(total_hari_ini)}</p>
                    </div>
                    <div className={`${card} rounded-xl p-5`}>
                        <p className={`text-sm ${subText} mb-1`}>Pengeluaran Bulan Ini</p>
                        <p className="text-2xl font-bold text-purple-500">{formatCurrency(total_bulan_ini)}</p>
                    </div>
                    <div className={`${card} rounded-xl p-5`}>
                        <p className={`text-sm ${subText} mb-1`}>Total Unit Dibeli</p>
                        <p className="text-2xl font-bold text-emerald-500">{totalUnit.toLocaleString("id-ID")}</p>
                    </div>
                </div>
                <div className={`${card} rounded-xl p-4 flex justify-between`}>
                    <div className="relative max-w-md">
                        <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${subText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Cari produk atau keterangan..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${inputCls}`}
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className={`absolute right-3 top-1/2 -translate-y-1/2 ${subText} hover:opacity-80`}>×</button>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.visit('/supplier')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm border transition-colors ${currentTheme === 'Dark' ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}
                        >
                            Kelola Supplier
                        </button>
                        <button
                            onClick={() => setShowForm(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Tambah Pembelian
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className={`${card} relative pb-20 rounded-xl overflow-hidden shadow-sm`}>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className={softBg}>
                                <tr className={`border-b ${borderSoft}`}>
                                    {["Produk", "Supplier", "Jumlah", "Harga Beli/Unit","Ongkir" ,"Total Harga", "Total Bayar", "Keterangan", "Nama User", "Status", "Tanggal"].map(h => (
                                        <th key={h} className={`px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider ${subText}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {paged.length === 0 ? (
                                    <tr>
                                        <td colSpan={11} className="text-center py-12">
                                            <svg className={`mx-auto h-12 w-12 ${subText} mb-3`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                            </svg>
                                            <p className={`text-sm font-medium ${text}`}>Belum ada data pembelian stok</p>
                                            <p className={`text-xs ${subText} mt-1`}>Klik "Tambah Pembelian" untuk mencatat restok produk.</p>
                                        </td>
                                    </tr>
                                ) : paged.map((p) => (
                                    <tr key={p.id} className={`border-b ${borderSoft} ${rowHover} transition-colors`}>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div>
                                                    <p className={`font-medium ${text}`}>{p.produk.nama}</p>
                                                    <p className={`text-xs ${subText}`}>Stok sekarang: {p.produk.stok}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`text-sm ${subText}`}>{p.supplier?.nama_supplier ?? '-'}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                                                +{p.jumlah}&nbsp;unit
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`text-sm font-medium ${text}`}>{formatCurrency(p.harga_beli)}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="text-sm font-bold text-blue-500">{formatCurrency(p.ongkir)}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="text-sm font-bold text-blue-500">{formatCurrency(p.total_harga)}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="text-sm font-bold text-blue-500">{formatCurrency(p.nominal_bayar)}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`text-sm ${subText}`}>{p.keterangan || "-"}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`text-sm ${text}`}>{p.user?.nama_user || "-"}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={getStatusBadge(p.status)}>
                                                {p.status === 'pending' ? 'Belum Lunas' : 'Lunas'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`text-sm ${subText}`}>{formatDate(p.created_at)}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {filtered.length > 0 && (
                        <div className={`flex flex-col sm:flex-row absolute bottom-0 left-0 right-0 items-center justify-between px-6 py-4 border-t ${borderSoft} gap-3`}>
                            <div className={`text-sm ${subText}`}>
                                Menampilkan <span className="font-semibold">{startIndex + 1}</span>–
                                <span className="font-semibold">{endIndex}</span> dari
                                <span className="font-semibold"> {totalItems}</span> data
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    className={`px-3 py-2 rounded-lg text-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 border ${currentTheme === 'Dark' ? 'border-zinc-700 hover:bg-zinc-800' : 'border-slate-300 hover:bg-slate-50'}`}
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentSafe === 1}
                                >Prev</button>
                                {pageNumbers.map((p, idx) =>
                                    p === '...' ? (
                                        <span key={`dots-${idx}`} className={`px-2 select-none ${subText}`}>…</span>
                                    ) : (
                                        <button
                                            key={p}
                                            onClick={() => setCurrentPage(p as number)}
                                            className={`px-3 py-2 rounded-lg text-sm transition-all cursor-pointer border ${currentSafe === p ? 'bg-blue-600 text-white border-blue-600' : currentTheme === 'Dark' ? 'border-zinc-700 hover:bg-blue-600 hover:text-white' : 'border-slate-300 hover:bg-blue-600 hover:text-white'}`}
                                        >{p}</button>
                                    )
                                )}
                                <button
                                    className={`px-3 py-2 rounded-lg text-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 border ${currentTheme === 'Dark' ? 'border-zinc-700 hover:bg-zinc-800' : 'border-slate-300 hover:bg-slate-50'}`}
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentSafe === totalPages}
                                >Next</button>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-sm ${subText}`}>Per halaman:</span>
                                <select
                                    value={pageSize}
                                    onChange={e => setPageSize(Number(e.target.value))}
                                    className={`px-2 py-2 rounded-lg text-sm border ${currentTheme === 'auto' ? 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800' : currentTheme === 'Dark' ? 'border-zinc-700 bg-zinc-800' : 'border-slate-300 bg-white'}`}
                                >
                                    {[10, 25, 50, 100].map(sz => <option key={sz} value={sz}>{sz}</option>)}
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Form Tambah Pembelian */}
            {showForm && (
                <div className="fixed inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className={`${card} ${text} rounded-2xl shadow-2xl w-full h-[85vh] overflow-y-auto  max-w-lg`}>
                        <div className={`flex items-center justify-between px-6 py-4 border-b ${borderSoft}`}>
                            <h2 className="text-lg font-bold">Tambah Pembelian Stok</h2>
                            <button onClick={() => { setShowForm(false); setFormErrors({}); }} className={`p-2 rounded-lg ${currentTheme === "Dark" ? "hover:bg-zinc-800" : "hover:bg-slate-100"} transition-colors`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${text}`}>Produk <span className="text-red-500">*</span></label>
                                <select
                                    value={form.produk_id}
                                    onChange={(e) => setForm(f => ({ ...f, produk_id: e.target.value }))}
                                    className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${inputCls} ${formErrors.produk_id ? "border-red-500" : ""}`}
                                >
                                    <option value="">-- Pilih Produk --</option>
                                    {produk.map(p => (
                                        <option key={p.id} value={p.id}>{p.nama} (Stok: {p.stok})</option>
                                    ))}
                                </select>
                                {formErrors.produk_id && <p className="text-red-500 text-xs mt-1">{formErrors.produk_id}</p>}
                                {selectedProduk && (
                                    <p className={`text-xs ${subText} mt-1`}>Harga jual: {formatCurrency(selectedProduk.harga)} · Stok saat ini: {selectedProduk.stok}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${text}`}>Jumlah <span className="text-red-500">*</span></label>
                                    <input
                                        type="number" min="1"
                                        value={form.jumlah}
                                        onChange={(e) => setForm(f => ({ ...f, jumlah: e.target.value }))}
                                        placeholder="0"
                                        className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${inputCls} ${formErrors.jumlah ? "border-red-500" : ""}`}
                                    />
                                    {formErrors.jumlah && <p className="text-red-500 text-xs mt-1">{formErrors.jumlah}</p>}
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${text}`}>Harga Beli/Unit <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={beliDisplay}
                                        onChange={(e) => {
                                            const raw = e.target.value.replace(/\D/g, '');

                                            if (raw === '') {
                                                setForm(f => ({ ...f, harga_beli: "" }));
                                                setBeliDisplay('');
                                            } else {
                                                const numeric = parseInt(raw, 10);
                                                setForm(f => ({ ...f, harga_beli: numeric.toString() }));
                                                setBeliDisplay(numeric.toLocaleString('id-ID'));
                                            }
                                        }}
                                        placeholder="0"
                                        className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${inputCls} ${formErrors.harga_beli ? "border-red-500" : ""}`}
                                    />
                                    {formErrors.harga_beli && <p className="text-red-500 text-xs mt-1">{formErrors.harga_beli}</p>}
                                </div>
                                <div className={`col-span-2`}>
                                    <label className={`block text-sm font-medium mb-1 ${text}`}>Ongkir</label>
                                    <input
                                        type="text"
                                        value={ongkirDisplay}
                                        onChange={(e) => {
                                            const raw = e.target.value.replace(/\D/g, '');

                                            if (raw === '') {
                                                setForm(f => ({ ...f, ongkir: "" }));
                                                setOngkirDisplay('');
                                            } else {
                                                const numeric = parseInt(raw, 10);
                                                setForm(f => ({ ...f, ongkir: numeric.toString() }));
                                                setOngkirDisplay(numeric.toLocaleString('id-ID'));
                                            }
                                        }}
                                        placeholder="0"
                                        className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${inputCls} ${formErrors.harga_beli ? "border-red-500" : ""}`}
                                    />
                                    {formErrors.ongkir && <p className="text-red-500 text-xs mt-1">{formErrors.ongkir}</p>}
                                </div>
                            </div>

                            {estimasiTotal > 0 && (
                                <>
                                <div className={`${softBg} rounded-lg px-4 py-3 flex items-center justify-between`}>
                                    <span className={`text-sm ${subText}`}>Estimasi Total</span>
                                    <span className="text-base font-bold text-blue-500">{formatCurrency(estimasiTotal)}</span>
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${text}`}>Bayar</label>
                                    <input
                                        type="text"
                                        value={bayarDisplay}
                                        onChange={(e) => {
                                            const raw = e.target.value.replace(/\D/g, '');
                                            if (raw === '') {
                                                setForm(f => ({ ...f, nominal_bayar: "" }));
                                                setBayarDisplay('');
                                            } else {
                                                const numeric = parseInt(raw, 10);
                                                setForm(f => ({ ...f, nominal_bayar: numeric.toString() }));
                                                setBayarDisplay(numeric.toLocaleString('id-ID')); // tampilan dengan titik
                                            }
                                        }}
                                        placeholder="0"
                                        className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${inputCls} ${formErrors.harga_beli ? "border-red-500" : ""}`}
                                    />
                                </div>
                                </>
                            )}


                            <div>
                                <label className={`block text-sm font-medium mb-1 ${text}`}>Supplier (Opsional)</label>
                                <select
                                    value={form.supplier_id}
                                    onChange={(e) => setForm(f => ({ ...f, supplier_id: e.target.value }))}
                                    className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${inputCls}`}
                                >
                                    <option value="">-- Pilih Supplier (opsional) --</option>
                                    {suppliers.map(s => (
                                        <option key={s.id} value={s.id}>{s.nama_supplier}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className={`block text-sm font-medium mb-1 ${text}`}>Keterangan</label>
                                <input
                                    type="text"
                                    value={form.keterangan}
                                    onChange={(e) => setForm(f => ({ ...f, keterangan: e.target.value }))}
                                    placeholder="Catatan tambahan..."
                                    className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${inputCls}`}
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                                    Simpan Pembelian
                                </button>
                                <button type="button" onClick={() => { setShowForm(false); setFormErrors({}); }}
                                    className={`flex-1 py-2.5 font-semibold rounded-lg transition-colors ${currentTheme === "Dark" ? "bg-zinc-700 hover:bg-zinc-600 text-zinc-100" : "bg-slate-200 hover:bg-slate-300 text-slate-700"}`}>
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
