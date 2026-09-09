import React, { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Assessment, NotificationLog } from "../types";
import { TrendingUp, BarChart2, Bell, GraduationCap, School, ShieldAlert } from "lucide-react";

interface AnalyticsDashboardProps {
  assessments: Assessment[];
  notifications: NotificationLog[];
}

export default function AnalyticsDashboard({ assessments, notifications }: AnalyticsDashboardProps) {
  // If no assessments exist yet, we show a friendly empty state or aggregate statistics
  const totalAssessments = assessments.length;
  
  // Calculate category aggregates
  const categoriesCount = assessments.reduce((acc, curr) => {
    const cat = curr.finalCategory.split(" ")[0]; // "A", "B", "C", "D"
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = [
    { name: "A (Sangat Baik)", value: categoriesCount["A"] || 0, color: "#10b981" },
    { name: "B (Baik)", value: categoriesCount["B"] || 0, color: "#3b82f6" },
    { name: "C (Cukup)", value: categoriesCount["C"] || 0, color: "#f59e0b" },
    { name: "D (Kurang)", value: categoriesCount["D"] || 0, color: "#ef4444" }
  ].filter(d => d.value > 0);

  // If pieData is empty, we show standard illustrative ratios
  const samplePieData = [
    { name: "A (Sangat Baik)", value: 4, color: "#10b981" },
    { name: "B (Baik)", value: 6, color: "#3b82f6" },
    { name: "C (Cukup)", value: 2, color: "#f59e0b" },
    { name: "D (Kurang)", value: 1, color: "#ef4444" }
  ];

  // Calculate Average Score by Instrument Category (Capaian Standar Pendidikan)
  // For Akademik:
  // I-A: items 1-3, I-B: 4-9, I-C: 10-19, I-D: 20-27, II: 28-33, III: 34-38, IV: 39-42, V: 43-50, VI: 51-58
  const getAverageCategoryScores = () => {
    const academicAssessments = assessments.filter(a => a.type === "Akademik");
    if (academicAssessments.length === 0) {
      // Return sample data representing standard averages
      return [
        { name: "Pedagogik (I)", score: 82 },
        { name: "Profesional (II)", score: 78 },
        { name: "Literasi/Num (III)", score: 71 },
        { name: "Teknologi (IV)", score: 85 },
        { name: "Refleksi Guru (V)", score: 74 },
        { name: "Aspek Pengawas (VI)", score: 80 }
      ];
    }

    const totals = { pedagogik: 0, profesional: 0, literasi: 0, teknologi: 0, refleksi: 0, pengawas: 0 };
    const counts = { pedagogik: 0, profesional: 0, literasi: 0, teknologi: 0, refleksi: 0, pengawas: 0 };

    academicAssessments.forEach(ass => {
      Object.entries(ass.scores).forEach(([itemNum, val]) => {
        const id = Number(itemNum);
        const scorePct = (val / 4) * 100;
        if (id <= 27) {
          totals.pedagogik += scorePct;
          counts.pedagogik++;
        } else if (id <= 33) {
          totals.profesional += scorePct;
          counts.profesional++;
        } else if (id <= 38) {
          totals.literasi += scorePct;
          counts.literasi++;
        } else if (id <= 42) {
          totals.teknologi += scorePct;
          counts.teknologi++;
        } else if (id <= 50) {
          totals.refleksi += scorePct;
          counts.refleksi++;
        } else {
          totals.pengawas += scorePct;
          counts.pengawas++;
        }
      });
    });

    return [
      { name: "Pedagogik (I)", score: counts.pedagogik ? Math.round(totals.pedagogik / counts.pedagogik) : 0 },
      { name: "Profesional (II)", score: counts.profesional ? Math.round(totals.profesional / counts.profesional) : 0 },
      { name: "Literasi/Num (III)", score: counts.literasi ? Math.round(totals.literasi / counts.literasi) : 0 },
      { name: "Teknologi (IV)", score: counts.teknologi ? Math.round(totals.teknologi / counts.teknologi) : 0 },
      { name: "Refleksi Guru (V)", score: counts.refleksi ? Math.round(totals.refleksi / counts.refleksi) : 0 },
      { name: "Aspek Pengawas (VI)", score: counts.pengawas ? Math.round(totals.pengawas / counts.pengawas) : 0 }
    ];
  };

  const getManagerialCategoryScores = () => {
    const managerialAssessments = assessments.filter(a => a.type === "Manajerial");
    if (managerialAssessments.length === 0) {
      return [
        { name: "Perencanaan", score: 85 },
        { name: "Kurikulum", score: 76 },
        { name: "SDM PTK", score: 80 },
        { name: "Sarpras", score: 68 },
        { name: "Keuangan", score: 72 },
        { name: "Humas & SIM", score: 88 },
        { name: "Kepemimpinan", score: 82 }
      ];
    }

    const totals = { I: 0, II: 0, III: 0, IV: 0, V: 0, VI: 0, VII: 0 };
    const counts = { I: 0, II: 0, III: 0, IV: 0, V: 0, VI: 0, VII: 0 };

    managerialAssessments.forEach(ass => {
      Object.entries(ass.scores).forEach(([itemNum, val]) => {
        const id = Number(itemNum);
        const scorePct = (val / 4) * 100;
        if (id <= 4) {
          totals.I += scorePct; counts.I++;
        } else if (id <= 9) {
          totals.II += scorePct; counts.II++;
        } else if (id <= 14) {
          totals.III += scorePct; counts.III++;
        } else if (id <= 18) {
          totals.IV += scorePct; counts.IV++;
        } else if (id <= 22) {
          totals.V += scorePct; counts.V++;
        } else if (id <= 26) {
          totals.VI += scorePct; counts.VI++;
        } else if (id <= 31) {
          totals.VII += scorePct; counts.VII++;
        }
      });
    });

    return [
      { name: "Perencanaan (I)", score: counts.I ? Math.round(totals.I / counts.I) : 0 },
      { name: "Kurikulum (II)", score: counts.II ? Math.round(totals.II / counts.II) : 0 },
      { name: "SDM PTK (III)", score: counts.III ? Math.round(totals.III / counts.III) : 0 },
      { name: "Sarpras (IV)", score: counts.IV ? Math.round(totals.IV / counts.IV) : 0 },
      { name: "Keuangan (V)", score: counts.V ? Math.round(totals.V / counts.V) : 0 },
      { name: "Humas & SIM (VI)", score: counts.VI ? Math.round(totals.VI / counts.VI) : 0 },
      { name: "Kepemimpinan (VII)", score: counts.VII ? Math.round(totals.VII / counts.VII) : 0 }
    ];
  };

  // Performance Trend Over Time
  const getTrendData = () => {
    if (assessments.length === 0) {
      return [
        { date: "Jan 2026", Akademik: 75, Manajerial: 78, Sekolah: "SMP Harapan Bangsa" },
        { date: "Feb 2026", Akademik: 80, Manajerial: 74, Sekolah: "SMP Harapan Bangsa" },
        { date: "Mar 2026", Akademik: 78, Manajerial: 82, Sekolah: "SMA Negeri 1" },
        { date: "Apr 2026", Akademik: 84, Manajerial: 80, Sekolah: "SMA Negeri 1" },
        { date: "Mei 2026", Akademik: 86, Manajerial: 85, Sekolah: "SMA Negeri 1" }
      ];
    }

    // Sort by date and format
    const sorted = [...assessments].sort((a, b) => 
      new Date(a.metadata.observationDate).getTime() - new Date(b.metadata.observationDate).getTime()
    );

    return sorted.map(a => ({
      date: new Date(a.metadata.observationDate).toLocaleDateString("id-ID", { month: "short", year: "2-digit" }),
      [a.type]: Math.round(a.finalScore),
      Sekolah: a.metadata.schoolName.substring(0, 15) + "..."
    }));
  };

  const trendData = getTrendData();
  const academicData = getAverageCategoryScores();
  const managerialData = getManagerialCategoryScores();

  return (
    <div className="space-y-6">
      {/* Top Aggregates */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
            <School className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider leading-none mb-1">Total Supervisi</span>
            <span className="text-xl font-bold text-slate-800 font-display">{totalAssessments} Laporan</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider leading-none mb-1">Rerata Akademik</span>
            <span className="text-xl font-bold text-slate-800 font-display">
              {assessments.filter(a => a.type === "Akademik").length > 0 
                ? (assessments.filter(a => a.type === "Akademik").reduce((sum, curr) => sum + curr.finalScore, 0) / assessments.filter(a => a.type === "Akademik").length).toFixed(1)
                : "80.4"
              }%
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider leading-none mb-1">Rerata Manajerial</span>
            <span className="text-xl font-bold text-slate-800 font-display">
              {assessments.filter(a => a.type === "Manajerial").length > 0 
                ? (assessments.filter(a => a.type === "Manajerial").reduce((sum, curr) => sum + curr.finalScore, 0) / assessments.filter(a => a.type === "Manajerial").length).toFixed(1)
                : "79.1"
              }%
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-lg shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider leading-none mb-1">Notifikasi Terkirim</span>
            <span className="text-xl font-bold text-slate-800 font-display">{notifications.length} Sukses</span>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Trend Historis */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-800 text-xs tracking-wider uppercase font-display flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" /> TREN KINERJA HISTORIS (%)
            </h3>
            {totalAssessments === 0 && <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-bold uppercase">Contoh Visualisasi</span>}
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[0, 100]} />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, marginTop: 10 }} />
                <Line type="monotone" dataKey="Akademik" stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 8 }} connectNulls />
                <Line type="monotone" dataKey="Manajerial" stroke="#ec4899" strokeWidth={3} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sebaran Predikat */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-800 text-xs tracking-wider uppercase font-display flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-emerald-500" /> DISTRIBUSI MUTU KINERJA
            </h3>
            {totalAssessments === 0 && <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-bold uppercase">Contoh Visualisasi</span>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center h-[280px]">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={totalAssessments > 0 ? pieData : samplePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {(totalAssessments > 0 ? pieData : samplePieData).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {(totalAssessments > 0 ? pieData : samplePieData).map((entry, index) => (
                <div key={index} className="flex items-center justify-between border-b border-slate-100 pb-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                    <span className="text-slate-600 font-medium">{entry.name}</span>
                  </div>
                  <span className="font-bold text-slate-800">{entry.value} Berkas</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Standar Pendidikan Capaian */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Capaian Akademik */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-800 text-xs tracking-wider uppercase font-display">
              🎯 ANALISIS CAPAIAN STANDAR AKADEMIK (%)
            </h3>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={academicData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={25}>
                  {academicData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.score >= 80 ? "#10b981" : entry.score >= 70 ? "#3b82f6" : "#f59e0b"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Capaian Manajerial */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-800 text-xs tracking-wider uppercase font-display">
              🏢 ANALISIS CAPAIAN STANDAR MANAJERIAL (%)
            </h3>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={managerialData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="score" fill="#ec4899" radius={[4, 4, 0, 0]} barSize={25}>
                  {managerialData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.score >= 80 ? "#10b981" : entry.score >= 70 ? "#3b82f6" : "#f59e0b"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Notifications History Log */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <h3 className="font-bold text-slate-800 text-xs tracking-wider uppercase font-display mb-3 flex items-center gap-2">
          <Bell className="w-4.5 h-4.5 text-indigo-600" /> LOG PENGIRIMAN NOTIFIKASI OTOMATIS
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 uppercase font-semibold">
                <th className="p-3">Waktu Kirim</th>
                <th className="p-3">Satuan Pendidikan</th>
                <th className="p-3">Penerima Sasaran</th>
                <th className="p-3">Tipe</th>
                <th className="p-3">Saluran</th>
                <th className="p-3">Status</th>
                <th className="p-3">Isi Pesan Notifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {notifications.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50">
                  <td className="p-3 whitespace-nowrap text-slate-400">
                    {new Date(log.sentAt).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}
                  </td>
                  <td className="p-3 font-semibold text-slate-800">{log.schoolName}</td>
                  <td className="p-3 font-medium text-indigo-600">{log.targetName}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${log.type === "Akademik" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"}`}>
                      {log.type}
                    </span>
                  </td>
                  <td className="p-3 text-slate-500 font-medium">{log.channel}</td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full font-bold">
                      ● Sukses
                    </span>
                  </td>
                  <td className="p-3 max-w-xs truncate text-slate-500" title={log.message}>
                    {log.message}
                  </td>
                </tr>
              ))}
              {notifications.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-slate-400">
                    Belum ada riwayat notifikasi terkirim. Buat supervisi baru dan kirim notifikasi!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
