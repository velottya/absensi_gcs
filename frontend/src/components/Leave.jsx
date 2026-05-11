import { useMemo, useState, useEffect } from 'react';
import { FaCalendarAlt, FaFileUpload, FaInfoCircle, FaPaperPlane } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import axios from 'axios';

export default function Leave() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    type: 'datang-terlambat',
    startDate: '',
    endDate: '',
    reason: '',
    evidence: null
  });
  const [submitted, setSubmitted] = useState(false);
  const [leaves, setLeaves] = useState([]);

  const totalDays = useMemo(() => {
    if (!form.startDate || !form.endDate) return 0;
    const start = parseDateInput(form.startDate);
    const end = parseDateInput(form.endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return 0;
    return Math.floor((end - start) / 86400000) + 1;
  }, [form.startDate, form.endDate]);

  const calendarDays = useMemo(() => {
    const anchor = form.startDate ? parseDateInput(form.startDate) : new Date();
    const year = anchor.getFullYear();
    const month = anchor.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const blanks = Array.from({ length: firstDay.getDay() }, () => null);
    const days = Array.from({ length: lastDay.getDate() }, (_, index) => new Date(year, month, index + 1));
    return {
      title: anchor.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
      days: [...blanks, ...days]
    };
  }, [form.startDate]);

  const selectedRange = useMemo(() => {
    const start = form.startDate ? parseDateInput(form.startDate) : null;
    const end = form.endDate ? parseDateInput(form.endDate) : null;
    return { start, end };
  }, [form.startDate, form.endDate]);

  const update = (key, value) => {
    setSubmitted(false);
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submitLeave = (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('type', form.type);
    formData.append('start_date', form.startDate);
    formData.append('end_date', form.endDate);
    formData.append('reason', form.reason || '');
    if (form.evidence) formData.append('evidence', form.evidence);

    if (form.type === 'sakit' && !form.evidence) {
      alert('Untuk jenis izin Sakit, lampiran surat dokter wajib diunggah');
      return;
    }

    axios.post('/leaves', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(() => {
        setSubmitted(true);
        setForm({ type: 'datang-terlambat', startDate: '', endDate: '', reason: '', evidence: null });
        fetchLeaves();
      })
      .catch((err) => {
        console.error(err);
        alert('Gagal mengajukan izin');
      });
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const res = await axios.get('/leaves');
      setLeaves(res.data || []);
    } catch (err) {
      console.error('fetchLeaves error', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#eef6ff] px-4 py-5">
      <div className="mx-auto max-w-md space-y-4">
        <section className="rounded-[28px] bg-gradient-to-br from-blue-700 via-sky-600 to-sky-400 p-5 text-white shadow-xl shadow-sky-200">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-sky-100">Pengajuan Izin</p>
              <h2 className="mt-1 text-2xl font-black">{user?.name || 'Karyawan'}</h2>
              <p className="mt-1 text-sm font-medium text-sky-50">Isi tanggal, keterangan, dan bukti pendukung.</p>
            </div>
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full border-2 border-white/35 bg-white/20 shadow-inner ring-4 ring-white/12">
              <FaCalendarAlt size={25} />
            </span>
          </div>
          <div className="mt-4 flex">
            <Link
              to="/leave/history"
              className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2 text-sm font-extrabold text-white ring-1 ring-white/20 transition hover:bg-white/25"
            >
              Lihat riwayat izin
            </Link>
          </div>
        </section>

        <form onSubmit={submitLeave} className="space-y-4">
          <section className="rounded-[24px] border border-sky-100 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-50 text-blue-700">
                <FaInfoCircle />
              </span>
              <div>
                <h3 className="font-black text-slate-900">Detail Izin</h3>
                <p className="text-sm font-medium text-slate-500">Pilih jenis dan rentang tanggal</p>
              </div>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-extrabold text-slate-700">Jenis izin</span>
              <select
                value={form.type}
                onChange={(event) => update('type', event.target.value)}
                className="h-12 w-full rounded-2xl border border-sky-100 bg-sky-50 px-4 font-bold text-slate-800 outline-none focus:border-blue-500"
              >
                <option value="datang-terlambat">Datang Terlambat</option>
                <option value="sakit">Sakit</option>
                <option value="tidak-masuk-kerja">Tidak Masuk Kerja</option>
                <option value="pulang-lebih-awal">Pulang Lebih Awal</option>
                <option value="meninggalkan-pekerjaan">Meninggalkan Pekerjaan</option>
                <option value="tidak-clocking-in">Tidak Clocking In</option>
                <option value="tidak-clocking-out">Tidak Clocking Out</option>
              </select>
            </label>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <DateField label="Mulai" value={form.startDate} onChange={(value) => update('startDate', value)} />
              <DateField label="Selesai" value={form.endDate} onChange={(value) => update('endDate', value)} />
            </div>

            <div className="mt-4 rounded-[22px] border border-sky-100 bg-sky-50 p-3">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-black text-slate-900">{calendarDays.title}</p>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-blue-700">
                  Kalender
                </span>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-black text-slate-400">
                {['M', 'S', 'S', 'R', 'K', 'J', 'S'].map((day, index) => (
                  <span key={`${day}-${index}`}>{day}</span>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-7 gap-1">
                {calendarDays.days.map((day, index) => (
                  <CalendarDay key={day ? day.toISOString() : `blank-${index}`} day={day} range={selectedRange} />
                ))}
              </div>
            </div>

            <div className="mt-3 rounded-2xl bg-blue-50 p-3">
              <p className="text-sm font-bold text-slate-500">Total kalender</p>
              <p className="text-2xl font-black text-blue-700">{totalDays} hari</p>
            </div>
          </section>

          <section className="rounded-[24px] border border-sky-100 bg-white p-4 shadow-sm">
            <label className="block">
              <span className="mb-2 block text-sm font-extrabold text-slate-700">Keterangan</span>
              <textarea
                value={form.reason}
                onChange={(event) => update('reason', event.target.value)}
                rows={5}
                placeholder="Tuliskan alasan pengajuan izin..."
                className="w-full resize-none rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 font-medium text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500"
              />
            </label>

            <label className="mt-4 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-sky-200 bg-sky-50 px-4 text-center">
              <FaFileUpload className="text-blue-700" size={24} />
              <span className="mt-2 text-sm font-black text-slate-800">Upload bukti</span>
              <span className="mt-1 text-xs font-semibold text-slate-500">
                {form.evidence ? form.evidence.name : 'Surat dokter, dokumen, atau foto pendukung'}
              </span>
              <input
                type="file"
                accept="image/*,.pdf,.doc,.docx"
                className="hidden"
                onChange={(event) => update('evidence', event.target.files?.[0] || null)}
              />
            </label>
          </section>

          {submitted && (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-extrabold text-emerald-700 shadow-sm">
              Ajukan izin berhasil dibuat
            </div>
          )}

          <button
            type="submit"
            className="flex h-14 w-full items-center justify-center gap-2 rounded-[22px] bg-blue-700 font-extrabold text-white shadow-lg shadow-blue-100"
          >
            <FaPaperPlane />
            Ajukan Izin
          </button>
        </form>
      </div>
    </div>
  );
}

function CalendarDay({ day, range }) {
  if (!day) return <span className="h-9" />;

  const dateKey = toDateKey(day);
  const startKey = range.start ? toDateKey(range.start) : '';
  const endKey = range.end ? toDateKey(range.end) : '';
  const inRange = range.start && range.end && day >= startOfDay(range.start) && day <= startOfDay(range.end);
  const isEdge = dateKey === startKey || dateKey === endKey;

  return (
    <span
      className={[
        'grid h-9 place-items-center rounded-xl text-sm font-black',
        isEdge ? 'bg-blue-700 text-white shadow-sm' : inRange ? 'bg-blue-100 text-blue-700' : 'bg-white text-slate-600'
      ].join(' ')}
    >
      {day.getDate()}
    </span>
  );
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function DateField({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-extrabold text-slate-700">{label}</span>
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-2xl border border-sky-100 bg-sky-50 px-3 text-sm font-bold text-slate-800 outline-none focus:border-blue-500"
      />
    </label>
  );
}

function parseDateInput(value) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}
