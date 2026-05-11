import { useEffect, useMemo, useRef, useState } from 'react';
import { FaArrowLeft, FaCalendarAlt, FaEye, FaFileAlt, FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { renderAsync } from 'docx-preview';
import { useAuth } from './AuthContext';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function LeaveHistory() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewLeave, setPreviewLeave] = useState(null);
  const [previewError, setPreviewError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const docxContainerRef = useRef(null);

  const filteredLeaves = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    return leaves.filter((leave) => {
      const typeLabel = formatLeaveType(leave.type).toLowerCase();
      const status = String(leave.status || '').toLowerCase();
      const reason = String(leave.reason || '').toLowerCase();
      const startDate = String(leave.start_date || '').toLowerCase();
      const endDate = String(leave.end_date || '').toLowerCase();
      const userName = String(leave.user?.name || '').toLowerCase();

      const matchesSearch =
        !query ||
        typeLabel.includes(query) ||
        status.includes(query) ||
        reason.includes(query) ||
        startDate.includes(query) ||
        endDate.includes(query) ||
        userName.includes(query);

      const matchesType = typeFilter === 'all' || leave.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [leaves, searchText, statusFilter, typeFilter]);

  const typeOptions = useMemo(() => {
    const uniqueTypes = Array.from(new Set(leaves.map((leave) => leave.type).filter(Boolean)));
    return uniqueTypes.sort((left, right) => formatLeaveType(left).localeCompare(formatLeaveType(right)));
  }, [leaves]);

  const statusOptions = useMemo(() => {
    return Array.from(new Set(leaves.map((leave) => String(leave.status || '').toLowerCase()).filter(Boolean))).sort();
  }, [leaves]);

  const exportFilenameSuffix = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const exportToExcel = () => {
    if (!filteredLeaves.length) return;

    const rows = filteredLeaves.map((leave, index) => ({
      No: index + 1,
      Nama: leave.user?.name || 'Karyawan',
      'Jenis Izin': formatLeaveType(leave.type),
      Status: formatStatus(leave.status),
      Mulai: formatDateLabel(leave.start_date),
      Selesai: formatDateLabel(leave.end_date),
      Keterangan: leave.reason || '-',
      Bukti: leave.evidence_url ? 'Ada' : 'Tidak ada',
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const columnWidths = [
      { wch: 6 },
      { wch: 22 },
      { wch: 22 },
      { wch: 14 },
      { wch: 16 },
      { wch: 16 },
      { wch: 40 },
      { wch: 12 },
    ];
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Riwayat Izin');
    XLSX.writeFile(workbook, `riwayat-izin-${exportFilenameSuffix}.xlsx`);
  };

  const exportToPdf = () => {
    if (!filteredLeaves.length) return;

    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const title = 'Laporan Riwayat Izin';
    const subtitle = user?.role === 'admin' ? 'Seluruh data izin karyawan' : `Data izin milik ${user?.name || 'Karyawan'}`;

    doc.setFontSize(16);
    doc.text(title, 40, 36);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(subtitle, 40, 54);
    doc.text(`Dicetak: ${formatDateTime(new Date())}`, 40, 68);

    autoTable(doc, {
      startY: 82,
      head: [['No', 'Nama', 'Jenis Izin', 'Status', 'Mulai', 'Selesai', 'Keterangan', 'Bukti']],
      body: filteredLeaves.map((leave, index) => [
        String(index + 1),
        leave.user?.name || 'Karyawan',
        formatLeaveType(leave.type),
        formatStatus(leave.status),
        formatDateLabel(leave.start_date),
        formatDateLabel(leave.end_date),
        leave.reason || '-',
        leave.evidence_url ? 'Ada' : 'Tidak ada',
      ]),
      styles: {
        fontSize: 8,
        cellPadding: 4,
        valign: 'middle',
      },
      headStyles: {
        fillColor: [30, 64, 175],
      },
      alternateRowStyles: {
        fillColor: [241, 245, 249],
      },
      margin: { left: 40, right: 40 },
    });

    doc.save(`riwayat-izin-${exportFilenameSuffix}.pdf`);
  };

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
              <p className="text-sm font-semibold text-sky-100">Riwayat Izin</p>
              <h2 className="mt-1 text-2xl font-black">
                {user?.role === 'admin' ? 'Riwayat Izin Karyawan' : 'Pengajuan Saya'}
              </h2>
              <p className="mt-1 text-sm font-medium text-sky-50">
                {user?.role === 'admin'
                  ? 'Seluruh izin karyawan ditampilkan di sini.'
                  : 'Daftar izin yang pernah Anda ajukan.'}
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
            Kembali ke pengajuan izin
          </Link>
        </div>

        {!loading && !error && leaves.length > 0 && (
          <section className="rounded-[24px] border border-sky-100 bg-white p-4 shadow-sm">
            <div className="space-y-3">
              <label className="block">
                <span className="mb-2 block text-sm font-extrabold text-slate-700">Cari history</span>
                <input
                  type="text"
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Cari nama, alasan, tanggal, atau jenis izin..."
                  className="h-12 w-full rounded-2xl border border-sky-100 bg-sky-50 px-4 text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500"
                />
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-extrabold text-slate-700">Filter jenis</span>
                  <select
                    value={typeFilter}
                    onChange={(event) => setTypeFilter(event.target.value)}
                    className="h-12 w-full rounded-2xl border border-sky-100 bg-sky-50 px-4 text-sm font-bold text-slate-800 outline-none focus:border-blue-500"
                  >
                    <option value="all">Semua jenis</option>
                    {typeOptions.map((type) => (
                      <option key={type} value={type}>
                        {formatLeaveType(type)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold text-slate-500">
                  Menampilkan <span className="font-black text-slate-800">{filteredLeaves.length}</span> dari{' '}
                  <span className="font-black text-slate-800">{leaves.length}</span> data
                </p>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={exportToExcel}
                    disabled={!filteredLeaves.length}
                    className="rounded-2xl bg-emerald-600 px-4 py-2 text-xs font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Export Excel
                  </button>
                  <button
                    type="button"
                    onClick={exportToPdf}
                    disabled={!filteredLeaves.length}
                    className="rounded-2xl bg-rose-600 px-4 py-2 text-xs font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Export PDF
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {loading && (
          <div className="rounded-[24px] border border-sky-100 bg-white p-5 text-center font-semibold text-slate-500 shadow-sm">
            Memuat riwayat izin...
          </div>
        )}

        {error && !loading && (
          <div className="rounded-[24px] border border-rose-100 bg-rose-50 p-4 text-sm font-bold text-rose-700 shadow-sm">
            {error}
          </div>
        )}

        {!loading && !error && leaves.length === 0 && (
          <div className="rounded-[24px] border border-sky-100 bg-white p-5 text-center text-sm font-semibold text-slate-500 shadow-sm">
            Belum ada riwayat izin.
          </div>
        )}

        {!loading && !error && leaves.length > 0 && filteredLeaves.length === 0 && (
          <div className="rounded-[24px] border border-sky-100 bg-white p-5 text-center text-sm font-semibold text-slate-500 shadow-sm">
            Tidak ada riwayat yang cocok dengan pencarian atau filter.
          </div>
        )}

        <section className="space-y-3">
          {filteredLeaves.map((leave) => (
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
                <div className="mt-3">
                  {getEvidenceKind(leave.evidence_path || leave.evidence_url) === 'image' ? (
                    <img
                      src={leave.evidence_url}
                      alt="Bukti"
                      onClick={() => {
                        setPreviewError('');
                        setPreviewLeave(leave);
                      }}
                      className="w-full max-h-44 object-cover rounded-xl border shadow-sm cursor-pointer"
                    />
                  ) : (
                    <div className="flex items-center gap-3 rounded-xl border p-3 bg-white">
                      <FaFileAlt className="text-slate-700" />
                      <div className="text-sm font-semibold text-slate-700">{getFileName(leave.evidence_path || leave.evidence_url)}</div>
                      <a href={leave.evidence_url} target="_blank" rel="noreferrer" className="ml-auto text-xs text-blue-700 font-bold">
                        Buka / Unduh
                      </a>
                    </div>
                  )}
                  <div className="mt-2 text-xs text-slate-500 flex items-center gap-3">
                    <div className="inline-block px-2 py-1 bg-slate-100 rounded text-xs font-semibold">{getEvidenceKind(leave.evidence_path || leave.evidence_url)}</div>
                    <div>Diunggah: {formatDateTime(leave.created_at || leave.updated_at || leave.date)}</div>
                  </div>
                </div>
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
    'datang-terlambat': 'Datang Terlambat',
    sakit: 'Sakit',
    'tidak-masuk-kerja': 'Tidak Masuk Kerja',
    'pulang-lebih-awal': 'Pulang Lebih Awal',
    'meninggalkan-pekerjaan': 'Meninggalkan Pekerjaan',
    'tidak-clocking-in': 'Tidak Clocking In',
    'tidak-clocking-out': 'Tidak Clocking Out',
  };

  return labels[type] || type;
}

function formatStatus(status) {
  const normalized = String(status || '').toLowerCase();
  const labels = {
    pending: 'Pending',
    approved: 'Disetujui',
    rejected: 'Ditolak',
  };

  return labels[normalized] || normalized;
}

function formatDateLabel(value) {
  if (!value) return '-';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

function formatDateTime(value) {
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) return '-';

  return parsed.toLocaleString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function renderEvidencePreview(leave, docxContainerRef) {
  const source = leave.evidence_url;
  const kind = getEvidenceKind(leave.evidence_path || source);

  if (kind === 'image') {
    return <img src={source} alt="Bukti izin" className="mx-auto max-h-[70vh] w-full rounded-2xl object-contain" />;
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
