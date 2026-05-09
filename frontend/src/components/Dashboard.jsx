import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaClipboardList, FaHistory, FaMapMarkerAlt, FaUserCheck } from 'react-icons/fa';
import { useAuth } from './AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-[#eef6ff] px-4 py-5">
      <div className="mx-auto max-w-md space-y-4">
        <section className="overflow-hidden rounded-[28px] bg-gradient-to-br from-blue-700 via-sky-600 to-sky-400 p-5 text-white shadow-xl shadow-sky-200">
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
            <StatusPill label="Status" value="Siap Absen" />
            <StatusPill label="Role" value={user?.role || 'Karyawan'} />
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <QuickAction
            to={user?.role === 'admin' ? '/employees' : '/attendance'}
            icon={user?.role === 'admin' ? FaClipboardList : FaUserCheck}
            label={user?.role === 'admin' ? 'Karyawan' : 'Absen'}
            text={user?.role === 'admin' ? 'Kelola data' : 'Check in/out'}
            primary
          />
          <QuickAction to="/leave" icon={FaCalendarAlt} label="Cuti" text="Ajukan izin" />
          <QuickAction to="/history" icon={FaHistory} label="History" text="Riwayat absen" />
          <QuickAction to="/profile" icon={FaClipboardList} label="Profile" text="Akun & setting" />
        </section>

        <section className="rounded-[24px] border border-sky-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-blue-700">
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
      </div>
    </div>
  );
};

function StatusPill({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/16 p-3 ring-1 ring-white/20">
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
        'rounded-[24px] border p-4 shadow-sm transition active:scale-[0.98]',
        primary ? 'border-blue-600 bg-blue-700 text-white shadow-blue-100' : 'border-sky-100 bg-white text-slate-900'
      ].join(' ')}
    >
      <span className={primary ? 'grid h-11 w-11 place-items-center rounded-2xl bg-white/18' : 'grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-blue-700'}>
        <Icon />
      </span>
      <p className="mt-3 text-lg font-black">{label}</p>
      <p className={primary ? 'text-sm font-semibold text-sky-100' : 'text-sm font-semibold text-slate-500'}>{text}</p>
    </Link>
  );
}

function Readiness({ label, value }) {
  return (
    <div className="rounded-2xl bg-sky-50 p-3">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="font-black text-blue-700">{value}</p>
    </div>
  );
}

export default Dashboard;
