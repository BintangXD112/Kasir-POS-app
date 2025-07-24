import React, { useEffect, useState } from "react";
import {Link, router} from '@inertiajs/react'
import Swal from 'sweetalert2';

interface Member {
  id: number;
  nama: string;
  diskon_id: number | null;
  alamat: string;
  telepon: number;
  total_transaksi: number;
  tanggal_daftar: string;
}

interface Voucher {
  id: number;
  kode_voucher: string;
  deskripsi: string;
  jumlah_diskon: number;
}

function getCsrfToken() {
  return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
}

export default function Member() {
  const [addData, setAddData] = useState({ nama: '', alamat: '', telepon: ''});
  const [member, setMember] = useState({
          nama: '',
          alamat: '',
          telepon: '',
  });
  const handleTambahMember = () => {
          router.post(route('member.store'), member, {
              onSuccess: () => {
                  Swal.fire({
                      icon: 'success',
                      title: 'Berhasil!',
                      text: 'Member berhasil ditambahkan.',
                  });
                  setMember({ nama: '', alamat: '', telepon: '' });
                  setShowModalTambahMember(false);
                  fetchMembers();
              },
              onError: (errors) => {
                  const allErrors = Object.values(errors).flat().join('\n');
                  Swal.fire({
                      icon: 'error',
                      title: 'Gagal!',
                      text: allErrors,
                  });
              },
  
          });
      };
      const handleDelete = (id: number) => {
          Swal.fire({
            title: 'Yakin ingin menghapus?',
            text: 'Data member akan dihapus secara permanen!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal',
          }).then((result) => {
            if (result.isConfirmed) {
              router.delete(route('member.destroy', id), {
                onSuccess: () => {
                  Swal.fire('Terhapus!', 'Produk berhasil dihapus.', 'success');
                  fetchMembers();
                },
                onError: () => {
                  Swal.fire('Gagal!', 'Gagal menghapus produk.', 'error');
                },
              });
            }
          });
        };
  const [members, setMembers] = useState<Member[]>([]);
  const [editData, setEditData] = useState<Member | null>(null);
  const openEditModal = (member: Member) => {
    setEditData({
      id: member.id,
      nama: member.nama ?? '',
      diskon_id: member.diskon_id ?? null,
      alamat: member.alamat ?? '',
      telepon: member.telepon ?? 0,
      total_transaksi: member.total_transaksi ?? 0,
      tanggal_daftar: member.tanggal_daftar ?? '',
    });
    setShowModalEditMember(true);
  };
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModalTambahMember, setShowModalTambahMember] = useState(false);
  const [showModalEditMember, setShowModalEditMember] = useState(false);
  const fetchMembers = async () => {
    setLoading(true);
    const res = await fetch('/admin/member');
    const data = await res.json();
    setMembers(data);
    setLoading(false);
  };

  const convertSpacesToNbsp = (text: string) => {
  return text.replace(/ /g, '\u00A0');
  };

  useEffect(() => {
    fetchMembers();
    fetch('/admin/voucher-diskon')
      .then(res => res.json())
      .then(setVouchers);
  }, []);

  const handleVoucherChange = async (memberId: number, diskonId: number | null) => {
    setLoading(true);
    const res = await fetch(`/admin/member/${memberId}/voucher`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': getCsrfToken(),
      },
      body: JSON.stringify({ diskon_id: diskonId }),
    });
    if (res.ok) {
      await fetchMembers();
      Swal.fire('Berhasil', 'Voucher diskon berhasil diupdate untuk member', 'success');
    } else {
      Swal.fire('Gagal', 'Gagal update voucher diskon', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-full mx-auto bg-gray-100 rounded-xl shadow text-black">
      <div className="flex justify-between mb-4 items-center">
        <h2 className="text-xl font-semibold">Kelola Member</h2>
        <button onClick={() => { setShowModalTambahMember(!showModalTambahMember) }} className="bg-blue-500 text-white px-4 py-2 rounded-md">Tambah Member Baru</button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 uppercase">
            <tr className="border-b border-gray-200">
              <th className="py-3 px-6">ID</th>
              <th className="py-3 px-6">Nama</th>
              <th className="py-3 px-6">Alamat</th>
              <th className="py-3 px-6">Nomor&nbsp;Telepon</th>
              <th className="py-3 px-6">Voucher&nbsp;Diskon</th>
              <th className="py-3 px-6">Total&nbsp;Transaksi</th>
              <th className="py-3 px-6">Tanggal&nbsp;Daftar</th>
              <th className="py-3 px-6 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                <td className="py-3 px-6">{member.id}</td>
                <td className="py-3 px-6">{convertSpacesToNbsp(member.nama)}</td>
                <td className="py-3 px-6">{member.alamat}</td>
                <td className="py-3 px-6">{member.telepon}</td>
                <td className="py-3 px-6">
                  <select
                    className="border rounded p-2"
                    value={member.diskon_id || ''}
                    onChange={e => handleVoucherChange(member.id, e.target.value ? Number(e.target.value) : null)}
                    disabled={loading}
                  >
                    <option value="">-- Tidak Ada Voucher --</option>
                    {vouchers.map(v => (
                      <option key={v.id} value={v.id}>{v.kode_voucher} - {v.jumlah_diskon}%</option>
                    ))}
                  </select>
                </td>
                <td className="py-3 px-6 text-center">{member.total_transaksi}</td>
                <td className="py-3 px-6">{member.tanggal_daftar}</td>
                <td className="py-3 px-6 flex justify-center gap-4">
                <button
                    onClick={()=> handleDelete(member.id)}
                    className="bg-red-500 text-white w-16 py-2 rounded-md"
                  >
                    Hapus
                  </button>
                  <button
                    onClick={() => openEditModal(member)}
                    className="bg-yellow-500 text-white w-16 py-2 rounded-md"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModalTambahMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b rounded-t border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Tambah Member
                            </h3>
                            <button
                                type="button"
                                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm h-8 w-8 flex justify-center items-center"
                                onClick={() => {
                                    setShowModalTambahMember(false);
                                }}
                            >
                                <svg className="w-3 h-3" aria-hidden="true" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                </svg>
                                <span className="sr-only">Close modal</span>
                            </button>
                        </div>
                        {/* Modal Body */}
                        <div className={`p-4 space-y-4`}>
                            <div className="flex flex-col">
                                <label htmlFor="nama">Nama Member</label>
                                <input
                                    id="nama"
                                    type="text"
                                    value={member.nama}
                                    onChange={(e) => setMember({ ...member, nama: e.target.value })}
                                    className="focus:outline-0 border border-gray-300 bg-white rounded-sm p-2"
                                />
                            </div>

                            <div className="flex flex-col">
                                <label htmlFor="alamat">Alamat Member</label>
                                <textarea
                                    id="alamat"
                                    value={member.alamat}
                                    onChange={(e) => setMember({ ...member, alamat: e.target.value })}
                                    className="focus:outline-0 border border-gray-300 bg-white rounded-sm p-2"
                                />
                            </div>

                            <div className="flex flex-col">
                                <label htmlFor="telepon">Nomor Telepon Member</label>
                                <input
                                    id="telepon"
                                    type="text"
                                    value={member.telepon}
                                    onChange={(e) => setMember({ ...member, telepon: e.target.value })}
                                    className="focus:outline-0 border border-gray-300 bg-white rounded-sm p-2"
                                />
                            </div>

                        </div>
                        <div className="p-4 space-y-4">
                            <button onClick={handleTambahMember} className="w-full bg-blue-500 text-white py-2 rounded-md">
                                Tambahkan
                            </button>
                        </div>
                    </div>
                </div>
            )}
      {showModalEditMember && editData && (
      <form
        onSubmit={e => {
          e.preventDefault();
          router.put(
            route('member.update', editData.id),
            {
              nama: editData.nama,
              telepon: String(editData.telepon),
              alamat: editData.alamat,
            },
            {
              onSuccess: () => {
                setShowModalEditMember(false);
                setEditData(null);
                Swal.fire('Berhasil', 'Member berhasil diperbarui', 'success');
                fetchMembers();
              },
              onError: (errors) => {
                const allErrors = errors
                  ? Object.values(errors).flat().join('\n')
                  : 'Terjadi kesalahan';
                Swal.fire('Gagal', allErrors, 'error');
              },
            }
          );
        }}
        className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
      >
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b rounded-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Edit Member
            </h3>
            <button
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm h-8 w-8 flex justify-center items-center"
              onClick={() => {
                setShowModalEditMember(false);
                setEditData(null);
              }}
            >
              <svg className="w-3 h-3" aria-hidden="true" fill="none" viewBox="0 0 14 14">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
          </div>
          {/* Modal Body */}
          <div className="p-4 space-y-4">
            <div className="flex flex-col">
              <label htmlFor="nama">Nama Member</label>
              <input
                id="nama"
                type="text"
                value={editData.nama}
                onChange={e => setEditData({ ...editData, nama: e.target.value })}
                className="focus:outline-0 border border-gray-300 bg-white rounded-sm p-2"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="alamat">Alamat Member</label>
              <textarea
                id="alamat"
                value={editData.alamat}
                onChange={e => setEditData({ ...editData, alamat: e.target.value })}
                className="focus:outline-0 border border-gray-300 bg-white rounded-sm p-2"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="telepon">Nomor Telepon Member</label>
              <input
                id="telepon"
                type="text"
                value={editData.telepon}
                onChange={e => setEditData({ ...editData, telepon: e.target.value })}
                className="focus:outline-0 border border-gray-300 bg-white rounded-sm p-2"
              />
            </div>
          </div>
          <div className="p-4 space-y-4">
            <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-md">
              Simpan Perubahan
            </button>
          </div>
        </div>
      </form>
    )}
    </div>
  );
}