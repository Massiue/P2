import React, { useEffect, useMemo, useState } from 'react';
import api from '../../api/client';
import { AlertTriangle, BarChart3, CheckCircle2, Clock3, FileDown, FileSpreadsheet, TrendingUp, Trash2 } from 'lucide-react';
import { formatAppDateTime } from '../../utils/date';

const reportCards = [
  { key: 'totalComplaints', label: 'Total Complaints', icon: BarChart3, tone: 'slate' },
  { key: 'pendingComplaints', label: 'Pending', icon: AlertTriangle, tone: 'amber' },
  { key: 'inProgressComplaints', label: 'In Progress', icon: Clock3, tone: 'blue' },
  { key: 'completedComplaints', label: 'Completed', icon: CheckCircle2, tone: 'emerald' },
];

const toneStyles = {
  slate: 'bg-slate-900 text-white border-slate-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-100',
  blue: 'bg-blue-50 text-blue-700 border-blue-100',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
};

const formatDate = (value) => {
  return value ? formatAppDateTime(value) : 'N/A';
};

const escapeCsvValue = (value) => {
  const normalized = value == null ? '' : String(value);
  return `"${normalized.replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
};

const escapePdfText = (value) =>
  String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\r?\n/g, ' ')
    .replace(/[^\x20-\x7E]/g, '?');

const createBlobDownload = (filename, content, type) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const buildCsv = (complaints) => {
  const header = [
    'Complaint ID',
    'Street light no',
    'Area',
    'Description',
    'Status',
    'Citizen Name',
    'Citizen Email',
    'Citizen Phone',
    'Assigned Staff',
    'Staff Phone',
    'Created At',
    'Updated At',
  ];

  const rows = complaints.map((complaint) => [
    complaint.id,
    complaint.pole_number,
    complaint.area,
    complaint.description,
    complaint.status,
    complaint.citizen_name,
    complaint.citizen_email,
    complaint.citizen_phone,
    complaint.staff_name || '',
    complaint.staff_phone || '',
    formatDate(complaint.created_at),
    formatDate(complaint.updated_at),
  ]);

  return [header, ...rows]
    .map((row) => row.map(escapeCsvValue).join(','))
    .join('\r\n');
};

const buildPdf = (summary, complaints) => {
  const lines = [
    'Smart LED Street Lighting Report',
    `Generated: ${new Date().toISOString()}`,
    '',
    'Summary Statistics',
    `- Total Complaints: ${summary.totalComplaints}`,
    `- Pending: ${summary.pendingComplaints}`,
    `- In Progress: ${summary.inProgressComplaints}`,
    `- Completed: ${summary.completedComplaints}`,
    `- Total Staff: ${summary.totalStaff}`,
    `- Total Street Lights: ${summary.totalStreetLights}`,
    `- Faulty Street Lights: ${summary.faultyStreetLights}`,
    '',
    'Recent Complaint Snapshot',
      ...complaints.slice(0, 15).map((complaint) =>
      `#${complaint.id} | Street light no ${complaint.pole_number} | ${complaint.area} | ${complaint.status} | ${String(complaint.description || '').slice(0, 72)}`
    ),
  ];

  const pages = [];
  const linesPerPage = 34;
  for (let index = 0; index < lines.length; index += linesPerPage) {
    pages.push(lines.slice(index, index + linesPerPage));
  }

  const objects = [];
  const fontObjectId = 3;
  const firstPageObjectId = 4;

  objects.push({ id: 1, body: '<< /Type /Catalog /Pages 2 0 R >>' });
  objects.push({ id: 2, body: `<< /Type /Pages /Kids [${pages.map((_, index) => `${firstPageObjectId + index * 2 + 1} 0 R`).join(' ')}] /Count ${pages.length} >>` });
  objects.push({ id: fontObjectId, body: '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>' });

  pages.forEach((pageLines, pageIndex) => {
    const contentObjectId = firstPageObjectId + pageIndex * 2;
    const pageObjectId = contentObjectId + 1;
    const contentLines = [
      'BT',
      '/F1 12 Tf',
      '50 790 Td',
      ...pageLines.map((line, lineIndex) => `${lineIndex === 0 ? '' : '0 -16 Td '}${`(${escapePdfText(line)}) Tj`}`),
      'ET',
    ].join('\n');

    objects.push({
      id: contentObjectId,
      body: `<< /Length ${contentLines.length} >>\nstream\n${contentLines}\nendstream`,
    });

    objects.push({
      id: pageObjectId,
      body:
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] ` +
        `/Resources << /Font << /F1 ${fontObjectId} 0 R >> >> ` +
        `/Contents ${contentObjectId} 0 R >>`,
    });
  });

  objects.sort((left, right) => left.id - right.id);

  let pdf = '%PDF-1.4\n';
  const offsets = new Map();

  objects.forEach((object) => {
    offsets.set(object.id, pdf.length);
    pdf += `${object.id} 0 obj\n${object.body}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  const maxId = objects[objects.length - 1]?.id || 0;

  pdf += `xref\n0 ${maxId + 1}\n`;
  pdf += '0000000000 65535 f \n';

  for (let id = 1; id <= maxId; id += 1) {
    const offset = offsets.get(id) || 0;
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${maxId + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return pdf;
};

const Reports = () => {
  const [stats, setStats] = useState({
    totalComplaints: 0,
    pendingComplaints: 0,
    inProgressComplaints: 0,
    completedComplaints: 0,
    totalStaff: 0,
    totalStreetLights: 0,
    faultyStreetLights: 0,
  });
  const [complaints, setComplaints] = useState([]);
  const [faultyLights, setFaultyLights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(null);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const [statsRes, complaintsRes, lightsRes] = await Promise.all([
          api.get('/complaints/stats'),
          api.get('/complaints/all'),
          api.get('/lights'),
        ]);

        setStats(statsRes.data.stats || {});
        setComplaints(complaintsRes.data.complaints || []);
        setFaultyLights((lightsRes.data.streetLights || []).filter((light) => light.status === 'faulty'));
      } catch (error) {
        console.error('Failed to load report data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  const summaryItems = useMemo(() => reportCards, []);

  const handleCsvExport = () => {
    setExporting('csv');
    const csv = buildCsv(complaints);
    createBlobDownload(`complaints-report-${new Date().toISOString().slice(0, 10)}.csv`, csv, 'text/csv;charset=utf-8;');
    setExporting(null);
  };

  const handlePdfExport = () => {
    setExporting('pdf');
    const pdf = buildPdf(stats, complaints);
    createBlobDownload(`complaints-report-${new Date().toISOString().slice(0, 10)}.pdf`, pdf, 'application/pdf');
    setExporting(null);
  };

  const refreshReports = async () => {
    setLoading(true);
    try {
      const [statsRes, complaintsRes, lightsRes] = await Promise.all([
        api.get('/complaints/stats'),
        api.get('/complaints/all'),
        api.get('/lights'),
      ]);

      setStats(statsRes.data.stats || {});
      setComplaints(complaintsRes.data.complaints || []);
      setFaultyLights((lightsRes.data.streetLights || []).filter((light) => light.status === 'faulty'));
    } catch (error) {
      console.error('Failed to refresh report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFaultyLight = async (lightId) => {
    const confirmed = window.confirm('Remove this faulty street light node from inventory?');
    if (!confirmed) return;

    try {
      await api.delete(`/lights/${lightId}`);
      setFaultyLights((prev) => prev.filter((item) => item.id !== lightId));
      refreshReports();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to remove faulty node.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-slate-200 bg-slate-50 text-slate-900 shadow-sm overflow-hidden">
        <div className="relative p-6 sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(239,68,68,0.08),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.08),_transparent_26%)]" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
              Reports
            </div>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Reports</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
              Export complaint data and view summary statistics.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={handlePdfExport}
                disabled={loading || exporting === 'pdf'}
                className="inline-flex items-center gap-3 rounded-xl bg-[#e53935] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition hover:bg-[#d32f2f] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <FileDown className="h-5 w-5" />
                {exporting === 'pdf' ? 'Exporting PDF...' : 'Export PDF'}
              </button>
              <button
                onClick={handleCsvExport}
                disabled={loading || exporting === 'csv'}
                className="inline-flex items-center gap-3 rounded-xl bg-[#0f9d58] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-[#0b8043] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <FileSpreadsheet className="h-5 w-5" />
                {exporting === 'csv' ? 'Exporting CSV...' : 'Export Excel (CSV)'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.key} className={`rounded-2xl border p-5 ${toneStyles[item.tone]}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{item.label}</p>
                  <div className="mt-2 text-3xl font-extrabold">{stats[item.key] ?? 0}</div>
                </div>
                <div className="rounded-2xl border border-current/10 bg-white p-3">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Staff</p>
          <div className="mt-2 text-3xl font-extrabold text-white">{stats.totalStaff}</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Street Lights</p>
          <div className="mt-2 text-3xl font-extrabold text-white">{stats.totalStreetLights}</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Faulty Nodes</p>
          <div className="mt-2 text-3xl font-extrabold text-white">{stats.faultyStreetLights}</div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Faulty Nodes</h2>
            <p className="text-sm text-slate-400">Remove failed nodes directly from street light inventory.</p>
          </div>
        </div>

        {faultyLights.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-6 text-center text-slate-400">
            No faulty nodes found in the inventory.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3">Pole #</th>
                  <th className="p-3">Area</th>
                  <th className="p-3">Latitude</th>
                  <th className="p-3">Longitude</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {faultyLights.map((light) => (
                  <tr key={light.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-mono text-amber-400">{light.pole_number}</td>
                    <td className="p-3 text-slate-200">{light.area}</td>
                    <td className="p-3 text-slate-400">{light.latitude ?? '—'}</td>
                    <td className="p-3 text-slate-400">{light.longitude ?? '—'}</td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveFaultyLight(light.id)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/20 transition text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove Faulty Node
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-sm text-slate-400">Loading report data...</div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">Latest export data</h2>
              <p className="text-sm text-slate-400">CSV includes every complaint; PDF includes a short executive summary.</p>
            </div>
            <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              {complaints.length} records ready
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Street light no</th>
                  <th className="p-3">Area</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Citizen</th>
                  <th className="p-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 bg-slate-950/40">
                {complaints.slice(0, 5).map((complaint) => (
                  <tr key={complaint.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-semibold text-amber-400">{complaint.pole_number}</td>
                    <td className="p-3 text-slate-200">{complaint.area}</td>
                    <td className="p-3 text-slate-300">{complaint.status}</td>
                    <td className="p-3 text-slate-300">{complaint.citizen_name}</td>
                    <td className="p-3 text-slate-400">{formatDate(complaint.created_at)}</td>
                  </tr>
                ))}
                {complaints.length === 0 && (
                  <tr>
                    <td className="p-6 text-center text-slate-500" colSpan="5">
                      No complaint data available yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
