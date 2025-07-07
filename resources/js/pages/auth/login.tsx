import { Head, useForm } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';
import { useEffect } from 'react';

import AuthLayout from '@/layouts/auth-layout';
import { Button } from '@/components/ui/button';

interface LoginProps {
  status?: string;
  canResetPassword: boolean;
  users: Array<{ id: number; nama_user: string; tipe_user: string }>;
}

export default function Login({ status, users }: LoginProps) {
  const [activeUser, setActiveUser] = useState<string | null>(null);
  const [kodeUserInput, setKodeUserInput] = useState('');
  const [showKode, setShowKode] = useState(false);
  const { errors } = useForm();

  useEffect(() => {
    if (status === 'success') {
      Swal.fire({
        icon: 'success',
        title: 'Login Berhasil',
        showConfirmButton: false,
        timer: 1500,
      });
    } else if (status === 'error') {
      Swal.fire({
        icon: 'error',
        title: 'Login Gagal',
        text: 'Kode user salah atau user tidak ditemukan',
      });
    }
  }, [status]);

  const handleLoginClick = (nama_user: string) => {
    setActiveUser(nama_user);
    setKodeUserInput('');
    setShowKode(false);
  };

  const handleSubmit = (nama_user: string, e: React.FormEvent) => {
    e.preventDefault();
    Inertia.post(route('login'), { nama_user, kode_user: kodeUserInput });
  };

  return (
<div className='w-full pt-86'>
  <Head title="Log in" />
  <div className="flex justify-center px-4">
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-10 gap-x-8 justify-center w-full max-w-5xl">
    {users.map((user) => {
      const isActive = activeUser === user.nama_user;

      return (
        <div
          key={user.id}
          className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-3xl shadow-lg 
          w-[280px] sm:w-[300px] p-5 flex flex-col justify-between items-center min-h-[340px] transition-all duration-300 hover:shadow-xl"
        >
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-3xl font-bold text-white mb-4 shadow-xl">
              {user.nama_user.charAt(0).toUpperCase()}
            </div>

            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-1">
              {user.nama_user}
            </h3>

            <span
              className={`text-sm font-medium px-3 py-1 rounded-full mb-4 ${
                user.tipe_user === 'admin'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-green-100 text-green-700'
              }`}
            >
              {user.tipe_user.charAt(0).toUpperCase() + user.tipe_user.slice(1)}
            </span>
          </div>

          <div className="w-full mt-2">
            {isActive ? (
              <form
                onSubmit={(e) => handleSubmit(user.nama_user, e)}
                className="flex flex-col w-full animate-fade-in"
              >
                <div className="relative mb-3">
                  <input
                    type={showKode ? 'text' : 'password'}
                    placeholder="Masukkan Kode User"
                    value={kodeUserInput}
                    onChange={(e) => setKodeUserInput(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    autoFocus
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowKode((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-800 dark:hover:text-white"
                  >
                    {showKode ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {errors.kode_user && (
                  <div className="text-sm text-red-600 bg-red-100 border border-red-300 rounded px-3 py-2 mb-3">
                    ⚠ {errors.kode_user}
                  </div>
                )}

                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg shadow-md">
                  Masuk
                </Button>

                <button
                  type="button"
                  onClick={() => setActiveUser(null)}
                  className="w-full mt-2 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-white"
                >
                  Batal
                </button>
              </form>
            ) : (
              <Button
                className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-bold py-2 rounded-lg shadow-md"
                onClick={() => handleLoginClick(user.nama_user)}
              >
                Login
              </Button>
            )}
          </div>
        </div>
      );
    })}
  </div>
</div>


  {status && (
    <div className="mt-6 text-center text-sm font-medium text-green-600">{status}</div>
  )}
</div>

  );
}
