import React from "react";
import { type BreadcrumbItem, type PageProps } from '../types/index';
import { useState, useRef, useEffect } from 'react';
import { useMobileNavigation } from '../hooks/use-mobile-navigation';
import { Link, router } from '@inertiajs/react';
import { icons, LogOut } from 'lucide-react';
import QRCodePembayaran from '../components/qrcodepaymentmodal';
import Swal from 'sweetalert2';

interface DashboardProps extends PageProps {
    produk: Produk[];
    kategori: Kategori[];
}

export interface Kategori {
  id: number;
  nama_kategori: string;
}

export interface Produk {
    id: number;
    id_kategori: number;
    nama: string;
    harga: number;
    stok: number;
    gambar: string;
}

declare const route: (name: string, params?: any, absolute?: boolean, config?: any) => string;

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];


export default function Dashboard({ produk, kategori }: DashboardProps) {
    const [searchTerm, setSearchTerm] = useState('');
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
    const scrollRef = useRef<HTMLDivElement>(null);

    // ====== ⬇️ STATE & LOGIC PAGINATION  ⬇️ ======
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(12);
  // Reset ke halaman 1 kalau filter/sort/pageSize berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, pageSize]);
  // ====== ⬆️ STATE & LOGIC PAGINATION  ⬆️ ======

    const [statusNabung, setStatusNabung]= useState("Deposit")

    const scrollLeft = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({
                left: -100,
                behavior: 'smooth'
            });
        }
    };

    // reset pembayaran
    const resetPembayaranTunai = () => {
        setUangTunai('');
        setUangTunaiDisplay('');
        setShowModal(false);
    };

    const generateKodeTransaksi = () => {
        const now = new Date();
        return 'TRX-' + now.getTime();
    };

    // loading screen 
    const [loading, setLoading] = useState(false);

    const [transaksi, setTransaksi] = useState<Array<{ produk: Produk, qty: number }>>([]);

    const handlePrint=()=>{
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        const formatIDR = (n: number) => `Rp ${Number(n || 0).toLocaleString('id-ID')}`;
        const kodeTransaksi = generateKodeTransaksi();
        const tanggalCetak = new Date();
        const subtotal = totalSebelumDiskon;
        const totalAkhir = totalSetelahDiskon;
        const bayarTunai = Number(uangTunai) || 0;
        const kekuranganLocal = Math.max(0, totalAkhir - bayarTunai);
        const kembalianLocal = Math.max(0, bayarTunai - totalAkhir);
        const pakaiSaldo = isSaldoCheck ? Math.min(kekuranganLocal, Number(selectedMember?.saldo ?? 0)) : 0;
        const status = isHutang
          ? 'pending'
          : (selectedPayment === 'tunai' || selectedPayment === 'non-tunai')
            ? 'paid'
            : 'failed';
        const printRows = transaksi.map((it, idx) => {
        const unit = formatIDR(it.produk.harga);
        const line = formatIDR(it.produk.harga * it.qty);
        return `
          <tr>
            <td style="padding:6px;border:1px solid #ddd;">${idx + 1}</td>
            <td style="padding:6px;border:1px solid #ddd;">${it.produk.nama}</td>
            <td style="padding:6px;border:1px solid #ddd; text-align:center;">${it.qty}</td>
            <td style="padding:6px;border:1px solid #ddd; text-align:right;">${unit}</td>
            <td style="padding:6px;border:1px solid #ddd; text-align:right;">${line}</td>
          </tr>
        `;
      }).join('');
        const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8"/>
          <title>Struk Transaksi</title>
          <style>
            body { font-family: Arial, sans-serif; margin:20px; color:#111; }
            h1 { text-align:center; margin:0 0 8px; }
            .meta { text-align:center; color:#555; margin-bottom:16px; }
            table { width:100%; border-collapse:collapse; margin-top:10px; }
            th { background:#f2f2f2; }
            th, td { border:1px solid #ddd; padding:8px; font-size:12px; }
            .right { text-align:right; }
            .summary { margin-top:16px; }
            .summary .row { display:flex; justify-content:space-between; margin:4px 0; }
            .badge { font-weight:bold; }
            .status-paid { color:#059669; }
            .status-pending { color:#d97706; }
            .status-failed { color:#dc2626; }
            @media print { .no-print { display:none; } }
          </style>
        </head>
        <body>
          <h1>Struk Transaksi</h1>
          <div class="meta">
            Kode: <b>${kodeTransaksi}</b> ·
            Tanggal: ${tanggalCetak.toLocaleDateString('id-ID')} ${tanggalCetak.toLocaleTimeString('id-ID')}<br/>
            Kasir: ${localStorage.getItem('username') ?? '-'}<br/>
            Member: ${selectedMember?.nama ?? 'Guest'}
          </div>

          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Produk</th>
                <th>Qty</th>
                <th>Harga</th>
                <th>Jumlah</th>
              </tr>
            </thead>
            <tbody>
              ${printRows}
            </tbody>
          </table>

          <div class="summary">
            <div class="row"><span>Subtotal</span><span>${formatIDR(subtotal)}</span></div>
            <div class="row"><span>Diskon Member (${diskonPersen}%)</span><span>- ${formatIDR(potongan)}</span></div>
            <div class="row"><span><b>Total</b></span><span><b>${formatIDR(totalAkhir)}</b></span></div>
            <div class="row"><span>Bayar Tunai</span><span>${formatIDR(selectedPayment === 'tunai' ? bayarTunai : totalAkhir)}</span></div>
            ${pakaiSaldo > 0 ? `<div class="row"><span>Gunakan Saldo</span><span>${formatIDR(pakaiSaldo)}</span></div>` : ''}
            ${kembalianLocal > 0 ? `<div class="row"><span>Kembalian</span><span>${formatIDR(kembalianLocal)}</span></div>` : ''}
            ${isHutang ? `<div class="row"><span>Sisa Hutang</span><span>${formatIDR(kekuranganLocal)}</span></div>` : ''}
            <div class="row"><span>Status</span>
              <span class="badge status-${status}">${status.toUpperCase()}</span>
            </div>
            <div class="row"><span>Metode</span><span>${selectedPayment || '-'}</span></div>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => window.close(), 100);
            }
          </script>
        </body>
        </html>
      `;
        printWindow.document.write(printContent);
        printWindow.document.close();
    }

    // untuk simulasi qr code
    const handleKonfirmasiPembayaran = () => {
        setShowNonTunaiModal(false);
        resetPembayaranTunai();


        // Tampilkan loading dari SweetAlert
        Swal.fire({
            title: 'Menyimpan transaksi...',
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        
        const kode_transaksi = generateKodeTransaksi();
        const dataToSend = {
            kode_transaksi,
            detail: transaksi.map(item => ({
                produk_id: item.produk.id,
                jumlah: item.qty,
                harga: item.produk.harga,
            })),
            metode: selectedPayment,
            status: isHutang === true
                ? 'pending'
                : (selectedPayment === 'tunai' || selectedPayment === 'non-tunai')
                    ? 'paid'
                    : 'failed',
            total: totalSetelahDiskon,
            nama_member: selectedMember?.nama ?? '',
            menggunakan_saldo: isSaldoCheck,
        };
        router.post(route('transaksi'), dataToSend, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Transaksi Berhasil',
                    text: 'Data berhasil disimpan.',
                });
                setTransaksi([]);
                if (selectedMember?.id) fetchMemberById(selectedMember.id);

                if (isTabung) {
                    handleTabunganMember(
                        selectedMember?.id, 
                        kembalian, 
                        0, 
                        'Kembalian belanja',
                        kode_transaksi, 
                        false,
                    );
                    
                }
                // Proses ke TabunganController jika menggunakan saldo
                if (isSaldoCheck) {
                    handleTabunganMember(
                        selectedMember?.id,
                        0,
                        kekurangan,
                        'Pembayaran menggunakan saldo',
                        kode_transaksi,
                        false
                    );
                }
            },
            onError: (errors) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Transaksi Gagal',
                    text: errors.error,
                });
            },
        });

    };



    const scrollRight = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({
                left: 100,
                behavior: 'smooth'
            });
        }
    };

    const [showModal, setShowModal] = useState(false);
    const [showModalTambahMember, setShowModalTambahMember] = useState(false);
    const [uangTunai, setUangTunai] = useState<number | ''>('');
    const [uangTunaiDisplay, setUangTunaiDisplay] = useState('');
    const [showNonTunaiModal, setShowNonTunaiModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState('');
    const [selectedKategori, setSelectedKategori] = useState<number | 'semua'>( 'semua' );
    const filterNamaProduk = produk.filter((item) => {
    const matchNama = item.nama.toLowerCase().includes(searchTerm.toLowerCase());
    const matchKategori = selectedKategori === 'semua' ? true : item.id_kategori === selectedKategori;
    return matchNama && matchKategori;
    });

    
    const [showModalNabung, setShowModalNabung] = useState(false)
    const funcShowModalNabung = () => {
        if (namaInput === "") {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Silahkan masukkan nama member terlebih dahulu',
                timer: 2000
            })
        } else {
            setShowModalNabung(!showModalNabung)
        }
    }
    

    const tambahTransaksi = (produk: Produk) => {
        setTransaksi((prev) => {
            const index = prev.findIndex(item => item.produk.id === produk.id);
            if (index !== -1) {
                const item = prev[index];
                if (item.qty + 1 > item.produk.stok) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Stok tidak cukup',
                        text: 'Jumlah produk melebihi stok yang tersedia',
                        timer: 2000,
                        timerProgressBar: true,
                        showConfirmButton: false,
                    });
                    return prev; // jangan update
                }
                const update = [...prev];
                update[index].qty += 1;
                return update;
            }
            if (produk.stok < 1) {
                Swal.fire({
                    icon: 'error',
                    title: 'Stok tidak cukup',
                    text: 'Produk ini sedang habis stok',
                    timer: 2000,
                    timerProgressBar: true,
                    showConfirmButton: false,
                });
                return prev;
            }
            return [...prev, { produk, qty: 1 }];
        });
    };


    const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
    const updateQuantity = (produkId: number, newQty: number) => {
        const finalQty = Math.max(0, newQty);

        if (finalQty === 0) {
            setTransaksi(prev => prev.filter(item => item.produk.id !== produkId));

            setQuantities(prev => {
                const newQuantities = { ...prev };
                delete newQuantities[produkId];
                return newQuantities;
            });
        } else {
            setQuantities(prev => ({
                ...prev,
                [produkId]: finalQty
            }));

            setTransaksi(prev =>
                prev.map(item =>
                    item.produk.id === produkId
                        ? { ...item, qty: finalQty }
                        : item
                )
            );
        }
    };
    const [isHutang, setIsHutang] = useState(false);
    const [isTabung, setIsTabung] = useState(false);
    const [isSaldoCheck, setIsSaldoCheck] = useState(false);


    // input rekomendasi otomatis
    const [namaInput, setNamaInput] = useState('');
    const [saran, setSaran] = useState<Array<{
        id: number;
        nama: string;
        diskon: number;
        saldo: number;
    }>>([]);

    const [selectedMember, setSelectedMember] = useState<{
        id: number;
        nama: string;
        diskon: number;
        saldo: number;
    } | null>(null);


    useEffect(() => {
        if (namaInput.trim() !== '') {
            fetch(`/members/search?q=${encodeURIComponent(namaInput)}`)
                .then(res => res.json())
                .then(data => setSaran(data))
                .catch(() => setSaran([]));
        } else {
            setSaran([]);
        }
    }, [namaInput]);

    useEffect(() => {
        const found = saran.find(
            item => item.nama.trim().toLowerCase() === namaInput.trim().toLowerCase()
        );

        if (found) {
            setSelectedMember(found);
        } else {
            setSelectedMember(null); // reset jika tidak ditemukan
        }
    }, [namaInput, saran]);




    useEffect(() => {
        if (localStorage.getItem("tipe_user") !== "kasir") {
            window.location.href = "/login";
        }
    },[handleLogout])


    // logika diskon 
    const totalSebelumDiskon = transaksi.reduce(
        (total, item) => total + item.produk.harga * item.qty,
        0
    );

    const diskonPersen = selectedMember?.diskon ?? 0;
    const potongan = Math.floor((totalSebelumDiskon * diskonPersen) / 100);
    const totalSetelahDiskon = totalSebelumDiskon - potongan;
    const kembalian = Number(uangTunai) - Number(totalSetelahDiskon);



    // tambah member 
    const [member, setMember] = useState({
        nama: '',
        alamat: '',
        telepon: '',
    });

    const handleTambahMember = () => {
        router.post(route('member.store'), member, {
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: 'Member berhasil ditambahkan.',
                });
                setMember({ nama: '', alamat: '', telepon: '' });
                setShowModalTambahMember(false);
            },
            onError: (errors) => {
                const allErrors = Object.values(errors).flat().join('\n');
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal!',
                    text: allErrors,
                });
            },

        });
    };
    // tambah tabungan member 
    const [deposit, setDeposit] = useState<number | ''>('');
    const [depositDisplay, setDepositDisplay] = useState('');
    const [tarik, setTarik] = useState<number | ''>('');
    const [tarikDisplay, setTarikDisplay] = useState('')
    const handleTabunganMember = (
        memberId: number | undefined,
        jumlahDeposit: number = 0,
        jumlahTarik: number = 0,
        keterangan: string = '',
        kodeTransaksi: string = '',
        showAlert: boolean = true
    ) => {
        if (!memberId || (jumlahDeposit <= 0 && jumlahTarik <= 0)) return;

        const executeRequest = () => {
            router.post(
                route('tabungan.store'),
                {
                    member_id: memberId,
                    deposit: jumlahDeposit,
                    tarik: jumlahTarik,
                    keterangan: keterangan,
                    kode_transaksi: kodeTransaksi,
                },
                {
                    onSuccess: (res) => {
                        if (showAlert) {
                            Swal.fire({
                                icon: 'success',
                                title: 'Berhasil!',
                                text: 'Tabungan berhasil diperbarui.',
                                timer: 1500,
                                showConfirmButton: false,
                            });
                        }
                        setDeposit('');
                        setDepositDisplay('');
                        setTarik('');
                        setTarikDisplay('');
                        setStatusNabung('Deposit')
                        setShowModalNabung(false);
                        if (memberId) fetchMemberById(memberId);
                        console.log(res);
                    },
                    onError: (errors) => {
                        if (showAlert) {
                            Swal.fire({
                                icon: 'error',
                                title: 'Gagal!',
                                text: 'Terjadi kesalahan saat memperbarui tabungan.',
                            });
                        }
                        console.error(errors);
                    },
                }
            );
        };

        // Tampilkan konfirmasi hanya jika showAlert = true

        if (showAlert) {
            if (Number(deposit) > 0) {
                Swal.fire({
                    title: 'Yakin?',
                    text: 'Melakukan Deposit!',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Ya, simpan!'
                }).then((result) => {
                    if (result.isConfirmed) {
                        executeRequest();
                    }
                });
            } else if(selectedMember.saldo < Number(tarik)) {
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal',
                    text: 'Saldo tidak mencukupi',
                })
            }else{
                Swal.fire({
                    title: 'Yakin?',
                    text: 'Melakukan Penarikan',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Ya, simpan!'
                }).then((result) => {
                    if (result.isConfirmed) {
                        executeRequest();
                    }
                });
            }
        } else {
            // Langsung request tanpa SweetAlert
            executeRequest();
        }
    };
    // Pastikan uangTunai & totalSetelahDiskon sudah Number
    const kekurangan = Math.max(0, Number(totalSetelahDiskon) - Number(uangTunai));

    const fetchMemberById = async (id: number) => {
        try {
            const res = await fetch(`/members/${id}`);
            if (!res.ok) throw new Error('Gagal fetch member');
            const data = await res.json();
            setSelectedMember(data);
        } catch (err) {
            // Optional: tampilkan error
            console.log(err)
        }
    };
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

  const headerText = 'text-white';

  const cardBg =
    currentTheme === 'auto'
      ? 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800'
      : currentTheme === 'Light'
      ? 'bg-white border border-zinc-200'
      : 'bg-zinc-900 border border-zinc-800';

  const inputTheme = currentTheme === 'auto' ? 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : currentTheme === 'Dark' ? 'border-zinc-700 bg-zinc-800 text-zinc-100' : 'border-slate-300 bg-white text-zinc-900';
  const rowHover =
        currentTheme === 'auto' ? 'hover:bg-slate-50 dark:hover:bg-zinc-800/60'
        : currentTheme === 'Dark' ? 'hover:bg-zinc-800/60'
        : 'hover:bg-slate-50';
  const borderSoft = currentTheme === 'Dark' ? 'border-zinc-800' : 'border-slate-200';
  const subText =
        currentTheme === 'auto' ? 'text-zinc-500 dark:text-zinc-400'
        : currentTheme === 'Dark' ? 'text-zinc-400'
        : 'text-zinc-500';
  const contentText =
    currentTheme === 'auto'
      ? 'text-zinc-900 dark:text-zinc-100'
      : currentTheme === 'Light'
      ? 'text-zinc-900'
      : 'text-zinc-100';




    // ====== ⬇️ DERIVED PAGINATION  ⬇️ ======
  const totalItems = filterNamaProduk.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentSafe = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (currentSafe - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const pagedProduk = filterNamaProduk.slice(startIndex, endIndex);

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
        <div className={`flex h-screen w-full ${bgApp} flex-col gap-4`}>
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
            <div className={`flex justify-between pt-4 px-4 ${headerBg} py-4`}>
                <div className="w-1/6 items-center flex">
                    <h1 className="text-2xl font-bold text-white">Point Of Sale</h1>
                </div>
                <div className={`flex gap-4 w-full justify-end`}>
                    <button onClick={() => router.visit('/tabungan')} className="flex justify-center bg-transparent gap-2 text-white border border-white rounded-sm items-center px-4 cursor-pointer hover:bg-white hover:scale-105 hover:text-black transition-all duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
                          <path d="M12 7.5a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z" />
                          <path fillRule="evenodd" d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 0 1 1.5 14.625v-9.75ZM8.25 9.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM18.75 9a.75.75 0 0 0-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 0 0 .75-.75V9.75a.75.75 0 0 0-.75-.75h-.008ZM4.5 9.75A.75.75 0 0 1 5.25 9h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H5.25a.75.75 0 0 1-.75-.75V9.75Z" clipRule="evenodd" />
                          <path d="M2.25 18a.75.75 0 0 0 0 1.5c5.4 0 10.63.722 15.6 2.075 1.19.324 2.4-.558 2.4-1.82V18.75a.75.75 0 0 0-.75-.75H2.25Z" />
                        </svg>
                        Detail&nbsp;Tabungan
                    </button>
                    <button onClick={() => router.visit('/transaksi')} className="flex justify-center gap-2 bg-transparent text-white border border-white rounded-sm items-center px-4 cursor-pointer hover:bg-white hover:scale-105 hover:text-black transition-all duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
                          <path fillRule="evenodd" d="M7.502 6h7.128A3.375 3.375 0 0 1 18 9.375v9.375a3 3 0 0 0 3-3V6.108c0-1.505-1.125-2.811-2.664-2.94a48.972 48.972 0 0 0-.673-.05A3 3 0 0 0 15 1.5h-1.5a3 3 0 0 0-2.663 1.618c-.225.015-.45.032-.673.05C8.662 3.295 7.554 4.542 7.502 6ZM13.5 3A1.5 1.5 0 0 0 12 4.5h4.5A1.5 1.5 0 0 0 15 3h-1.5Z" clipRule="evenodd" />
                          <path fillRule="evenodd" d="M3 9.375C3 8.339 3.84 7.5 4.875 7.5h9.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 0 1 3 20.625V9.375ZM6 12a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H6.75a.75.75 0 0 1-.75-.75V12Zm2.25 0a.75.75 0 0 1 .75-.75h3.75a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1-.75-.75ZM6 15a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H6.75a.75.75 0 0 1-.75-.75V15Zm2.25 0a.75.75 0 0 1 .75-.75h3.75a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1-.75-.75ZM6 18a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H6.75a.75.75 0 0 1-.75-.75V18Zm2.25 0a.75.75 0 0 1 .75-.75h3.75a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
                        </svg>
                        Riwayat&nbsp;Transaksi
                    </button>
                    <button onClick={() => { setTransaksi([]) }} className={`flex justify-center gap-2 bg-transparent text-white border border-red-500 rounded-sm items-center px-4 cursor-pointer hover:bg-red-500 hover:scale-105 transition-all duration-300`}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
                          <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clipRule="evenodd" />
                        </svg>
                        Batalkan&nbsp;Transaksi
                    </button>
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
            </div>
            <div className={`flex h-full p-4 w-full`}>
                <div className={`w-4/6 h-full ${cardBg} ${contentText} rounded-lg pt-4 pb-20 relative px-4`}>
                    <div className={`flex items-center mb-4`}>
                        <div className={`relative w-full`}>
                            <input type="text" placeholder='Cari Produk' className={`${inputTheme} border p-2 rounded-full w-full`} value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value) }} />
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 font-bold text-red-500 absolute right-2 top-2 cursor-pointer">
                                <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div onClick={() => { setSearchTerm("") }} className={`ml-2 flex justify-end items-center hover:opacity-50 cursor-pointer`}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4 text-red-500 mr-1">
                                <path fillRule="evenodd" d="M11.03 3.97a.75.75 0 0 1 0 1.06l-6.22 6.22H21a.75.75 0 0 1 0 1.5H4.81l6.22 6.22a.75.75 0 1 1-1.06 1.06l-7.5-7.5a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
                            </svg>
                            <p className={`text-red-500`}>Back</p>
                        </div>
                    </div>
                    <div className={`flex gap-2`}>
                        <div
                            onClick={scrollLeft}
                            className={`rounded-full active:opacity-50 p-1 mb-4 text-red-500 border border-red-500 cursor-pointer select-none`}
                            title="Scroll Left"
                        >
                            {/* Tombol scroll left (panah kiri) */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" 
                            viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7 7-7" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 19l-7-7 7-7" />
                            </svg>
                        </div>

                        <div
                            ref={scrollRef}
                            className={`overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex-grow`}
                        >
                            <div className="flex gap-2 mb-4">
                            <button
                                className={`px-3 py-1 rounded ${
                                selectedKategori === 'semua' ? 'bg-red-500 text-white' : 'bg-gray-300 text-black'
                                }`}
                                onClick={() => setSelectedKategori('semua')}
                            >
                                Semua
                            </button>
                            {kategori.map((kat) => (
                                <button
                                key={kat.id}
                                className={`px-3 py-1 rounded w-fit ${
                                    selectedKategori === kat.id ? 'bg-red-500 text-white' : 'bg-gray-300 text-black'
                                }`}
                                onClick={() => setSelectedKategori(kat.id)}
                                >
                                {kat.nama_kategori}
                                </button>
                            ))}
                            </div>
                        </div>

                        <div
                            onClick={scrollRight}
                            className={`rounded-full active:opacity-50 p-1 mb-4 text-red-500 border border-red-500 cursor-pointer select-none`}
                            title="Scroll Right"
                        >
                            {/* Tombol scroll right (panah kanan) */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" 
                            viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 5l7 7-7 7" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                    <div className={`grid grid-cols-6 gap-4 mt-4 p-2 [scrollbar-width:thin] overflow-y-auto max-h-[375px] overflow-x-hidden`}>
                        {filterNamaProduk && filterNamaProduk.length > 0 ? (
                            pagedProduk.map((item) => (
                                <div key={item.id} onClick={() => tambahTransaksi(item)} className={`flex flex-col rounded-sm ${borderSoft} ${subText} border hover:scale-105 hover:shadow-md hover:shadow-gray-500 transition-all duration-300 ease-in-out cursor-pointer w-[120px] h-[160px]`}>
                                    <img src={`/logo/${item.gambar || 'default.png'}`} alt={item.nama} className={`object-cover w-full h-20 rounded-t-sm`} />
                                    <div className={`p-2 rounded-b-sm`}>
                                        <p className={`text-sm font-semibold truncate`}>{item.nama}</p>
                                        <p className={`text-xs`}>Rp. {item.harga.toLocaleString('id-ID')}</p>
                                        <p className={`text-xs`}>Stok: {item.stok}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-6 flex justify-center items-center w-full h-full">
                                <p className="text-center">Produk tidak ditemukan</p>
                            </div>
                        )}

                    </div>
                    {/* ====== ⬇️ KONTROL PAGINATION  ⬇️ ====== */}
                    {filterNamaProduk.length > 0 && (
                      <div className={`flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t ${borderSoft} absolute bottom-0 left-0 right-0 gap-3`}>
                        <div className={`text-sm ${subText}`}>
                          Menampilkan <span className="font-semibold">{startIndex + 1}</span>–
                          <span className="font-semibold">{endIndex}</span> dari
                          <span className="font-semibold"> {totalItems}</span> Produk
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
                    {/* ====== ⬆️ KONTROL PAGINATION ⬆️ ====== */}
                </div>
                <div className={`ml-4 flex-1 relative overflow-x-auto shadow-md sm:rounded-lg ${cardBg} ${contentText} h-full w-full`}>
                    <div className={`flex items-center my-2 px-2 gap-2`}>
                        <input type="text" placeholder='Masukkan nama member...' list="daftar-member" value={namaInput} onChange={e => setNamaInput(e.target.value)} className={`${inputTheme} py-4 rounded-sm border px-2 focus:outline-0`} />
                        <datalist id="daftar-member">
                            {saran.map((item, i) => (
                                <option key={i} value={item.nama} />
                            ))}
                        </datalist>
                        <div className="flex flex-col w-3/6 gap-2">
                            <button onClick={() => { setShowModalTambahMember(!showModalTambahMember) }} className={`flex w-full justify-center bg-blue-500 text-white border border-blue-500 rounded-sm items-center px-4 cursor-pointer hover:bg-blue-500 hover:scale-105 transition-all duration-300`}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
                                    <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
                                </svg>&nbsp;Member&nbsp;baru
                            </button>
                            <button onClick={funcShowModalNabung} className={`flex w-full justify-center bg-green-500 text-white border border-green-500 rounded-sm items-center px-4 cursor-pointer hover:bg-green-500 hover:scale-105 transition-all duration-300`}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
                                    <path d="M12 7.5a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z" />
                                    <path fillRule="evenodd" d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 0 1 1.5 14.625v-9.75ZM8.25 9.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM18.75 9a.75.75 0 0 0-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 0 0 .75-.75V9.75a.75.75 0 0 0-.75-.75h-.008ZM4.5 9.75A.75.75 0 0 1 5.25 9h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H5.25a.75.75 0 0 1-.75-.75V9.75Z" clipRule="evenodd" />
                                    <path d="M2.25 18a.75.75 0 0 0 0 1.5c5.4 0 10.63.722 15.6 2.075 1.19.324 2.4-.558 2.4-1.82V18.75a.75.75 0 0 0-.75-.75H2.25Z" />
                                </svg>&nbsp;Nabung
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-x-hidden overflow-y-auto h-[315px]">
                        <table className="min-w-full table-fixed text-sm text-left">
                            <thead className={`${currentTheme === 'auto'? 'bg-slate-50 dark:bg-zinc-800' : currentTheme === 'Dark' ? 'bg-zinc-800' : 'bg-slate-50'}`}>
                                <tr>
                                    <th scope="col" className="px-4 py-3 w-1/5">
                                        Product
                                    </th>
                                    <th scope="col" className="px-4 py-3 w-1/5 text-center">
                                        Qty
                                    </th>
                                    <th scope="col" className="px-4 py-3 w-1/5">
                                        Unit&nbsp;Price
                                    </th>
                                    <th scope="col" className="px-4 py-3 w-1/5">
                                        Total&nbsp;Price
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {transaksi.map((item, index) => (
                                    <tr key={index} className="border-b border-gray-200">
                                        <th scope="row" className="px-6 py-4 font-medium whitespace-normal truncate overflow-hidden max-w-40">
                                            {item.produk.nama}
                                        </th>
                                        <td className="px-6 py-4 whitespace-normal">
                                            <div className="flex items-center w-full">
                                                <svg onClick={() => updateQuantity(item.produk.id, (quantities[item.produk.id] || item.qty) - 1)} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="cursor-pointer size-4 mr-2">
                                                    <path fillRule="evenodd" d="M4.25 12a.75.75 0 0 1 .75-.75h14a.75.75 0 0 1 0 1.5H5a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
                                                </svg>
                                                <p>{quantities[item.produk.id] || item.qty}</p>
                                                <svg onClick={() => updateQuantity(item.produk.id, (quantities[item.produk.id] || item.qty) + 1)} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4 cursor-pointer ml-2">
                                                    <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-normal">
                                            Rp.&nbsp;{item.produk.harga.toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-normal">
                                            Rp.&nbsp;{(item.produk.harga * (Number(quantities[item.produk.id] || item.qty) || item.qty)).toLocaleString('id-ID')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className={`${currentTheme === 'auto'? 'bg-slate-50 dark:bg-zinc-800' : currentTheme === 'Dark' ? 'bg-zinc-800' : 'bg-slate-50'} font-bold w-full absolute bottom-28`}>
                        <table className="w-full">
                            <tbody>
                                <tr>
                                    <td colSpan={3} className="px-6 py-4 text-left">
                                        Subtotal
                                    </td>
                                    <td className="text-right px-6 py-4">
                                        Rp. {transaksi.reduce((total, item) => total + (item.produk.harga * item.qty), 0).toLocaleString('id-ID')}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="w-full absolute bottom-0 left-0 items-center justify-center p-4 ">
                        <div className="flex mb-4">
                            <div className="flex justify-center items-center w-1/2">
                                <input type="radio" id='method' name='method' className='mr-2' checked={selectedPayment === 'tunai'} onChange={() => setSelectedPayment('tunai')} />
                                Tunai
                            </div>
                            <div className="justify-center flex w-1/2">
                                <input type="radio" id='method' name='method' className='mr-2' checked={selectedPayment === 'non-tunai'} onChange={() => setSelectedPayment('non-tunai')} />
                                Non Tunai
                            </div>
                        </div>
                        <div className={`w-full`}>
                            <button
                                className="w-full bg-blue-500 text-white py-2 rounded-md"
                                onClick={() => {

                                    const found = saran.find(item => item.nama.toLowerCase() === namaInput.toLowerCase());
                                    const isMemberValid = namaInput.length === 0 || !!found;
                                    if (!isMemberValid) {
                                        Swal.fire({
                                            icon: 'error',
                                            title: 'Member Tidak Ditemukan',
                                            text: `Nama "${namaInput}" tidak terdaftar.`,
                                        });
                                        return;
                                    }

                                    if (transaksi.length === 0) {
                                        Swal.fire({
                                            icon: 'warning',
                                            title: 'Oops!',
                                            text: 'Tidak ada produk yang dipilih',
                                            confirmButtonText: 'OK',
                                        });
                                        return;
                                    }

                                    if (!selectedPayment) {
                                        Swal.fire({
                                            icon: 'warning',
                                            title: 'Metode Pembayaran Belum Dipilih',
                                            text: 'Silahkan pilih metode pembayaran terlebih dahulu.',
                                            confirmButtonText: 'OK',
                                        });
                                        return;
                                    }

                                    // Aksi berdasarkan metode pembayaran
                                    if (selectedPayment === 'tunai') {
                                        setShowModal(true);
                                    } else if (selectedPayment === 'non-tunai') {
                                        setShowNonTunaiModal(true);
                                    }
                                }}
                            >
                                Checkout
                            </button>
                        </div>

                    </div>

                </div>
            </div>
            {loading && (
                <div className="flex flex-col items-center text-white text-xl">
                    <svg className="animate-spin h-10 w-10 mb-4" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" fill="none" />
                    </svg>
                    Memproses Transaksi...
                </div>
            )}
            {showModal && (
                <div className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm`}>
                    <div className={`${cardBg} ${contentText} rounded-lg shadow-lg w-full max-w-md`}>
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b rounded-t border-gray-200">
                            <h3 className="text-lg font-semibold">
                                PEMBAYARAN Tunai
                            </h3>
                            <button
                                type="button"
                                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm h-8 w-8 flex justify-center items-center"
                                onClick={() => {
                                    resetPembayaranTunai();
                                    setSelectedPayment('');
                                    // setTransaksi([]);
                                }}
                            >
                                <svg className="w-3 h-3" aria-hidden="true" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                </svg>
                                <span className="sr-only">Close modal</span>
                            </button>
                        </div>
                        {/* Modal Body */}
                        {selectedMember ? (
                            <div className="p-4 border-b border-gray-200 max-h-48 overflow-y-auto">
                                <h4 className="font-semibold mb-2">Ringkasan Checkout</h4>
                                <ul className="text-sm space-y-1">
                                    {transaksi.map((item, index) => (
                                        <li key={index} className="flex justify-between">
                                            <span>{item.qty}x {item.produk.nama}</span>
                                            <span>Rp {(item.produk.harga * item.qty).toLocaleString('id-ID')}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="flex justify-between font-bold mt-3">
                                    <span>Nama Member:</span>
                                    <span>{selectedMember.nama}</span>
                                </div>
                                <div className="flex justify-between font-bold mt-2">
                                    <span>Diskon Member:</span>
                                    <span>{diskonPersen}%</span>
                                </div>
                                <div className="flex justify-between font-bold mt-2 text-red-600">
                                    <span>Potongan:</span>
                                    <span>- Rp {potongan.toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 border-b border-gray-200 max-h-48 overflow-y-auto">
                                <h4 className="font-semibold mb-2">Ringkasan Checkout</h4>
                                <ul className="text-sm space-y-1">
                                    {transaksi.map((item, index) => (
                                        <li key={index} className="flex justify-between">
                                            <span>{item.qty}x {item.produk.nama}</span>
                                            <span>Rp {(item.produk.harga * item.qty).toLocaleString('id-ID')}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="flex justify-between font-bold mt-2">
                                    <span>Total:</span>
                                    <span>Rp {transaksi.reduce((total, item) => total + item.produk.harga * item.qty, 0).toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                        )}
                        {/* pembayaran */}
                        <div className="p-4 space-y-4">
                            <div className="flex justify-between">
                                <span className=" font-medium">Total Harga</span>
                                <span className=" font-semibold">Rp. {totalSetelahDiskon.toLocaleString('id-ID')}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <label htmlFor="uangTunai" className=" font-medium">Uang Tunai</label>
                                <input
                                    type="text"
                                    id="uangTunai"
                                    value={uangTunaiDisplay}
                                    onChange={(e) => {
                                        const raw = e.target.value.replace(/\D/g, '');
                                        if (raw === '') {
                                            setUangTunai('');
                                            setUangTunaiDisplay('');
                                        } else {
                                            const numeric = parseInt(raw, 10);
                                            setUangTunai(numeric); // angka asli
                                            setUangTunaiDisplay(numeric.toLocaleString('id-ID')); // tampilan dengan titik
                                        }
                                    }}
                                    className={`border ${inputTheme} rounded px-2 py-1 w-40 text-black`}
                                    placeholder="Masukkan nominal"
                                />
                            </div>
                            {uangTunai !== '' && Number(uangTunai) < Number(totalSetelahDiskon) && selectedMember?.nama ? (
                                <div>
                                    { kekurangan > 0 && (
                                        <div className="flex justify-between pb-4">
                                            <span className="text-gray-700 font-medium">Kekurangan</span>
                                            <span className="text-black font-semibold">
                                                Rp. {kekurangan.toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between pb-4">
                                        <span className="text-gray-700 font-medium">Saldo Member</span>
                                        <span className="text-black font-semibold">Rp. {Number(selectedMember.saldo).toLocaleString('id-ID')}</span>
                                    </div>
                                    {!isSaldoCheck && (
                                        <span className="text-yellow-500 font-medium">Uang tidak cukup! Apakah ingin menggunakan saldo?</span>
                                    )}
                                    <div className="flex items-center space-x-2 mt-2">
                                        <input
                                            type="checkbox"
                                            id="checkbox-saldo"
                                            checked={isSaldoCheck}
                                            className="w-4 h-4 text-red-500 border-gray-300 rounded"
                                            onChange={e => {
                                                const saldo = Number(selectedMember?.saldo ?? 0);
                                                const kekurangan = Math.max(0, totalSetelahDiskon - Number(uangTunai));

                                                // Cek saldo kosong
                                                if (saldo === '0') {
                                                    Swal.fire('Saldo Kosong', 'Tabungan member ini masih nol.', 'warning');
                                                    setIsSaldoCheck(false);
                                                    return;
                                                }

                                                // Cek saldo kurang dari kekurangan
                                                if (e.target.checked && saldo < kekurangan) {
                                                    Swal.fire(
                                                        'Saldo Tidak Cukup',
                                                        `Saldo member hanya Rp ${saldo.toLocaleString('id-ID')}, perlu Rp ${(kekurangan - saldo).toLocaleString('id-ID')} lagi.`,
                                                        'warning'
                                                    );
                                                    setIsSaldoCheck(false);
                                                    return;
                                                }

                                                // Kalau lolos semua, update state
                                                setIsSaldoCheck(e.target.checked);

                                                // Kalau saldo diaktifkan, hutang otomatis mati
                                                if (e.target.checked) {
                                                    setIsHutang(false);
                                                }
                                            }}
                                        />

                                        <label htmlFor="checkbox-saldo" className="text-sm text-gray-700">
                                            Mengambil dari <span className="text-green-500 font-semibold">Saldo</span>
                                        </label>
                                    </div>
                                    <div className="flex items-center space-x-2 mt-4">
                                        <input
                                            type="checkbox"
                                            id="checkbox-hutang"
                                            checked={isHutang}
                                            onChange={e => {
                                                setIsHutang(e.target.checked);
                                                if (e.target.checked) setIsSaldoCheck(false);
                                            }}
                                            className="w-4 h-4 text-red-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="checkbox-hutang" className="text-sm text-gray-700">
                                            Tandai sebagai <span className="text-red-500 font-semibold">Hutang</span>
                                        </label>
                                    </div>
                                </div>

                            ) : (
                                uangTunai !== '' && Number(uangTunai) > Number(totalSetelahDiskon) && (
                                    <div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-700 font-medium">Kembalian</span>
                                            <span className="text-green-600 font-bold">
                                                Rp. {kembalian.toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                        <div className="mt-2">
                                            {kembalian > 0 && selectedMember?.nama && (
                                                <div className="mt-2">
                                                    <div className="flex items-center space-x-2 mt-4">
                                                        <input
                                                            type="checkbox"
                                                            id="checkbox-hutang"
                                                            checked={isTabung}
                                                            onChange={(e) => setIsTabung(e.target.checked)}
                                                            className="w-4 h-4 text-green-500 border-gray-300 rounded"
                                                        />
                                                        <label htmlFor="checkbox-hutang" className="text-sm text-gray-700">
                                                            Masukan Dalam <span className="text-green-500 font-semibold">Tabungan</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            )}
                            <button
                                className="w-full bg-green-500 text-white py-2 rounded-md"
                                onClick={() => {
                                    if (uangTunai === '') {
                                        Swal.fire({
                                            icon: 'warning',
                                            title: 'Oops!',
                                            text: 'Silakan masukkan nominal pembayaran!',
                                        });
                                        return;
                                    }

                                    // Jika tidak hutang dan uang tidak cukup
                                    const totalTanpaDiskon = transaksi.reduce((total, item) => total + item.produk.harga * item.qty, 0);
                                    if (!isHutang && !isSaldoCheck && uangTunai < totalTanpaDiskon) {
                                        Swal.fire({
                                            icon: 'error',
                                            title: 'Uang Tidak Cukup!',
                                            text: 'Silakan masukkan jumlah yang sesuai atau centang sebagai hutang atau menggunakan saldo.',
                                        });
                                        return;
                                    }
                                    handlePrint();
                                    // Jika valid, jalankan transaksi
                                    handleKonfirmasiPembayaran();
                                    setTransaksi([]);
                                    setSelectedPayment('');
                                }}
                            >
                                Bayar Sekarang
                            </button>

                        </div>
                    </div>
                </div>
            )}
            {showNonTunaiModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
                    <div className={`${cardBg} ${contentText} rounded-lg shadow-lg w-full max-w-md`}>
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b rounded-t border-gray-200">
                            <h3 className="text-lg font-semibold">
                                PEMBAYARAN Non Tunai
                            </h3>
                            <button
                                type="button"
                                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm h-8 w-8 flex justify-center items-center"
                                onClick={() => {
                                    setShowNonTunaiModal(false);
                                }}
                            >
                                <svg className="w-3 h-3" aria-hidden="true" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                </svg>
                                <span className="sr-only">Close modal</span>
                            </button>
                        </div>
                        {/* Modal Body */}
                        {selectedMember ? (
                            // Jika ada member (versi dengan diskon)
                            <div className="p-4 border-b border-gray-200 max-h-48 overflow-y-auto">
                                <h4 className="font-semibold mb-2">Ringkasan Checkout</h4>
                                <ul className="text-sm space-y-1">
                                    {transaksi.map((item, index) => (
                                        <li key={index} className="flex justify-between">
                                            <span>{item.qty}x {item.produk.nama}</span>
                                            <span>Rp {(item.produk.harga * item.qty).toLocaleString('id-ID')}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="flex justify-between font-bold mt-3">
                                    <span>Nama Member:</span>
                                    <span>{selectedMember.nama}</span>
                                </div>
                                <div className="flex justify-between font-bold mt-2">
                                    <span>Diskon Member:</span>
                                    <span>{diskonPersen}%</span>
                                </div>
                                <div className="flex justify-between font-bold mt-2 text-red-600">
                                    <span>Potongan:</span>
                                    <span>- Rp {potongan.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between font-bold mt-2 text-green-600">
                                    <span>Total Akhir:</span>
                                    <span>Rp {totalSetelahDiskon.toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                        ) : (
                            // Jika bukan member
                            <div className="p-4 border-b border-gray-200 max-h-48 overflow-y-auto">
                                <h4 className="font-semibold mb-2">Ringkasan Checkout</h4>
                                <ul className="text-sm space-y-1">
                                    {transaksi.map((item, index) => (
                                        <li key={index} className="flex justify-between">
                                            <span>{item.qty}x {item.produk.nama}</span>
                                            <span>Rp {(item.produk.harga * item.qty).toLocaleString('id-ID')}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="flex justify-between font-bold mt-2">
                                    <span>Total:</span>
                                    <span>Rp {transaksi.reduce((total, item) => total + item.produk.harga * item.qty, 0).toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                        )}

                        {/* Form Pembayaran Non-Tunai */}
                        <div className="p-4 space-y-4">
                            {/* untuk qr code */}
                            <div className="p-4 flex justify-center">
                                <QRCodePembayaran value="https://simulasi.pembayaran/12345" />
                            </div>
                            <button
                                className="w-full bg-green-500 text-white py-2 rounded-md"
                                onClick={() => {
                                    handlePrint();
                                    handleKonfirmasiPembayaran();
                                    setTransaksi([]);
                                    setSelectedPayment('');
                                }}
                            >
                                Konfirmasi Pembayaran
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showModalTambahMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
                    <div className={`${cardBg} ${contentText} rounded-lg shadow-lg w-full max-w-md`}>
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b rounded-t border-gray-200">
                            <h3 className="text-lg font-semibold">
                                Tambah Member
                            </h3>
                            <button
                                type="button"
                                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm h-8 w-8 flex justify-center items-center"
                                onClick={() => {
                                    setShowModalTambahMember(false);
                                }}
                            >
                                <svg className="w-3 h-3" aria-hidden="true" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                </svg>
                                <span className="sr-only">Close modal</span>
                            </button>
                        </div>
                        {/* Modal Body */}
                        <div className={`p-4 space-y-4`}>
                            <div className="flex flex-col">
                                <label htmlFor="nama">Nama Member</label>
                                <input
                                    id="nama"
                                    type="text"
                                    value={member.nama}
                                    onChange={(e) => setMember({ ...member, nama: e.target.value })}
                                    className={`focus:outline-0 border ${inputTheme} rounded-sm p-2`}
                                />
                            </div>

                            <div className="flex flex-col">
                                <label htmlFor="alamat">Alamat Member</label>
                                <textarea
                                    id="alamat"
                                    value={member.alamat}
                                    onChange={(e) => setMember({ ...member, alamat: e.target.value })}
                                    className={`focus:outline-0 border ${inputTheme} rounded-sm p-2`}
                                />
                            </div>

                            <div className="flex flex-col">
                                <label htmlFor="telepon">Nomor Telepon Member</label>
                                <input
                                    id="telepon"
                                    type="text"
                                    value={member.telepon}
                                    onChange={(e) => setMember({ ...member, telepon: e.target.value })}
                                    className={`focus:outline-0 border ${inputTheme} rounded-sm p-2`}
                                />
                            </div>

                        </div>
                        <div className="p-4 space-y-4">
                            <button onClick={handleTambahMember} className="w-full bg-blue-500 text-white py-2 rounded-md">
                                Tambahkan
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showModalNabung && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
                    <div className={`${cardBg} ${contentText} rounded-lg shadow-lg w-full max-w-md`}>
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b rounded-t border-gray-200">
                            <h3 className="text-lg font-semibold">
                                Tabungan Member
                            </h3>
                            <button
                                type="button"
                                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm h-8 w-8 flex justify-center items-center"
                                onClick={() => {
                                    setShowModalNabung(false);
                                }}
                            >
                                <svg className="w-3 h-3" aria-hidden="true" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                </svg>
                                <span className="sr-only">Close modal</span>
                            </button>
                        </div>
                        {/* Modal Body */}
                        <div className={`p-4 space-y-4 text-black`}>
                            <div className={`flex w-full h-10 justify-between relative rounded-full p-2 bg-gray-900`}>
                                <div className={` w-1/2 h-2/3 top-1.5 z-0 ${statusNabung === "Deposit" ? '' :statusNabung === "Tarik" && 'translate-x-48'} bg-white rounded-full absolute transition-all duration-300 ease-in-out`}>&nbsp;</div>
                                <div onClick={()=>{setStatusNabung("Deposit")}} className={`w-1/2 items-center flex justify-center z-10 transition-all font-bold ${statusNabung === "Deposit" ? 'text-black' :'text-white'}`}>Deposit</div>
                                <div onClick={()=>{setStatusNabung("Tarik")}} className={`w-1/2 items-center flex justify-center z-10 transition-all font-bold ${statusNabung === "Tarik" ? 'text-black' :'text-white'}`}>Tarik</div>
                            </div>
                            <div className="flex justify-between pb-4">
                                <span className={`${contentText} font-medium`}>Saldo Member</span>
                                <span className={`${subText} font-semibold`}>Rp. {Number(selectedMember.saldo).toLocaleString('id-ID')}</span>
                            </div>
                            {statusNabung === "Deposit" ? (<div className="flex flex-col">
                                <label htmlFor="telepon" className={`${contentText}`}>Deposit Member</label>
                                <input
                                    id="deposit"
                                    type="text"
                                    value={depositDisplay}
                                    onChange={(e) => {
                                        const raw = e.target.value.replace(/\D/g, '');
                                        if (raw === '') {
                                            setDeposit('');
                                            setDepositDisplay('');
                                        } else {
                                            const numeric = parseInt(raw,10);
                                            setDeposit(numeric); // angka asli
                                            setDepositDisplay(numeric.toLocaleString('id-ID')); // tampilan dengan titik
                                        }
                                    }}
                                    className={`focus:outline-0 border ${inputTheme} rounded-sm p-2`}
                                />
                            </div>): statusNabung === "Tarik" && (
                            <div className="flex flex-col">
                                <label htmlFor="telepon" className={`${contentText}`}>Tarik Uang Member</label>
                                <input
                                    id="tarik"
                                    type="text"
                                    value={tarikDisplay}
                                    onChange={(e) => {
                                        const raw = e.target.value.replace(/\D/g, '');
                                        if (raw === '') {
                                            setTarik('');
                                            setTarikDisplay('');
                                        } else {
                                            const numeric = parseInt(raw,10);
                                            setTarik(numeric); // angka asli
                                            setTarikDisplay(numeric.toLocaleString('id-ID')); // tampilan dengan titik
                                        }
                                    }}
                                    className={`focus:outline-0 border ${inputTheme} rounded-sm p-2`}
                                />
                            </div>
                            )}
                        </div>
                        <div className="p-4 space-y-4">
                            <button
                                onClick={() => handleTabunganMember(
                                    selectedMember?.id,
                                    parseInt(deposit || '0'),
                                    parseInt(tarik || '0'),
                                    `${statusNabung === 'Deposit' ? `Deposit uang ${selectedMember.nama} oleh ${localStorage.getItem("username")}` : `Penarikan uang ${selectedMember.nama} oleh ${localStorage.getItem("username")}`}`,
                                    '-',
                                    true
                                )}
                                className="w-full bg-blue-500 text-white py-2 rounded-md font-semibold"
                            >
                                {statusNabung === "Deposit" ?'Depositkan uang' :'Tarik uang'}
                            </button>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}