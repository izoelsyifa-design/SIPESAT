import React from "react";
import { BookOpen, Award, Info, FileSpreadsheet } from "lucide-react";

export default function Branding() {
  return (
    <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 md:p-8 rounded-2xl shadow-xl mb-6 border border-slate-800">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 px-3 py-1 rounded-full text-indigo-300 text-xs font-semibold tracking-wider uppercase mb-3">
              <Award className="w-4 h-4" /> PermenpanRB No. 7 Tahun 2026
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
              SIPESAT: Aplikasi Pengawasan Akademik & Manajerial
            </h1>
            <p className="mt-2 text-slate-300 text-sm md:text-base leading-relaxed">
              Sistem Penilaian, Evaluasi, dan Analisis Terstruktur untuk Pengawas Sekolah Ahli Muda & Ahli Madya. 
              Membantu efisiensi pelaporan, analisis standar nasional pendidikan, dan diseminasi rekomendasi berbasis AI secara otomatis.
            </p>
          </div>
          
          <div className="flex flex-col items-start md:items-end shrink-0 bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl">
            <span className="text-xs text-slate-400">Pengembang Utama:</span>
            <span className="text-lg font-bold text-indigo-300">Zulfian Yusmana, M.Pd.</span>
            <span className="text-xs text-slate-400 mt-1">Pengawas Sekolah Ahli</span>
          </div>
        </div>

        <hr className="my-6 border-slate-800" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300">
          <div className="flex gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-300 h-fit">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-200 mb-1">Pengawas Ahli Muda (Analisis Mutu)</h4>
              <p className="leading-relaxed text-slate-400">
                Fokus utama pada <strong>Analisis Mutu</strong> (Akademik & Manajerial) di satuan pendidikan formal. Menilai kompetensi guru, literasi/numerasi, teknologi, dan merumuskan analisis kesesuaian.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-300 h-fit">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-200 mb-1">Pengawas Ahli Madya (Pengendalian & Pengembangan)</h4>
              <p className="leading-relaxed text-slate-400">
                Fokus utama pada <strong>Pengendalian & Pengembangan Mutu</strong>. Mengendalikan konsistensi implementasi SNP, membimbing penyusunan program perbaikan, dan merancang model tata kelola tereplikasi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
