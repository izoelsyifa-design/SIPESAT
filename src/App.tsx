import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Assessment, NotificationLog } from "./types";
import Branding from "./components/Branding";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import AssessmentForm from "./components/AssessmentForm";
import HistoryList from "./components/HistoryList";
import GoogleDriveModal from "./components/GoogleDriveModal";
import { 
  LayoutDashboard, 
  FileSignature, 
  Archive, 
  Bell, 
  BookOpen, 
  ChevronRight,
  Info,
  CheckCircle,
  HelpCircle,
  Mail,
  HardDrive
} from "lucide-react";

// ==========================================
// PRE-DEFINED SEED DATA FOR FIRST LAUNCH
// ==========================================
const SEED_ASSESSMENTS: Assessment[] = [
  {
    id: "seed-1",
    type: "Akademik",
    metadata: {
      id: "seed-1",
      supervisorName: "Zulfian Yusmana, M.Pd.",
      supervisorNip: "19850412 201101 1 002",
      supervisorLevel: "Ahli Muda",
      supervisorUnit: "Dinas Pendidikan Kabupaten",
      supervisorWilayah: "Binaan Kecamatan Sukamakmur",
      schoolName: "SMA Negeri 1 Permata",
      schoolNpsn: "10204859",
      schoolAddress: "Jl. Pendidikan No. 45, Sukamakmur",
      schoolRombel: "18 Rombel",
      teacherName: "Budi Santoso, S.Pd.",
      teacherNip: "19910815 201802 2 004",
      subjectOrClass: "Fisika / Kelas XI-IPA",
      teacherLevel: "Penata Muda / III-a",
      certified: "Sudah",
      teachingHours: "24 Jam",
      observationDate: "2026-07-15",
      createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString()
    },
    scores: {
      1: 4, 2: 3, 3: 4, 4: 3, 5: 3, 6: 4, 7: 3, 8: 4, 9: 3, 10: 4,
      11: 4, 12: 3, 13: 4, 14: 3, 15: 4, 16: 3, 17: 4, 18: 3, 19: 4, 20: 3,
      21: 4, 22: 3, 23: 4, 24: 3, 25: 3, 26: 4, 27: 4, 28: 3, 29: 3, 30: 4,
      31: 4, 32: 3, 33: 4, 34: 3, 35: 3, 36: 4, 37: 3, 38: 4, 39: 4, 40: 3,
      41: 4, 42: 3, 43: 3, 44: 4, 45: 4, 46: 3, 47: 4, 48: 3, 49: 4, 50: 3,
      51: 4, 52: 3, 53: 4, 54: 3, 55: 4, 56: 3, 57: 4, 58: 4
    },
    notes: {
      "I-A": "Guru terbukti konsisten melakukan apersepsi kognitif dan memetakan gaya belajar sebelum memulai unit.",
      "I-B": "Modul ajar disusun secara mandiri, mengintegrasikan P5 dan diferensiasi konten dengan sangat bervariasi.",
      "I-C": "Pengelolaan waktu dan suasana kelas dinilai sangat hidup, interaktif, dan berpusat penuh pada murid.",
      "I-D": "Evaluasi formatif dilaksanakan rutin melalui portofolio digital dan kuis interaktif yang mendidik.",
      "II": "Penguasaan materi Fisika sangat mendalam dan kontekstual, terbukti dengan pengembangan alat peraga mandiri.",
      "III": "Sangat baik dalam pembiasaan penyajian grafik kuantitatif serta interpretasi data pada materi Fisika.",
      "IV": "Guru terampil memanfaatkan Chromebook, platform Canva, dan Quizizz untuk mendukung pembelajaran aktif.",
      "V": "Rutin melakukan refleksi sejawat, aktif di MGMP Kabupaten, dan memiliki portofolio pengembangan diri lengkap.",
      "VI": "Pengawas menganalisis kesesuaian administrasi dan proses secara mendalam untuk dasar program pembinaan lanjutan."
    },
    strengths: "Memiliki kekuatan yang sangat unggul pada integrasi teknologi digital (Skor 4), pengelolaan pembelajaran berpusat pada murid yang interaktif, dan penyusunan modul ajar mandiri berbasis diferensiasi konten. Karakter dan kedisiplinan guru dinilai sangat menginspirasi sejawat.",
    developments: "Perlu didorong untuk memperluas publikasi karya inovatif hasil Penelitian Tindakan Kelas (PTK) ke tingkat provinsi atau jurnal ilmiah terakreditasi guna mendukung diseminasi mutu yang lebih luas.",
    actionPlan: [
      { id: "1", plan: "Diseminasi Praktik Baik Pembelajaran Diferensiasi Berbasis Teknologi", strategy: "Workshop Pengimbasan di MGMP Fisika Kabupaten", pic: "Budi Santoso, S.Pd. & Pengawas Sekolah", targetTime: "1 Bulan", successIndicator: "Terlaksananya sharing session dengan 15 rekan sejawat" },
      { id: "2", plan: "Publikasi Karya Ilmiah PTK di Jurnal Pendidikan", strategy: "Pendampingan Klinis Penulisan Karya Ilmiah", pic: "Guru & Pengawas Ahli Muda", targetTime: "3 Bulan", successIndicator: "Draft PTK siap submit ke jurnal terbitan lokal" }
    ],
    finalScore: 88.36,
    finalCategory: "A (Sangat Baik)",
    notified: true,
    notifiedAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: "seed-2",
    type: "Manajerial",
    metadata: {
      id: "seed-2",
      supervisorName: "Zulfian Yusmana, M.Pd.",
      supervisorNip: "19850412 201101 1 002",
      supervisorLevel: "Ahli Madya",
      supervisorUnit: "Dinas Pendidikan Kabupaten",
      supervisorWilayah: "Binaan Kecamatan Sukamakmur",
      schoolName: "SMP Harapan Bangsa",
      schoolNpsn: "10203948",
      schoolAddress: "Jl. Merdeka No. 12, Sukamakmur",
      schoolRombel: "15 Rombel",
      principalName: "Dra. Siti Aminah",
      principalNip: "19780512 200501 1 001",
      principalEducation: "S2 Manajemen Pendidikan",
      principalTenure: "5 Tahun",
      principalLevel: "Pembina / IV-a",
      observationDate: "2026-07-18",
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
    },
    scores: {
      1: 3, 2: 3, 3: 3, 4: 4, 5: 3, 6: 3, 7: 3, 8: 3, 9: 3, 10: 3,
      11: 3, 12: 3, 13: 4, 14: 3, 15: 3, 16: 3, 17: 2, 18: 3, 19: 3, 20: 3,
      21: 2, 22: 3, 23: 3, 24: 3, 25: 3, 26: 3, 27: 3, 28: 3, 29: 3, 30: 3,
      31: 3, 32: 3, 33: 3, 34: 3, 35: 3, 36: 3, 37: 3
    },
    notes: {
      "I": "RKJM disusun partisipatif, sosialisasi visi misi sekolah dipahami dengan sangat baik oleh warga sekolah.",
      "II": "Pengelolaan KSP tertib, supervisi akademik kepala sekolah berjalan terjadwal dengan dokumen pendukung cukup.",
      "III": "Manajemen SDM berjalan tertib, kedisiplinan guru terpelihara baik dengan bimbingan berkelanjutan.",
      "IV": "Sarana prasarana terpelihara, namun pemeliharaan preventif pada laboratorium komputer perlu dioptimalkan anggarannya.",
      "V": "RKAS disusun transparan, pelaporan pertanggungjawaban dana BOS tertib meskipun pembiayaan alternatif masih minim.",
      "VI": "Sistem SIM Dapodik terisi tertib dan update, kemitraan komite berjalan harmonis mendukung program sekolah.",
      "VII": "Kepala Sekolah menunjukkan instructional leadership cukup baik, serta responsif menindaklanjuti data rapor pendidikan.",
      "VIII": "Pengawas Ahli Madya melakukan pengendalian berkala untuk konsistensi implementasi SNP di sekolah sasaran."
    },
    strengths: "Memiliki kekuatan utama pada keterbukaan hubungan masyarakat dan kemitraan komite sekolah yang aktif (Skor 4) serta transparansi pengelolaan keuangan sekolah yang akuntabel. Visi misi sekolah dipahami oleh seluruh warga sekolah.",
    developments: "Perlu perhatian dan peningkatan program pemeliharaan preventif sarana prasarana sekolah (khususnya laboratorium TIK) serta peningkatan alokasi dana pendampingan mandiri guna memperluas diseminasi inovasi guru.",
    actionPlan: [
      { id: "1", plan: "Penyusunan Rencana Kerja Pemeliharaan Preventif Sarpras", strategy: "Rapat Koordinasi bersama Wakil Kepala Sekolah bidang Sarpras", pic: "Kepala Sekolah & Wakasek Sarpras", targetTime: "1 Bulan", successIndicator: "Tersusunnya daftar ceklis pemeliharaan lab mingguan" },
      { id: "2", plan: "Penyusunan Program Inovasi Rujukan Kerja Sama DUDI", strategy: "Workshop pengembangan MoU kemitraan industri luar sekolah", pic: "Kepala Sekolah & Tim Humas", targetTime: "2 Bulan", successIndicator: "Terjalinnya 1 MoU baru dengan industri lokal" }
    ],
    finalScore: 75.68,
    finalCategory: "B (Baik)",
    notified: true,
    notifiedAt: new Date(Date.now() - 3600000 * 12).toISOString()
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "new" | "history">("dashboard");
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  
  // Alert/Notification Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleImportFromDrive = (importedList: Assessment[]) => {
    const existingMap = new Map(assessments.map(a => [a.id, a]));
    importedList.forEach(a => existingMap.set(a.id, a));
    const merged = Array.from(existingMap.values());
    
    setAssessments(merged);
    localStorage.setItem("sipesat_assessments", JSON.stringify(merged));
  };

  // Load initial assessments from local storage
  useEffect(() => {
    const stored = localStorage.getItem("sipesat_assessments");
    if (stored) {
      setAssessments(JSON.parse(stored));
    } else {
      // populate seed data on first launch
      localStorage.setItem("sipesat_assessments", JSON.stringify(SEED_ASSESSMENTS));
      setAssessments(SEED_ASSESSMENTS);
    }

    // Load backend notification logs
    fetchNotificationLogs();
  }, []);

  const fetchNotificationLogs = async () => {
    try {
      const response = await fetch("/api/notifications");
      const data = await response.json();
      if (data.logs) {
        setNotifications(data.logs);
      }
    } catch (err) {
      console.error("Gagal memuat log notifikasi:", err);
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Save/Update assessment
  const handleSaveAssessment = (newAss: Assessment) => {
    let updated: Assessment[] = [];
    const exists = assessments.some(a => a.id === newAss.id);

    if (exists) {
      updated = assessments.map(a => a.id === newAss.id ? newAss : a);
      showToast(`Laporan supervisi ${newAss.metadata.schoolName} berhasil diperbarui di arsip!`);
    } else {
      updated = [newAss, ...assessments];
      showToast(`Laporan supervisi baru untuk ${newAss.metadata.schoolName} berhasil disimpan!`);
    }

    setAssessments(updated);
    localStorage.setItem("sipesat_assessments", JSON.stringify(updated));
    setEditingAssessment(null);
    setActiveTab("history");
  };

  // Delete assessment
  const handleDeleteAssessment = (id: string) => {
    const updated = assessments.filter(a => a.id !== id);
    setAssessments(updated);
    localStorage.setItem("sipesat_assessments", JSON.stringify(updated));
    showToast("Berkas laporan supervisi telah dihapus permanen.");
  };

  // Send Automated Notification
  const handleSendNotification = async (ass: Assessment) => {
    try {
      const targetName = ass.type === "Akademik" ? ass.metadata.teacherName : ass.metadata.principalName;
      const email = ass.type === "Akademik" ? "izoelsyifa@gmail.com" : "sekolah@edu.go.id"; // default test email

      const response = await fetch("/api/send-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId: ass.id,
          schoolName: ass.metadata.schoolName,
          targetName: targetName,
          type: ass.type,
          score: ass.finalScore,
          category: ass.finalCategory,
          email: email
        })
      });

      const result = await response.json();
      if (result.success) {
        showToast(result.alertText);
        
        // Mark as notified in local assessments too
        const updatedAssessments = assessments.map(a => {
          if (a.id === ass.id) {
            return {
              ...a,
              notified: true,
              notifiedAt: new Date().toISOString()
            };
          }
          return a;
        });
        setAssessments(updatedAssessments);
        localStorage.setItem("sipesat_assessments", JSON.stringify(updatedAssessments));

        // Refresh log table
        fetchNotificationLogs();
      }
    } catch (err) {
      console.error(err);
      showToast("Gagal mengirim notifikasi otomatis. Silakan coba kembali.");
    }
  };

  const handleSelectForEdit = (ass: Assessment) => {
    setEditingAssessment(ass);
    setActiveTab("new");
  };

  const handleNewFormTrigger = () => {
    setEditingAssessment(null);
    setActiveTab("new");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16 font-sans">
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-5 py-3.5 rounded-full shadow-2xl border border-slate-800 flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navbar */}
      <header className="sticky top-0 bg-white border-b border-slate-200 z-30 shadow-sm px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold text-sm shadow-md">
            S
          </div>
          <div>
            <h1 className="text-sm md:text-base font-bold leading-none text-indigo-900">
              SIP-AM <span className="font-normal text-slate-400">| Instrumen Pengawasan</span>
            </h1>
            <p className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5 font-bold">Dev by Zulfian Yusmana, M.Pd.</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1 bg-slate-100 p-0.75 rounded-lg">
          <button
            onClick={() => { setActiveTab("dashboard"); setEditingAssessment(null); }}
            className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${activeTab === "dashboard" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Dasbor Tren</span>
          </button>
          
          <button
            onClick={handleNewFormTrigger}
            className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${activeTab === "new" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
          >
            <FileSignature className="w-3.5 h-3.5" /> <span>{editingAssessment ? "Edit Berkas" : "Supervisi Baru"}</span>
          </button>

          <button
            onClick={() => { setActiveTab("history"); setEditingAssessment(null); }}
            className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${activeTab === "history" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
          >
            <Archive className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Arsip Berkas</span>
          </button>
        </nav>

        {/* Extra Info (High Density metadata/profile) */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDriveModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
            title="Integrasi Google Drive Cloud"
          >
            <HardDrive className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Google Drive</span>
          </button>

          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-full">
            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wide">
              {notifications.length > 0 ? `${notifications.length} Notifikasi Baru` : "Sistem Siap"}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2.5">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-800">Zulfian Yusmana, M.Pd.</p>
              <p className="text-[9px] text-indigo-600 font-bold uppercase">Pengawas Ahli Madya</p>
            </div>
            <div className="w-8 h-8 bg-slate-100 rounded-full border border-slate-200 flex items-center justify-center font-bold text-xs text-indigo-600">
              ZY
            </div>
          </div>
        </div>
      </header>

      {/* Google Drive Integration Modal */}
      <GoogleDriveModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        assessments={assessments}
        onImportAssessments={handleImportFromDrive}
        showToast={showToast}
      />

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
        
        {/* Dynamic header branding info */}
        <Branding />

        {/* Tab contents transition frame */}
        <div className="mt-8">
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
              >
                <AnalyticsDashboard assessments={assessments} notifications={notifications} />
              </motion.div>
            )}

            {activeTab === "new" && (
              <motion.div
                key="new"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
              >
                <AssessmentForm 
                  initialAssessment={editingAssessment} 
                  onSave={handleSaveAssessment}
                  onCancel={() => { setActiveTab("history"); setEditingAssessment(null); }}
                  onTriggerNotification={handleSendNotification}
                />
              </motion.div>
            )}

            {activeTab === "history" && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
              >
                <HistoryList 
                  assessments={assessments} 
                  onSelect={handleSelectForEdit}
                  onDelete={handleDeleteAssessment}
                  onSendNotification={handleSendNotification}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer credits & High Density Status Bar */}
      <footer className="max-w-7xl mx-auto px-4 md:px-8 mt-16 border-t border-slate-200 pt-6 pb-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-slate-400">
          <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start">
            <span>DATABASE: <span className="text-slate-600 font-bold italic">CLOUD_STG_01</span></span>
            <span>LAST SYNC: <span className="text-slate-600">10-05-2024 09:12</span></span>
            <span className="hidden md:inline text-slate-300">|</span>
            <span>SIP-AM VER: <span className="text-slate-600 font-bold">4.0.12</span></span>
          </div>
          
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[9px]">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
            <span>System Operational</span>
          </div>
        </div>

        <div className="text-center text-[10px] text-slate-400 mt-6 pt-4 border-t border-slate-100 space-y-1">
          <p className="font-semibold text-slate-500 uppercase tracking-wider">SIPESAT - Sistem Informasi Pengawasan Pendidikan Terstruktur</p>
          <p>Dirancang khusus untuk implementasi Peraturan Menteri PAN-RB No. 7 Tahun 2026</p>
          <p className="text-indigo-600 font-bold mt-1">Dikembangkan oleh Zulfian Yusmana, M.Pd.</p>
        </div>
      </footer>
    </div>
  );
}
