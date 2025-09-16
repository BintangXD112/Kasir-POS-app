import { Head, useForm } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';
import { useEffect } from 'react';
import { router } from '@inertiajs/react';
import AuthLayout from '@/layouts/auth-layout';
import { Button } from '@/components/ui/button';

interface LoginProps {
  status?: string;
  canResetPassword: boolean;
  users: Array<{ id: number; nama_user: string; tipe_user: string }>;
}

export default function Login({ status, users }: LoginProps) {
  const [activeUser, setActiveUser] = useState<string | null>(null);
  const [activeTipeUser, setActiveTipeUser] = useState<string | null>(null);
  const [showKode, setShowKode] = useState(false);
  const { data, setData, post, errors, reset } = useForm({
    nama_user: '',
    kode_user: '',
  });

  const [theme, setTheme] = useState(false)
  const [currentTheme, setCurrentTheme] = useState(localStorage.getItem("theme") || 'auto')
  useEffect(()=>{
      localStorage.setItem("theme", currentTheme)
  }, [currentTheme])

  useEffect(() => {
    if (status) {
      Swal.fire({
        icon: 'success',
        title: status,
        showConfirmButton: false,
        timer: 1500,
      });
    }
  }, [status]);

  const handleLoginClick = (nama_user: string, tipe_user: string) => {
    setActiveUser(nama_user);
    setActiveTipeUser(tipe_user);
    setData('nama_user', nama_user); // ✅ wajib set nama_user di useForm
    localStorage.setItem("username", nama_user);
    localStorage.setItem("tipe_user", tipe_user);
    errors.kode_user = '';
    setData('kode_user', ''); // kosongkan input kode
  };

  useEffect(()=>{
    localStorage.removeItem("tipe_user");
  },[])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!activeUser) return;

    const user = users.find((u) => u.nama_user === activeUser);
    if (!user) return;

    post('/login', {
      onError: (errors) => {
        console.error(errors);
      },
    });
  };

  return (
    <div className='w-full'>
      {/*Tema*/}
      <div className={`${currentTheme === 'auto' ? 'bg-zinc-50 shadow-gray-800 dark:shadow-gray-500 dark:bg-zinc-900 dark:text-white' : currentTheme === 'Light' ? 'bg-zinc-50 text-zinc-900 shadow-gray-800' : currentTheme === 'Dark' && 'bg-zinc-900 text-white shadow-gray-500'} rounded-xl transition-all py-2 gap-2 ${theme ? 'h-30 justify-end' :'h-12 justify-center'} w-12 fixed bottom-4 right-4 shadow border-slate-100 flex flex-col items-center`}>
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
      <Head title="Log in" />
      <div className={`min-h-screen flex flex-wrap gap-6 justify-center items-center p-6 ${currentTheme === 'auto' ? 'bg-gray-50 dark:bg-zinc-950' : currentTheme === 'Light' ? 'bg-gray-50' : currentTheme === 'Dark' && 'bg-zinc-950'}`}>
        {users.length === 0 ? (
          <div className={`text-center col-span-full {currentTheme === 'auto' ? 'text-zinc-600 dark:text-zinc-400' : currentTheme === 'Light' ? 'text-zinc-600' : currentTheme === 'Dark' && 'text-zinc-400'}`}>
            Tidak ada user ditemukan.
          </div>
        ) : (
          (users ?? []).map((user) => {
            const isActive = activeUser === user.nama_user;
            return (
              <div
                key={user.id}
                className={`${currentTheme === 'auto' ? 'bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700' : currentTheme === 'Light' ? 'bg-white border border-zinc-300' : currentTheme === 'Dark' && 'bg-zinc-900 border border-zinc-700'}
      rounded-3xl shadow-lg max-w-xs w-full p-6 flex flex-col justify-between items-center min-h-[360px] 
      transition duration-300 hover:shadow-xl`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-green-500 
        flex items-center justify-center text-3xl font-bold text-white mb-4 shadow-lg">
                    {user.nama_user.charAt(0).toUpperCase()}
                  </div>

                  <h3 className={`text-xl font-semibold ${currentTheme === 'auto' ? 'text-zinc-900 dark:text-white' : currentTheme === 'Light' ? 'text-zinc-900' : currentTheme === 'Dark' && 'text-white'} mb-1`}>
                    {user.nama_user}
                  </h3>

                  <span
                    className={`text-sm font-medium px-3 py-1 rounded-full mb-4 ${user.tipe_user === 'admin'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                      }`}
                  >
                    {user.tipe_user.charAt(0).toUpperCase() + user.tipe_user.slice(1)}
                  </span>
                </div>

                <div className="w-full mt-auto">
                  {isActive ? (
                    <form
                      onSubmit={handleSubmit}
                      className="flex flex-col gap-3 animate-fade-in"
                    >
                      <div className="relative">
                        <input
                          type={showKode ? 'text' : 'password'}
                          placeholder="Masukkan Kode User"
                          value={data.kode_user}
                          onChange={(e) => setData('kode_user', e.target.value)}
                          className={`w-full px-4 py-2 rounded-lg ${currentTheme === 'auto' ? 'border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white' : currentTheme === 'Light' ? 'border border-zinc-300 bg-zinc-50 text-zinc-900' : currentTheme === 'Dark' && 'border border-zinc-600 bg-zinc-800 text-white'}
                shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                          autoFocus
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowKode((prev) => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 
                hover:text-zinc-800 dark:hover:text-white"
                        >
                          {showKode ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>

                      {errors.kode_user && (
                        <div className="text-sm text-red-600 bg-red-100 border border-red-300 rounded px-3 py-2">
                          ⚠ {errors.kode_user}
                        </div>
                      )}

                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg shadow-md">
                        Masuk
                      </Button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveUser(null);
                          setActiveTipeUser(null);
                          setData('kode_user', '');
                        }}
                        className={`text-xs text-zinc-500 ${currentTheme === 'auto' ? 'hover:text-zinc-700 dark:hover:text-white' : currentTheme === 'Light' ? 'hover:text-zinc-700' : currentTheme === "Dark" && 'hover:text-white' } mt-1`}
                      >
                        Batal
                      </button>
                    </form>
                  ) : (
                    <Button
                      className="w-full bg-gradient-to-r from-blue-500 to-green-500 
            hover:from-blue-600 hover:to-green-600 text-white font-bold py-2 
            rounded-lg shadow-md"
                      onClick={() => handleLoginClick(user.nama_user, user.tipe_user)}
                    >
                      Login
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}