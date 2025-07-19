import { usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function UserLogs() {
    const page = usePage<any>();
    const logs = page.props.logs || [];
    const filters = page.props.filters || {};
    const [filter, setFilter] = useState({
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
    });

    const handleFilterChange = (e: any) => {
        setFilter({ ...filter, [e.target.name]: e.target.value });
    };
    const handleFilterSubmit = (e: any) => {
        e.preventDefault();
        const params = new URLSearchParams();
        Object.entries(filter).forEach(([k, v]) => { if (v) params.append(k, v as string); });
        window.location.href = `/admin/user-logs?${params.toString()}`;
    };
    const handleExport = () => {
        const params = new URLSearchParams();
        Object.entries(filter).forEach(([k, v]) => { if (v) params.append(k, v as string); });
        window.open(`/admin/user-logs/export?${params.toString()}`);
    };
    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Log Aktivitas User</h2>
            <form onSubmit={handleFilterSubmit} className="flex flex-wrap gap-2 mb-4 items-end">
                <input name="date_from" type="date" value={filter.date_from} onChange={handleFilterChange} className="border rounded px-2 py-1 text-gray-900" />
                <input name="date_to" type="date" value={filter.date_to} onChange={handleFilterChange} className="border rounded px-2 py-1 text-gray-900" />
                <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded">Filter</button>
                <button type="button" onClick={handleExport} className="bg-green-600 text-white px-4 py-1 rounded">Export CSV</button>
            </form>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded shadow text-sm">
                    <thead className="bg-gray-100 uppercase">
                        <tr className="border-b border-gray-200">
                            <th className="py-3 px-6 text-left font-bold text-gray-800">Waktu</th>
                            <th className="py-3 px-6 text-left font-bold text-gray-800">User</th>
                            <th className="py-3 px-6 text-left font-bold text-gray-800">Aksi</th>
                            <th className="py-3 px-6 text-left font-bold text-gray-800">Target User</th>
                            <th className="py-3 px-6 text-left font-bold text-gray-800">Keterangan</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log: any) => (
                            <tr key={log.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                                <td className="py-3 px-6 text-gray-900 font-medium">{new Date(log.created_at).toLocaleString()}</td>
                                <td className="py-3 px-6 text-gray-900 font-medium">{log.user?.nama_user || '-'}</td>
                                <td className="py-3 px-6 text-gray-900 font-medium">{log.action}</td>
                                <td className="py-3 px-6 text-gray-900 font-medium">{log.target_user ? log.target_user.nama_user : '-'}</td>
                                <td className="py-3 px-6 text-gray-900 font-medium">{log.keterangan || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
} 