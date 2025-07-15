import { useEffect, useState } from 'react';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation.js';
import {Link, router, usePage } from '@inertiajs/react';
import { LogOut } from 'lucide-react';
import Home from './view/home.js';
import type { PageProps } from '@/types/type';

export default function Admin(){
    const { users, members, produks } = usePage<PageProps>().props;
    const [page, setPage] = useState(localStorage.getItem("page") || "home")
    useEffect(()=>{
        localStorage.setItem("page", page)
    })
    const [showLogOut, setShowLogOut] = useState(false)
    const funcShowLogOut = ()=>{
        setShowLogOut(!showLogOut)
    }
    const cleanup = useMobileNavigation();
    const handleLogout = () => {
            cleanup();
            router.flushAll();
            localStorage.removeItem("username");
            window.location.href = "/login";
        };
    const [nav, setNav] = useState(false)
    const funcNav = () => {
        setNav(!nav)
    }
    useEffect(()=>{
        if(localStorage.getItem("tipe_user")!=="admin"){
            window.location.href = "/login";
        }
    })
    return (
        <div className='w-full h-screen bg-gray-700 flex'>
            {/* Sidebar */}
            <div className={`${nav ? 'w-64' : 'w-0'} transition-all duration-300 ease-in-out bg-gray-800 overflow-hidden`}>
                <div className="p-4">
                    <h3 className="text-white text-lg font-semibold mb-4">Menu</h3>
                    <nav className="space-y-2">
                        <a onClick={()=>{setPage("home")}} className={`flex ${page === "home" && "bg-gray-700 text-white"} items-center gap-1 text-gray-300 hover:text-white hover:bg-gray-700 rounded px-3 py-2 transition-colors`}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
                                <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
                                <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
                            </svg>
                            Dashboard
                        </a>
                        <a onClick={()=>{setPage("produk")}} className={`flex  ${page === "produk"  && "bg-gray-700 text-white" }  items-center gap-1 text-gray-300 hover:text-white hover:bg-gray-700 rounded px-3 py-2 transition-colors`}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
                                <path d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v.75c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875v-.75C22.5 3.839 21.66 3 20.625 3H3.375Z" />
                                <path fillRule="evenodd" d="m3.087 9 .54 9.176A3 3 0 0 0 6.62 21h10.757a3 3 0 0 0 2.995-2.824L20.913 9H3.087Zm6.163 3.75A.75.75 0 0 1 10 12h4a.75.75 0 0 1 0 1.5h-4a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
                            </svg>
                            Products
                        </a>
                        <a onClick={()=>{setPage("penjualan")}} className={`flex  ${page === "penjualan"  && "bg-gray-700 text-white" }  items-center gap-1 text-gray-300 hover:text-white hover:bg-gray-700 rounded px-3 py-2 transition-colors`}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
                                <path d="M12 7.5a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z" />
                                <path fillRule="evenodd" d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 0 1 1.5 14.625v-9.75ZM8.25 9.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM18.75 9a.75.75 0 0 0-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 0 0 .75-.75V9.75a.75.75 0 0 0-.75-.75h-.008ZM4.5 9.75A.75.75 0 0 1 5.25 9h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H5.25a.75.75 0 0 1-.75-.75V9.75Z" clipRule="evenodd" />
                                <path d="M2.25 18a.75.75 0 0 0 0 1.5c5.4 0 10.63.722 15.6 2.075 1.19.324 2.4-.558 2.4-1.82V18.75a.75.75 0 0 0-.75-.75H2.25Z" />
                            </svg>
                            Sales
                        </a>
                        <a onClick={()=>{setPage("laporan")}} className={`flex  ${page === "laporan"  && "bg-gray-700 text-white" }  items-center gap-1 text-gray-300 hover:text-white hover:bg-gray-700 rounded px-3 py-2 transition-colors`}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
                                <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A8.237 8.237 0 0 1 6 18.75c1.995 0 3.823.707 5.25 1.886V4.533ZM12.75 20.636A8.214 8.214 0 0 1 18 18.75c.966 0 1.89.166 2.75.47a.75.75 0 0 0 1-.708V4.262a.75.75 0 0 0-.5-.707A9.735 9.735 0 0 0 18 3a9.707 9.707 0 0 0-5.25 1.533v16.103Z" />
                            </svg>
                            Reports
                        </a>
                    </nav>
                </div>
            </div>
            
            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="w-full bg-gray-800 shadow-lg">
                    <div className="flex justify-between items-center px-4 py-3">
                        <div className='flex gap-3 items-center'>
                            <button 
                                onClick={funcNav}
                                className="p-1 hover:bg-gray-600 rounded transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 text-white">
                                    <path fillRule="evenodd" d={`${nav ? 
                                        `M7.28 7.72a.75.75 0 0 1 0 1.06l-2.47 2.47H21a.75.75 0 0 1 0 1.5H4.81l2.47 2.47a.75.75 0 1 1-1.06 1.06l-3.75-3.75a.75.75 0 0 1 0-1.06l3.75-3.75a.75.75 0 0 1 1.06 0Z` 
                                        : `M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z`
                                    }`} clipRule="evenodd" />
                                </svg>
                            </button>
                            <h2 className="text-2xl md:text-3xl text-white font-bold">Point of Sale</h2>
                        </div>
                        
                        <div className="flex justify-end items-center">
                            <div className='relative'>
                                <button 
                                    onClick={funcShowLogOut}
                                    className='flex items-center cursor-pointer gap-2 text-white hover:bg-gray-600 rounded px-3 py-2 transition-colors'
                                >
                                    <span className='text-sm md:text-base'>{localStorage.getItem("username")}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`${showLogOut && 'rotate-180'} transition-all duration-300 ease-in-out size-4`}>
                                        <path fillRule="evenodd" d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z" clipRule="evenodd" />
                                    </svg>
                                </button>
                                
                                {showLogOut && (
                                    <div className={`transition-all duration-150 ease-in-out absolute top-10 right-0 bg-red-500 cursor-pointer hover:opacity-50 rounded-md shadow-lg p-0 w-36 z-20 animate-fade-in`}>
                                        <ul className="text-white m-0 p-0">
                                            <li className="py-2 px-2 transition-colors rounded-md">
                                                <Link className="flex cursor-pointer w-full" method="post" href={route('logout')} as="button" onClick={handleLogout}>
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
                </div>
                
                {/* Main Content Area */}
                <div className="flex-1 overflow-auto p-6">
                    <div className="bg-white rounded-lg shadow-lg p-6 h-full">
                        {page === "home" ? <Home users={users} members={members} produks={produks} /> :page === "produk" ?'' :""}
                    </div>
                </div>
            </div>
        </div>
    )
}