import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaClipboardList, FaHistory, FaMapMarkerAlt, FaUserCheck, FaUsers } from 'react-icons/fa';
import { useAuth } from './AuthContext';
import { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});

  useEffect(() => {
    if (user?.role !== 'admin') return;

    let mounted = true;
    const load = async () => {
      try {
        const res = await axios.get('/dashboard/stats');
        if (!mounted) return;
        setStats(res.data || {});
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
      }
    };

    load();
    return () => { mounted = false; };
  }, [user]);
  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-[#f2fbf6] px-4 py-5">
      <div className="mx-auto max-w-md space-y-4">
        <section className="overflow-hidden rounded-lg border border-blue-800 bg-blue-700 p-5 text-white shadow-md ">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-sky-100">{today}</p>
              <h1 className="mt-2 text-2xl font-black leading-tight">Halo, {user?.name || 'Karyawan'}</h1>
              <p className="mt-1 text-sm font-medium text-sky-50">NIK {user?.nik || '-'}</p>
            </div>
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white/18 text-xl font-black ring-1 ring-white/25">
              {(user?.name || 'A').slice(0, 1).toUpperCase()}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <StatusPill label="Status" value="Karyawan" />
            <StatusPill label="Role" value={user?.role || 'Karyawan'} />
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <QuickAction
            to={user?.role === 'admin' ? '/employees' : '/attendance'}
            icon={user?.role === 'admin' ? FaUsers : FaUserCheck}
            label={user?.role === 'admin' ? 'Karyawan' : 'Absen'}
            text={user?.role === 'admin' ? 'Kelola data' : 'Check in/out'}
            primary
          />
          <QuickAction to="/leave" icon={FaCalendarAlt} label="Izin" text="Ajukan izin" />
          <QuickAction to="/history" icon={FaHistory} label="History" text="Riwayat absen" />
          <QuickAction to="/profile" icon={FaClipboardList} label="Profile" text="Akun & setting" />
        </section>

        <section className="rounded-lg border border-sky-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-blue-50 text-blue-700">
              <FaMapMarkerAlt />
            </span>
            <div>
              <h2 className="font-black text-slate-900">Kesiapan Absensi</h2>
              <p className="text-sm font-medium text-slate-500">Pastikan GPS dan kamera aktif sebelum absen.</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Readiness label="GPS" value="Wajib" />
            <Readiness label="Kamera" value="Wajib" />
          </div>
        </section>

        {user?.role === 'admin' && (
          <section className="rounded-lg border border-sky-100 bg-white p-4 shadow-sm">
            <h3 className="font-black text-slate-900">Ringkasan Tim</h3>
            <p className="text-sm text-slate-500">Kondisi tim hari ini</p>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <StatCard label="Hadir" value={stats.hadir ?? '-'} color="bg-emerald-50 text-emerald-700" />
              <StatCard label="Terlambat" value={stats.terlambat ?? '-'} color="bg-amber-50 text-amber-700" />
              <StatCard label="Izin" value={stats.izin ?? '-'} color="bg-sky-50 text-sky-700" />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <StatCard label="Sakit" value={stats.sakit ?? '-'} color="bg-rose-50 text-rose-700" />
              <StatCard label="Tidak Masuk" value={stats.tidak_masuk ?? '-'} color="bg-slate-50 text-slate-700" />
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

function StatCard({ label, value, color }) {
  return (
    <div className={[`rounded-lg p-3`, color].join(' ')}>
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}

export default Dashboard;

function StatusPill({ label, value }) {
  return (
    <div className="rounded-lg bg-white/16 p-3 ring-1 ring-white/20">
      <p className="text-xs font-bold text-sky-100">{label}</p>
      <p className="truncate text-base font-black text-white">{value}</p>
    </div>
  );
}

function QuickAction({ to, icon: Icon, label, text, primary }) {
  return (
    <Link
      to={to}
      className={[
        'rounded-lg border p-4 shadow-sm transition active:scale-[0.98]',
        primary ? 'border-[#f6ae45] bg-[#fff4df] text-slate-900 ' : 'border-sky-100 bg-white text-slate-900'
      ].join(' ')}
    >
      <span className={primary ? 'grid h-11 w-11 place-items-center rounded-lg bg-[#ffebc7] text-[#f6ae45]' : 'grid h-11 w-11 place-items-center rounded-lg bg-blue-50 text-blue-700'}>
        <Icon />
      </span>
      <p className="mt-3 text-lg font-black">{label}</p>
      <p className="text-sm font-semibold text-slate-500">{text}</p>
    </Link>
  );
}

function Readiness({ label, value }) {
  return (
    <div className="rounded-lg bg-sky-50 p-3">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="font-black text-blue-700">{value}</p>
    </div>
  );
}
