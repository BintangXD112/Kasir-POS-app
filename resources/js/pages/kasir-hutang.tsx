import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import HutangMemberComponent from './view/hutang-member';

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

    const navBg = 'bg-zinc-900';
    const navText = 'text-white';

    const pageBg =
        currentTheme === 'auto' ? 'bg-gray-50 dark:bg-zinc-950 min-h-screen'
            : currentTheme === 'Dark' ? 'bg-zinc-950 min-h-screen'
                : 'bg-gray-50 min-h-screen';

    return (
        <div className={pageBg}>
            {/* Navbar — sama gaya dengan kasir */}
            <header className={`${navBg} ${navText} px-6 py-3 flex items-center justify-between shadow-md sticky top-0 z-30`}>
                <div className="flex items-center gap-4">
                    {/* Tombol kembali ke kasir */}
                    <button
                        onClick={() => router.visit('/kasir')}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-medium transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Kembali ke Kasir
                    </button>
                    <h1 className="text-lg font-bold">Rekap Hutang Member</h1>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-zinc-300">{auth?.user?.nama_user}</span>
                </div>
            </header>

            {/* Content */}
            <HutangMemberComponent rekap={rekap} currentTheme={currentTheme} />
        </div>
    );
}
