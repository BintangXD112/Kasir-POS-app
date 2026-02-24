import { usePage, Link, router } from '@inertiajs/react'
import { Home, Wallet, HandCoins, Truck, Layers, UsersRound, Settings, BarChart2, Users, FileText } from 'lucide-react'

export default function MenuBar() {
    const { url } = usePage()
    const activeMenuBar = 'font-bold underline flex justify-center gap-1 text-white items-center px-4 cursor-pointer'
    const menuBar = 'flex justify-center gap-1 text-white items-center px-4 cursor-pointer hover:underline'
    return (
        <div className={`flex gap-4 w-full justify-center`}>
            <button onClick={() => router.visit('/kasir')} className={url === '/kasir' ? activeMenuBar : menuBar}>
                <Home />
                Home
            </button>
            <button onClick={() => router.visit('/beli')} className={url === '/beli' ? activeMenuBar : menuBar}>
                <HandCoins />
                Beli
            </button>
            <button onClick={() => router.visit('/bayar')} className={url === '/bayar' ? activeMenuBar : menuBar}>
                <Wallet />
                Bayar
            </button>
            <button onClick={() => router.visit('/stock')} className={url === '/stock' ? activeMenuBar : menuBar}>
                <Layers />
                Stock
            </button>
            <button onClick={() => router.visit('/admin/supplier')} className={url.startsWith('/admin/supplier') ? activeMenuBar : menuBar}>
                <Truck />
                Supplier
            </button>
            <button onClick={() => router.visit('/member')} className={url === '/member' ? activeMenuBar : menuBar}>
                <UsersRound />
                Member
            </button>
            <button onClick={() => router.visit('/setting')} className={url === '/setting' ? activeMenuBar : menuBar}>
                <Settings />
                Setting
            </button>
            <button onClick={() => router.visit('/admin/rekap')} className={url.startsWith('/admin/rekap') ? activeMenuBar : menuBar}>
                <BarChart2 />
                Rekap
            </button>
            <button onClick={() => router.visit('/admin/laporan-transaksi-member')} className={url.startsWith('/admin/laporan-transaksi-member') ? activeMenuBar : menuBar}>
                <Users />
                Lap. Member
            </button>
            <button onClick={() => router.visit('/admin/laporan-keuangan-supplier')} className={url.startsWith('/admin/laporan-keuangan-supplier') ? activeMenuBar : menuBar}>
                <FileText />
                Lap. Supplier
            </button>


            {/*<button onClick={() => router.visit('/tabungan')} className="flex justify-center bg-transparent gap-2 text-white border border-white rounded-sm items-center px-4 cursor-pointer hover:bg-white hover:scale-105 hover:text-black transition-all duration-300">
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
        </button>*/}
        </div>
    )
}