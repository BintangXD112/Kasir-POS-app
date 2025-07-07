import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useRef, useEffect } from 'react';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Swal from 'sweetalert2';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Kode User settings',
        href: '/settings/kode_user',
    },
];

export default function KodeUserSettings() {
    const kodeUserInput = useRef<HTMLInputElement>(null);
    const currentKodeUserInput = useRef<HTMLInputElement>(null);

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_kode_user: '',
        kode_user: '',
        kode_user_confirmation: '',
    });

    const updateKodeUser: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('kode_user.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.kode_user) {
                    reset('kode_user', 'kode_user_confirmation');
                    kodeUserInput.current?.focus();
                }

                if (errors.current_kode_user) {
                    reset('current_kode_user');
                    currentKodeUserInput.current?.focus();
                }
            },
        });
    };

    const { status } = usePage().props;

    useEffect(() => {
        if (status) {
            Swal.fire({
                icon: 'success',
                title: status,
                showConfirmButton: false,
                timer: 1500,
            });
        } else if (Object.keys(errors).length > 0) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal mengubah kode user',
                text: Object.values(errors).join(', '),
            });
        }
    }, [status, errors]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kode User settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Update kode user" description="Ganti kode user Anda secara berkala untuk menjaga keamanan akun." />

                    <form onSubmit={updateKodeUser} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="current_kode_user">Kode user saat ini</Label>

                            <Input
                                id="current_kode_user"
                                ref={currentKodeUserInput}
                                value={data.current_kode_user}
                                onChange={(e) => setData('current_kode_user', e.target.value)}
                                type="text"
                                className="mt-1 block w-full"
                                autoComplete="off"
                                placeholder="Kode user saat ini"
                            />

                            <InputError message={errors.current_kode_user} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="kode_user">Kode user baru</Label>

                            <Input
                                id="kode_user"
                                ref={kodeUserInput}
                                value={data.kode_user}
                                onChange={(e) => setData('kode_user', e.target.value)}
                                type="text"
                                className="mt-1 block w-full"
                                autoComplete="off"
                                placeholder="Kode user baru"
                            />

                            <InputError message={errors.kode_user} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="kode_user_confirmation">Konfirmasi kode user baru</Label>

                            <Input
                                id="kode_user_confirmation"
                                value={data.kode_user_confirmation}
                                onChange={(e) => setData('kode_user_confirmation', e.target.value)}
                                type="text"
                                className="mt-1 block w-full"
                                autoComplete="off"
                                placeholder="Konfirmasi kode user baru"
                            />

                            <InputError message={errors.kode_user_confirmation} />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>Simpan kode user</Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">Tersimpan</p>
                            </Transition>
                        </div>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
