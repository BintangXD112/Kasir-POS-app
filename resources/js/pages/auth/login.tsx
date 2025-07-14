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
    setData('kode_user', ''); // kosongkan input kode
  };

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
      <Head title="Log in" />
      <div className="min-h-screen flex flex-wrap gap-6 justify-center items-center p-6 bg-gray-50 dark:bg-zinc-950">
        {users.length === 0 ? (
          <div className="text-center col-span-full text-zinc-600 dark:text-zinc-400">
            Tidak ada user ditemukan.
          </div>
        ) : (
          (users ?? []).map((user) => {
            const isActive = activeUser === user.nama_user;
            return (
              <div
                key={user.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 
      rounded-3xl shadow-lg max-w-xs w-full p-6 flex flex-col justify-between items-center min-h-[360px] 
      transition duration-300 hover:shadow-xl"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-green-500 
        flex items-center justify-center text-3xl font-bold text-white mb-4 shadow-lg">
                    {user.nama_user.charAt(0).toUpperCase()}
                  </div>

                  <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-1">
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
                          className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 
                bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white 
                shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                        className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-white mt-1"
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