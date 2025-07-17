// User Interface
export interface User {
  id: number;
  nama_user: string;
  tipe_user: 'admin' | 'kasir';
  kode_user: string;
  email_verified_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  status: 'active' | 'non-active'; // New field for user status
}

// Member Interface
export interface Member {
  id: number;
  nama: string;
  diskon_id: number;
  total_transaksi: string;
  tanggal_daftar?: string;
}

// Produk Interface
export interface Produk {
  id: number;
  nama: string;
  harga: number;
  stok: number;
  gambar: string | File;
  created_at: string | null;
  updated_at: string | null;
}

export interface PageProps {
  users: User[];
  members: Member[];
  produks: Produk[];
}

