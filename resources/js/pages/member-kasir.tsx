import MenuBar from '@/components/menu-bar';
import type { Member as MemberType } from '@/types/type';
import { Link, router } from '@inertiajs/react';
import { LogOut } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { useMobileNavigation } from '../hooks/use-mobile-navigation';

// ===== helpers
function getCsrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
}

export default function Member() {
    const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('theme') || 'auto');
    const [theme, setTheme] = useState(false);

    // ===== theme classes
    const bgApp = currentTheme === 'auto' ? 'bg-gray-50 dark:bg-zinc-950' : currentTheme === 'Light' ? 'bg-gray-50' : 'bg-zinc-950';
    const card =
        currentTheme === 'auto'
            ? 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800'
            : currentTheme === 'Dark'
              ? 'bg-zinc-900 border border-zinc-800'
              : 'bg-white border border-zinc-200';
    const text = currentTheme === 'auto' ? 'text-zinc-900 dark:text-zinc-100' : currentTheme === 'Dark' ? 'text-zinc-100' : 'text-zinc-900';
    const subText = currentTheme === 'auto' ? 'text-zinc-500 dark:text-zinc-400' : currentTheme === 'Dark' ? 'text-zinc-400' : 'text-zinc-500';
    const rowHover =
        currentTheme === 'auto'
            ? 'hover:bg-slate-50 dark:hover:bg-zinc-800/60'
            : currentTheme === 'Dark'
              ? 'hover:bg-zinc-800/60'
              : 'hover:bg-slate-50';
    const borderSoft = currentTheme === 'Dark' ? 'border-zinc-800' : 'border-slate-200';

    // ===== state
    const [searchTerm, setSearchTerm] = useState('');
    const [membersList, setMembersList] = useState<MemberType[]>([]); // <- fix: harus array, bukan string
    const [member, setMember] = useState({ nama: '', alamat: '', telepon: '' });

    const [editData, setEditData] = useState<MemberType | null>(null);
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModalTambahMember, setShowModalTambahMember] = useState(false);
    const [showModalEditMember, setShowModalEditMember] = useState(false);

    // ===== pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState<number>(10);
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, pageSize]);

    // ===== fetch
    const fetchMembers = async () => {
        try {
            setLoading(true);
            const res = await fetch('/member/list');
            if (!res.ok) throw new Error('Gagal mengambil data member');
            const data = await res.json();
            setMembersList(Array.isArray(data) ? data : []);
        } catch (e: any) {
            Swal.fire('Gagal', e?.message || 'Gagal mengambil data', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    // ===== data view
    const filteredMember = useMemo(() => {
        const list = membersList || [];
        if (!searchTerm) return list;
        const q = searchTerm.toLowerCase();
        return list.filter((item) => (item.nama || '').toLowerCase().includes(q));
    }, [membersList, searchTerm]); // <- fix deps

    // ===== derived pagination
    const totalItems = filteredMember.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const currentSafe = Math.min(Math.max(currentPage, 1), totalPages);
    const startIndex = (currentSafe - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    const pagedMember = filteredMember.slice(startIndex, endIndex);

    const getPageNumbers = (current: number, total: number): (number | '...')[] => {
        if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
        if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
        if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
        return [1, '...', current - 1, current, current + 1, '...', total];
    };
    const pageNumbers = getPageNumbers(currentSafe, totalPages);

    // ===== handlers
    const handleTambahMember = () => {
        router.post(route('member.store'), member, {
            onSuccess: () => {
                Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Member berhasil ditambahkan.' });
                setMember({ nama: '', alamat: '', telepon: '' });
                setShowModalTambahMember(false);
                fetchMembers();
            },
            onError: (errors: Record<string, string>) => {
                const allErrors = errors ? Object.values(errors).join('\n') : 'Terjadi kesalahan';
                Swal.fire({ icon: 'error', title: 'Gagal!', text: allErrors });
            },
        });
    };

    const handleDelete = (id: number) => {
        Swal.fire({
            title: 'Yakin ingin menghapus?',
            text: 'Data member akan dihapus secara permanen!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('member.destroy', id), {
                    onSuccess: () => {
                        Swal.fire('Terhapus!', 'Member berhasil dihapus.', 'success');
                        fetchMembers();
                    },
                    onError: () => {
                        Swal.fire('Gagal!', 'Gagal menghapus member.', 'error');
                    },
                });
            }
        });
    };

    const openEditModal = (m: MemberType) => {
        setEditData({
            ...m,
            nama: m.nama ?? '',
            alamat: m.alamat ?? '',
            telepon: (m.telepon ?? '').toString() as any, // biar aman di input text
        });
        setShowModalEditMember(true);
    };

    const handleLevelChange = async (memberId: number, level: string | null) => {
        try {
            setLoading(true);
            const res = await fetch(`/admin/member/${memberId}/level`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify({ level: level }),
            });

            if (!res.ok) {
                const errJson = await res.json().catch(() => ({}));
                throw new Error(errJson?.message || 'Gagal update voucher');
            }

            Swal.fire('Berhasil', 'Voucher diskon berhasil diupdate untuk member', 'success');
            fetchMembers();
        } catch (e: any) {
            Swal.fire('Gagal', e?.message || 'Terjadi kesalahan.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const headerBg =
        currentTheme === 'auto'
            ? 'bg-gray-800 dark:bg-zinc-900/80'
            : currentTheme === 'Light'
              ? 'bg-gray-800' // header tetap gelap biar kontras
              : 'bg-zinc-900/80';

    const cleanup = useMobileNavigation();
    const handleLogout = () => {
        cleanup();
        router.flushAll();
        localStorage.removeItem('username');
    };
    const [showLogout, setShowLogout] = useState(false);
    const toggleLogout = () => {
        setShowLogout(!showLogout);
    };

    useEffect(() => {
        const root = document.documentElement;

        if (currentTheme === 'Dark') {
            root.classList.add('dark');
            localStorage.setItem('theme', 'Dark');
        } else if (currentTheme === 'Light') {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'Light');
        } else if (currentTheme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            localStorage.setItem('theme', 'auto');

            if (prefersDark) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        }
    }, [currentTheme]);

    // ===== render
    return (
        <div className={`flex min-h-screen w-full ${bgApp} flex-col gap-4 pt-30`}>
            <div
                className={`${currentTheme === 'auto' ? 'bg-zinc-50 shadow-gray-800 dark:bg-zinc-900 dark:text-white dark:shadow-gray-500' : currentTheme === 'Light' ? 'bg-zinc-50 text-zinc-900 shadow-gray-800' : currentTheme === 'Dark' && 'bg-zinc-900 text-white shadow-gray-500'} gap-2 rounded-xl py-2 transition-all ${theme ? 'h-30 justify-end' : 'h-12 justify-center'} fixed right-4 bottom-4 z-10 flex w-12 flex-col items-center border-slate-100 shadow`}
            >
                {theme && (
                    <>
                        <svg
                            onClick={() => setTheme(false)}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="size-6"
                        >
                            <path
                                fillRule="evenodd"
                                d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z"
                                clipRule="evenodd"
                            />
                        </svg>
                        {currentTheme === 'auto' ? (
                            <>
                                <svg
                                    onClick={() => setCurrentTheme('Dark')}
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="size-6 rounded transition-all hover:bg-gray-500"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <svg
                                    onClick={() => setCurrentTheme('Light')}
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="size-6 rounded transition-all hover:bg-gray-500"
                                >
                                    <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" />
                                </svg>
                            </>
                        ) : currentTheme === 'Light' ? (
                            <>
                                <svg
                                    onClick={() => setCurrentTheme('Dark')}
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="size-6 rounded transition-all hover:bg-gray-500"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <svg
                                    onClick={() => setCurrentTheme('auto')}
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="size-6 rounded transition-all hover:bg-gray-500"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M11.828 2.25c-.916 0-1.699.663-1.85 1.567l-.091.549a.798.798 0 0 1-.517.608 7.45 7.45 0 0 0-.478.198.798.798 0 0 1-.796-.064l-.453-.324a1.875 1.875 0 0 0-2.416.2l-.243.243a1.875 1.875 0 0 0-.2 2.416l.324.453a.798.798 0 0 1 .064.796 7.448 7.448 0 0 0-.198.478.798.798 0 0 1-.608.517l-.55.092a1.875 1.875 0 0 0-1.566 1.849v.344c0 .916.663 1.699 1.567 1.85l.549.091c.281.047.508.25.608.517.06.162.127.321.198.478a.798.798 0 0 1-.064.796l-.324.453a1.875 1.875 0 0 0 .2 2.416l.243.243c.648.648 1.67.733 2.416.2l.453-.324a.798.798 0 0 1 .796-.064c.157.071.316.137.478.198.267.1.47.327.517.608l.092.55c.15.903.932 1.566 1.849 1.566h.344c.916 0 1.699-.663 1.85-1.567l.091-.549a.798.798 0 0 1 .517-.608 7.52 7.52 0 0 0 .478-.198.798.798 0 0 1 .796.064l.453.324a1.875 1.875 0 0 0 2.416-.2l.243-.243c.648-.648.733-1.67.2-2.416l-.324-.453a.798.798 0 0 1-.064-.796c.071-.157.137-.316.198-.478.1-.267.327-.47.608-.517l.55-.091a1.875 1.875 0 0 0 1.566-1.85v-.344c0-.916-.663-1.699-1.567-1.85l-.549-.091a.798.798 0 0 1-.608-.517 7.507 7.507 0 0 0-.198-.478.798.798 0 0 1 .064-.796l.324-.453a1.875 1.875 0 0 0-.2-2.416l-.243-.243a1.875 1.875 0 0 0-2.416-.2l-.453.324a.798.798 0 0 1-.796.064 7.462 7.462 0 0 0-.478-.198.798.798 0 0 1-.517-.608l-.091-.55a1.875 1.875 0 0 0-1.85-1.566h-.344ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </>
                        ) : (
                            currentTheme === 'Dark' && (
                                <>
                                    <svg
                                        onClick={() => setCurrentTheme('auto')}
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        className="size-6 rounded transition-all hover:bg-gray-500"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M11.828 2.25c-.916 0-1.699.663-1.85 1.567l-.091.549a.798.798 0 0 1-.517.608 7.45 7.45 0 0 0-.478.198.798.798 0 0 1-.796-.064l-.453-.324a1.875 1.875 0 0 0-2.416.2l-.243.243a1.875 1.875 0 0 0-.2 2.416l.324.453a.798.798 0 0 1 .064.796 7.448 7.448 0 0 0-.198.478.798.798 0 0 1-.608.517l-.55.092a1.875 1.875 0 0 0-1.566 1.849v.344c0 .916.663 1.699 1.567 1.85l.549.091c.281.047.508.25.608.517.06.162.127.321.198.478a.798.798 0 0 1-.064.796l-.324.453a1.875 1.875 0 0 0 .2 2.416l.243.243c.648.648 1.67.733 2.416.2l.453-.324a.798.798 0 0 1 .796-.064c.157.071.316.137.478.198.267.1.47.327.517.608l.092.55c.15.903.932 1.566 1.849 1.566h.344c.916 0 1.699-.663 1.85-1.567l.091-.549a.798.798 0 0 1 .517-.608 7.52 7.52 0 0 0 .478-.198.798.798 0 0 1 .796.064l.453.324a1.875 1.875 0 0 0 2.416-.2l.243-.243c.648-.648.733-1.67.2-2.416l-.324-.453a.798.798 0 0 1-.064-.796c.071-.157.137-.316.198-.478.1-.267.327-.47.608-.517l.55-.091a1.875 1.875 0 0 0 1.566-1.85v-.344c0-.916-.663-1.699-1.567-1.85l-.549-.091a.798.798 0 0 1-.608-.517 7.507 7.507 0 0 0-.198-.478.798.798 0 0 1 .064-.796l.324-.453a1.875 1.875 0 0 0-.2-2.416l-.243-.243a1.875 1.875 0 0 0-2.416-.2l-.453.324a.798.798 0 0 1-.796.064 7.462 7.462 0 0 0-.478-.198.798.798 0 0 1-.517-.608l-.091-.55a1.875 1.875 0 0 0-1.85-1.566h-.344ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    <svg
                                        onClick={() => setCurrentTheme('Light')}
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        className="size-6 rounded transition-all hover:bg-gray-500"
                                    >
                                        <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" />
                                    </svg>
                                </>
                            )
                        )}
                    </>
                )}
                {currentTheme === 'auto' ? (
                    <svg onClick={() => setTheme(true)} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                        <path
                            fillRule="evenodd"
                            d="M11.828 2.25c-.916 0-1.699.663-1.85 1.567l-.091.549a.798.798 0 0 1-.517.608 7.45 7.45 0 0 0-.478.198.798.798 0 0 1-.796-.064l-.453-.324a1.875 1.875 0 0 0-2.416.2l-.243.243a1.875 1.875 0 0 0-.2 2.416l.324.453a.798.798 0 0 1 .064.796 7.448 7.448 0 0 0-.198.478.798.798 0 0 1-.608.517l-.55.092a1.875 1.875 0 0 0-1.566 1.849v.344c0 .916.663 1.699 1.567 1.85l.549.091c.281.047.508.25.608.517.06.162.127.321.198.478a.798.798 0 0 1-.064.796l-.324.453a1.875 1.875 0 0 0 .2 2.416l.243.243c.648.648 1.67.733 2.416.2l.453-.324a.798.798 0 0 1 .796-.064c.157.071.316.137.478.198.267.1.47.327.517.608l.092.55c.15.903.932 1.566 1.849 1.566h.344c.916 0 1.699-.663 1.85-1.567l.091-.549a.798.798 0 0 1 .517-.608 7.52 7.52 0 0 0 .478-.198.798.798 0 0 1 .796.064l.453.324a1.875 1.875 0 0 0 2.416-.2l.243-.243c.648-.648.733-1.67.2-2.416l-.324-.453a.798.798 0 0 1-.064-.796c.071-.157.137-.316.198-.478.1-.267.327-.47.608-.517l.55-.091a1.875 1.875 0 0 0 1.566-1.85v-.344c0-.916-.663-1.699-1.567-1.85l-.549-.091a.798.798 0 0 1-.608-.517 7.507 7.507 0 0 0-.198-.478.798.798 0 0 1 .064-.796l.324-.453a1.875 1.875 0 0 0-.2-2.416l-.243-.243a1.875 1.875 0 0 0-2.416-.2l-.453.324a.798.798 0 0 1-.796.064 7.462 7.462 0 0 0-.478-.198.798.798 0 0 1-.517-.608l-.091-.55a1.875 1.875 0 0 0-1.85-1.566h-.344ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z"
                            clipRule="evenodd"
                        />
                    </svg>
                ) : currentTheme === 'Light' ? (
                    <svg onClick={() => setTheme(true)} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                        <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" />
                    </svg>
                ) : (
                    currentTheme === 'Dark' && (
                        <svg
                            onClick={() => setTheme(true)}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="size-6"
                        >
                            <path
                                fillRule="evenodd"
                                d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z"
                                clipRule="evenodd"
                            />
                        </svg>
                    )
                )}
            </div>
            <div className={`flex flex-col ${headerBg} fixed top-0 right-0 left-0 z-10 gap-4 px-4 py-4`}>
                <div className={`flex justify-between`}>
                    <div className="flex w-1/6 items-center">
                        <h1 className="text-2xl font-bold text-white">Point Of Sale</h1>
                    </div>
                    <div onClick={toggleLogout} className={`relative flex cursor-pointer items-center text-white`}>
                        {localStorage.getItem('username')}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className={`ml-2 size-4 ${showLogout ? 'rotate-180' : ''} transition-transform duration-150 ease-in-out`}
                        >
                            <path
                                fillRule="evenodd"
                                d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z"
                                clipRule="evenodd"
                            />
                        </svg>
                        {showLogout && (
                            <div
                                className={`animate-fade-in absolute top-8 right-0 z-20 w-36 cursor-pointer rounded-md bg-red-500 p-0 shadow-lg transition-all duration-150 ease-in-out hover:opacity-50`}
                            >
                                <ul className="m-0 p-0 text-white">
                                    <li className="cursor-pointer rounded-md px-2 py-2 transition-colors">
                                        <Link className="flex w-full" method="post" href={route('logout')} as="button" onClick={handleLogout}>
                                            <LogOut className="mr-2" />
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
            <div className="flex flex-col p-6">
                <div className="mb-4 flex items-center gap-4">
                    <h2 className="text-xl font-semibold">Kelola Member</h2>
                </div>
                <div className={`mb-6 flex items-center justify-between rounded-xl p-6 shadow ${card}`}>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                        }}
                        className={`mx-4 w-1/2 rounded-xl border p-3 shadow ${
                            currentTheme === 'auto'
                                ? 'border-zinc-300 bg-white text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100'
                                : currentTheme === 'Dark'
                                  ? 'border-zinc-700 bg-zinc-800 text-zinc-100'
                                  : 'border-slate-300 bg-white text-zinc-900'
                        }`}
                        placeholder="Cari nama member..."
                    />
                    <button
                        onClick={() => {
                            setShowModalTambahMember(true);
                        }}
                        className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    >
                        Tambah Member Baru
                    </button>
                </div>

                <div className={`relative min-h-[40vh] overflow-x-auto rounded-xl pb-20 shadow ${card}`}>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead
                                className={`${currentTheme === 'auto' ? 'bg-slate-50 dark:bg-zinc-800' : currentTheme === 'Dark' ? 'bg-zinc-800' : 'bg-slate-50'}`}
                            >
                                <tr className={`border-b ${borderSoft}`}>
                                    <th className="px-6 py-3">ID</th>
                                    <th className="px-6 py-3">Nama</th>
                                    <th className="px-6 py-3">Alamat</th>
                                    <th className="px-6 py-3">Nomor&nbsp;Telepon</th>
                                    <th className="px-6 py-3">Level</th>
                                    <th className="px-6 py-3">Total&nbsp;Transaksi</th>
                                    <th className="px-6 py-3">Tanggal&nbsp;Daftar</th>
                                    <th className="py-3 pr-6 text-center">Aksi</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading && (
                                    <tr>
                                        <td colSpan={8} className={`py-8 text-center ${subText}`}>
                                            Loading…
                                        </td>
                                    </tr>
                                )}

                                {!loading && filteredMember.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="py-12">
                                            <div className="text-center">
                                                <svg className={`mx-auto h-12 w-12 ${subText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                    />
                                                </svg>
                                                <h3 className="mt-2 text-sm font-medium">Tidak ada Data</h3>
                                                <p className={`mt-1 text-sm ${subText}`}>Tidak ada data yang sesuai dengan filter.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}

                                {!loading &&
                                    pagedMember.map((m) => (
                                        <tr key={m.id} className={`border-b ${borderSoft} ${rowHover} transition`}>
                                            <td className="px-6 py-3">{m.id}</td>
                                            <td className="px-6 py-3">{m.nama}</td>
                                            <td className="px-6 py-3">{m.alamat}</td>
                                            <td className="px-6 py-3">{m.telepon}</td>
                                            <td className="px-6 py-3">
                                                <select
                                                    className={`rounded border p-2 ${
                                                        currentTheme === 'auto'
                                                            ? 'border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-800'
                                                            : currentTheme === 'Dark'
                                                              ? 'border-zinc-700 bg-zinc-800'
                                                              : 'border-slate-300 bg-white'
                                                    }`}
                                                    value={m.level || ''}
                                                    onChange={(e) => handleLevelChange(m.id, e.target.value ? e.target.value : null)}
                                                    disabled={loading}
                                                >
                                                    <option value="merah">merah</option>
                                                    <option value="kuning">kuning</option>
                                                    <option value="hijau">hijau</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-3 text-center">{m.total_transaksi}</td>
                                            <td className="px-6 py-3">{m.tanggal_daftar}</td>
                                            <td className="py-3 pr-6">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => handleDelete(m.id)}
                                                        className="rounded-md bg-red-600 px-3 py-2 text-white hover:bg-red-700"
                                                    >
                                                        Hapus
                                                    </button>
                                                    <button
                                                        onClick={() => openEditModal(m)}
                                                        className="rounded-md bg-yellow-500 px-3 py-2 text-white hover:bg-yellow-600"
                                                    >
                                                        Edit
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>

                    {/* pagination */}
                    {!loading && filteredMember.length > 0 && (
                        <div
                            className={`flex flex-col items-center justify-between border-t px-6 py-4 sm:flex-row ${borderSoft} absolute right-0 bottom-0 left-0 gap-3`}
                        >
                            <div className={`text-sm ${subText}`}>
                                Menampilkan <span className="font-semibold">{startIndex + 1}</span>–<span className="font-semibold">{endIndex}</span>{' '}
                                dari
                                <span className="font-semibold"> {totalItems}</span> Member
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    className={`cursor-pointer rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50 ${currentTheme === 'Dark' ? 'border-zinc-700 hover:bg-zinc-800' : 'border-slate-300 hover:bg-slate-50'}`}
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentSafe === 1}
                                    aria-label="Halaman sebelumnya"
                                >
                                    Prev
                                </button>

                                {pageNumbers.map((p, idx) =>
                                    p === '...' ? (
                                        <span key={`dots-${idx}`} className={`px-2 select-none ${subText}`}>
                                            …
                                        </span>
                                    ) : (
                                        <button
                                            key={p}
                                            onClick={() => setCurrentPage(p as number)}
                                            aria-current={currentSafe === p ? 'page' : undefined}
                                            className={`cursor-pointer rounded-lg border px-3 py-2 text-sm transition-all ${
                                                currentSafe === p
                                                    ? 'border-blue-600 bg-blue-600 text-white hover:bg-blue-600/90'
                                                    : currentTheme === 'Dark'
                                                      ? 'border-zinc-700 hover:bg-blue-600 hover:text-white'
                                                      : 'border-slate-300 hover:bg-blue-600 hover:text-white'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    ),
                                )}

                                <button
                                    className={`cursor-pointer rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50 ${currentTheme === 'Dark' ? 'border-zinc-700 hover:bg-zinc-800' : 'border-slate-300 hover:bg-slate-50'}`}
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
                                    className={`rounded-lg border px-2 py-2 text-sm ${
                                        currentTheme === 'auto'
                                            ? 'border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-800'
                                            : currentTheme === 'Dark'
                                              ? 'border-zinc-700 bg-zinc-800'
                                              : 'border-slate-300 bg-white'
                                    }`}
                                >
                                    {[10, 25, 50, 100].map((sz) => (
                                        <option key={sz} value={sz}>
                                            {sz}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal Tambah */}
                {showModalTambahMember && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
                        <div className={`${card} ${text} w-full max-w-md rounded-lg shadow-lg`}>
                            <div className="flex items-center justify-between rounded-t border-b border-gray-200 p-4">
                                <h3 className="text-lg font-semibold">Tambah Member</h3>
                                <button
                                    type="button"
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-sm text-gray-400 hover:text-gray-700"
                                    onClick={() => setShowModalTambahMember(false)}
                                >
                                    <svg className="h-3 w-3" aria-hidden="true" fill="none" viewBox="0 0 14 14">
                                        <path
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                                        />
                                    </svg>
                                    <span className="sr-only">Close modal</span>
                                </button>
                            </div>

                            <div className="space-y-4 p-4">
                                <div className="flex flex-col">
                                    <label htmlFor="nama">Nama Member</label>
                                    <input
                                        id="nama"
                                        type="text"
                                        value={member.nama}
                                        onChange={(e) => setMember({ ...member, nama: e.target.value })}
                                        className={`border border-gray-300 focus:outline-0 ${currentTheme === 'auto' ? 'border-zinc-300 bg-white text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100' : currentTheme === 'Dark' ? 'border-zinc-700 bg-zinc-800 text-zinc-100' : 'border-slate-300 bg-white text-zinc-900'} rounded-md p-2`}
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <label htmlFor="alamat">Alamat Member</label>
                                    <textarea
                                        id="alamat"
                                        value={member.alamat}
                                        onChange={(e) => setMember({ ...member, alamat: e.target.value })}
                                        className={`border border-gray-300 focus:outline-0 ${currentTheme === 'auto' ? 'border-zinc-300 bg-white text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100' : currentTheme === 'Dark' ? 'border-zinc-700 bg-zinc-800 text-zinc-100' : 'border-slate-300 bg-white text-zinc-900'} rounded-md p-2`}
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <label htmlFor="telepon">Nomor Telepon Member</label>
                                    <input
                                        id="telepon"
                                        type="text"
                                        value={member.telepon}
                                        onChange={(e) => setMember({ ...member, telepon: e.target.value })}
                                        className={`border border-gray-300 focus:outline-0 ${currentTheme === 'auto' ? 'border-zinc-300 bg-white text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100' : currentTheme === 'Dark' ? 'border-zinc-700 bg-zinc-800 text-zinc-100' : 'border-slate-300 bg-white text-zinc-900'} rounded-md p-2`}
                                    />
                                </div>
                            </div>

                            <div className="p-4">
                                <button onClick={handleTambahMember} className="w-full rounded-md bg-blue-600 py-2 text-white hover:bg-blue-700">
                                    Tambahkan
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Edit */}
                {showModalEditMember && editData && (
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            router.put(
                                route('member.update', editData.id),
                                { nama: editData.nama, telepon: String(editData.telepon), alamat: editData.alamat },
                                {
                                    onSuccess: () => {
                                        setShowModalEditMember(false);
                                        setEditData(null);
                                        Swal.fire('Berhasil', 'Member berhasil diperbarui', 'success');
                                        fetchMembers();
                                    },
                                    onError: (errors) => {
                                        const allErrors = errors ? Object.values(errors).flat().join('\n') : 'Terjadi kesalahan';
                                        Swal.fire('Gagal', allErrors, 'error');
                                    },
                                },
                            );
                        }}
                        className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
                    >
                        <div className={`${card} ${text} w-full max-w-md rounded-lg shadow-lg`}>
                            <div className="flex items-center justify-between rounded-t border-b border-gray-200 p-4">
                                <h3 className="text-lg font-semibold">Edit Member</h3>
                                <button
                                    type="button"
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-sm text-gray-400 hover:text-gray-700"
                                    onClick={() => {
                                        setShowModalEditMember(false);
                                        setEditData(null);
                                    }}
                                >
                                    <svg className="h-3 w-3" aria-hidden="true" fill="none" viewBox="0 0 14 14">
                                        <path
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                                        />
                                    </svg>
                                    <span className="sr-only">Close modal</span>
                                </button>
                            </div>

                            <div className="space-y-4 p-4">
                                <div className="flex flex-col">
                                    <label htmlFor="nama-edit">Nama Member</label>
                                    <input
                                        id="nama-edit"
                                        type="text"
                                        value={editData.nama}
                                        onChange={(e) => setEditData({ ...editData, nama: e.target.value })}
                                        className={`border border-gray-300 focus:outline-0 ${currentTheme === 'auto' ? 'border-zinc-300 bg-white text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100' : currentTheme === 'Dark' ? 'border-zinc-700 bg-zinc-800 text-zinc-100' : 'border-slate-300 bg-white text-zinc-900'} rounded-md p-2`}
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label htmlFor="alamat-edit">Alamat Member</label>
                                    <textarea
                                        id="alamat-edit"
                                        value={editData.alamat || ''}
                                        onChange={(e) => setEditData({ ...editData, alamat: e.target.value })}
                                        className={`border border-gray-300 focus:outline-0 ${currentTheme === 'auto' ? 'border-zinc-300 bg-white text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100' : currentTheme === 'Dark' ? 'border-zinc-700 bg-zinc-800 text-zinc-100' : 'border-slate-300 bg-white text-zinc-900'} rounded-md p-2`}
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label htmlFor="telepon-edit">Nomor Telepon Member</label>
                                    <input
                                        id="telepon-edit"
                                        type="text"
                                        value={(editData.telepon ?? '').toString()}
                                        onChange={(e) => setEditData({ ...editData, telepon: e.target.value as any })}
                                        className={`border border-gray-300 focus:outline-0 ${currentTheme === 'auto' ? 'border-zinc-300 bg-white text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100' : currentTheme === 'Dark' ? 'border-zinc-700 bg-zinc-800 text-zinc-100' : 'border-slate-300 bg-white text-zinc-900'} rounded-md p-2`}
                                    />
                                </div>
                            </div>

                            <div className="p-4">
                                <button type="submit" className="w-full rounded-md bg-blue-600 py-2 text-white hover:bg-blue-700">
                                    Simpan Perubahan
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
