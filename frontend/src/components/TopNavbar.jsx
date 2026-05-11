import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaBell, FaCalendarAlt, FaHistory, FaHome, FaRegUser, FaUserCheck } from 'react-icons/fa';
import { useAuth } from './AuthContext';

const navItems = [
  { key: 'home', label: 'Home', path: '/dashboard', icon: FaHome },
  { key: 'history', label: 'History', path: '/history', icon: FaHistory },
  { key: 'attendance', label: 'Absen', path: '/attendance', icon: FaUserCheck, center: true },
  { key: 'leave', label: 'Cuti', path: '/leave', icon: FaCalendarAlt },
  { key: 'profile', label: 'Profile', path: '/profile', icon: FaRegUser }
];

const adminNavItems = [
  { key: 'home', label: 'Home', path: '/dashboard', icon: FaHome },
  { key: 'leave', label: 'Cuti', path: '/leave', icon: FaCalendarAlt },
  { key: 'employees', label: 'Karyawan', path: '/employees', icon: FaUserCheck, center: true },
  { key: 'history', label: 'History', path: '/history', icon: FaHistory },
  { key: 'profile', label: 'Profile', path: '/profile', icon: FaRegUser }
];

export default function TopNavbar() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const isAdmin = user?.role === 'admin';
  const visibleNavItems = isAdmin ? adminNavItems : navItems;

  const activeKey = useMemo(() => {
    const pathname = location.pathname;
    if (pathname.startsWith('/employees')) return 'employees';
    if (pathname.startsWith('/history')) return 'history';
    if (pathname.startsWith('/attendance')) return 'attendance';
    if (pathname.startsWith('/leave')) return 'leave';
    if (pathname.startsWith('/setting')) return 'profile';
    if (pathname.startsWith('/profile')) return 'profile';
    return 'home';
  }, [location.pathname]);

  const initial = (user?.name || 'A').slice(0, 1).toUpperCase();

  useEffect(() => {
    setNotificationOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-sky-100 bg-white">
        <div className="mx-auto flex max-w-md items-center justify-between px-5 py-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex h-14 items-center"
            aria-label="Home"
          >
            <img src="/gcs.png" alt="GCS" className="h-14 w-auto object-contain" />
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setNotificationOpen((value) => !value)}
              className="grid h-10 w-10 place-items-center rounded-full border border-sky-100 bg-sky-50 text-sky-700 shadow-sm"
              aria-label="Notifikasi"
            >
              <FaBell size={15} />
            </button>
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-sky-500 to-blue-700 text-sm font-black text-white shadow-lg shadow-sky-200"
              aria-label="Buka profile"
            >
              {initial}
            </button>
          </div>
        </div>

        {notificationOpen && (
          <div className="fixed inset-x-0 top-[74px] z-50 px-5">
            <div className="mx-auto max-w-md">
              <div className="rounded-3xl border border-sky-100 bg-white p-4 shadow-2xl shadow-sky-200/70">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-slate-900">Notifikasi</p>
                    <p className="mt-1 text-sm font-medium text-slate-500">Belum ada notifikasi baru hari ini.</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">0 baru</span>
                </div>
                <div className="mt-3 space-y-2">
                  <NotificationItem title="Pengingat Absen" text="Pengingat check in dan check out akan tampil di sini." />
                  <NotificationItem title="Status Cuti" text="Update persetujuan pengajuan cuti akan muncul otomatis." />
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-sky-100 bg-white px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-16px_40px_rgba(2,132,199,0.14)]">
        <div
          className="mx-auto grid max-w-md items-end gap-1"
          style={{ gridTemplateColumns: `repeat(${visibleNavItems.length}, minmax(0, 1fr))` }}
        >
          {visibleNavItems.map((item) => (
            <TabButton
              key={item.key}
              item={item}
              active={activeKey === item.key}
              onClick={() => navigate(item.path)}
            />
          ))}
        </div>
      </nav>
    </>
  );
}

function NotificationItem({ title, text }) {
  return (
    <div className="rounded-2xl bg-sky-50 p-3">
      <p className="text-sm font-black text-slate-900">{title}</p>
      <p className="mt-1 text-xs font-semibold text-slate-500">{text}</p>
    </div>
  );
}

function TabButton({ item, active, onClick }) {
  const Icon = item.icon;

  if (item.center) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="relative -mt-8 flex flex-col items-center gap-1 text-[11px] font-extrabold text-blue-700"
        aria-label="Absen"
      >
        <span
          className={[
            'grid h-16 w-16 place-items-center rounded-full border-4 border-white text-white shadow-xl transition',
            active ? 'bg-blue-700 shadow-blue-200' : 'bg-gradient-to-br from-sky-500 to-blue-700 shadow-sky-200'
          ].join(' ')}
        >
          <Icon size={24} />
        </span>
        <span className={active ? 'text-blue-700' : 'text-slate-500'}>{item.label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-bold transition"
      style={{
        color: active ? '#1d4ed8' : '#64748b',
        background: active ? 'rgba(219, 234, 254, 0.9)' : 'transparent'
      }}
      aria-label={item.label}
    >
      <Icon size={18} />
      <span>{item.label}</span>
    </button>
  );
}
