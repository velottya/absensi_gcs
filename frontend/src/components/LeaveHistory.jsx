import { useEffect, useRef, useState } from 'react';
import { FaArrowLeft, FaCalendarAlt, FaEye, FaFileAlt, FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { renderAsync } from 'docx-preview';
import { useAuth } from './AuthContext';

export default function LeaveHistory() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewLeave, setPreviewLeave] = useState(null);
  const [previewError, setPreviewError] = useState('');
  const docxContainerRef = useRef(null);

  useEffect(() => {
    const loadLeaves = async () => {
      try {
        const response = await axios.get('/leaves');
        setLeaves(response.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal memuat riwayat cuti');
      } finally {
        setLoading(false);
      }
    };

    loadLeaves();
  }, []);

  useEffect(() => {
    const loadDocxPreview = async () => {
      if (!previewLeave) return;

      const kind = getEvidenceKind(previewLeave.evidence_path || previewLeave.evidence_url);
      if (kind !== 'docx' || !docxContainerRef.current) return;

      docxContainerRef.current.innerHTML = '';
      setPreviewError('');

      try {
        const response = await axios.get(previewLeave.evidence_url, { responseType: 'arraybuffer' });
        await renderAsync(response.data, docxContainerRef.current, undefined, {
          className: 'docx-viewer',
          inWrapper: false,
          ignoreWidth: false,
          breakPages: true,
        });
      } catch (err) {
        console.error('docx preview error', err);
        setPreviewError('Pratinjau Word gagal dimuat. Silakan unduh file untuk membukanya.');
      }
    };

    loadDocxPreview();

    return () => {
      if (docxContainerRef.current) {
        docxContainerRef.current.innerHTML = '';
      }
    };
  }, [previewLeave]);

  return (
    <div className="min-h-screen bg-[#eef6ff] px-4 py-5">
      <div className="mx-auto max-w-md space-y-4">
        <section className="rounded-[28px] bg-gradient-to-br from-slate-900 via-blue-900 to-sky-700 p-5 text-white shadow-xl shadow-sky-200">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-sky-100">Riwayat Cuti</p>
              <h2 className="mt-1 text-2xl font-black">
                {user?.role === 'admin' ? 'Riwayat Cuti Karyawan' : 'Pengajuan Saya'}
              </h2>
              <p className="mt-1 text-sm font-medium text-sky-50">
                {user?.role === 'admin'
                  ? 'Seluruh cuti karyawan ditampilkan di sini.'
                  : 'Daftar cuti yang pernah Anda ajukan.'}
              </p>
            </div>
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full border-2 border-white/35 bg-white/20 shadow-inner ring-4 ring-white/12">
              <FaCalendarAlt size={25} />
            </span>
          </div>
        </section>

        <div>
          <Link
            to="/leave"
            className="inline-flex items-center gap-2 rounded-2xl border border-sky-100 bg-white px-4 py-3 text-sm font-extrabold text-slate-800 shadow-sm"
          >
            <FaArrowLeft />
            Kembali ke pengajuan cuti
          </Link>
        </div>

        {loading && (
          <div className="rounded-[24px] border border-sky-100 bg-white p-5 text-center font-semibold text-slate-500 shadow-sm">
            Memuat riwayat cuti...
          </div>
        )}

        {error && !loading && (
          <div className="rounded-[24px] border border-rose-100 bg-rose-50 p-4 text-sm font-bold text-rose-700 shadow-sm">
            {error}
          </div>
        )}

        {!loading && !error && leaves.length === 0 && (
          <div className="rounded-[24px] border border-sky-100 bg-white p-5 text-center text-sm font-semibold text-slate-500 shadow-sm">
            Belum ada riwayat cuti.
          </div>
        )}

        <section className="space-y-3">
          {leaves.map((leave) => (
            <article key={leave.id} className="rounded-[24px] border border-sky-100 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-500">{leave.status}</p>
                  <h3 className="mt-1 text-lg font-black text-slate-900">{formatLeaveType(leave.type)}</h3>
                  {user?.role === 'admin' && (
                    <p className="mt-1 text-sm font-bold text-slate-700">
                      {leave.user?.name || 'Karyawan'}
                    </p>
                  )}
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {leave.start_date} - {leave.end_date}
                  </p>
                </div>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sky-50 text-sky-700">
                  <FaFileAlt />
                </span>
              </div>

              {leave.reason && (
                <p className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm font-medium text-slate-700">
                  {leave.reason}
                </p>
              )}

              {leave.evidence_url && (
                <button
                  type="button"
                  onClick={() => {
                    setPreviewError('');
                    setPreviewLeave(leave);
                  }}
                  className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-blue-700 px-4 py-2 text-sm font-extrabold text-white"
                >
                  <FaEye />
                  Lihat bukti
                </button>
              )}
            </article>
          ))}
        </section>

        {previewLeave && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6">
            <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-500">Lihat Bukti</p>
                  <h3 className="text-lg font-black text-slate-900">{formatLeaveType(previewLeave.type)}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewLeave(null)}
                  className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-700"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="flex-1 overflow-auto bg-slate-50 p-4">
                {previewError && (
                  <div className="mb-4 rounded-2xl border border-amber-100 bg-amber-50 p-3 text-sm font-semibold text-amber-900">
                    {previewError}
                  </div>
                )}

                {renderEvidencePreview(previewLeave, docxContainerRef)}
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
                <p className="text-xs font-semibold text-slate-500">File: {getFileName(previewLeave.evidence_path || previewLeave.evidence_url)}</p>
                <a
                  href={previewLeave.evidence_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-2xl bg-slate-900 px-4 py-2 text-sm font-extrabold text-white"
                >
                  Buka / Unduh
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatLeaveType(type) {
  const labels = {
    tahunan: 'Cuti Tahunan',
    sakit: 'Cuti Sakit',
    penting: 'Keperluan Penting',
    melahirkan: 'Cuti Melahirkan',
  };

  return labels[type] || type;
}

function renderEvidencePreview(leave, docxContainerRef) {
  const source = leave.evidence_url;
  const kind = getEvidenceKind(leave.evidence_path || source);

  if (kind === 'image') {
    return <img src={source} alt="Bukti cuti" className="mx-auto max-h-[70vh] w-full rounded-2xl object-contain" />;
  }

  if (kind === 'pdf') {
    return (
      <iframe
        title="Preview PDF"
        src={source}
        className="h-[70vh] w-full rounded-2xl border border-slate-200 bg-white"
      />
    );
  }

  if (kind === 'docx') {
    return (
      <div className="overflow-auto rounded-2xl border border-slate-200 bg-white p-4">
        <div ref={docxContainerRef} />
      </div>
    );
  }

  if (kind === 'word') {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700">
        File Word lama (.doc) tersimpan dengan benar, tetapi browser tidak bisa merender format ini secara native.
        Gunakan tombol Buka / Unduh untuk membukanya di aplikasi Word.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700">
      Pratinjau tidak tersedia untuk tipe file ini.
    </div>
  );
}

function getEvidenceKind(path) {
  const filename = String(path || '').toLowerCase();
  if (filename.endsWith('.png') || filename.endsWith('.jpg') || filename.endsWith('.jpeg') || filename.endsWith('.gif') || filename.endsWith('.webp')) {
    return 'image';
  }
  if (filename.endsWith('.pdf')) return 'pdf';
  if (filename.endsWith('.docx')) return 'docx';
  if (filename.endsWith('.doc')) return 'word';
  return 'unknown';
}

function getFileName(path) {
  const value = String(path || '');
  const parts = value.split('/');
  return parts[parts.length - 1] || 'bukti';
}
