import { SupervisorLevel } from "../types";

export interface IndicatorItem {
  id: number;
  text: string;
}

export interface InstrumentCategory {
  id: string; // e.g. "I-A", "II"
  name: string; // e.g. "Pemahaman Karakteristik Peserta Didik"
  items: IndicatorItem[];
}

// ==========================================
// 1. ACADEMIC INSTRUMENT DATA
// ==========================================
export const ACADEMIC_CATEGORIES = (level: SupervisorLevel): InstrumentCategory[] => {
  const commonCategories: InstrumentCategory[] = [
    {
      id: "I-A",
      name: "I-A. Pemahaman Karakteristik Peserta Didik",
      items: [
        { id: 1, text: "Guru mengidentifikasi gaya belajar, kesiapan, dan minat peserta didik sebelum memulai unit pembelajaran" },
        { id: 2, text: "Guru memetakan keberagaman peserta didik (kemampuan awal, latar belakang sosial-ekonomi, kebutuhan khusus)" },
        { id: 3, text: "Hasil pemetaan peserta didik digunakan sebagai dasar perencanaan pembelajaran berdiferensiasi" }
      ]
    },
    {
      id: "I-B",
      name: "I-B. Perencanaan Pembelajaran",
      items: [
        { id: 4, text: "Modul Ajar / RPP memuat tujuan pembelajaran yang terukur dan selaras dengan Capaian Pembelajaran (CP)" },
        { id: 5, text: "Modul Ajar / RPP mencantumkan strategi diferensiasi konten, proses, dan/atau produk" },
        { id: 6, text: "Pemilihan model dan metode pembelajaran relevan dengan tujuan dan karakteristik materi" },
        { id: 7, text: "Modul Ajar / RPP memuat rancangan asesmen awal (diagnostik), proses (formatif), dan akhir (sumatif)" },
        { id: 8, text: "Modul Ajar / RPP mencerminkan integrasi penguatan karakter dan profil pelajar Pancasila" },
        { id: 9, text: "Perangkat pembelajaran disusun secara mandiri atau dimodifikasi (bukan sekadar menyalin), mencakup pengembangan CP, TP, dan ATP" }
      ]
    },
    {
      id: "I-C",
      name: "I-C. Pelaksanaan Pembelajaran",
      items: [
        { id: 10, text: "Guru membuka pembelajaran dengan apersepsi yang mengaktifkan pengetahuan awal siswa" },
        { id: 11, text: "Guru menyampaikan tujuan pembelajaran dan manfaatnya bagi peserta didik" },
        { id: 12, text: "Guru mengelola kelas secara efektif: waktu, ruang, dan perilaku peserta didik" },
        { id: 13, text: "Guru menggunakan metode/model pembelajaran aktif (diskusi, proyek, inkuiri, kooperatif, dll.)" },
        { id: 14, text: "Guru melaksanakan diferensiasi pembelajaran sesuai kebutuhan peserta didik" },
        { id: 15, text: "Guru memanfaatkan media dan sumber belajar yang bervariasi dan relevan" },
        { id: 16, text: "Guru mendorong peserta didik untuk berpikir kritis, kreatif, dan berkolaborasi" },
        { id: 17, text: "Guru memberikan umpan balik yang konstruktif selama proses pembelajaran berlangsung" },
        { id: 18, text: "Guru mengelola waktu pembelajaran secara efisien sesuai alokasi yang direncanakan" },
        { id: 19, text: "Guru menutup pembelajaran dengan refleksi, penguatan, dan tindak lanjut yang jelas" }
      ]
    },
    {
      id: "I-D",
      name: "I-D. Penilaian / Asesmen Pembelajaran",
      items: [
        { id: 20, text: "Guru melaksanakan asesmen diagnostik untuk mengetahui kesiapan belajar awal peserta didik" },
        { id: 21, text: "Guru melaksanakan asesmen formatif secara berkala selama proses pembelajaran" },
        { id: 22, text: "Instrumen asesmen (soal/tugas) sesuai dengan tujuan pembelajaran dan tingkat berpikir (LOTS–HOTS)" },
        { id: 23, text: "Guru memberikan umpan balik tertulis/lisan yang spesifik dan bermakna kepada peserta didik" },
        { id: 24, text: "Hasil asesmen dianalisis dan digunakan untuk perbaikan rancangan dan pelaksanaan pembelajaran" },
        { id: 25, text: "Guru melaksanakan program remedial bagi peserta didik yang belum mencapai tujuan pembelajaran" },
        { id: 26, text: "Guru melaksanakan program pengayaan bagi peserta didik yang telah melampaui tujuan pembelajaran" },
        { id: 27, text: "Dokumentasi hasil asesmen peserta didik lengkap dan mudah diverifikasi" }
      ]
    },
    {
      id: "II",
      name: "II. KOMPETENSI PROFESIONAL GURU",
      items: [
        { id: 28, text: "Guru menguasai materi ajar secara mendalam sesuai bidang studi / mata pelajaran yang diampu" },
        { id: 29, text: "Guru mengintegrasikan perkembangan ilmu pengetahuan terkini dalam kegiatan pembelajaran" },
        { id: 30, text: "Guru mampu mengembangkan materi secara kreatif dan kontekstual dengan kehidupan nyata siswa" },
        { id: 31, text: "Guru memiliki dan memanfaatkan sumber belajar utama dan pendukung yang relevan (buku, jurnal, digital)" },
        { id: 32, text: "Guru melaksanakan Penelitian Tindakan Kelas (PTK) atau karya inovatif sebagai bentuk pengembangan profesional" },
        { id: 33, text: "Guru aktif mengikuti pelatihan, seminar, atau komunitas belajar (KKG/MGMP) untuk peningkatan kompetensi" }
      ]
    },
    {
      id: "III",
      name: "III. PENGUATAN LITERASI DAN NUMERASI",
      items: [
        { id: 34, text: "Guru mengintegrasikan kegiatan membaca/menulis yang bermakna dalam setiap pembelajaran" },
        { id: 35, text: "Guru membiasakan peserta didik menginterpretasikan data, grafik, atau informasi kuantitatif dalam pembelajaran" },
        { id: 36, text: "Kelas/ruang belajar memiliki pojok baca atau sumber literasi yang dapat diakses peserta didik" },
        { id: 37, text: "Guru merancang tugas yang melatih kemampuan bernalar secara logis dan matematis lintas mata pelajaran" },
        { id: 38, text: "Hasil asesmen literasi dan numerasi peserta didik digunakan sebagai dasar program intervensi guru" }
      ]
    },
    {
      id: "IV",
      name: "IV. PEMANFAATAN TEKNOLOGI DALAM PEMBELAJARAN",
      items: [
        { id: 39, text: "Guru memanfaatkan teknologi digital (perangkat, aplikasi, platform) sebagai media pembelajaran" },
        { id: 40, text: "Penggunaan teknologi mendukung interaktivitas dan keterlibatan aktif peserta didik" },
        { id: 41, text: "Guru memastikan keamanan dan etika digital peserta didik dalam penggunaan teknologi" },
        { id: 42, text: "Guru memanfaatkan platform digital untuk mengakses dan berbagi sumber belajar berkualitas" }
      ]
    },
    {
      id: "V",
      name: "V. REFLEKSI GURU DAN PENGEMBANGAN BERKELANJUTAN",
      items: [
        { id: 43, text: "Guru melakukan refleksi pembelajaran secara rutin (jurnal refleksi, diskusi sejawat, atau catatan observasi)" },
        { id: 44, text: "Guru menggunakan hasil refleksi sebagai dasar perbaikan perencanaan dan pelaksanaan pembelajaran berikutnya" },
        { id: 45, text: "Guru aktif berkolaborasi dengan guru lain dalam komunitas belajar (KKG, komunitas praktisi, lesson study)" },
        { id: 46, text: "Guru mengidentifikasi kebutuhan pengembangan kompetensinya sendiri dan menindaklanjutinya" },
        { id: 47, text: "Guru berbagi praktik baik (best practice) kepada rekan sejawat di sekolah atau forum yang lebih luas" },
        { id: 48, text: "Guru memanfaatkan data Rapor Pendidikan sebagai cermin untuk menetapkan target peningkatan mutu kelas" },
        { id: 49, text: "Guru menunjukkan keterbukaan terhadap umpan balik dari kepala sekolah dan pengawas" },
        { id: 50, text: "Guru memiliki portofolio pengembangan profesional yang terdokumentasi secara sistematis" }
      ]
    }
  ];

  const levelSpecific: InstrumentCategory = level === "Ahli Muda" 
    ? {
        id: "VI",
        name: "VI. ANALISIS MUTU AKADEMIK ★ Aspek Utama Pengawas Ahli Muda",
        items: [
          { id: 51, text: "Pengawas menganalisis kesesuaian antara perencanaan, pelaksanaan, dan penilaian pembelajaran guru" },
          { id: 52, text: "Pengawas mengidentifikasi pola kesulitan belajar peserta didik berdasarkan data hasil belajar" },
          { id: 53, text: "Pengawas menganalisis capaian kompetensi guru dibandingkan dengan standar proses pembelajaran" },
          { id: 54, text: "Pengawas memetakan kebutuhan pengembangan profesional guru berdasarkan hasil observasi dan data pendukung" },
          { id: 55, text: "Pengawas menyusun rekomendasi awal perbaikan pembelajaran berbasis data dan bukti (evidence-based)" },
          { id: 56, text: "Pengawas mengomunikasikan hasil analisis mutu pembelajaran kepada guru dan kepala sekolah" },
          { id: 57, text: "Pengawas memantau tindak lanjut awal dari rekomendasi yang telah diberikan" },
          { id: 58, text: "Hasil analisis mutu pembelajaran didokumentasikan secara sistematis sebagai dasar pembinaan lanjutan" }
        ]
      }
    : {
        id: "VI",
        name: "VI. PENGENDALIAN DAN PENGEMBANGAN MUTU AKADEMIK ★ Aspek Utama Pengawas Ahli Madya",
        items: [
          { id: 51, text: "Terdapat konsistensi antara perencanaan (Modul Ajar/RPP), pelaksanaan, dan penilaian pembelajaran" },
          { id: 52, text: "Guru melaksanakan pembelajaran sesuai dengan standar proses yang ditetapkan sekolah" },
          { id: 53, text: "Data hasil belajar murid dipantau secara berjenjang (KKTP/ketuntasan, tren, distribusi nilai)" },
          { id: 54, text: "Kepala sekolah dan guru bersama-sama menganalisis data hasil belajar dan menetapkan program perbaikan" },
          { id: 55, text: "Program supervisi akademik oleh kepala sekolah berjalan terjadwal dan ditindaklanjuti" },
          { id: 56, text: "Guru berpartisipasi aktif dalam program pengembangan yang ditetapkan sekolah (IHT, lesson study, dll.)" },
          { id: 57, text: "Terdapat bukti nyata peningkatan kualitas pembelajaran sebagai dampak pembinaan akademik pengawas" },
          { id: 58, text: "Hasil pengawasan akademik oleh pengawas sekolah didokumentasikan dan dilaporkan secara periodik" }
        ]
      };

  return [...commonCategories, levelSpecific];
};


// ==========================================
// 2. MANAGERIAL INSTRUMENT DATA
// ==========================================
export const MANAGERIAL_CATEGORIES = (level: SupervisorLevel): InstrumentCategory[] => {
  const commonCategories: InstrumentCategory[] = [
    {
      id: "I",
      name: "I. PERENCANAAN SEKOLAH (Perencanaan Strategis dan Operasional)",
      items: [
        { id: 1, text: "RKJM disusun berdasarkan hasil Evaluasi Diri Sekolah (EDS)/rapor pendidikan dan analisis kebutuhan" },
        { id: 2, text: "RKT dan RKAS disusun dengan melibatkan warga sekolah dan selaras dengan RKJM" },
        { id: 3, text: "Program sekolah dilengkapi indikator keberhasilan yang terukur (SMART)" },
        { id: 4, text: "Visi, misi, dan tujuan sekolah disosialisasikan dan dipahami oleh seluruh warga sekolah" }
      ]
    },
    {
      id: "II",
      name: "II. PENGELOLAAN KURIKULUM (Manajemen Kurikulum dan Supervisi Akademik)",
      items: [
        { id: 5, text: "Kurikulum Satuan Pendidikan (KSP) disusun sesuai karakteristik dan kebutuhan peserta didik" },
        { id: 6, text: "Struktur kurikulum, beban jam mengajar, dan pembagian tugas guru sesuai ketentuan yang berlaku" },
        { id: 7, text: "Kalender pendidikan dan program semester disusun serta disosialisasikan kepada warga sekolah" },
        { id: 8, text: "Kepala sekolah melaksanakan supervisi akademik terhadap guru secara terjadwal" },
        { id: 9, text: "Hasil supervisi akademik ditindaklanjuti dengan program pembinaan guru yang jelas" }
      ]
    },
    {
      id: "III",
      name: "III. PENGELOLAAN PENDIDIK DAN TENAGA KEPENDIDIKAN (Manajemen Sumber Daya Manusia)",
      items: [
        { id: 10, text: "Pemetaan kebutuhan dan distribusi guru/tenaga kependidikan sesuai beban kerja dan kualifikasi" },
        { id: 11, text: "Pengembangan kompetensi PTK (PKB) direncanakan dan dilaksanakan secara berkala" },
        { id: 12, text: "Penilaian kinerja guru dan tenaga kependidikan dilaksanakan secara objektif dan tepat waktu" },
        { id: 13, text: "Pembinaan disiplin dan kode etik profesi PTK berjalan konsisten" },
        { id: 14, text: "Sekolah memberikan penghargaan/apresiasi terhadap kinerja PTK yang berprestasi" }
      ]
    },
    {
      id: "IV",
      name: "IV. PENGELOLAAN SARANA DAN PRASARANA (Manajemen Sarana Prasarana)",
      items: [
        { id: 15, text: "Sarana dan prasarana pembelajaran dikelola dan dipelihara sesuai standar" },
        { id: 16, text: "Pemanfaatan perpustakaan, laboratorium, dan fasilitas TIK berjalan optimal" },
        { id: 17, text: "Sekolah memiliki program pemeliharaan dan pengembangan sarana prasarana secara berkala" },
        { id: 18, text: "Sekolah menjamin keamanan, kenyamanan, dan aksesibilitas lingkungan belajar bagi seluruh peserta didik" }
      ]
    },
    {
      id: "V",
      name: "V. PENGELOLAAN PEMBIAYAAN SEKOLAH (Manajemen Keuangan)",
      items: [
        { id: 19, text: "RKAS disusun secara transparan, partisipatif, dan akuntabel" },
        { id: 20, text: "Realisasi anggaran dilaporkan secara berkala dan sesuai peruntukan" },
        { id: 21, text: "Sekolah menggali sumber pembiayaan alternatif yang sah dan tidak memberatkan orang tua/masyarakat" },
        { id: 22, text: "Laporan pertanggungjawaban keuangan sekolah terdokumentasi dengan baik dan dapat diaudit" }
      ]
    },
    {
      id: "VI",
      name: "VI. PENGELOLAAN HUBUNGAN MASYARAKAT DAN TATA KELOLA (Kehumasan, Kemitraan, dan Tata Kelola)",
      items: [
        { id: 23, text: "Sekolah menjalin kemitraan aktif dengan orang tua, komite sekolah, dan masyarakat" },
        { id: 24, text: "Sistem informasi manajemen sekolah (Dapodik, PMM, rapor pendidikan) dikelola dengan tertib" },
        { id: 25, text: "Layanan publik sekolah (PPDB, pengaduan, informasi) berjalan transparan dan mudah diakses" },
        { id: 26, text: "Sekolah menjalin kerja sama dengan dunia usaha/industri atau lembaga lain yang relevan" }
      ]
    },
    {
      id: "VII",
      name: "VII. KEPEMIMPINAN KEPALA SEKOLAH DAN BUDAYA MUTU (Kepemimpinan dan Budaya Sekolah)",
      items: [
        { id: 27, text: "Kepala sekolah menunjukkan kepemimpinan pembelajaran (instructional leadership) yang nyata" },
        { id: 28, text: "Kepala sekolah membangun budaya kolaboratif dan iklim kerja yang positif" },
        { id: 29, text: "Kepala sekolah responsif terhadap hasil rapor pendidikan dan menetapkan prioritas perbaikan" },
        { id: 30, text: "Pengambilan keputusan sekolah dilaksanakan secara konsisten berbasis data" },
        { id: 31, text: "Kepala sekolah membangun budaya refleksi dan pembelajaran berkelanjutan di lingkungan sekolah" }
      ]
    }
  ];

  const levelSpecific: InstrumentCategory = level === "Ahli Muda"
    ? {
        id: "VIII",
        name: "VIII. ANALISIS MUTU MANAJERIAL ★ Aspek Utama Pengawas Ahli Muda",
        items: [
          { id: 32, text: "Pengawas menganalisis capaian 8 Standar Nasional Pendidikan berdasarkan data rapor pendidikan dan EDS" },
          { id: 33, text: "Pengawas mengidentifikasi akar masalah pengelolaan sekolah melalui data kuantitatif dan kualitatif" },
          { id: 34, text: "Pengawas menyusun peta masalah manajerial sekolah sebagai dasar rekomendasi awal" },
          { id: 35, text: "Pengawas memberikan rekomendasi perbaikan tata kelola berbasis hasil analisis kepada kepala sekolah" },
          { id: 36, text: "Pengawas memfasilitasi diskusi hasil analisis mutu manajerial bersama kepala sekolah dan tim manajemen" },
          { id: 37, text: "Hasil analisis mutu manajerial didokumentasikan secara sistematis sebagai dasar pembinaan lanjutan" }
        ]
      }
    : {
        id: "VIII",
        name: "VIII. PENGENDALIAN DAN PENGEMBANGAN MUTU MANAJERIAL ★ Aspek Utama Pengawas Ahli Madya",
        items: [
          { id: 32, text: "Pengawas memastikan tindak lanjut rekomendasi manajerial sebelumnya dilaksanakan dan dipantau capaiannya" },
          { id: 33, text: "Pengawas mengembangkan model/inovasi tata kelola sekolah yang dapat direplikasi ke sekolah binaan lain" },
          { id: 34, text: "Pengawas memfasilitasi sekolah menyusun program pengembangan mutu berkelanjutan (continuous improvement)" },
          { id: 35, text: "Pengawas mengendalikan konsistensi implementasi kebijakan sekolah terhadap Standar Nasional Pendidikan" },
          { id: 36, text: "Pengawas melakukan pendampingan strategis kepada kepala sekolah dalam pengambilan keputusan manajerial" },
          { id: 37, text: "Terdapat bukti nyata peningkatan tata kelola sekolah sebagai dampak pembinaan manajerial pengawas" }
        ]
      };

  return [...commonCategories, levelSpecific];
};


// ==========================================
// 3. ANALYSIS & GRADING UTILITIES
// ==========================================
export const getMutuCategory = (score: number): { category: string; color: string; description: string } => {
  if (score >= 85) return { category: "A (Sangat Baik)", color: "text-emerald-600 bg-emerald-50 border-emerald-200", description: "Jadikan sebagai sekolah/praktik model; rekomendasikan berbagi praktik baik di forum MKKS/KKKS atau musyawarah pengawas." };
  if (score >= 70) return { category: "B (Baik)", color: "text-blue-600 bg-blue-50 border-blue-200", description: "Dorong penguatan pada aspek yang masih cukup; jadikan prioritas pembinaan lanjutan." };
  if (score >= 55) return { category: "C (Cukup)", color: "text-amber-600 bg-amber-50 border-amber-200", description: "Susun program pembinaan terfokus bersama kepala sekolah/tim manajemen; pantau dalam 3 bulan." };
  return { category: "D (Kurang)", color: "text-rose-600 bg-rose-50 border-rose-200", description: "Lakukan pembinaan intensif; usulkan pendampingan khusus atau kolaborasi dengan pengawas lain segera." };
};

// ==========================================
// 4. PRE-DEFINED RULE-BASED OBSERVATION GENERATOR (FALLBACK & SEED DATA)
// ==========================================
export const generateRuleBasedNotes = (
  type: "Akademik" | "Manajerial",
  scores: Record<number, number>,
  categories: InstrumentCategory[]
): {
  notes: Record<string, string>;
  strengths: string;
  developments: string;
  actionPlan: Array<{ plan: string; strategy: string; pic: string; targetTime: string; successIndicator: string }>;
} => {
  const notes: Record<string, string> = {};
  
  // Fill notes for each category
  categories.forEach(cat => {
    // get average score for this category
    const catItems = cat.items;
    let sum = 0;
    let count = 0;
    catItems.forEach(item => {
      if (scores[item.id]) {
        sum += scores[item.id];
        count++;
      }
    });
    
    const avg = count > 0 ? sum / count : 3;
    
    if (type === "Akademik") {
      if (cat.id === "I-A") {
        notes[cat.id] = avg >= 3.5 
          ? "Guru secara konsisten mengidentifikasi gaya belajar, kesiapan, dan minat peserta didik sebelum memulai materi pembelajaran."
          : avg >= 2.5 
          ? "Guru sudah melakukan pemetaan dasar namun belum terdokumentasi secara konsisten untuk merancang pembelajaran berdiferensiasi."
          : "Identifikasi karakteristik peserta didik masih minim, disarankan untuk merancang asesmen diagnostik awal.";
      } else if (cat.id === "I-B") {
        notes[cat.id] = avg >= 3.5
          ? "Modul ajar disusun secara mandiri, sangat lengkap dengan strategi pembelajaran berdiferensiasi serta asesmen yang selaras dengan tujuan."
          : avg >= 2.5
          ? "Rencana pembelajaran sudah mencakup CP dan TP, namun rincian diferensiasi proses dan produk masih memerlukan penguatan."
          : "Modul ajar sebagian besar masih bersifat menyalin. Perlu pendampingan intensif penyusunan modul ajar mandiri.";
      } else if (cat.id === "I-C") {
        notes[cat.id] = avg >= 3.5
          ? "Pelaksanaan pembelajaran berlangsung interaktif dan berpusat pada siswa, guru mengelola waktu dengan sangat efisien."
          : avg >= 2.5
          ? "Guru melaksanakan kegiatan sesuai sintaks model pembelajaran, namun interaksi siswa perlu lebih didorong agar aktif."
          : "Pembelajaran masih didominasi ceramah satu arah. Pengelolaan kelas dan alokasi waktu perlu diperbaiki.";
      } else if (cat.id === "I-D") {
        notes[cat.id] = avg >= 3.5
          ? "Asesmen formatif dan sumatif dilaksanakan dengan instrumen bervariasi (LOTS-HOTS) disertai umpan balik lisan dan tertulis secara berkala."
          : avg >= 2.5
          ? "Asesmen sudah dilakukan, namun analisis hasil asesmen dan program tindak lanjut (remedial/pengayaan) belum terstruktur."
          : "Dokumentasi asesmen tidak lengkap. Umpan balik yang diberikan kepada siswa masih sangat umum.";
      } else if (cat.id === "II") {
        notes[cat.id] = avg >= 3.5
          ? "Penguasaan materi ajar sangat mendalam dan kontekstual, guru aktif mengembangkan karya inovatif dan PTK secara berkelanjutan."
          : avg >= 2.5
          ? "Guru menguasai materi dengan baik, namun integrasi perkembangan ilmu pengetahuan terkini perlu ditingkatkan."
          : "Penguasaan materi ajar perlu ditingkatkan melalui keaktifan di forum MGMP/KKG.";
      } else if (cat.id === "III") {
        notes[cat.id] = avg >= 3.5
          ? "Sangat baik dalam mengintegrasikan program literasi dan numerasi dalam proses pembelajaran, ditunjang pojok baca yang representatif."
          : avg >= 2.5
          ? "Program literasi telah diintegrasikan secara terjadwal, namun pembiasaan penyajian data kuantitatif masih perlu diperkuat."
          : "Kegiatan pembelajaran belum menunjukkan integrasi literasi dan numerasi yang bermakna.";
      } else if (cat.id === "IV") {
        notes[cat.id] = avg >= 3.5
          ? "Pemanfaatan teknologi digital sangat bervariasi (Chromebook, Canva, Quizizz) dan terbukti meningkatkan interaktivitas siswa secara positif."
          : avg >= 2.5
          ? "Guru menggunakan proyektor dan platform digital, namun pemanfaatan untuk interaktivitas aktif siswa masih terbatas."
          : "Pemanfaatan teknologi dalam pembelajaran masih sangat minim dan perlu pelatihan dasar TIK.";
      } else if (cat.id === "V") {
        notes[cat.id] = avg >= 3.5
          ? "Guru memiliki portofolio yang rapi, rutin berkolaborasi di komunitas belajar sekolah, serta sangat terbuka terhadap umpan balik pengawas."
          : avg >= 2.5
          ? "Refleksi pembelajaran sudah dilakukan, namun tindak lanjut perbaikan berdasarkan hasil refleksi belum terencana baik."
          : "Belum terbiasa melakukan refleksi pembelajaran. Portofolio pengembangan diri belum terdokumentasi.";
      } else if (cat.id === "VI") {
        notes[cat.id] = avg >= 3.5
          ? "Proses analisis mutu akademik dan pemantauan tindak lanjut pengawasan berjalan dengan sangat baik dan terdokumentasi secara sistematis."
          : avg >= 2.5
          ? "Analisis mutu akademik sudah dilakukan, namun pemantauan dampak nyata terhadap mutu pembelajaran perlu diperkuat."
          : "Proses analisis mutu belum terstruktur, disarankan koordinasi intensif dengan kepala sekolah terkait program supervisi.";
      }
    } else {
      // Manajerial
      if (cat.id === "I") {
        notes[cat.id] = avg >= 3.5
          ? "RKJM, RKT, dan RKAS dirumuskan secara partisipatif berbasis rekomendasi Rapor Pendidikan dan EDS dengan indikator SMART."
          : avg >= 2.5
          ? "Dokumen perencanaan sekolah sudah lengkap, namun sosialisasi visi misi kepada seluruh pemangku kepentingan perlu ditingkatkan."
          : "Penyusunan RKAS belum optimal merujuk pada prioritas Rapor Pendidikan. Keterlibatan warga sekolah perlu ditingkatkan.";
      } else if (cat.id === "II") {
        notes[cat.id] = avg >= 3.5
          ? "Pengelolaan KSP sangat baik, didukung supervisi akademik kepala sekolah yang terjadwal teratur dan ditindaklanjuti secara nyata."
          : avg >= 2.5
          ? "Supervisi dilaksanakan oleh kepala sekolah, namun tindak lanjut pembinaan bagi guru yang mendapat nilai cukup masih belum terstruktur."
          : "Pelaksanaan supervisi akademik belum terjadwal dengan baik, dokumen tindak lanjut pembinaan tidak terdokumentasi.";
      } else if (cat.id === "III") {
        notes[cat.id] = avg >= 3.5
          ? "Manajemen SDM sangat rapi, pemetaan beban kerja sesuai kualifikasi, sekolah aktif memberikan reward dan mengelola PKB secara berkala."
          : avg >= 2.5
          ? "Penilaian kinerja PTK sudah objektif, namun program peningkatan kompetensi (PKB) guru belum merata."
          : "Pembinaan disiplin dan pemetaan kompetensi guru perlu ditingkatkan. Belum ada mekanisme reward yang jelas.";
      } else if (cat.id === "IV") {
        notes[cat.id] = avg >= 3.5
          ? "Sarana prasarana terpelihara sangat baik, laboratorium dan perpustakaan dimanfaatkan optimal, lingkungan sekolah aman dan ramah anak."
          : avg >= 2.5
          ? "Fasilitas TIK dan perpustakaan tersedia, namun program pemeliharaan preventif sarana prasarana perlu ditingkatkan anggarannya."
          : "Banyak sarana prasarana yang memerlukan perbaikan. Keamanan dan kenyamanan lingkungan belajar belum optimal.";
      } else if (cat.id === "V") {
        notes[cat.id] = avg >= 3.5
          ? "Manajemen keuangan sangat transparan, akuntabel, dan laporan pertanggungjawaban terdokumentasi dengan sangat baik dan siap diaudit."
          : avg >= 2.5
          ? "Penyusunan anggaran sudah melibatkan guru, namun penggalian sumber pembiayaan alternatif di luar dana BOS masih sangat terbatas."
          : "Pelaporan keuangan sering terlambat, transparansi penggunaan anggaran kepada komite sekolah perlu ditingkatkan.";
      } else if (cat.id === "VI") {
        notes[cat.id] = avg >= 3.5
          ? "Kemitraan dengan komite sekolah dan DUDI berjalan sangat dinamis, sistem informasi Dapodik/PMM up-to-date, layanan publik sangat transparan."
          : avg >= 2.5
          ? "Sistem Dapodik dikelola dengan baik, namun kerja sama formal dengan dunia usaha (MoU) perlu diperluas cakupannya."
          : "Hubungan masyarakat dan keterbukaan informasi publik masih terbatas. Update data Dapodik sering terlambat.";
      } else if (cat.id === "VII") {
        notes[cat.id] = avg >= 3.5
          ? "Kepala Sekolah menunjukkan kepemimpinan pembelajaran yang visioner, membangun budaya kolaborasi, dan merespons cepat rekomendasi rapor mutu."
          : avg >= 2.5
          ? "Budaya kolaboratif di antara staf guru sudah terbentuk, namun pengambilan keputusan berbasis data perlu dioptimalkan."
          : "Kepemimpinan pembelajaran dari kepala sekolah perlu diperkuat, budaya refleksi di lingkungan sekolah belum berjalan.";
      } else if (cat.id === "VIII") {
        notes[cat.id] = avg >= 3.5
          ? "Pengawasan manajerial berbasis pemecahan masalah (problem solving) terlaksana sempurna dengan analisis akar masalah yang sangat tajam."
          : avg >= 2.5
          ? "Analisis manajerial sudah terstruktur, namun pendampingan dalam penyusunan model inovasi tata kelola masih perlu dioptimalkan."
          : "Rekomendasi hasil pengawasan belum terintegrasi ke dalam program sekolah. Tindak lanjut pengawasan masih lemah.";
      }
    }
  });

  // Calculate Strengths and Developments based on specific high/low scores
  const scorePairs = Object.entries(scores).map(([k, v]) => ({ id: Number(k), score: v }));
  const highScores = scorePairs.filter(p => p.score === 4);
  const lowScores = scorePairs.filter(p => p.score <= 2);

  let strengths = "Berdasarkan penilaian indikator kinerja:";
  if (highScores.length > 0) {
    strengths += `\n1. Memiliki kekuatan unggulan yang luar biasa (Skor Maksimal 4) pada beberapa indikator, yaitu indikator nomor ${highScores.map(p => p.id).join(", ")}.`;
    strengths += `\n2. Penerapan standar pengajaran/manajemen pada sektor ini dinilai sangat konsisten, inovatif, dan telah berdampak nyata pada peningkatan mutu pendidikan.`;
    strengths += `\n3. Sangat direkomendasikan menjadi model/praktik rujukan di tingkat kecamatan/kabupaten.`;
  } else {
    strengths += `\n- Secara umum pelaksanaan tugas telah berjalan dengan Baik.`;
    strengths += `\n- Aspek pedagogik dasar serta kedisiplinan administratif telah dipenuhi sesuai kriteria standar minimal.`;
  }

  let developments = "Berdasarkan hasil analisis, prioritas pengembangan meliputi:";
  if (lowScores.length > 0) {
    developments += `\n1. Diperlukan pembinaan dan pendampingan khusus (Skor <= 2) pada indikator nomor ${lowScores.map(p => p.id).join(", ")}.`;
    developments += `\n2. Sektor ini memerlukan intervensi berupa bimbingan teknis (Bimtek), pelatihan klinis, atau pendampingan terfokus dari Pengawas Sekolah dalam kurun waktu 1-3 bulan ke depan.`;
    developments += `\n3. Kepala Sekolah/Guru wajib menyusun rencana aksi perbaikan mutu spesifik guna meningkatkan konsistensi implementasinya.`;
  } else {
    developments += `\n- Tetap perlu didorong inovasi mandiri agar mutu meningkat dari kriteria 'Baik' menjadi 'Sangat Baik/Istimewa'.`;
    developments += `\n- Melakukan diseminasi praktik baik (sharing best practices) kepada rekan sejawat secara reguler.`;
  }

  // Create action plans
  const actionPlan = [
    {
      id: "1",
      plan: lowScores.length > 0 ? `Bimbingan Teknis Terfokus Indikator ${lowScores.slice(0, 3).map(p => p.id).join(", ")}` : "Diseminasi Praktik Baik Pembelajaran Inovatif",
      strategy: "Workshop Mandiri / Klinis Pengawas di Satuan Pendidikan",
      pic: "Pengawas Sekolah & Kepala Sekolah",
      targetTime: "1 Bulan",
      successIndicator: "Capaian indikator meningkat menjadi minimal Baik (Skor 3)"
    },
    {
      id: "2",
      plan: "Penguatan Komunitas Belajar (Kombel) Sekolah",
      strategy: "IHT (In-House Training) dan Lesson Study berkala",
      pic: "Kepala Sekolah & Koordinator Kurikulum",
      targetTime: "2 Bulan",
      successIndicator: "Adanya dokumentasi kolaborasi pembelajaran dan peningkatan portofolio guru"
    }
  ];

  return { notes, strengths, developments, actionPlan };
};
