// User Interface
export interface User {
  id: number;
  nama_user: string;
  tipe_user: 'admin' | 'kasir';
  kode_user: string;
  email_verified_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  status: 'active' | 'non-active'; // status user
}

// Member Interface
export interface Member {
  id: number;
  nama: string;
  level: string;
  alamat: string;
  telepon: string | number;
  total_transaksi: number;
  tanggal_daftar: string;
}

// Voucher Interface

// export interface Kategori {
//   id: number;
//   nama_kategori: string;
//   created_at: string;
//   updated_at: string;
// }
export interface JenisProduk {
  id: number;
  nama_jenis_produk: string;
  created_at: string;
  updated_at: string;
}

// export interface ProdukKategori {
//   id: number;
//   nama_kategori: string;
// }

export interface Produk {
  id: number;
  nama: string;
  harga: number;
  stok: number;
  gambar: string | null;
  id_jenis_produk: number;
  jenis_produk: JenisProduk;
}

// Props untuk halaman yang memuat beberapa data
export interface PageProps {
  users: User[];
  members: Member[];
  produks: Produk[];
  jenis_produk: JenisProduk[];  // tambahkan jenis produk jika perlu dipakai
}
