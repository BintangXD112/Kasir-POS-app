import React, { useState, useMemo, useEffect } from 'react';
import { router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { useMobileNavigation } from '../hooks/use-mobile-navigation';
import MenuBar from '@/components/menu-bar';


declare const route: (name: string, params?: any) => string;

interface Supplier {
    id: number;
    nama_supplier: string;
    no_hp: string | null;
    alamat: string | null;
    jumlah_pembelian: number;
    total_pembelian: number;
    created_at: string | null;
}

interface Props {
    suppliers: Supplier[];
    total_pembelian: number;
    sisa_hutang: number;
}

const fmt = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const fmtDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

const emptyForm = { nama_supplier: '', no_hp: '', alamat: '' };

export default function SupplierPage({ suppliers = [], total_pembelian = 0, sisa_hutang = 0 }: Props) {
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [pageSize, setPageSize] = useState<number>(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('theme') || 'auto');
    const [theme, setTheme] = useState(false);

    // ===== DATA =====
    const filtered = useMemo(() =>
        suppliers.filter(s =>
            s.nama_supplier.toLowerCase().includes(search.toLowerCase()) ||
            (s.no_hp?.includes(search) ?? false)
        ), [suppliers, search]);

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

    const openAdd = () => { setForm(emptyForm); setErrors({}); setEditMode(false); setEditId(null); setShowModal(true); };
    const openEdit = (s: Supplier) => { setForm({ nama_supplier: s.nama_supplier, no_hp: s.no_hp || '', alamat: s.alamat || '' }); setErrors({}); setEditMode(true); setEditId(s.id); setShowModal(true); };
    const closeModal = () => { setShowModal(false); setForm(emptyForm); setErrors({}); };

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.nama_supplier.trim()) e.nama_supplier = 'Nama supplier wajib diisi';
        return e;
    };

    const handleSubmit = (ev: React.FormEvent) => {
        ev.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }

        if (editMode && editId) {
            router.put(route('supplier.update', editId), form, {
                preserveScroll: true,
                onSuccess: () => { Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Data supplier diperbarui.', timer: 1500, showConfirmButton: false }); closeModal(); },
                onError: (e) => setErrors(e as any),
            });
        } else {
            router.post(route('supplier.store'), form, {
                preserveScroll: true,
                onSuccess: () => { Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Supplier baru ditambahkan.', timer: 1500, showConfirmButton: false }); closeModal(); },
                onError: (e) => setErrors(e as any),
            });
        }
    };

    const handleDelete = (id: number, nama: string) => {
        Swal.fire({ title: `Hapus ${nama}?`, text: 'Data supplier akan dihapus permanen.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#6b7280', confirmButtonText: 'Ya, hapus', cancelButtonText: 'Batal' })
            .then(r => {
                if (r.isConfirmed) {
                    router.delete(route('supplier.destroy', id), {
                        preserveScroll: true,
                        onSuccess: () => Swal.fire({ icon: 'success', title: 'Terhapus!', text: 'Supplier berhasil dihapus.', timer: 1500, showConfirmButton: false }),
                        onError: () => Swal.fire('Gagal!', 'Supplier tidak bisa dihapus (mungkin ada data terkait).', 'error'),
                    });
                }
            });
    };
    // ===== THEME HELPERS =====
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

    return (
        <div className={`flex min-h-screen w-full ${bgApp} flex-col gap-4`}>
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
            <div className={`flex flex-col ${headerBg} gap-4 px-4 py-4`}>
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
            {/* Page Title */}
            <div className="pl-6 pt-6 flex items-center pr-6">
                <div>
                    <h2 className={`text-xl font-semibold ${text}`}>Kelola Supplier</h2>
                    <p className={`text-sm ${subText} mt-0.5`}>Manajemen data supplier pembelian stok</p>
                </div>
            </div>

            <div className="p-6 space-y-4">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className={`${card} rounded-xl p-5`}>
                        <p className={`text-sm ${subText} mb-1`}>Total Supplier</p>
                        <p className="text-2xl font-bold text-blue-500">{suppliers.length}</p>
                    </div>
                    <div className={`${card} rounded-xl p-5`}>
                        <p className={`text-sm ${subText} mb-1`}>Total Pembelian ke Supplier</p>
                        <p className="text-2xl font-bold text-emerald-500">{fmt(total_pembelian)}</p>
                    </div>
                    <div className={`${card} rounded-xl p-5`}>
                        <p className={`text-sm ${subText} mb-1`}>Sisa Hutang (Status Pending)</p>
                        <p className="text-2xl font-bold text-red-500">{fmt(sisa_hutang)}</p>
                    </div>
                </div>

                {/* Search */}
                <div className={`${card} flex justify-between rounded-xl p-4`}>
                    <div className="relative max-w-md">
                        <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${subText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input type="text" placeholder="Cari nama atau no. HP supplier..." value={search} onChange={e => setSearch(e.target.value)} className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${inputCls}`} />
                        {search && <button onClick={() => setSearch('')} className={`absolute right-3 top-1/2 -translate-y-1/2 ${subText} hover:opacity-80`}>×</button>}
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => router.visit('/stock')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm border transition-colors ${currentTheme === 'Dark' ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}>
                            Pembelian Stok
                        </button>
                        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            Tambah Supplier
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className={`${card} relative pb-20 rounded-xl overflow-hidden shadow-sm`}>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className={softBg}>
                                <tr className={`border-b ${borderSoft}`}>
                                    {['Nama Supplier', 'No. HP', 'Alamat', 'Jml Order', 'Total Pembelian', 'Terdaftar', 'Aksi'].map(h => (
                                        <th key={h} className={`px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider ${subText}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={7} className={`text-center py-12 ${subText}`}>Belum ada data supplier.</td></tr>
                                ) : filtered.map(s => (
                                    <tr key={s.id} className={`border-b ${borderSoft} ${rowHover} transition-colors`}>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                                    {s.nama_supplier.charAt(0).toUpperCase()}
                                                </div>
                                                <p className={`font-medium ${text}`}>{s.nama_supplier}</p>
                                            </div>
                                        </td>
                                        <td className={`px-5 py-4 text-sm ${subText}`}>{s.no_hp || '-'}</td>
                                        <td className={`px-5 py-4 text-sm ${subText} max-w-[180px] truncate`}>{s.alamat || '-'}</td>
                                        <td className="px-5 py-4">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">{s.jumlah_pembelian}x</span>
                                        </td>
                                        <td className="px-5 py-4"><span className="text-sm font-bold text-emerald-500">{fmt(s.total_pembelian)}</span></td>
                                        <td className={`px-5 py-4 text-sm ${subText}`}>{fmtDate(s.created_at)}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex gap-2">
                                                <button onClick={() => openEdit(s)} className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition-colors">Edit</button>
                                                <button onClick={() => handleDelete(s.id, s.nama_supplier)} className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors">Hapus</button>
                                            </div>
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

            {/* Modal Tambah/Edit */}
            {showModal && (
                <div className="fixed inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className={`${card} ${text} rounded-2xl shadow-2xl w-full max-w-lg`}>
                        <div className={`flex items-center justify-between px-6 py-4 border-b ${borderSoft}`}>
                            <h2 className="text-lg font-bold">{editMode ? 'Edit Supplier' : 'Tambah Supplier Baru'}</h2>
                            <button onClick={closeModal} className={`p-2 rounded-lg ${currentTheme === 'Dark' ? 'hover:bg-zinc-800' : 'hover:bg-slate-100'} transition-colors`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${text}`}>Nama Supplier <span className="text-red-500">*</span></label>
                                <input type="text" value={form.nama_supplier} onChange={e => setForm(f => ({ ...f, nama_supplier: e.target.value }))} placeholder="Nama lengkap supplier" className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputCls} ${errors.nama_supplier ? 'border-red-500' : ''}`} />
                                {errors.nama_supplier && <p className="text-red-500 text-xs mt-1">{errors.nama_supplier}</p>}
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${text}`}>No. HP</label>
                                <input type="text" value={form.no_hp} onChange={e => setForm(f => ({ ...f, no_hp: e.target.value }))} placeholder="08xx-xxxx-xxxx" className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputCls}`} />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${text}`}>Alamat</label>
                                <textarea value={form.alamat} onChange={e => setForm(f => ({ ...f, alamat: e.target.value }))} placeholder="Alamat lengkap supplier" rows={3} className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${inputCls}`} />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                                    {editMode ? 'Simpan Perubahan' : 'Tambah Supplier'}
                                </button>
                                <button type="button" onClick={closeModal} className={`flex-1 py-2.5 font-semibold rounded-lg transition-colors ${currentTheme === 'Dark' ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-100' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}`}>
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
