import React from "react";
import { type BreadcrumbItem, type PageProps } from '../types/index';
import { useState, useRef, useEffect } from 'react';
import { useMobileNavigation } from '../hooks/use-mobile-navigation';
import { Link, router } from '@inertiajs/react';
import { icons, LogOut, Home, Wallet, Eye } from 'lucide-react';
import CountUp from '@/components/count-up';
import Swal from 'sweetalert2';
import LiveClock from '@/components/live-clock'
import MenuBar from '@/components/menu-bar'
import {Button} from '@/components/ui/button'

interface DashboardProps extends PageProps {
    produk: Produk[];
    kategori: Kategori[];
}

export default function Dashboard({ produk, kategori }: DashboardProps) {

    const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('theme') || 'auto');
    const [theme, setTheme] = useState(false);

    const sectionTitle =
    currentTheme === 'auto'
      ? 'text-zinc-900 dark:text-zinc-100'
      : currentTheme === 'Light'
      ? 'text-zinc-900'
      : 'text-zinc-100';

    const cardBase = 'p-6 rounded-lg shadow transition-colors';

    const tableWrap =
    currentTheme === 'auto'
      ? 'p-6 max-w-full mx-auto min-h-[45vh] rounded-xl shadow border border-zinc-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100'
      : currentTheme === 'Light'
      ? 'p-6 max-w-full mx-auto min-h-[45vh] rounded-xl shadow border border-zinc-200 bg-gray-50 text-zinc-900'
      : 'p-6 max-w-full mx-auto min-h-[45vh] rounded-xl shadow border border-zinc-800 bg-zinc-900 text-zinc-100';

    const tableHead =
    currentTheme === 'auto'
      ? 'bg-gray-100 dark:bg-zinc-800'
      : currentTheme === 'Light'
      ? 'bg-gray-100'
      : 'bg-zinc-800';

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

    useEffect(() => {
      const root = document.documentElement

      if (currentTheme === "Dark") {
        root.classList.add("dark")
      } 
      else if (currentTheme === "Light") {
        root.classList.remove("dark")
      } 
      else if (currentTheme === "auto") {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
        
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

    return (
        <div className={`flex h-screen w-full ${bgApp} flex-col gap-4`}>
            {/*Tema*/}
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
                <MenuBar/>
            </div>
            <div className={`flex min-h-full p-4 w-full`}>
                <div className={`w-full h-fit ${cardBg} ${contentText} shadow rounded-lg py-4 relative px-4`}>
                  <div className="flex flex-col justify-center">
                      <h1 className={`text-2xl font-bold mb-4 ${sectionTitle}`}>Dashboard</h1>
                      <h1 className={`text-xl font-bold mb-4 ${sectionTitle}`}>CBT - 18</h1>
                      <h1 className={`text-xl font-bold mb-4 ${sectionTitle}`}><LiveClock/></h1>
                  </div>
                  {/* Kartu ringkas (tetap berwarna agar kontras di semua tema) */}
                  <div className="flex flex-col gap-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className={`${cardBase} bg-secondary text-primary border-b-blue-500 border-b-4`}>
                          <h3 className="text-lg font-semibold mb-2">Total Pemasukan</h3>
                          <div className="flex flex-col gap-2">
                            <div className = "flex justify-between items-center">
                                <p className="text-3xl font-bold">
                                    Rp.&nbsp;
                                    <CountUp
                                      from={0}
                                      to={10000000}
                                      separator="."
                                      direction="up"
                                      duration={0.3}
                                      className="count-up-text"
                                    />
                                </p>
                                <p className="text-lg bg-green-500/35 rounded-full items-center p-1 text-green-800 dark:text-green-200">
                                    +10%
                                </p>
                            </div>
                            <p className="text-muted-foreground">
                                Dari bulan lalu
                            </p>
                          </div>
                        </div>
                        <div className={`${cardBase} bg-secondary text-primary border-b-red-500 border-b-4`}>
                          <h3 className="text-lg font-semibold mb-2">Total Pengeluaran</h3>
                          <div className="flex flex-col gap-2">
                            <div className = "flex justify-between items-center">
                                <p className="text-3xl font-bold">
                                    Rp.&nbsp;
                                    <CountUp
                                      from={0}
                                      to={10000000}
                                      separator="."
                                      direction="up"
                                      duration={0.3}
                                      className="count-up-text"
                                    />
                                </p>
                                <p className="text-lg bg-red-500/35 rounded-full items-center p-1 text-red-800 dark:text-red-200">
                                    +13%
                                </p>
                            </div>
                            <p className="text-muted-foreground">
                                Dari bulan lalu
                            </p>
                          </div>
                        </div>
                        <div className={`${cardBase} bg-secondary text-primary border-b-orange-500 border-b-4`}>
                          <h3 className="text-lg font-semibold mb-2">Pembayaran Supplier</h3>
                          <div className="flex flex-col gap-2">
                            <div className = "flex justify-between items-center">
                                <p className="text-3xl font-bold">
                                    Rp.&nbsp;
                                    <CountUp
                                      from={0}
                                      to={10000000}
                                      separator="."
                                      direction="up"
                                      duration={0.3}
                                      className="count-up-text"
                                    />
                                </p>
                                <p className="text-lg bg-green-500/35 rounded-full items-center p-1 text-green-800 dark:text-green-200">
                                    -8%
                                </p>
                            </div>
                            <p className="text-muted-foreground">
                                Dari bulan lalu
                            </p>
                          </div>
                        </div>
                        
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                        <div className={`${cardBase} bg-secondary border-b-4 border-b-green-500 text-primary`}>
                          <div className="flex justify-between items-center">                            
                            <h3 className="text-lg font-semibold mb-2">Total Penjualan</h3>
                            <h3 className="text-base bg-primary-foreground p-2 rounded-full font-semibold mb-2">Total: 1076 Kg</h3>
                          </div>
                          <div className="flex justify-center gap-4 text-primary p-2">
                                <div>
                                  <p className="text-lg font-bold">
                                    <CountUp
                                      from={0}
                                      to={250}
                                      separator="."
                                      direction="up"
                                      duration={0.3}
                                      className="count-up-text"
                                    />
                                    &nbsp;Kg&nbsp;Kedelai
                                  </p>
                                </div>
                                <div>
                                  <p className="text-lg font-bold">
                                    <CountUp
                                      from={0}
                                      to={370}
                                      separator="."
                                      direction="up"
                                      duration={0.3}
                                      className="count-up-text"
                                    />
                                    &nbsp;Kg&nbsp;Garam
                                  </p>
                                </div>
                                <div>
                                  <p className="text-lg font-bold">
                                    <CountUp
                                      from={0}
                                      to={456}
                                      separator="."
                                      direction="up"
                                      duration={0.3}
                                      className="count-up-text"
                                    />
                                    &nbsp;Kg&nbsp;Kunyit
                                  </p>
                                </div>
                          </div>
                        </div>
                        <div className={`${cardBase} bg-secondary border-b-4 border-b-emerald-500 text-primary`}>
                          <div className="flex justify-between items-center">                            
                            <h3 className="text-lg font-semibold mb-2">Stock</h3>
                            <h3 className="text-base bg-primary-foreground p-2 rounded-full font-semibold mb-2">Total: 1076 Kg</h3>
                          </div>
                          <div className="flex justify-center gap-4 text-primary p-2">
                                <div>
                                  <p className="text-lg font-bold">
                                    <CountUp
                                      from={0}
                                      to={250}
                                      separator="."
                                      direction="up"
                                      duration={0.3}
                                      className="count-up-text"
                                    />
                                    &nbsp;Kg&nbsp;Kedelai
                                  </p>
                                </div>
                                <div>
                                  <p className="text-lg font-bold">
                                    <CountUp
                                      from={0}
                                      to={370}
                                      separator="."
                                      direction="up"
                                      duration={0.3}
                                      className="count-up-text"
                                    />
                                    &nbsp;Kg&nbsp;Garam
                                  </p>
                                </div>
                                <div>
                                  <p className="text-lg font-bold">
                                    <CountUp
                                      from={0}
                                      to={456}
                                      separator="."
                                      direction="up"
                                      duration={0.3}
                                      className="count-up-text"
                                    />
                                    &nbsp;Kg&nbsp;Kunyit
                                  </p>
                                </div>
                          </div>
                        </div>                        
                    </div>
                  </div>

                  {/* Tabel Users (sinkron tema) */}
                  <div className={`${tableWrap} mt-5`}>
                    <h2 className="text-xl font-semibold mb-4">Riwayat Transaksi</h2>
                    <div className={`bg-secondary text-primary rounded-xl shadow p-6 mb-6`}>
                      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex flex-col sm:flex-row gap-3 flex-1">
                          <div className="relative flex-1 max-w-md">
                            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                              type="text"
                              placeholder="Cari kode transaksi atau member..."
                              // value={searchTerm}
                              // onChange={(e) => setSearchTerm(e.target.value)}
                              className={`w-full pl-10 pr-4 py-2 border ${inputTheme} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                            />
                          </div>

                          <select
                            // value={statusFilter}
                            // onChange={(e) => setStatusFilter(e.target.value)}
                            className={`px-4 py-2 border ${inputTheme} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                          >
                            <option value="all">Semua Tipe</option>
                            <option value="lunas">Masuk</option>
                            <option value="pending">Keluar</option>
                            {/*<option value="cancelled">Cancelled</option>*/}
                          </select>

                          <button
                            // onClick={() => setShowPrintModal(true)}
                            className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 font-medium"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Print
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium">Urutkan:</label>
                          <select
                            // value={sortBy}
                            // onChange={(e) => setSortBy(e.target.value)}
                            className={`px-3 py-2 border ${inputTheme} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm`}
                          >
                            <option value="created_at">Tanggal</option>
                            <option value="total">Total</option>
                            <option value="kode_transaksi">Kode</option>
                          </select>
                          <button
                            // onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            className={`p-2 border ${inputTheme} rounded-lg transition-colors`}
                            aria-label="Toggle sort order"
                            title="Toggle sort order"
                          >
                            {/*{sortOrder === 'asc' ? '↑' : '↓'}*/}↓
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="overflow-x-auto rounded-xl">
                      <table className="min-w-full text-sm text-left">
                        <thead className={`${tableHead} uppercase`}>
                          <tr className="border-b border-zinc-200 dark:border-zinc-800">
                            <th className="py-3 px-6">Tanggal</th>
                            <th className="py-3 px-6">Tipe</th>
                            <th className="py-3 px-6">Kode Transaksi</th>
                            <th className="py-3 px-6">Jumlah (Kg)</th>
                            <th className="py-3 px-6">Total (Rp)</th>
                            <th className="py-3 px-6">Status Transaksi</th>
                            <th className="py-3 px-6 text-center">Aksi</th>
                          </tr>
                        </thead>
                        <tbody>                          
                            <tr                              
                              className={`border-b border-zinc-200 dark:border-zinc-800 transition ${rowHover}`}
                            >
                              <td className="py-3 px-6">11-2-2026</td>
                              <td className="py-3 px-6">
                                <span className={'bg-green-500/35 text-green-800 dark:text-green-200 p-2 rounded-full'}>
                                  Masuk
                                </span>
                              </td>
                              <td className="py-3 px-6">TRX - 102304029</td>
                              <td className="py-3 px-6">150</td>
                              <td className="py-3 px-6">150.000</td>
                              <td className="py-3 px-6">
                                <span className={'bg-green-500/35 text-green-800 dark:text-green-200 p-2 rounded-full'}>
                                  Lunas
                                </span>
                              </td>
                              <td className="py-3 px-6 text-center">
                                <Button variant="secondary"><Eye/>Aksi</Button>
                              </td>
                            </tr>
                            <tr                              
                              className={`border-b border-zinc-200 dark:border-zinc-800 transition ${rowHover}`}
                            >
                              <td className="py-3 px-6">11-2-2026</td>
                              <td className="py-3 px-6">
                                <span className={'bg-red-500/35 text-red-800 dark:text-red-200 p-2 rounded-full'}>
                                  Keluar
                                </span>
                              </td>
                              <td className="py-3 px-6">TRX - 102304029</td>
                              <td className="py-3 px-6">150</td>
                              <td className="py-3 px-6">150.000</td>
                              <td className="py-3 px-6">
                                <span className={'bg-red-500/35 text-red-800 dark:text-red-200 p-2 rounded-full'}>
                                  Belum Lunas
                                </span>
                              </td>
                              <td className="py-3 px-6 text-center">
                                <Button variant="secondary"><Eye/>Aksi</Button>
                              </td>
                            </tr>                                                    
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
            </div>
        </div>
    );
}