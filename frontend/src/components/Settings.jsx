import { useEffect, useMemo, useState } from 'react';
import { FaBell, FaCamera, FaClock, FaMapMarkerAlt, FaShieldAlt, FaUserCheck } from 'react-icons/fa';
import { useAuth } from './AuthContext';

const STORAGE_KEY = 'absensi.settings';

const defaultSettings = {
  reminderIn: true,
  reminderOut: true,
  autoLocation: true,
  savePhotoPreview: true,
  reminderLeadMinutes: 30,
  workStart: '07:00',
  workEnd: '17:00',
  defaultAttendance: 'in'
};

export default function Settings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState(defaultSettings);
  const [saved, setSaved] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState(() => getNotificationStatus());
  const effectiveWorkStart = new Date().getDay() === 5 ? '06:00' : settings.workStart;
  const reminderInTime = subtractMinutes(effectiveWorkStart, settings.reminderLeadMinutes);
  const reminderOutTime = subtractMinutes(settings.workEnd, settings.reminderLeadMinutes);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      setSettings({ ...defaultSettings, ...stored });
    } catch {
      setSettings(defaultSettings);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSaved(true);
    const timer = setTimeout(() => setSaved(false), 1300);
    return () => clearTimeout(timer);
  }, [settings]);

  const permissionCards = useMemo(
    () => [
      {
        icon: FaMapMarkerAlt,
        title: 'Lokasi GPS',
        text: settings.autoLocation ? 'Aktif untuk validasi titik absen.' : 'Validasi lokasi manual dimatikan.',
        status: settings.autoLocation ? 'Aktif' : 'Nonaktif'
      },
      {
        icon: FaCamera,
        title: 'Kamera Selfie',
        text: 'Dipakai saat check in dan check out karyawan.',
        status: 'Wajib'
      },
      {
        icon: FaBell,
        title: 'Notifikasi',
        text: notificationStatus === 'granted' ? 'Pengingat bisa dikirim oleh perangkat.' : 'Izinkan agar pengingat absen berjalan.',
        status: notificationStatus === 'granted' ? 'Diizinkan' : 'Belum'
      }
    ],
    [notificationStatus, settings.autoLocation]
  );

  const update = (key, value) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const requestNotification = async () => {
    if (!('Notification' in window)) {
      setNotificationStatus('unsupported');
      return;
    }

    const result = await Notification.requestPermission();
    setNotificationStatus(result);
  };

  return (
    <div className="min-h-screen bg-[#eef6ff] px-4 py-5">
      <div className="mx-auto max-w-md space-y-4">
        <section className="overflow-hidden rounded-[28px] bg-gradient-to-br from-blue-700 via-sky-600 to-sky-400 p-5 text-white shadow-xl shadow-sky-200">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-sky-100">Pengaturan akun</p>
              <h2 className="mt-1 text-2xl font-black">{user?.name || 'Karyawan'}</h2>
              <p className="mt-1 text-sm font-medium text-sky-50">NIK {user?.nik || '-'}</p>
            </div>
            <div className="grid h-16 w-16 place-items-center rounded-full bg-white/18 text-2xl font-black ring-1 ring-white/25">
              {(user?.name || 'A').slice(0, 1).toUpperCase()}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <InfoPill label="Masuk" value={effectiveWorkStart} />
            <InfoPill label="Pulang" value={settings.workEnd} />
          </div>
        </section>

        <section className="rounded-[24px] border border-sky-100 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900">Preferensi Absen</h3>
              <p className="text-sm font-medium text-slate-500">{saved ? 'Tersimpan otomatis' : 'Atur pengalaman aplikasi'}</p>
            </div>
            <FaUserCheck className="text-blue-600" size={22} />
          </div>

          <div className="space-y-3">
            <ToggleRow
              title="Pengingat masuk"
              text="Sebelum jam masuk"
              checked={settings.reminderIn}
              onChange={(value) => update('reminderIn', value)}
            />
            <ToggleRow
              title="Pengingat pulang"
              text="Sebelum jam pulang"
              checked={settings.reminderOut}
              onChange={(value) => update('reminderOut', value)}
            />
            <ToggleRow
              title="Ambil lokasi otomatis"
              text="GPS langsung dibaca saat membuka halaman absen"
              checked={settings.autoLocation}
              onChange={(value) => update('autoLocation', value)}
            />
            <ToggleRow
              title="Simpan preview foto"
              text="Preview selfie tetap terlihat sebelum dikirim"
              checked={settings.savePhotoPreview}
              onChange={(value) => update('savePhotoPreview', value)}
            />
          </div>
        </section>

        <section className="rounded-[24px] border border-sky-100 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-50 text-blue-700">
              <FaClock />
            </span>
            <div>
              <h3 className="font-black text-slate-900">Jam Kerja</h3>
              <p className="text-sm font-medium text-slate-500">Dipakai untuk pengingat harian</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <TimeField label="Masuk" value={settings.workStart} onChange={(value) => update('workStart', value)} />
            <TimeField label="Pulang" value={settings.workEnd} onChange={(value) => update('workEnd', value)} />
          </div>

          <div className="mt-3 rounded-2xl bg-blue-50 p-3">
            <p className="text-sm font-extrabold text-slate-700">Pengingat otomatis</p>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Sebelum jam masuk dan sebelum jam pulang.
            </p>
          </div>

          <div className="mt-3">
            <label className="mb-2 block text-sm font-extrabold text-slate-700">Default tipe absen</label>
            <select
              value={settings.defaultAttendance}
              onChange={(event) => update('defaultAttendance', event.target.value)}
              className="h-12 w-full rounded-2xl border border-sky-100 bg-sky-50 px-4 font-bold text-slate-800 outline-none focus:border-blue-500"
            >
              <option value="in">Check In</option>
              <option value="out">Check Out</option>
            </select>
          </div>
        </section>

        <section className="rounded-[24px] border border-sky-100 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-black text-slate-900">Perangkat</h3>
              <p className="text-sm font-medium text-slate-500">Kesiapan iOS dan Android</p>
            </div>
            <FaShieldAlt className="text-blue-600" />
          </div>

          <div className="space-y-3">
            {permissionCards.map((card) => (
              <PermissionCard key={card.title} {...card} />
            ))}
          </div>

          <button
            type="button"
            onClick={requestNotification}
            className="mt-4 h-12 w-full rounded-2xl bg-blue-700 font-extrabold text-white shadow-lg shadow-blue-100 transition active:scale-[0.98]"
          >
            Izinkan Notifikasi
          </button>
        </section>

      </div>
    </div>
  );
}

function getNotificationStatus() {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

function subtractMinutes(time, minutes) {
  const [hour, minute] = time.split(':').map(Number);
  const totalMinutes = (hour * 60 + minute - minutes + 24 * 60) % (24 * 60);
  const resultHour = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
  const resultMinute = String(totalMinutes % 60).padStart(2, '0');
  return `${resultHour}:${resultMinute}`;
}

function InfoPill({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/16 p-3 ring-1 ring-white/20">
      <p className="text-xs font-bold text-sky-100">{label}</p>
      <p className="text-lg font-black text-white">{value}</p>
    </div>
  );
}

function ToggleRow({ title, text, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-sky-50 p-3">
      <div className="min-w-0">
        <p className="font-extrabold text-slate-900">{title}</p>
        <p className="text-sm font-medium text-slate-500">{text}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className="relative h-8 w-14 shrink-0 rounded-full transition"
        style={{ background: checked ? '#1d4ed8' : '#cbd5e1' }}
        aria-pressed={checked}
      >
        <span
          className="absolute top-1 h-6 w-6 rounded-full bg-white shadow transition"
          style={{ left: checked ? 26 : 4 }}
        />
      </button>
    </div>
  );
}

function TimeField({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-extrabold text-slate-700">{label}</span>
      <input
        type="time"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-2xl border border-sky-100 bg-sky-50 px-3 font-bold text-slate-800 outline-none focus:border-blue-500"
      />
    </label>
  );
}

function PermissionCard({ icon: Icon, title, text, status }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-sky-100 p-3">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-700">
        <Icon />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-extrabold text-slate-900">{title}</p>
        <p className="text-sm font-medium text-slate-500">{text}</p>
      </div>
      <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-black text-blue-700">{status}</span>
    </div>
  );
}
