import { useState, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const History = () => {
  const { user } = useAuth();
  const [attendanceList, setAttendanceList] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadHistory = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get('/attendance/history');
        let data = response.data || [];

        // Jika bukan admin, tampilkan hanya riwayat milik user tersebut
        if (user.role !== 'admin') {
          data = data.filter((r) => {
            const ownerId = r.user?.id ?? r.user_id ?? r.userId;
            return String(ownerId) === String(user.id) || String(r.user?.nik) === String(user.nik);
          });
        }

        setAttendanceList(data);
      } catch (err) {
        setError('Gagal memuat history: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [user]);

  const filteredList = filter === 'all' ? attendanceList : attendanceList.filter((item) => item.type === filter);

  const formatTime = (timestamp) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const exportFilenameSuffix = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const exportToExcel = () => {
    if (!filteredList.length) return;

    const rows = filteredList.map((r, i) => ({
      No: i + 1,
      Nama: r.user?.name || currentUserName,
      Tipe: r.type === 'in' ? 'MASUK' : 'KELUAR',
      Waktu: formatTime(r.created_at),
      Lokasi: `${r.lat || '-'}, ${r.lng || '-'}`,
      Foto: r.foto ? 'Ada' : 'Tidak ada'
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet['!cols'] = [{ wch: 6 }, { wch: 24 }, { wch: 12 }, { wch: 24 }, { wch: 22 }, { wch: 12 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Riwayat Absensi');
    XLSX.writeFile(workbook, `riwayat-absensi-${exportFilenameSuffix}.xlsx`);
  };

  const exportToPdf = () => {
    if (!filteredList.length) return;

    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    doc.setFontSize(14);
    doc.text('Laporan Riwayat Absensi', 40, 40);
    doc.setFontSize(10);
    doc.text(`Dicetak: ${new Date().toLocaleString('id-ID')}`, 40, 56);

    autoTable(doc, {
      startY: 74,
      head: [['No', 'Nama', 'Tipe', 'Waktu', 'Lokasi', 'Foto']],
      body: filteredList.map((r, i) => [
        String(i + 1),
        r.user?.name || currentUserName,
        r.type === 'in' ? 'MASUK' : 'KELUAR',
        formatTime(r.created_at),
        `${r.lat || '-'}, ${r.lng || '-'}`,
        r.foto ? 'Ada' : 'Tidak ada'
      ]),
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: { fillColor: [30, 64, 175] },
      margin: { left: 40, right: 40 }
    });

    doc.save(`riwayat-absensi-${exportFilenameSuffix}.pdf`);
  };

  const buildPhotoUrl = (fotoPath) => {
    if (!fotoPath) return '';

    if (/^https?:\/\//i.test(fotoPath)) {
      return fotoPath;
    }

    const normalizedPath = String(fotoPath).replace(/^\/+/, '');
    const storagePath = normalizedPath.startsWith('storage/') ? normalizedPath : `storage/${normalizedPath}`;

    try {
      const base = axios.defaults.baseURL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
      const apiUrl = new URL(base);
      return `${apiUrl.origin}/${storagePath}`;
    } catch {
      return `/${storagePath}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center" style={{ background: '#f2fbf6' }}>
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: 'rgba(7,155,76,0.45)', borderBottomColor: '#079b4c' }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6" style={{ background: '#f2fbf6' }}>
        <div className="max-w-2xl mx-auto bg-white/95 rounded-lg p-6" style={{ border: '1px solid rgba(7,155,76,0.20)' }}>
          <p className="font-extrabold" style={{ color: '#773e1b' }}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  const currentUserName = user?.name || 'Karyawan';
  const currentUserNik = user?.nik || '-';
  const totalMasuk = attendanceList.filter((a) => a.type === 'in').length;
  const totalKeluar = attendanceList.filter((a) => a.type === 'out').length;
  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen p-3 sm:p-6" style={{ background: '#f2fbf6' }}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/95 rounded-lg p-5 sm:p-8 shadow-md mb-6" style={{ border: '1px solid rgba(7,155,76,0.20)' }}>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#173224] mb-2">Riwayat Absensi</h1>
          <p className="text-sm sm:text-base" style={{ color: 'rgba(0,0,0,0.65)' }}>
            Total: <span className="font-extrabold">{attendanceList.length}</span> records
          </p>
        </div>

        <div className="bg-white/95 rounded-lg p-4 sm:p-6 shadow-md" style={{ border: '1px solid rgba(7,155,76,0.24)' }}>
          <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilter('all')}
                className="px-6 py-2 rounded-xl font-extrabold transition-all duration-200"
                style={
                  filter === 'all'
                    ? { background: '#079b4c', color: '#ffffff', boxShadow: 'none' }
                    : { background: 'rgba(7,155,76,0.14)', color: '#05773a', border: '1px solid rgba(7,155,76,0.20)' }
                }
              >
                Semua
              </button>
              <button
                onClick={() => setFilter('in')}
                className="px-6 py-2 rounded-xl font-extrabold transition-all duration-200"
                style={
                  filter === 'in'
                    ? { background: '#079b4c', color: '#ffffff', boxShadow: 'none' }
                    : { background: 'rgba(7,155,76,0.14)', color: '#05773a', border: '1px solid rgba(7,155,76,0.20)' }
                }
              >
                Masuk
              </button>
              <button
                onClick={() => setFilter('out')}
                className="px-6 py-2 rounded-xl font-extrabold transition-all duration-200"
                style={
                  filter === 'out'
                    ? { background: '#079b4c', color: '#ffffff', boxShadow: 'none' }
                    : { background: 'rgba(7,155,76,0.14)', color: '#05773a', border: '1px solid rgba(7,155,76,0.20)' }
                }
              >
                Keluar
              </button>
            </div>
            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
              <div className="grid flex-1 grid-cols-2 gap-2 sm:flex-none">
                <div className="rounded-lg border bg-white px-4 py-2 text-center" style={{ borderColor: 'rgba(7,155,76,0.24)' }}>
                  <p className="text-xs font-semibold" style={{ color: '#05773a' }}>
                    Masuk
                  </p>
                  <p className="text-xl font-extrabold text-[#173224]">{totalMasuk}</p>
                </div>
                <div className="rounded-lg border bg-white px-4 py-2 text-center" style={{ borderColor: 'rgba(7,155,76,0.24)' }}>
                  <p className="text-xs font-semibold" style={{ color: '#05773a' }}>
                    Keluar
                  </p>
                  <p className="text-xl font-extrabold text-[#173224]">{totalKeluar}</p>
                </div>
              </div>
              {isAdmin && (
                <div className="grid w-full grid-cols-2 gap-2 sm:w-auto">
                  <button
                    type="button"
                    onClick={exportToExcel}
                    disabled={!filteredList.length}
                    className="h-11 rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white disabled:opacity-50 sm:w-32"
                  >
                    Export Excel
                  </button>
                  <button
                    type="button"
                    onClick={exportToPdf}
                    disabled={!filteredList.length}
                    className="h-11 rounded-xl bg-rose-600 px-4 text-sm font-bold text-white disabled:opacity-50 sm:w-32"
                  >
                    Export PDF
                  </button>
                </div>
              )}
            </div>
          </div>

          {filteredList.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm sm:text-base font-semibold" style={{ color: 'rgba(0,0,0,0.60)' }}>
                Belum ada data absensi
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredList.map((record) => (
                <div
                  key={record.id}
                  className="p-4 rounded-lg border transition-all duration-200"
                  style={{ background: 'rgba(7,155,76,0.10)', borderColor: 'rgba(7,155,76,0.24)' }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className="text-lg font-bold px-3 py-1 rounded-lg"
                        style={{
                          backgroundColor: record.type === 'in' ? 'rgba(7,155,76,0.18)' : 'rgba(246,174,69,0.25)',
                          color: record.type === 'in' ? '#05773a' : '#b85d18'
                        }}
                      >
                        {record.type === 'in' ? 'MASUK' : 'KELUAR'}
                      </span>
                      <div>
                        <p className="font-extrabold" style={{ color: '#173224' }}>
                          {record.type === 'in' ? 'Absensi Masuk' : 'Absensi Keluar'}
                        </p>
                        <p className="text-sm" style={{ color: 'rgba(0,0,0,0.65)' }}>
                          {record.user?.name || currentUserName} ({record.user?.nik || currentUserNik})
                        </p>
                      </div>
                    </div>

                    {record.foto && (
                      <div className="mb-3">
                        <img
                          src={buildPhotoUrl(record.foto)}
                          alt="Foto absensi"
                          className="w-full h-36 sm:h-44 object-cover rounded-xl border shadow-md"
                          style={{ borderColor: 'rgba(7,155,76,0.32)' }}
                        />
                      </div>
                    )}

                    <p className="text-sm" style={{ color: 'rgba(0,0,0,0.65)' }}>
                      Waktu: {formatTime(record.created_at)}
                    </p>
                    <p className="text-xs" style={{ color: 'rgba(0,0,0,0.50)' }}>
                      Lokasi: {record.lat}, {record.lng}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default History;
