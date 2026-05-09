import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaEnvelope, FaHistory, FaIdCard, FaUserCheck } from 'react-icons/fa';
import { useAuth } from './AuthContext';

export default function EmployeeDetail() {
  const { user } = useAuth();
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDetail = async () => {
      try {
        setLoading(true);
        const [employeesResponse, historyResponse] = await Promise.all([
          axios.get('/employees'),
          axios.get('/attendance/history')
        ]);
        setEmployees(employeesResponse.data.data || employeesResponse.data || []);
        setAttendanceList(historyResponse.data || []);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, []);

  const employee = useMemo(
    () => employees.find((item) => String(item.id) === String(employeeId)),
    [employeeId, employees]
  );

  const records = useMemo(
    () => employee ? attendanceList.filter((record) => belongsToEmployee(record, employee)) : [],
    [attendanceList, employee]
  );

  const stats = useMemo(() => buildStats(records), [records]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#eef6ff] p-4">
        <div className="rounded-[24px] border border-sky-100 bg-white p-6 text-center shadow-sm">
          <h2 className="text-2xl font-black text-slate-900">Akses Ditolak</h2>
          <p className="mt-2 text-sm font-semibold text-slate-500">Hanya admin yang dapat mengakses halaman ini.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#eef6ff]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-sky-100 border-b-blue-700" />
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="min-h-screen bg-[#eef6ff] px-4 py-5">
        <div className="mx-auto max-w-md rounded-[24px] border border-amber-200 bg-amber-50 p-4">
          <p className="font-black text-amber-900">{error || 'Karyawan tidak ditemukan'}</p>
          <button
            type="button"
            onClick={() => navigate('/employees')}
            className="mt-4 h-11 rounded-2xl bg-blue-700 px-5 font-extrabold text-white"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  const recentRecords = [...records]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-[#eef6ff] px-4 py-5">
      <div className="mx-auto max-w-md space-y-4">
        <button
          type="button"
          onClick={() => navigate('/employees')}
          className="flex h-11 items-center gap-2 rounded-2xl bg-white px-4 font-extrabold text-blue-700 shadow-sm"
        >
          <FaArrowLeft />
          Karyawan
        </button>

        <section className="rounded-[28px] bg-gradient-to-br from-blue-700 via-sky-600 to-sky-400 p-5 text-white shadow-xl shadow-sky-200">
          <div className="flex items-start gap-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border-2 border-white/35 bg-white/20 text-2xl font-black ring-4 ring-white/12">
              {(employee.name || 'K').slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-sky-100">Detail Karyawan</p>
              <h1 className="mt-1 truncate text-2xl font-black">{employee.name || '-'}</h1>
              <p className="mt-1 text-sm font-medium text-sky-50 capitalize">{employee.role || 'user'}</p>
            </div>
          </div>
        </section>

        <section className="rounded-[24px] border border-sky-100 bg-white p-4 shadow-sm">
          <InfoRow icon={FaIdCard} label="NIK" value={employee.nik || '-'} />
          <InfoRow icon={FaEnvelope} label="Email" value={employee.email || '-'} />
        </section>

        <section className="rounded-[24px] border border-sky-100 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <FaUserCheck className="text-blue-700" />
            <h2 className="font-black text-slate-900">Statistik Absensi</h2>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <StatBox label="Masuk" value={stats.inCount} />
            <StatBox label="Pulang" value={stats.outCount} />
            <StatBox label="Total" value={stats.total} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <DetailBox label="Terakhir Masuk" value={formatDate(stats.lastIn?.created_at)} />
            <DetailBox label="Terakhir Pulang" value={formatDate(stats.lastOut?.created_at)} />
          </div>
        </section>

        <section className="rounded-[24px] border border-sky-100 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <FaHistory className="text-blue-700" />
            <h2 className="font-black text-slate-900">Riwayat Terbaru</h2>
          </div>

          {recentRecords.length === 0 ? (
            <div className="rounded-2xl bg-sky-50 p-4 text-sm font-semibold text-slate-500">
              Belum ada riwayat absensi.
            </div>
          ) : (
            <div className="space-y-2">
              {recentRecords.map((record) => (
                <div key={record.id} className="rounded-2xl bg-sky-50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-blue-700">
                      {record.type === 'in' ? 'Masuk' : 'Pulang'}
                    </span>
                    <span className="text-xs font-bold text-slate-500">{formatDate(record.created_at)}</span>
                  </div>
                  <p className="mt-2 text-xs font-semibold text-slate-500">
                    Lokasi: {record.lat || '-'}, {record.lng || '-'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 border-b border-sky-50 py-3 last:border-b-0">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-700">
        <Icon />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-bold text-slate-500">{label}</p>
        <p className="truncate font-black text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="rounded-2xl bg-sky-50 p-3 text-center">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="text-2xl font-black text-blue-700">{value}</p>
    </div>
  );
}

function DetailBox({ label, value }) {
  return (
    <div className="rounded-2xl border border-sky-100 p-3">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-black text-slate-900">{value}</p>
    </div>
  );
}

function belongsToEmployee(record, employee) {
  const ownerId = record.user?.id ?? record.user_id ?? record.userId;
  const ownerNik = record.user?.nik ?? record.nik;
  return String(ownerId) === String(employee.id) || String(ownerNik) === String(employee.nik);
}

function buildStats(records) {
  const sorted = [...records].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return {
    total: records.length,
    inCount: records.filter((record) => record.type === 'in').length,
    outCount: records.filter((record) => record.type === 'out').length,
    lastIn: sorted.find((record) => record.type === 'in'),
    lastOut: sorted.find((record) => record.type === 'out')
  };
}

function formatDate(timestamp) {
  if (!timestamp) return '-';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}
