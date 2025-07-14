export default function Home(){
    return(
        <>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-500 text-white p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Total Pemasukan</h3>
                    <p className="text-3xl font-bold">Rp. 1.200.000</p>
                </div>
                <div className="bg-orange-500 text-white p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Jumlah Produk</h3>
                    <p className="text-3xl font-bold">156</p>
                </div>
                <div className="bg-yellow-500 text-white p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Total Member</h3>
                    <p className="text-3xl font-bold">89</p>
                </div>
                <div className="bg-green-500 text-white p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Total User</h3>
                    <p className="text-3xl font-bold">8</p>
                </div>
            </div>
        </>
    )
}