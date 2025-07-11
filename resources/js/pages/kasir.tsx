import React from "react";
import { type BreadcrumbItem, type PageProps } from '../types/index';
import { useState, useRef } from 'react';
import { useMobileNavigation } from '../hooks/use-mobile-navigation';
import { Link, router } from '@inertiajs/react';
import { LogOut } from 'lucide-react';
import QRCodePembayaran from '../components/qrcodepaymentmodal';

interface DashboardProps extends PageProps {
    produk: Produk[];
}

export interface Produk {
    id: number;
    nama: string;
    harga: number;
    gambar: string;
}

declare const route: (name: string, params?: any, absolute?: boolean, config?: any) => string;

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];


export default function Dashboard({ produk }: DashboardProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const cleanup = useMobileNavigation();
    const handleLogout = () => {
        cleanup();
        router.flushAll();
        localStorage.removeItem("username");
        window.location.href = "/login";
    };
    const [showLogout, setShowLogout] = useState(false);
    const toggleLogout = () => {
        setShowLogout(!showLogout);
    };
    const scrollRef = useRef<HTMLDivElement>(null);

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

    // untuk simulasi qr code
    const handleKonfirmasiPembayaran = () => {
        alert("Simulasi pembayaran berhasil!");
        setShowNonTunaiModal(false);
        setSelectedPayment('');
        setTransaksi([]);
        };

    const scrollRight = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({
                left: 100,
                behavior: 'smooth'
            });
        }
    };
    const [hoverPrint, setHoverPrint] = useState(false)
    const funcHoverPrint = () => {
        setHoverPrint(!hoverPrint)
    }
    const [showModal, setShowModal] = useState(false);
    const [uangTunai, setUangTunai] = useState<number | ''>('');
    const [uangTunaiDisplay, setUangTunaiDisplay] = useState('');
    const [showNonTunaiModal, setShowNonTunaiModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState('');
    const [selectedProduk, setSelectedProduk] = useState<Produk | null>(null);
    const filterNamaProduk = produk.filter((item) =>
        item.nama.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const [transaksi, setTransaksi] = useState<Array<{produk: Produk, qty: number}>>([]);
    const tambahTransaksi = (produk: Produk) => {
        setTransaksi((prev) => {
            const index = prev.findIndex(item => item.produk.id === produk.id);
            if (index !== -1) {
                const update = [...prev];
                update[index].qty += 1;
                return update;
            }
            return [...prev, {produk, qty: 1}];
        });
    };
    const [quantities, setQuantities] = useState<{[key: number]: number}>({});
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

    return (
        <div className="flex h-screen w-full bg-gray-600 flex-col gap-4">
            <div className={`flex justify-between pt-4 px-4`}>
                <div>
                    <h1 className="text-2xl font-bold text-white">Point Of Sale</h1>
                </div>
                <div className={`flex gap-4`}>
                    <input type="text" placeholder='Masukkan nama member' className="rounded-sm bg-white px-2 focus:outline-0" />
                    <button onClick={()=>{setTransaksi([])}} className={`flex justify-center bg-transparent text-white border border-red-500 rounded-sm items-center px-4 cursor-pointer hover:bg-red-500 hover:text- transition-all duration-300`}>
                        Hapus Transaksi
                    </button>
                    <div onMouseEnter={funcHoverPrint} onMouseLeave={funcHoverPrint}>
                        {hoverPrint ? (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-8 text-white">
                                <path fillRule="evenodd" d="M7.875 1.5C6.839 1.5 6 2.34 6 3.375v2.99c-.426.053-.851.11-1.274.174-1.454.218-2.476 1.483-2.476 2.917v6.294a3 3 0 0 0 3 3h.27l-.155 1.705A1.875 1.875 0 0 0 7.232 22.5h9.536a1.875 1.875 0 0 0 1.867-2.045l-.155-1.705h.27a3 3 0 0 0 3-3V9.456c0-1.434-1.022-2.7-2.476-2.917A48.716 48.716 0 0 0 18 6.366V3.375c0-1.036-.84-1.875-1.875-1.875h-8.25ZM16.5 6.205v-2.83A.375.375 0 0 0 16.125 3h-8.25a.375.375 0 0 0-.375.375v2.83a49.353 49.353 0 0 1 9 0Zm-.217 8.265c.178.018.317.16.333.337l.526 5.784a.375.375 0 0 1-.374.409H7.232a.375.375 0 0 1-.374-.409l.526-5.784a.373.373 0 0 1 .333-.337 41.741 41.741 0 0 1 8.566 0Zm.967-3.97a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H18a.75.75 0 0 1-.75-.75V10.5ZM15 9.75a.75.75 0 0 0-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 0 0 .75-.75V10.5a.75.75 0 0 0-.75-.75H15Z" clipRule="evenodd" />
                            </svg>
                        ) :
                            (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8 text-white">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
                                </svg>)}
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
                                        <LogOut className='mr-2'/>
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
                            <input type="text" placeholder='Cari Produk' className={`border-gray-500 border p-2 focus:outline-none rounded-full w-full`} value={searchTerm} onChange={(e)=>{setSearchTerm(e.target.value)}} />
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
                        <div onClick={scrollLeft} className={`rounded-full active:opacity-50 p-1 text-red-500 border border-red-500`}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                <path fillRule="evenodd" d="M10.72 11.47a.75.75 0 0 0 0 1.06l7.5 7.5a.75.75 0 1 0 1.06-1.06L12.31 12l6.97-6.97a.75.75 0 0 0-1.06-1.06l-7.5 7.5Z" clipRule="evenodd" />
                                <path fillRule="evenodd" d="M4.72 11.47a.75.75 0 0 0 0 1.06l7.5 7.5a.75.75 0 1 0 1.06-1.06L6.31 12l6.97-6.97a.75.75 0 0 0-1.06-1.06l-7.5 7.5Z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div ref={scrollRef} className={`overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden`}>
                            <div className={`flex gap-2`}>
                                <button className={`bg-gray-300 text-gray-600 p-1 rounded-sm flex items-center justify-center active:bg-red-500 active:text-white active:opacity-60`}>TEST</button>
                                <button className={`bg-gray-300 text-gray-600 p-1 rounded-sm flex items-center justify-center active:bg-red-500 active:text-white active:opacity-60`}>TEST</button>
                                <button className={`bg-gray-300 text-gray-600 p-1 rounded-sm flex items-center justify-center active:bg-red-500 active:text-white active:opacity-60`}>TEST</button>
                                <button className={`bg-gray-300 text-gray-600 p-1 rounded-sm flex items-center justify-center active:bg-red-500 active:text-white active:opacity-60`}>TEST</button>
                                <button className={`bg-gray-300 text-gray-600 p-1 rounded-sm flex items-center justify-center active:bg-red-500 active:text-white active:opacity-60`}>TEST</button>
                                <button className={`bg-gray-300 text-gray-600 p-1 rounded-sm flex items-center justify-center active:bg-red-500 active:text-white active:opacity-60`}>TEST</button>
                                <button className={`bg-gray-300 text-gray-600 p-1 rounded-sm flex items-center justify-center active:bg-red-500 active:text-white active:opacity-60`}>TEST</button>
                                <button className={`bg-gray-300 text-gray-600 p-1 rounded-sm flex items-center justify-center active:bg-red-500 active:text-white active:opacity-60`}>TEST</button>
                                <button className={`bg-gray-300 text-gray-600 p-1 rounded-sm flex items-center justify-center active:bg-red-500 active:text-white active:opacity-60`}>TEST</button>
                                <button className={`bg-gray-300 text-gray-600 p-1 rounded-sm flex items-center justify-center active:bg-red-500 active:text-white active:opacity-60`}>TEST</button>
                                <button className={`bg-gray-300 text-gray-600 p-1 rounded-sm flex items-center justify-center active:bg-red-500 active:text-white active:opacity-60`}>TEST</button>
                                <button className={`bg-gray-300 text-gray-600 p-1 rounded-sm flex items-center justify-center active:bg-red-500 active:text-white active:opacity-60`}>TEST</button>
                                <button className={`bg-gray-300 text-gray-600 p-1 rounded-sm flex items-center justify-center active:bg-red-500 active:text-white active:opacity-60`}>TEST</button>
                                <button className={`bg-gray-300 text-gray-600 p-1 rounded-sm flex items-center justify-center active:bg-red-500 active:text-white active:opacity-60`}>TEST</button>
                                <button className={`bg-gray-300 text-gray-600 p-1 rounded-sm flex items-center justify-center active:bg-red-500 active:text-white active:opacity-60`}>TEST</button>
                                <button className={`bg-gray-300 text-gray-600 p-1 rounded-sm flex items-center justify-center active:bg-red-500 active:text-white active:opacity-60`}>TEST</button>
                                <button className={`bg-gray-300 text-gray-600 p-1 rounded-sm flex items-center justify-center active:bg-red-500 active:text-white active:opacity-60`}>TEST</button>
                                <button className={`bg-gray-300 text-gray-600 p-1 rounded-sm flex items-center justify-center active:bg-red-500 active:text-white active:opacity-60`}>TEST</button>
                                <button className={`bg-gray-300 text-gray-600 p-1 rounded-sm flex items-center justify-center active:bg-red-500 active:text-white active:opacity-60`}>TEST</button>
                                <button className={`bg-gray-300 text-gray-600 p-1 rounded-sm flex items-center justify-center active:bg-red-500 active:text-white active:opacity-60`}>TEST</button>
                                <button className={`bg-gray-300 text-gray-600 p-1 rounded-sm flex items-center justify-center active:bg-red-500 active:text-white active:opacity-60`}>TEST</button>
                                <button className={`bg-gray-300 text-gray-600 p-1 rounded-sm flex items-center justify-center active:bg-red-500 active:text-white active:opacity-60`}>TEST</button>
                                <button className={`bg-gray-300 text-gray-600 p-1 rounded-sm flex items-center justify-center active:bg-red-500 active:text-white active:opacity-60`}>TEST</button>

                            </div>
                        </div>
                        <div onClick={scrollRight} className={`rounded-full active:opacity-50 p-1 text-red-500 border border-red-500`}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                <path fillRule="evenodd" d="M13.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L11.69 12 4.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clipRule="evenodd" />
                                <path fillRule="evenodd" d="M19.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 1 1-1.06-1.06L17.69 12l-6.97-6.97a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                    <div className={`grid grid-cols-6 gap-4 mt-4 [scrollbar-width:thin] overflow-y-auto max-h-[375px] overflow-x-hidden`}>
                        {filterNamaProduk && filterNamaProduk.length > 0 ? (
                            filterNamaProduk.map((item) => (
                                <div key={item.id} onClick={() => tambahTransaksi(item)} className={`flex flex-col rounded-sm border border-gray-300 w-[120px] h-[140px]`}>
                                    <img src={`/logo/${item.gambar}`} alt={item.nama} className={`object-cover w-full h-20 rounded-t-sm`} />
                                    <div className={`p-2 rounded-b-sm`}>
                                        <p className={`text-gray-600 text-sm font-semibold truncate`}>{item.nama}</p>
                                        <p className={`text-gray-500 text-xs`}>Rp. {item.harga.toLocaleString('id-ID')}</p>
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
                    <div className="flex-1 overflow-x-hidden overflow-y-auto h-[510px]">
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
                                            <svg onClick={()=>updateQuantity(item.produk.id, (quantities[item.produk.id] || item.qty) - 1)} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="cursor-pointer size-4 mr-2">
                                                <path fillRule="evenodd" d="M4.25 12a.75.75 0 0 1 .75-.75h14a.75.75 0 0 1 0 1.5H5a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
                                            </svg>
                                            <p>{quantities[item.produk.id] || item.qty}</p>
                                            <svg onClick={()=>updateQuantity(item.produk.id, (quantities[item.produk.id] || item.qty) + 1)} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4 cursor-pointer ml-2">
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
                                <input type="radio" id='method' name='method'  className='mr-2' checked={selectedPayment === 'tunai'} onChange={() => setSelectedPayment('tunai')}/>
                                Tunai
                            </div>
                            <div className="justify-center flex w-1/2 text-black">
                                <input type="radio" id='method' name='method' className='mr-2' checked={selectedPayment === 'non-tunai'} onChange={() => setSelectedPayment('non-tunai')}/>
                                Non Tunai
                            </div>
                        </div>
                        <button className="w-full bg-blue-500 text-white py-2 rounded-md "
                            onClick={() => {
                                if (transaksi.length === 0){
                                    alert("Tidak ada produk yang dipilih");
                                    return;
                                }
                                if (!selectedPayment){
                                    alert("Silahkan pilih metode pembayaran");
                                    return;
                                }
                                if (selectedPayment === 'tunai') {
                                    setSelectedProduk(filterNamaProduk[0]);
                                    setShowModal(true);
                                    return;
                                }else if (selectedPayment === 'non-tunai') {
                                    setShowNonTunaiModal(true);
                                }
                            }}>
                            Checkout
                        </button>
                    </div>

                </div>
            </div>
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
                                    setTransaksi([]);
                                }}
                            >
                                <svg className="w-3 h-3" aria-hidden="true" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                </svg>
                                <span className="sr-only">Close modal</span>
                            </button>
                        </div>
                        {/* Modal Body */}
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
                        {/* pembayaran */}
                        <div className="p-4 space-y-4">
                            <div className="flex justify-between">
                                <span className="text-gray-700 font-medium">Total Harga</span>
                                <span className="text-black font-semibold">Rp. {transaksi.reduce((total, item) => total + (item.produk.harga * item.qty), 0).toLocaleString('id-ID')}</span>
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
                            {uangTunai !== '' && uangTunai < transaksi.reduce((total, item) => total + (item.produk.harga * item.qty), 0) ? (
                            <p className="text-red-500">Uang tidak cukup</p>
                            ) : (
                            uangTunai !== '' && (
                                <div className="flex justify-between">
                                <span className="text-gray-700 font-medium">Kembalian</span>
                                <span className="text-green-600 font-bold">
                                    Rp. {(uangTunai - transaksi.reduce((total, item) => total + (item.produk.harga * item.qty), 0)).toLocaleString('id-ID')}
                                </span>
                                </div>
                            )
                            )}
                            <button
                                className="w-full bg-green-500 text-white py-2 rounded-md"
                                disabled={uangTunai === '' || uangTunai < transaksi.reduce((total, item) => total + (item.produk.harga * item.qty), 0)}
                                onClick={() => {
                                    alert('Pembayaran berhasil!');
                                    setTransaksi([]);
                                    resetPembayaranTunai();
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
                                    setSelectedPayment('');
                                    setTransaksi([]);
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
        </div>
    );
}