
import React, { useState, useEffect, useMemo } from 'react';
import { router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import type { Member, Voucher } from '@/types/type';

function getCsrfToken() {
  return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
}

export default function Member() {
  useEffect(()=>{
    fetchMembers();
    setLoading(false);
  },[])
  const [searchTerm, setSearchTerm] = useState('');
  const [membersList, setMembersList] = useState<Member[]>('');
  const [member, setMember] = useState({ nama: '', alamat: '', telepon: '' });

  // ====== ⬇️ STATE & LOGIC PAGINATION  ⬇️ ======
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  // Reset ke halaman 1 kalau filter/sort/pageSize berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, pageSize]);
  // ====== ⬆️ STATE & LOGIC PAGINATION  ⬆️ ======


  // fetch ulang data member
  const fetchMembers = async () => {
    const res = await fetch('/member/list');
    if (res.ok) {
      const data = await res.json();
      setMembersList(data);
    }
  };

  const filteredMember = useMemo(()=>{
    if(!searchTerm) return membersList;
    return membersList.filter(item=>
      item.nama.toLowerCase().includes(searchTerm.toLowerCase())
      )
  })

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
  const [loading, setLoading] = useState(true);
  const [showModalTambahMember, setShowModalTambahMember] = useState(false);
  const [showModalEditMember, setShowModalEditMember] = useState(false);

  const convertSpacesToNbsp = (text: string) => {
  return text.replace(/ /g, '\u00A0');
  };

  useEffect(() => {
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
      Swal.fire('Berhasil', 'Voucher diskon berhasil diupdate untuk member', 'success');
      fetchMembers();
    } else {
      window.location.reload()
      Swal.fire('Gagal', res.message, 'error');
    }
    setLoading(false);
  };

  // ====== ⬇️ DERIVED PAGINATION  ⬇️ ======
  const totalItems = filteredMember.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentSafe = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (currentSafe - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const pagedMember = filteredMember.slice(startIndex, endIndex);

  // Buat list nomor halaman (dengan "..." bila banyak)
  const getPageNumbers = (current: number, total: number): (number | '...')[] => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
    if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];

    return [1, '...', current - 1, current, current + 1, '...', total];
  };
  const pageNumbers = getPageNumbers(currentSafe, totalPages);
  // ====== ⬆️ DERIVED PAGINATION  ⬆️ ======
  return (
    <div className="p-6 max-w-full min-h-[75vh] mx-auto bg-gray-100 rounded-xl shadow text-black">
      <div className="flex justify-between mb-4 items-center">
        <h2 className="text-xl font-semibold">Kelola Member</h2>
      </div>
      <div className="flex justify-between items-center mb-6 bg-white shadow rounded-xl p-6">
        <input type="text" value={searchTerm} onChange={(e)=>{setSearchTerm(e.target.value)}} className={`w-1/2 shadow mx-4 border border-slate-300 bg-white rounded-xl p-4`} placeholder="Cari nama produk atau kategori" />
        <button onClick={() => { setShowModalTambahMember(!showModalTambahMember) }} className="bg-blue-500 text-white px-4 py-2 rounded-md">Tambah Member Baru</button>
      </div>
      <div className=" pb-20 relative bg-white rounded-xl shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="uppercase">
              <tr className="border-b border-gray-200">
                <th className="py-3 px-6">ID</th>
                <th className="py-3 px-6">Nama</th>
                <th className="py-3 px-6">Alamat</th>
                <th className="py-3 px-6">Nomor&nbsp;Telepon</th>
                <th className="py-3 px-6">Voucher&nbsp;Diskon</th>
                <th className="py-3 px-6">Total&nbsp;Transaksi</th>
                <th className="py-3 px-6">Tanggal&nbsp;Daftar</th>
                <th className="py-3 pr-6 text-center">Aksi</th>
              </tr>
            </thead>
            {loading ? <div className="text-center py-8">Loading...</div> : (
              <tbody>
              {filteredMember.length > 0 && pagedMember.map((member) => (
                <tr key={member.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                  <td className="py-3 px-6">{member.id}</td>
                  <td className="py-3 px-6">{member.nama}</td>
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
                  <td className="py-3 pr-6 flex justify-center gap-4">
                  <button
                      onClick={()=> handleDelete(member.id)}
                      className="bg-red-500 text-white w-16 py-2 rounded-md cursor-pointer"
                    >
                      Hapus
                    </button>
                    <button
                      onClick={() => openEditModal(member)}
                      className="bg-yellow-500 text-white w-16 py-2 rounded-md cursor-pointer"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
              )}
          </table>
          {filteredMember.length === 0 && (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-slate-900">Tidak ada Data</h3>
                  <p className="mt-1 text-sm text-slate-500">Tidak ada Data yang sesuai dengan filter yang dipilih.</p>
                </div>
              )}
          {/* ====== ⬇️ KONTROL PAGINATION  ⬇️ ====== */}
              {filteredMember.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t absolute bottom-0 left-0 right-0 border-slate-200 gap-3">
                  <div className="text-sm text-slate-600">
                    Menampilkan <span className="font-semibold">{startIndex + 1}</span>–
                    <span className="font-semibold">{endIndex}</span> dari
                    <span className="font-semibold"> {totalItems}</span> Member
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      className="px-3 py-2 border rounded-lg cursor-pointer disabled:cursor-not-allowed text-sm hover:bg-slate-50 disabled:opacity-50"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentSafe === 1}
                      aria-label="Halaman sebelumnya"
                    >
                      Prev
                    </button>

                    {pageNumbers.map((p, idx) =>
                      p === '...' ? (
                        <span key={`dots-${idx}`} className="px-2 text-slate-500 select-none">…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setCurrentPage(p as number)}
                          aria-current={currentSafe === p ? 'page' : undefined}
                          className={`px-3 py-2 border rounded-lg text-sm hover:scale-105 transition-all cursor-pointer ${
                            currentSafe === p ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-600/50' : 'hover:text-white hover:bg-blue-600'
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}

                    <button
                      className="px-3 py-2 border rounded-lg text-sm hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentSafe === totalPages}
                      aria-label="Halaman berikutnya"
                    >
                      Next
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">Per halaman:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                      className="px-2 py-2 border rounded-lg text-sm"
                    >
                      {[10, 25, 50, 100].map(sz => (
                        <option key={sz} value={sz}>{sz}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              {/* ====== ⬆️ KONTROL PAGINATION ⬆️ ====== */}
        </div>
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
                Swal.fire('Gagal', allErrors, 'success');
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