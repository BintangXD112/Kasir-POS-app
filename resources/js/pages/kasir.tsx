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
        localStorage.removeItem("tipe_user");
        window.location.href = "/login";
    };
    const [showLogout, setShowLogout] = useState(false);
    const toggleLogout = () => {
        setShowLogout(!showLogout);
    };
    const scrollRef = useRef<HTMLDivElement>(null);

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
                    const totalDiskonNum = Number(totalSetelahDiskon) || 0;
                    const uangTunaiNum = Number(uangTunai) || 0;
                    handleTabunganMember(
                        selectedMember?.id,
                        0,
                        totalDiskonNum - uangTunaiNum,
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
        console.log('DATA YANG DIKIRIM:', dataToSend);

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
    const [transaksi, setTransaksi] = useState<Array<{ produk: Produk, qty: number }>>([]);

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

            console.log(saran);
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
    })


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
    const [deposit, setDeposit] = useState('');
    const [tarik, setTarik] = useState('');
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
                        setTarik('');
                        setShowModalNabung(false);
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
            } else {
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






    return (
        <div className="flex h-screen w-full bg-gray-600 flex-col gap-4">
            <div className={`flex justify-between pt-4 px-4 bg-gray-800 py-4`}>
                <div className="w-1/6 items-center flex">
                    <h1 className="text-2xl font-bold text-white">Point Of Sale</h1>
                </div>
                <div className={`flex gap-4 w-full justify-end`}>
                    <button onClick={() => { setTransaksi([]) }} className={`flex justify-center bg-transparent text-white border border-red-500 rounded-sm items-center px-4 cursor-pointer hover:bg-red-500 hover:scale-105 transition-all duration-300`}>
                        Batalkan&nbsp;Transaksi
                    </button>
                    <button onClick={() => router.visit('/transaksi')} className="flex justify-center bg-transparent text-white border border-white rounded-sm items-center px-4 cursor-pointer hover:bg-white hover:scale-105 hover:text-black transition-all duration-300">
                        Riwayat&nbsp;Transaksi
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
                <div className={`w-4/6 h-full bg-white rounded-lg p-4`}>
                    <div className={`flex items-center mb-4`}>
                        <div className={`relative w-full`}>
                            <input type="text" placeholder='Cari Produk' className={`border-gray-500 border p-2 focus:outline-none rounded-full w-full`} value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value) }} />
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 font-bold text-red-500 absolute right-2 top-2 cursor-pointer">
                                <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className={`ml-2 flex justify-end items-center`}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4 text-red-500 mr-1">
                                <path fillRule="evenodd" d="M11.03 3.97a.75.75 0 0 1 0 1.06l-6.22 6.22H21a.75.75 0 0 1 0 1.5H4.81l6.22 6.22a.75.75 0 1 1-1.06 1.06l-7.5-7.5a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
                            </svg>
                            <p className={`text-red-500`}>Back</p>
                        </div>
                    </div>
                    <div className={`flex gap-4`}>
                        <div
                            onClick={scrollLeft}
                            className={`rounded-full active:opacity-50 py-1 mb-4 text-red-500 border border-red-500 cursor-pointer select-none`}
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
                                selectedKategori === 'semua' ? 'bg-red-500 text-white' : 'bg-gray-300'
                                }`}
                                onClick={() => setSelectedKategori('semua')}
                            >
                                Semua
                            </button>
                            {kategori.map((kat) => (
                                <button
                                key={kat.id}
                                className={`px-3 py-1 rounded ${
                                    selectedKategori === kat.id ? 'bg-red-500 text-white' : 'bg-gray-300'
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
                            className={`rounded-full active:opacity-50 py-1 mb-4 text-red-500 border border-red-500 cursor-pointer select-none`}
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
                            filterNamaProduk.map((item) => (
                                <div key={item.id} onClick={() => tambahTransaksi(item)} className={`flex flex-col rounded-sm border hover:scale-105 hover:shadow-md hover:shadow-gray-500 transition-all duration-300 ease-in-out cursor-pointer border-gray-300 w-[120px] h-[160px]`}>
                                    <img src={`/logo/${item.gambar}`} alt={item.nama} className={`object-cover w-full h-20 rounded-t-sm`} />
                                    <div className={`p-2 rounded-b-sm`}>
                                        <p className={`text-gray-600 text-sm font-semibold truncate`}>{item.nama}</p>
                                        <p className={`text-gray-500 text-xs`}>Rp. {item.harga.toLocaleString('id-ID')}</p>
                                        <p className={`text-gray-600 text-xs`}>Stok: {item.stok}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-6 flex justify-center items-center w-full h-[350px]">
                                <p className="text-black text-center">Produk tidak ditemukan</p>
                            </div>
                        )}

                    </div>
                </div>
                <div className="ml-4 flex-1 relative overflow-x-auto shadow-md sm:rounded-lg bg-white h-full w-full">
                    <div className={`flex items-center my-2 px-2 gap-2`}>
                        <input type="text" placeholder='Masukkan nama member...' list="daftar-member" value={namaInput} onChange={e => setNamaInput(e.target.value)} className="rounded-sm bg-white text-black w-full py-4 border-slate-300 border placeholder-gray-500 px-2 focus:outline-0" />
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
                    <div className="flex-1 overflow-x-hidden overflow-y-auto h-[330px]">
                        <table className="min-w-full table-fixed text-sm text-left text-black">
                            <thead className="text-xs text-black uppercase bg-gray-100">
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
                                    <tr key={index} className="odd:bg-white even:bg-gray-100 border-b border-gray-200">
                                        <th scope="row" className="px-6 py-4 font-medium text-black whitespace-normal truncate overflow-hidden max-w-40">
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
                    <div className="border border-gray-300 bg-gray-100 font-bold w-full absolute bottom-28">
                        <table className="w-full">
                            <tbody>
                                <tr>
                                    <td colSpan={3} className="px-6 py-4 text-left text-black">
                                        Subtotal
                                    </td>
                                    <td className="text-right px-6 py-4 text-black">
                                        Rp. {transaksi.reduce((total, item) => total + (item.produk.harga * item.qty), 0).toLocaleString('id-ID')}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="w-100 absolute bottom-0 left-0 items-center justify-center m-4 ">
                        <div className="flex mb-4">
                            <div className="flex justify-center items-center w-1/2 text-black">
                                <input type="radio" id='method' name='method' className='mr-2' checked={selectedPayment === 'tunai'} onChange={() => setSelectedPayment('tunai')} />
                                Tunai
                            </div>
                            <div className="justify-center flex w-1/2 text-black">
                                <input type="radio" id='method' name='method' className='mr-2' checked={selectedPayment === 'non-tunai'} onChange={() => setSelectedPayment('non-tunai')} />
                                Non Tunai
                            </div>
                        </div>
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
            {loading && (
                <div className="flex flex-col items-center text-white text-xl">
                    <svg className="animate-spin h-10 w-10 mb-4" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" fill="none" />
                    </svg>
                    Memproses Transaksi...
                </div>
            )}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b rounded-t border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">
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
                            <div className="p-4 border-b border-gray-200 max-h-48 overflow-y-auto text-black">
                                <h4 className="font-semibold mb-2">Ringkasan Checkout</h4>
                                <ul className="text-sm text-gray-700 space-y-1">
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
                            <div className="p-4 border-b border-gray-200 max-h-48 overflow-y-auto text-black">
                                <h4 className="font-semibold mb-2">Ringkasan Checkout</h4>
                                <ul className="text-sm text-black space-y-1">
                                    {transaksi.map((item, index) => (
                                        <li key={index} className="flex justify-between">
                                            <span>{item.qty}x {item.produk.nama}</span>
                                            <span>Rp {(item.produk.harga * item.qty).toLocaleString('id-ID')}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="flex justify-between font-bold mt-2 text--black">
                                    <span>Total:</span>
                                    <span>Rp {transaksi.reduce((total, item) => total + item.produk.harga * item.qty, 0).toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                        )}
                        {/* pembayaran */}
                        <div className="p-4 space-y-4">
                            <div className="flex justify-between">
                                <span className="text-gray-700 font-medium">Total Harga</span>
                                <span className="text-black font-semibold">Rp. {totalSetelahDiskon.toLocaleString('id-ID')}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <label htmlFor="uangTunai" className="text-gray-700 font-medium">Uang Tunai</label>
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
                                    className="border border-gray-300 rounded px-2 py-1 w-40 text-black"
                                    placeholder="Masukkan nominal"
                                />
                            </div>
                            {uangTunai !== '' && Number(uangTunai) < Number(totalSetelahDiskon) && selectedMember?.nama ? (
                                <div>
                                    <div className="flex justify-between pb-4">
                                        <span className="text-gray-700 font-medium">Saldo Member</span>
                                        <span className="text-black font-semibold">Rp. {selectedMember.saldo.toLocaleString('id-ID')}</span>
                                    </div>
                                    {!isSaldoCheck && (
                                        <span className="text-yellow-500 font-medium">Uang tidak cukup! Apakah ingin menggunakan saldo?</span>
                                    )}
                                    <div className="flex items-center space-x-2 mt-2">
                                        <input
                                            type="checkbox"
                                            id="checkbox-saldo"
                                            checked={isSaldoCheck}
                                            onChange={e => {
                                                setIsSaldoCheck(e.target.checked);
                                                if (e.target.checked) setIsHutang(false);
                                            }}
                                            className="w-4 h-4 text-blue-500 border-gray-300 rounded"
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
                                uangTunai !== '' && (
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
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b rounded-t border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">
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
                            <div className="p-4 border-b border-gray-200 max-h-48 overflow-y-auto text-black">
                                <h4 className="font-semibold mb-2">Ringkasan Checkout</h4>
                                <ul className="text-sm text-gray-700 space-y-1">
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
                            <div className="p-4 border-b border-gray-200 max-h-48 overflow-y-auto text-black">
                                <h4 className="font-semibold mb-2">Ringkasan Checkout</h4>
                                <ul className="text-sm text-gray-700 space-y-1">
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
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b rounded-t border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">
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
                                    className="focus:outline-0 border border-gray-300 bg-white rounded-sm p-2"
                                />
                            </div>

                            <div className="flex flex-col">
                                <label htmlFor="alamat">Alamat Member</label>
                                <textarea
                                    id="alamat"
                                    value={member.alamat}
                                    onChange={(e) => setMember({ ...member, alamat: e.target.value })}
                                    className="focus:outline-0 border border-gray-300 bg-white rounded-sm p-2"
                                />
                            </div>

                            <div className="flex flex-col">
                                <label htmlFor="telepon">Nomor Telepon Member</label>
                                <input
                                    id="telepon"
                                    type="text"
                                    value={member.telepon}
                                    onChange={(e) => setMember({ ...member, telepon: e.target.value })}
                                    className="focus:outline-0 border border-gray-300 bg-white rounded-sm p-2"
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
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b rounded-t border-gray-200">
                            <h3 className="text-lg font-semibold text-black">
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
                            <div className={`flex w-full h-10 justify-between relative rounded-full p-2 bg-gray-400`}>
                                <div className={` w-1/2 h-2/3 top-1.5 z-0 ${statusNabung === "Deposit" ? '' :statusNabung === "Tarik" && 'translate-x-48'} bg-white rounded-full absolute transition-all duration-300 ease-in-out`}>&nbsp;</div>
                                <div onClick={()=>{setStatusNabung("Deposit")}} className={`w-1/2 items-center flex justify-center z-10 transition-all font-bold ${statusNabung === "Deposit" ? 'text-black' :'text-white'}`}>Deposit</div>
                                <div onClick={()=>{setStatusNabung("Tarik")}} className={`w-1/2 items-center flex justify-center z-10 transition-all font-bold ${statusNabung === "Tarik" ? 'text-black' :'text-white'}`}>Tarik</div>
                            </div>
                            {statusNabung === "Deposit" ? (<div className="flex flex-col">
                                <label htmlFor="telepon" className="text-black">Deposit Member</label>
                                <input
                                    id="deposit"
                                    type="number"
                                    value={deposit}
                                    onChange={(e) => setDeposit(e.target.value)}
                                    className="focus:outline-0 border border-gray-300 bg-white rounded-sm p-2 text-black"
                                />
                            </div>): statusNabung === "Tarik" && (
                            <div className="flex flex-col">
                                <label htmlFor="telepon" className="text-black">Tarik Uang Member</label>
                                <input
                                    id="tarik"
                                    type="number"
                                    value={tarik}
                                    onChange={(e) => setTarik(e.target.value)}
                                    className="focus:outline-0 border border-gray-300 bg-white rounded-sm p-2 text-black"
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
                                    'Setoran manual oleh kasir',
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