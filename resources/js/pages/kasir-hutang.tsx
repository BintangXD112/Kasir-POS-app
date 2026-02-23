import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import HutangMemberComponent from './view/hutang-member';
import MenuBar from '@/components/menu-bar';
import { LogOut } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useMobileNavigation } from '../hooks/use-mobile-navigation';

declare const route: (name: string, params?: any) => string;

interface RekapMember {
    member_id: number;
    nama: string;
    telepon: string;
    jumlah_transaksi: number;
    total_hutang: number;
    transaksi: any[];
}

interface Props {
    rekap: RekapMember[];
    auth: { user: { nama_user: string } };
}

export default function KasirHutang({ rekap, auth }: Props) {
    const [currentTheme] = useState<'auto' | 'Light' | 'Dark'>(
        (localStorage.getItem('theme') as 'auto' | 'Light' | 'Dark') || 'auto'
    );

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
        localStorage.removeItem("username");
    };
    const [showLogout, setShowLogout] = useState(false);
    const toggleLogout = () => {
        setShowLogout(!showLogout);
    };

    const navBg = 'bg-zinc-900';
    const navText = 'text-white';

    const pageBg =
        currentTheme === 'auto' ? 'bg-gray-50 dark:bg-zinc-950 min-h-screen'
            : currentTheme === 'Dark' ? 'bg-zinc-950 min-h-screen'
                : 'bg-gray-50 min-h-screen';

    return (

        <div className={pageBg}>
            <div className={`flex flex-col ${headerBg} px-4 py-4`}>
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

            {/* Content */}
            <HutangMemberComponent rekap={rekap} currentTheme={currentTheme} />
        </div>
    );
}
