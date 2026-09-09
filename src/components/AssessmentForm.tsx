import React, { useState, useEffect } from "react";
import { Assessment, AssessmentMetadata, ActionPlanItem, SupervisorLevel, InstrumentType } from "../types";
import { ACADEMIC_CATEGORIES, MANAGERIAL_CATEGORIES, getMutuCategory, generateRuleBasedNotes } from "../data/instruments";
import { LOGO_LEBAK_BASE64, LOGO_LEBAK_URL } from "../data/logo";
import { Sparkles, Save, Printer, Check, ClipboardCopy, Plus, Trash2, ArrowLeft, RefreshCw, Send, Download } from "lucide-react";

interface AssessmentFormProps {
  initialAssessment?: Assessment | null;
  onSave: (assessment: Assessment) => void;
  onCancel: () => void;
  onTriggerNotification: (assessment: Assessment) => void;
}

export default function AssessmentForm({ initialAssessment, onSave, onCancel, onTriggerNotification }: AssessmentFormProps) {
  // 1. Initial State Definitions
  const [type, setType] = useState<InstrumentType>(initialAssessment?.type || "Akademik");
  const [level, setLevel] = useState<SupervisorLevel>(initialAssessment?.metadata.supervisorLevel || "Ahli Madya");
  
  const [metadata, setMetadata] = useState<AssessmentMetadata>({
    id: initialAssessment?.metadata.id || `ass-${Date.now()}`,
    supervisorName: initialAssessment?.metadata.supervisorName || "Zulfian Yusmana, M.Pd.",
    supervisorNip: initialAssessment?.metadata.supervisorNip || "197909222009021002",
    supervisorLevel: initialAssessment?.metadata.supervisorLevel || "Ahli Madya",
    supervisorUnit: initialAssessment?.metadata.supervisorUnit || "Dinas Pendidikan Kabupaten Lebak",
    supervisorWilayah: initialAssessment?.metadata.supervisorWilayah || "Kecamatan Cibeber/Cilograng",
    schoolName: initialAssessment?.metadata.schoolName || "",
    schoolNpsn: initialAssessment?.metadata.schoolNpsn || "",
    schoolAddress: initialAssessment?.metadata.schoolAddress || "",
    schoolRombel: initialAssessment?.metadata.schoolRombel || "12 Rombel",
    
    teacherName: initialAssessment?.metadata.teacherName || "",
    teacherNip: initialAssessment?.metadata.teacherNip || "",
    subjectOrClass: initialAssessment?.metadata.subjectOrClass || "",
    teacherLevel: initialAssessment?.metadata.teacherLevel || "Penata Muda / III-a",
    certified: initialAssessment?.metadata.certified || "Sudah",
    teachingHours: initialAssessment?.metadata.teachingHours || "24 Jam",
    
    principalName: initialAssessment?.metadata.principalName || "",
    principalNip: initialAssessment?.metadata.principalNip || "",
    principalEducation: initialAssessment?.metadata.principalEducation || "S2 Manajemen",
    principalTenure: initialAssessment?.metadata.principalTenure || "4 Tahun",
    principalLevel: initialAssessment?.metadata.principalLevel || "Pembina / IV-a",

    observationDate: initialAssessment?.metadata.observationDate || new Date().toISOString().split("T")[0],
    createdAt: initialAssessment?.metadata.createdAt || new Date().toISOString()
  });

  // Score states
  const [scores, setScores] = useState<Record<number, number>>(initialAssessment?.scores || {});
  
  // Custom narrative states (category key -> narrative note)
  const [notes, setNotes] = useState<Record<string, string>>(initialAssessment?.notes || {});
  const [strengths, setStrengths] = useState(initialAssessment?.strengths || "");
  const [developments, setDevelopments] = useState(initialAssessment?.developments || "");
  
  // Action plans
  const [actionPlans, setActionPlans] = useState<ActionPlanItem[]>(initialAssessment?.actionPlan || [
    { id: "1", plan: "Penyusunan Rencana Aksi Perbaikan Mutu Pembelajaran", strategy: "Bimtek Klinis Mandiri", pic: "Pengawas & Guru", targetTime: "1 Bulan", successIndicator: "Indikator naik menjadi Baik" },
    { id: "2", plan: "In-House Training (IHT) Diferensiasi Proses", strategy: "Pelatihan Berkelanjutan Kombel", pic: "Kepala Sekolah & Guru", targetTime: "2 Bulan", successIndicator: "Tersedianya modul ajar diferensiasi lengkap" }
  ]);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState("");

  const activeCategories = type === "Akademik" ? ACADEMIC_CATEGORIES(level) : MANAGERIAL_CATEGORIES(level);
  const totalItems = type === "Akademik" ? 58 : 37;
  const maxScore = totalItems * 4;

  // Calculate current score metrics
  const totalScoreObtained = (Object.values(scores) as number[]).reduce((sum, curr) => sum + curr, 0);
  const finalScorePercentage = totalItems > 0 ? (totalScoreObtained / maxScore) * 100 : 0;
  const ratingDetails = getMutuCategory(finalScorePercentage);

  // Sync state if initial assessment changes
  useEffect(() => {
    if (initialAssessment) {
      setType(initialAssessment.type);
      setLevel(initialAssessment.metadata.supervisorLevel);
      setMetadata(initialAssessment.metadata);
      setScores(initialAssessment.scores);
      setNotes(initialAssessment.notes);
      setStrengths(initialAssessment.strengths);
      setDevelopments(initialAssessment.developments);
      setActionPlans(initialAssessment.actionPlan);
    }
  }, [initialAssessment]);

  // Handle Level or Type change -> clean/update scores or metadata
  const handleTypeChange = (newType: InstrumentType) => {
    setType(newType);
    setScores({});
    setNotes({});
    setStrengths("");
    setDevelopments("");
  };

  const handleLevelChange = (newLevel: SupervisorLevel) => {
    setLevel(newLevel);
    setMetadata(prev => ({ ...prev, supervisorLevel: newLevel }));
  };

  const handleScoreChange = (itemId: number, score: number) => {
    setScores(prev => ({ ...prev, [itemId]: score }));
  };

  // Helper: Auto-fill typical random scores (for demos and quick playgrounds)
  const handleAutoFill = () => {
    const defaultScores: Record<number, number> = {};
    for (let i = 1; i <= totalItems; i++) {
      // populate mostly 3s and 4s, occasionally 2s
      const rand = Math.random();
      defaultScores[i] = rand > 0.9 ? 2 : rand > 0.4 ? 3 : 4;
    }
    setScores(defaultScores);

    // Apply rule-based notes instantly so fields aren't blank
    const rules = generateRuleBasedNotes(type, defaultScores, activeCategories);
    setNotes(rules.notes);
    setStrengths(rules.strengths);
    setDevelopments(rules.developments);
    setActionPlans(rules.actionPlan);
  };

  // 2. AI-Powered Generator (Gemini Server API)
  const handleGenerateAINotes = async () => {
    // Validate that at least some items are graded
    const gradedCount = Object.keys(scores).length;
    if (gradedCount < 10) {
      alert("Harap isi nilai terlebih dahulu (minimal 10 indikator) sebelum meminta bantuan AI menulis Catatan Pengawas.");
      return;
    }

    setAiLoading(true);
    setAiMessage("Menghubungi AI Gemini untuk mensintesis narasi pengawasan...");

    try {
      const response = await fetch("/api/generate-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          level,
          scores,
          categories: activeCategories
        })
      });

      const result = await response.json();

      if (result.success && !result.isFallback) {
        // AI successfully generated custom notes!
        const payload = result.data;
        setNotes(payload.notes || {});
        setStrengths(payload.strengths || "");
        setDevelopments(payload.developments || "");
        if (payload.actionPlan && payload.actionPlan.length > 0) {
          setActionPlans(payload.actionPlan.map((p: any, idx: number) => ({
            id: String(idx + 1),
            ...p
          })));
        }
        setAiMessage("Catatan Pengawas & Analisis Kinerja berhasil disusun secara kontekstual oleh AI!");
      } else {
        // Fallback to rule-based offline generator
        setAiMessage("Menggunakan sistem pembuat catatan terstruktur (Offline Fallback)...");
        const fallback = generateRuleBasedNotes(type, scores, activeCategories);
        setTimeout(() => {
          setNotes(fallback.notes);
          setStrengths(fallback.strengths);
          setDevelopments(fallback.developments);
          setActionPlans(fallback.actionPlan);
          setAiMessage("Catatan Pengawas berhasil terisi secara otomatis!");
        }, 800);
      }
    } catch (error) {
      console.error(error);
      // fallback
      const fallback = generateRuleBasedNotes(type, scores, activeCategories);
      setNotes(fallback.notes);
      setStrengths(fallback.strengths);
      setDevelopments(fallback.developments);
      setActionPlans(fallback.actionPlan);
      setAiMessage("Catatan berhasil digenerasikan (Fallback offline).");
    } finally {
      setTimeout(() => {
        setAiLoading(false);
        setAiMessage("");
      }, 2000);
    }
  };

  // 3. Action Plan Table Row Handlers
  const handleAddPlanRow = () => {
    const newId = `plan-${Date.now()}`;
    setActionPlans(prev => [
      ...prev,
      { id: newId, plan: "", strategy: "", pic: "", targetTime: "", successIndicator: "" }
    ]);
  };

  const handleUpdatePlanField = (id: string, field: keyof ActionPlanItem, val: string) => {
    setActionPlans(prev => prev.map(item => item.id === id ? { ...item, [field]: val } : item));
  };

  const handleRemovePlanRow = (id: string) => {
    setActionPlans(prev => prev.filter(item => item.id !== id));
  };

  // 4. Save to Local Storage
  const handleFormSave = () => {
    if (!metadata.schoolName) {
      alert("Harap isi Nama Sekolah terlebih dahulu.");
      return;
    }
    const finalAssessment: Assessment = {
      id: metadata.id,
      type,
      metadata,
      scores,
      notes,
      strengths,
      developments,
      actionPlan: actionPlans,
      finalScore: finalScorePercentage,
      finalCategory: ratingDetails.category,
      notified: initialAssessment?.notified || false,
      notifiedAt: initialAssessment?.notifiedAt
    };

    onSave(finalAssessment);
  };

  const handleDownloadDocx = () => {
    // Determine target name
    const targetName = type === "Akademik" ? metadata.teacherName : metadata.principalName;
    const targetLabel = type === "Akademik" ? "Nama Guru Sasaran" : "Nama Kepala Sekolah Sasaran";
    const targetNipLabel = type === "Akademik" ? "NIP Guru" : "NIP Kepala Sekolah";
    const targetNip = type === "Akademik" ? metadata.teacherNip : metadata.principalNip;
    const targetExtraLabel = type === "Akademik" ? "Mata Pelajaran / Kelas" : "Pendidikan Terakhir";
    const targetExtraVal = type === "Akademik" ? metadata.subjectOrClass : metadata.principalEducation;

    // Build categories scores HTML
    let categoriesHtml = "";
    activeCategories.forEach(cat => {
      categoriesHtml += `
        <tr style="background-color: #f1f5f9; font-weight: bold;">
          <td colspan="3" style="border: 1px solid #94a3b8; padding: 8px; color: #1e3a8a; font-family: sans-serif; font-size: 11pt;">${cat.name}</td>
        </tr>
      `;
      cat.items.forEach(item => {
        const score = scores[item.id] || "-";
        categoriesHtml += `
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; font-family: sans-serif; font-size: 10pt;">${item.id}</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px; font-family: sans-serif; font-size: 10pt;">${item.text}</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; font-weight: bold; font-family: sans-serif; font-size: 10pt;">${score}</td>
          </tr>
        `;
      });
      categoriesHtml += `
        <tr>
          <td colspan="3" style="border: 1px solid #cbd5e1; padding: 8px; font-style: italic; background-color: #f8fafc; font-family: sans-serif; font-size: 10pt;">
            <strong>Catatan Sektor:</strong> ${notes[cat.id] || "Tidak ada catatan spesifik."}
          </td>
        </tr>
      `;
    });

    // Build action plans HTML
    let actionPlansHtml = "";
    actionPlans.forEach((item, index) => {
      actionPlansHtml += `
        <tr>
          <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; font-family: sans-serif; font-size: 10pt;">${index + 1}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px; font-family: sans-serif; font-size: 10pt;">${item.plan || "-"}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px; font-family: sans-serif; font-size: 10pt;">${item.strategy || "-"}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px; font-family: sans-serif; font-size: 10pt;">${item.pic || "-"}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; font-family: sans-serif; font-size: 10pt;">${item.targetTime || "-"}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px; font-family: sans-serif; font-size: 10pt;">${item.successIndicator || "-"}</td>
        </tr>
      `;
    });

    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>Laporan SIPESAT - ${metadata.schoolName}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 11pt;
            line-height: 1.5;
            color: #000000;
          }
          .kop-surat {
            text-align: center;
            border-bottom: 3px double #000000;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .kop-kementerian {
            font-size: 12pt;
            font-weight: bold;
            text-transform: uppercase;
            margin: 0;
          }
          .kop-dinas {
            font-size: 14pt;
            font-weight: bold;
            text-transform: uppercase;
            margin: 0;
          }
          .kop-unit {
            font-size: 10pt;
            margin: 0;
          }
          .judul {
            text-align: center;
            font-size: 13pt;
            font-weight: bold;
            text-transform: uppercase;
            margin-top: 20px;
            margin-bottom: 5px;
          }
          .subjudul {
            text-align: center;
            font-size: 11pt;
            font-weight: bold;
            margin-bottom: 20px;
          }
          .section-title {
            font-size: 11pt;
            font-weight: bold;
            text-transform: uppercase;
            margin-top: 20px;
            margin-bottom: 8px;
            border-bottom: 1px solid #000000;
            padding-bottom: 2px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
          }
          table.bordered td, table.bordered th {
            border: 1px solid #000000;
            padding: 6px;
          }
          table.bordered th {
            background-color: #f2f2f2;
            font-weight: bold;
            text-align: center;
          }
          .info-table td {
            padding: 4px;
            vertical-align: top;
          }
          .signature-container {
            margin-top: 40px;
            width: 100%;
          }
          .signature-table {
            border: none;
            width: 100%;
          }
          .signature-table td {
            border: none;
            text-align: center;
            width: 33.33%;
            font-size: 10pt;
          }
        </style>
      </head>
      <body>
        <div class="kop-surat" style="border-bottom: 4px solid #000000; padding-bottom: 10px; margin-bottom: 20px;">
          <table style="width: 100%; border-collapse: collapse; border: none;">
            <tr>
              <td style="width: 90px; text-align: center; vertical-align: middle; padding-right: 15px; border: none;">
                <img src="${LOGO_LEBAK_BASE64}" width="85" height="100" alt="Logo Lebak" style="width: 85px; height: auto;" />
              </td>
              <td style="text-align: center; vertical-align: middle; border: none;">
                <p style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 13pt; font-weight: bold; text-transform: uppercase;">
                  PEMERINTAH KABUPATEN LEBAK
                </p>
                <p style="margin: 2px 0 4px 0; font-family: Arial, Helvetica, sans-serif; font-size: 17pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
                  DINAS PENDIDIKAN
                </p>
                <p style="margin: 1px 0; font-family: Arial, Helvetica, sans-serif; font-size: 9.5pt;">
                  Jalan Siliwangi Pasir Ona, Rangkasbitung, Lebak, Banten 42313
                </p>
                <p style="margin: 1px 0; font-family: Arial, Helvetica, sans-serif; font-size: 9.5pt;">
                  Telepon (0252) 280786, Faksimile (0252) 280911 PO. BOX 21
                </p>
                <p style="margin: 1px 0; font-family: Arial, Helvetica, sans-serif; font-size: 9.5pt;">
                  Laman : disdik.lebakkab.go.id Pos-el : disdik@lebakkab.go.id
                </p>
              </td>
            </tr>
          </table>
        </div>

        <div class="judul">LAPORAN HASIL PENGAWASAN DAN PENILAIAN MUTU SEKOLAH</div>
        <div class="subjudul">INSTRUMEN PENGAWASAN ${type.toUpperCase()} (PERMENPAN-RB NO. 7 TAHUN 2026)</div>

        <div class="section-title">A. IDENTITAS PELAKSANA PENGAWASAN</div>
        <table class="info-table" style="width: 100%;">
          <tr>
            <td style="width: 32%; border-bottom: 1px dotted #cccccc;">Nama Pengawas Sekolah</td>
            <td style="width: 3%; border-bottom: 1px dotted #cccccc; text-align: center;">:</td>
            <td style="width: 65%; border-bottom: 1px dotted #cccccc; font-weight: bold;">${metadata.supervisorName}</td>
          </tr>
          <tr>
            <td style="border-bottom: 1px dotted #cccccc;">NIP Pengawas</td>
            <td style="border-bottom: 1px dotted #cccccc; text-align: center;">:</td>
            <td style="border-bottom: 1px dotted #cccccc;">${metadata.supervisorNip}</td>
          </tr>
          <tr>
            <td style="border-bottom: 1px dotted #cccccc;">Jenjang / Jabatan</td>
            <td style="border-bottom: 1px dotted #cccccc; text-align: center;">:</td>
            <td style="border-bottom: 1px dotted #cccccc;">Pengawas Sekolah Ahli ${metadata.supervisorLevel.replace('Pengawas ', '').replace('Ahli ', '')}</td>
          </tr>
          <tr>
            <td style="border-bottom: 1px dotted #cccccc;">Unit Kerja</td>
            <td style="border-bottom: 1px dotted #cccccc; text-align: center;">:</td>
            <td style="border-bottom: 1px dotted #cccccc;">${metadata.supervisorUnit}</td>
          </tr>
          <tr>
            <td style="border-bottom: 1px dotted #cccccc;">Wilayah Binaan</td>
            <td style="border-bottom: 1px dotted #cccccc; text-align: center;">:</td>
            <td style="border-bottom: 1px dotted #cccccc;">${metadata.supervisorWilayah}</td>
          </tr>
        </table>

        <div class="section-title">B. IDENTITAS SATUAN PENDIDIKAN & SASARAN</div>
        <table class="info-table" style="width: 100%;">
          <tr>
            <td style="width: 32%; border-bottom: 1px dotted #cccccc;">Nama Sekolah</td>
            <td style="width: 3%; border-bottom: 1px dotted #cccccc; text-align: center;">:</td>
            <td style="width: 65%; border-bottom: 1px dotted #cccccc; font-weight: bold;">${metadata.schoolName}</td>
          </tr>
          <tr>
            <td style="border-bottom: 1px dotted #cccccc;">NPSN</td>
            <td style="border-bottom: 1px dotted #cccccc; text-align: center;">:</td>
            <td style="border-bottom: 1px dotted #cccccc;">${metadata.schoolNpsn}</td>
          </tr>
          <tr>
            <td style="border-bottom: 1px dotted #cccccc;">Alamat Sekolah</td>
            <td style="border-bottom: 1px dotted #cccccc; text-align: center;">:</td>
            <td style="border-bottom: 1px dotted #cccccc;">${metadata.schoolAddress}</td>
          </tr>
          <tr>
            <td style="border-bottom: 1px dotted #cccccc;">Nama Kepala Sekolah</td>
            <td style="border-bottom: 1px dotted #cccccc; text-align: center;">:</td>
            <td style="border-bottom: 1px dotted #cccccc; font-weight: bold;">${metadata.principalName || "-"}</td>
          </tr>
          <tr>
            <td style="border-bottom: 1px dotted #cccccc;">NIP Kepala Sekolah</td>
            <td style="border-bottom: 1px dotted #cccccc; text-align: center;">:</td>
            <td style="border-bottom: 1px dotted #cccccc;">${metadata.principalNip || "-"}</td>
          </tr>
          ${type === "Akademik" ? `
          <tr>
            <td style="border-bottom: 1px dotted #cccccc;">Nama Guru Sasaran</td>
            <td style="border-bottom: 1px dotted #cccccc; text-align: center;">:</td>
            <td style="border-bottom: 1px dotted #cccccc; font-weight: bold;">${metadata.teacherName || "-"}</td>
          </tr>
          <tr>
            <td style="border-bottom: 1px dotted #cccccc;">NIP Guru</td>
            <td style="border-bottom: 1px dotted #cccccc; text-align: center;">:</td>
            <td style="border-bottom: 1px dotted #cccccc;">${metadata.teacherNip || "-"}</td>
          </tr>
          <tr>
            <td style="border-bottom: 1px dotted #cccccc;">Mata Pelajaran / Kelas</td>
            <td style="border-bottom: 1px dotted #cccccc; text-align: center;">:</td>
            <td style="border-bottom: 1px dotted #cccccc;">${metadata.subjectOrClass || "-"}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="border-bottom: 1px dotted #cccccc;">Tanggal Pelaksanaan</td>
            <td style="border-bottom: 1px dotted #cccccc; text-align: center;">:</td>
            <td style="border-bottom: 1px dotted #cccccc;">${metadata.observationDate}</td>
          </tr>
        </table>

        <div class="section-title">C. DASAR HUKUM</div>
        <ol>
          <li>Peraturan Menteri PAN-RB Nomor 7 Tahun 2026 Pasal 9 ayat (3): tugas JF Pengawas Sekolah melaksanakan pemantauan, penilaian, dan pembinaan pada Satuan Pendidikan formal.</li>
          <li>Pasal 10 ayat (3) huruf a: Pengawas Sekolah Ahli Muda melakukan analisis mutu melalui pengawasan manajerial dan akademik pada Satuan Pendidikan formal.</li>
          <li>Pasal 10 ayat (3) huruf b: Pengawas Sekolah Ahli Madya melakukan pengendalian dan pengembangan mutu melalui pengawasan manajerial dan akademik pada Satuan Pendidikan formal.</li>
        </ol>

        <div style="page-break-after: always;"></div>

        <div class="section-title">D. Hasil Penilaian Kinerja Per Indikator (${type})</div>
        <table class="bordered" style="width: 100%;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="width: 10%;">No</th>
              <th style="width: 75%;">Pernyataan Indikator Kinerja</th>
              <th style="width: 15%;">Skor (1-4)</th>
            </tr>
          </thead>
          <tbody>
            ${categoriesHtml}
          </tbody>
        </table>

        <div style="page-break-after: always;"></div>

        <div class="section-title">E. Rekapitulasi & Kategori Mutu</div>
        <table class="bordered" style="width: 100%;">
          <tr>
            <td style="width: 50%; font-weight: bold;">Skor Total Perolehan</td>
            <td style="width: 50%;">${totalScoreObtained} (Maksimal: ${maxScore})</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Nilai Akhir (Skala 100)</td>
            <td style="font-weight: bold; font-size: 12pt; color: #1e3a8a;">${finalScorePercentage.toFixed(2)} %</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Kategori Mutu Capaian</td>
            <td style="font-weight: bold; text-transform: uppercase;">${ratingDetails.category}</td>
          </tr>
        </table>

        <div style="margin-top: 15px; margin-bottom: 20px;">
          <strong>Rekomendasi Tindak Lanjut Utama:</strong><br />
          <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 10px; font-style: italic;">
            "${ratingDetails.description}"
          </div>
        </div>

        <div class="section-title">F. Catatan Kekuatan & Pengembangan</div>
        <table class="bordered" style="width: 100%;">
          <tr>
            <th style="width: 50%;">Kekuatan yang Dipertahankan</th>
            <th style="width: 50%;">Area Pengembangan Prioritas</th>
          </tr>
          <tr>
            <td style="vertical-align: top; height: 100px;">${(strengths || "Belum ada catatan kekuatan.").replace(/\n/g, "<br />")}</td>
            <td style="vertical-align: top; height: 100px;">${(developments || "Belum ada catatan pengembangan.").replace(/\n/g, "<br />")}</td>
          </tr>
        </table>

        <div class="section-title">G. Rencana Tindak Lanjut & Strategi Pembinaan (RTL)</div>
        <table class="bordered" style="width: 100%;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="width: 5%;">No</th>
              <th style="width: 25%;">Rencana Tindak Lanjut</th>
              <th style="width: 25%;">Strategi Pembinaan</th>
              <th style="width: 15%;">Penanggung Jawab</th>
              <th style="width: 10%;">Target Waktu</th>
              <th style="width: 20%;">Indikator Keberhasilan</th>
            </tr>
          </thead>
          <tbody>
            ${actionPlansHtml || "<tr><td colspan='6' style='text-align: center;'>Tidak ada rencana tindak lanjut.</td></tr>"}
          </tbody>
        </table>

        <div class="signature-container">
          <table class="signature-table">
            <tr>
              <td>
                Guru / Kepala Sekolah yang Dinilai,<br /><br /><br /><br /><br />
                <span style="font-weight: bold; text-decoration: underline;">${targetName || "......................................."}</span><br />
                NIP. ${targetNip || "......................................."}
              </td>
              <td>
                Mengetahui,<br />Kepala Sekolah<br /><br /><br /><br /><br />
                <span style="font-weight: bold; text-decoration: underline;">${metadata.principalName || "......................................."}</span><br />
                NIP. ${metadata.principalNip || "......................................."}
              </td>
              <td>
                Dibuat Oleh,<br />Pengawas Sekolah,<br /><br /><br /><br /><br />
                <span style="font-weight: bold; text-decoration: underline;">${metadata.supervisorName}</span><br />
                NIP. ${metadata.supervisorNip}
              </td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin-top: 50px; font-size: 8pt; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px;">
          Laporan ini diunduh secara resmi melalui Sistem Informasi Pengawasan Pendidikan Terstruktur (SIPESAT).<br />
          Sistem dikembangkan oleh Zulfian Yusmana, M.Pd.
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + htmlContent], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SIPESAT_${type}_${metadata.schoolName.replace(/\s+/g, "_")}_${metadata.observationDate}.doc`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <button 
          onClick={onCancel}
          className="text-xs font-semibold text-slate-600 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Arsip
        </button>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleAutoFill}
            className="text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
            title="Mengisi kuesioner dengan nilai simulasi instan"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Simulasi Isi Nilai
          </button>

          <button 
            onClick={() => window.print()}
            className="text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" /> Cetak / PDF
          </button>

          <button 
            onClick={handleDownloadDocx}
            className="text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
            title="Unduh laporan dalam format Microsoft Word (.docx)"
          >
            <Download className="w-3.5 h-3.5" /> Unduh Word (DOCX)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 columns: Identity, Questionnaire, Actions */}
        <div className="lg:col-span-2 space-y-5">
          {/* Identity Card */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider font-display">Identitas Pelaksana & Sasaran</h3>
              <div className="flex gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase my-auto">Jabatan:</span>
                <select 
                  value={level} 
                  onChange={(e) => handleLevelChange(e.target.value as SupervisorLevel)}
                  className="bg-slate-50 text-xs border border-slate-200 rounded-lg p-1 font-bold text-indigo-600 focus:outline-none"
                >
                  <option value="Ahli Muda">Pengawas Ahli Muda</option>
                  <option value="Ahli Madya">Pengawas Ahli Madya</option>
                </select>
              </div>
            </div>

            {/* Config Selectors */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 block font-bold uppercase mb-1">Tipe Pengawasan</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    type="button"
                    onClick={() => handleTypeChange("Akademik")}
                    className={`text-xs font-bold py-1.5 rounded border cursor-pointer ${type === "Akademik" ? "bg-blue-600 text-white border-blue-600 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
                  >
                    Akademik
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleTypeChange("Manajerial")}
                    className={`text-xs font-bold py-1.5 rounded border cursor-pointer ${type === "Manajerial" ? "bg-fuchsia-600 text-white border-fuchsia-600 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
                  >
                    Manajerial
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block font-bold uppercase mb-1">Tanggal Observasi</label>
                <input
                  type="date"
                  value={metadata.observationDate || ""}
                  onChange={(e) => setMetadata(prev => ({ ...prev, observationDate: e.target.value }))}
                  className="w-full bg-slate-50 text-xs border border-slate-200 rounded p-1.5 font-medium text-slate-700"
                />
              </div>
            </div>

            {/* Dynamic Identity Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-slate-100 pt-3">
              {/* Supervisor Info Section */}
              <div className="space-y-3 bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-[10px] font-black text-indigo-700 tracking-wider uppercase block">Pengawas Sekolah (Pelaksana)</span>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Nama Pengawas</label>
                  <input
                    type="text"
                    value={metadata.supervisorName || ""}
                    onChange={(e) => setMetadata(prev => ({ ...prev, supervisorName: e.target.value }))}
                    className="w-full bg-white text-xs border border-slate-200 rounded-md p-1.5 font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">NIP Pengawas</label>
                  <input
                    type="text"
                    value={metadata.supervisorNip || ""}
                    onChange={(e) => setMetadata(prev => ({ ...prev, supervisorNip: e.target.value }))}
                    className="w-full bg-white text-xs border border-slate-200 rounded-md p-1.5 font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Unit Kerja / Wilayah</label>
                  <input
                    type="text"
                    value={metadata.supervisorUnit || ""}
                    onChange={(e) => setMetadata(prev => ({ ...prev, supervisorUnit: e.target.value }))}
                    className="w-full bg-white text-xs border border-slate-200 rounded-md p-1.5 font-medium"
                  />
                </div>
              </div>

              {/* School & Target Info Section */}
              <div className="space-y-3 bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-[10px] font-black text-emerald-700 tracking-wider uppercase block">B. IDENTITAS SATUAN PENDIDIKAN & SASARAN</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-bold">Nama Sekolah</label>
                    <input
                      type="text"
                      placeholder="e.g. SMAN 1 Rangkasbitung"
                      value={metadata.schoolName || ""}
                      onChange={(e) => setMetadata(prev => ({ ...prev, schoolName: e.target.value }))}
                      className="w-full bg-white text-xs border border-slate-200 rounded-md p-1.5 font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-bold">NPSN</label>
                    <input
                      type="text"
                      placeholder="e.g. 20601824"
                      value={metadata.schoolNpsn || ""}
                      onChange={(e) => setMetadata(prev => ({ ...prev, schoolNpsn: e.target.value }))}
                      className="w-full bg-white text-xs border border-slate-200 rounded-md p-1.5 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 font-bold">Alamat Sekolah</label>
                  <input
                    type="text"
                    placeholder="Alamat lengkap sekolah"
                    value={metadata.schoolAddress || ""}
                    onChange={(e) => setMetadata(prev => ({ ...prev, schoolAddress: e.target.value }))}
                    className="w-full bg-white text-xs border border-slate-200 rounded-md p-1.5 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-bold">Nama Kepala Sekolah</label>
                    <input
                      type="text"
                      placeholder="Nama Kepala Sekolah"
                      value={metadata.principalName || ""}
                      onChange={(e) => setMetadata(prev => ({ ...prev, principalName: e.target.value }))}
                      className="w-full bg-white text-xs border border-slate-200 rounded-md p-1.5 font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-bold">NIP Kepala Sekolah</label>
                    <input
                      type="text"
                      placeholder="NIP Kepala Sekolah"
                      value={metadata.principalNip || ""}
                      onChange={(e) => setMetadata(prev => ({ ...prev, principalNip: e.target.value }))}
                      className="w-full bg-white text-xs border border-slate-200 rounded-md p-1.5 font-medium"
                    />
                  </div>
                </div>

                {type === "Akademik" && (
                  <div className="space-y-2 pt-1 border-t border-slate-100">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1 font-bold">Nama Guru Sasaran</label>
                        <input
                          type="text"
                          placeholder="Nama Guru"
                          value={metadata.teacherName || ""}
                          onChange={(e) => setMetadata(prev => ({ ...prev, teacherName: e.target.value }))}
                          className="w-full bg-white text-xs border border-slate-200 rounded-md p-1.5 font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1 font-bold">NIP Guru</label>
                        <input
                          type="text"
                          placeholder="NIP Guru"
                          value={metadata.teacherNip || ""}
                          onChange={(e) => setMetadata(prev => ({ ...prev, teacherNip: e.target.value }))}
                          className="w-full bg-white text-xs border border-slate-200 rounded-md p-1.5 font-medium"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 font-bold">Mata Pelajaran / Kelas</label>
                      <input
                        type="text"
                        placeholder="e.g. Matematika / X IPA 1"
                        value={metadata.subjectOrClass || ""}
                        onChange={(e) => setMetadata(prev => ({ ...prev, subjectOrClass: e.target.value }))}
                        className="w-full bg-white text-xs border border-slate-200 rounded-md p-1.5 font-medium"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Questionnaire Checklist Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-indigo-50/20 p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-sm md:text-base">Daftar Indikator Penilaian Kinerja</h3>
                <span className="text-xs text-slate-500">Skor: 4 = Sangat Baik, 3 = Baik, 2 = Cukup, 1 = Kurang</span>
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full shrink-0">
                {Object.keys(scores).length} / {totalItems} Diisi
              </span>
            </div>

            {/* Checklist categories render */}
            <div className="divide-y divide-slate-100">
              {activeCategories.map((cat) => (
                <div key={cat.id} className="p-5 space-y-4">
                  <h4 className="font-extrabold text-indigo-950 text-xs md:text-sm tracking-wide bg-slate-50 p-2 rounded-lg border-l-4 border-indigo-500">
                    {cat.name}
                  </h4>

                  <div className="space-y-3">
                    {cat.items.map((item) => (
                      <div 
                        key={item.id} 
                        className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 rounded-xl hover:bg-slate-50/50 border border-transparent hover:border-slate-100 transition-all duration-150"
                      >
                        <div className="flex gap-3 text-xs md:text-sm text-slate-700 font-medium">
                          <span className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 font-bold text-[11px] text-slate-500 mt-0.5">
                            {item.id}
                          </span>
                          <p className="leading-relaxed">{item.text}</p>
                        </div>

                        {/* Scores radio set (1-4) */}
                        <div className="flex gap-1.5 shrink-0 justify-end md:justify-start">
                          {[1, 2, 3, 4].map((scoreVal) => {
                            const isSelected = scores[item.id] === scoreVal;
                            let btnStyle = "bg-white text-slate-500 border-slate-200 hover:bg-slate-50";
                            
                            if (isSelected) {
                              if (scoreVal === 4) btnStyle = "bg-emerald-600 text-white border-emerald-600 shadow-sm";
                              else if (scoreVal === 3) btnStyle = "bg-blue-600 text-white border-blue-600 shadow-sm";
                              else if (scoreVal === 2) btnStyle = "bg-amber-500 text-white border-amber-500 shadow-sm";
                              else btnStyle = "bg-rose-600 text-white border-rose-600 shadow-sm";
                            }

                            return (
                              <button
                                key={scoreVal}
                                type="button"
                                onClick={() => handleScoreChange(item.id, scoreVal)}
                                className={`w-8.5 h-8.5 rounded-lg border text-xs font-black transition-all cursor-pointer flex items-center justify-center ${btnStyle}`}
                                title={`Skor ${scoreVal}`}
                              >
                                {scoreVal}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* AI Catatan Pengawas for this category */}
                  <div className="mt-3 bg-slate-50 p-4 rounded-xl border border-slate-100/50 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black tracking-wider text-slate-500 uppercase">Catatan Pengawas Sektor ({cat.id})</label>
                      <span className="text-[9px] text-slate-400">diisi otomatis atau manual</span>
                    </div>
                    <textarea
                      value={notes[cat.id] || ""}
                      onChange={(e) => setNotes(prev => ({ ...prev, [cat.id]: e.target.value }))}
                      placeholder="Masukkan catatan spesifik hasil observasi, atau gunakan tombol 'Asisten AI' di sebelah kanan untuk menjabarkan otomatis..."
                      className="w-full text-xs bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-lg p-2.5 min-h-[50px] leading-relaxed text-slate-700"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Plan Table Row (Rencana Tindak Lanjut) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-sm md:text-base">J. Rencana Tindak Lanjut dan Strategi Pembinaan</h3>
                <p className="text-xs text-slate-500 mt-0.5">Rencana aksi pembinaan terstruktur tindak lanjut pasca-supervisi.</p>
              </div>
              <button
                type="button"
                onClick={handleAddPlanRow}
                className="text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Tambah Baris
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 uppercase font-semibold">
                    <th className="p-3">Rencana Tindak Lanjut</th>
                    <th className="p-3">Strategi Pembinaan</th>
                    <th className="p-3">Penanggung Jawab</th>
                    <th className="p-3">Target</th>
                    <th className="p-3">Indikator Keberhasilan</th>
                    <th className="p-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {actionPlans.map((item) => (
                    <tr key={item.id}>
                      <td className="p-2">
                        <textarea
                          value={item.plan || ""}
                          onChange={(e) => handleUpdatePlanField(item.id, "plan", e.target.value)}
                          className="w-full bg-slate-50/50 focus:bg-white border border-transparent focus:border-indigo-300 rounded-md p-1.5 text-xs focus:outline-none"
                          rows={2}
                        />
                      </td>
                      <td className="p-2">
                        <textarea
                          value={item.strategy || ""}
                          onChange={(e) => handleUpdatePlanField(item.id, "strategy", e.target.value)}
                          className="w-full bg-slate-50/50 focus:bg-white border border-transparent focus:border-indigo-300 rounded-md p-1.5 text-xs focus:outline-none"
                          rows={2}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.pic || ""}
                          onChange={(e) => handleUpdatePlanField(item.id, "pic", e.target.value)}
                          className="w-full bg-slate-50/50 focus:bg-white border border-transparent focus:border-indigo-300 rounded-md p-1.5 text-xs focus:outline-none"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.targetTime || ""}
                          onChange={(e) => handleUpdatePlanField(item.id, "targetTime", e.target.value)}
                          className="w-full bg-slate-50/50 focus:bg-white border border-transparent focus:border-indigo-300 rounded-md p-1.5 text-xs focus:outline-none"
                        />
                      </td>
                      <td className="p-2">
                        <textarea
                          value={item.successIndicator || ""}
                          onChange={(e) => handleUpdatePlanField(item.id, "successIndicator", e.target.value)}
                          className="w-full bg-slate-50/50 focus:bg-white border border-transparent focus:border-indigo-300 rounded-md p-1.5 text-xs focus:outline-none"
                          rows={2}
                        />
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemovePlanRow(item.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 column: Score summary & AI Generator Panel */}
        <div className="space-y-6">
          {/* Score & Category overview */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-indigo-950 space-y-4">
            <h3 className="font-extrabold text-indigo-200 text-xs tracking-wider uppercase">Ringkasan Nilai Akhir</h3>
            
            <div className="text-center py-4 bg-white/5 rounded-xl border border-white/10">
              <span className="text-5xl font-black block text-indigo-100">{finalScorePercentage.toFixed(1)}</span>
              <span className="text-xs text-indigo-300 font-medium block mt-1">Skor Perolehan: {totalScoreObtained} / {maxScore}</span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-indigo-300 block uppercase font-bold leading-none">Kategori Mutu</span>
              <span className="text-xl font-bold block">{ratingDetails.category}</span>
              <p className="text-[11px] text-slate-300 leading-relaxed mt-1">{ratingDetails.description}</p>
            </div>

            {/* Save to Archives */}
            <div className="space-y-2 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={handleFormSave}
                className="w-full text-xs font-black bg-emerald-500 text-slate-950 hover:bg-emerald-400 py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Save className="w-4 h-4" /> Simpan Ke Arsip Laporan
              </button>

              {initialAssessment && (
                <button
                  type="button"
                  onClick={() => onTriggerNotification(initialAssessment)}
                  className="w-full text-xs font-bold bg-white/10 text-white hover:bg-white/20 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-white/10"
                >
                  <Send className="w-3.5 h-3.5" /> Kirim Notifikasi Hasil
                </button>
              )}
            </div>
          </div>

          {/* AI Generator card */}
          <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-full filter blur-xl" />
            
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Asisten AI (Gemini)</h3>
                <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">PermenpanRB No. 7</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Menganalisis hasil penilaian indikator secara terstruktur untuk mengisi <strong>Catatan Sektor</strong>, <strong>Catatan Kekuatan</strong>, dan <strong>Area Pengembangan</strong> secara efisien, akurat, dan otomatis.
            </p>

            <button
              type="button"
              disabled={aiLoading}
              onClick={handleGenerateAINotes}
              className={`w-full text-xs font-black py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${aiLoading ? "bg-slate-100 text-slate-400 border border-slate-200" : "bg-gradient-to-r from-indigo-600 to-indigo-800 text-white shadow-sm hover:from-indigo-700 hover:to-indigo-900"}`}
            >
              {aiLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-400" /> Memproses...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" /> Isi Otomatis dengan AI
                </>
              )}
            </button>

            {aiMessage && (
              <div className="bg-indigo-50/50 border border-indigo-100 p-3 rounded-xl text-[11px] text-indigo-700 leading-normal animate-pulse">
                {aiMessage}
              </div>
            )}
          </div>

          {/* Automatics Strengths and Area of Development Inputs */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-50 pb-2">Catatan Kekuatan & Pengembangan</h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Catatan Kekuatan yang Perlu Dipertahankan</label>
                <textarea
                  value={strengths || ""}
                  onChange={(e) => setStrengths(e.target.value)}
                  placeholder="Diisi otomatis berdasarkan skor indikator penilaian kinerja atau edit secara manual..."
                  className="w-full text-xs bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-lg p-2.5 min-h-[120px] leading-relaxed text-slate-700"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Area Pengembangan yang Diprioritaskan</label>
                <textarea
                  value={developments || ""}
                  onChange={(e) => setDevelopments(e.target.value)}
                  placeholder="Diisi otomatis berdasarkan skor rendah atau edit secara manual..."
                  className="w-full text-xs bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-lg p-2.5 min-h-[120px] leading-relaxed text-slate-700"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =======================================================
          5. FORMAL OFFICIAL PRINTABLE SHEET (HIDDEN ON SCREEN)
          ======================================================= */}
      <div className="hidden print:block bg-white text-black p-8 font-serif leading-relaxed text-xs max-w-4xl mx-auto printable-document">
        
        {/* Official Kop Surat Dinas Pendidikan Kabupaten Lebak */}
        <div className="kop-surat mb-6 border-b-4 border-black pb-3">
          <div className="flex items-center justify-between gap-4">
            <div className="w-24 shrink-0 flex justify-center">
              <img 
                src={LOGO_LEBAK_BASE64 || LOGO_LEBAK_URL} 
                alt="Logo Kabupaten Lebak" 
                className="w-20 h-auto object-contain"
              />
            </div>
            <div className="text-center flex-1 font-sans">
              <h1 className="text-base md:text-lg font-black uppercase tracking-wider text-black m-0 leading-tight">
                PEMERINTAH KABUPATEN LEBAK
              </h1>
              <h2 className="text-lg md:text-xl font-black uppercase tracking-widest text-black m-0 my-0.5 leading-tight">
                DINAS PENDIDIKAN
              </h2>
              <p className="text-[11px] text-black m-0 leading-tight">
                Jalan Siliwangi Pasir Ona, Rangkasbitung, Lebak, Banten 42313
              </p>
              <p className="text-[11px] text-black m-0 leading-tight">
                Telepon (0252) 280786, Faksimile (0252) 280911 PO. BOX 21
              </p>
              <p className="text-[11px] text-black m-0 leading-tight">
                Laman : disdik.lebakkab.go.id Pos-el : disdik@lebakkab.go.id
              </p>
            </div>
          </div>
        </div>

        {/* Page Sub Header */}
        <div className="border-b border-slate-300 pb-1 mb-6 flex justify-between text-[10px] font-sans italic text-slate-500">
          <span>Instrumen Pengawasan Akademik & Manajerial PermenpanRB No. 7 Tahun 2026</span>
          <span>Sistem Informasi Pengawasan Pendidikan Terstruktur (SIPESAT)</span>
        </div>

        {/* Cover title */}
        <div className="text-center space-y-4 my-10">
          <h1 className="text-xl font-bold tracking-wider uppercase">PAKET INSTRUMEN PENGAWASAN<br />AKADEMIK DAN MANAJERIAL</h1>
          <h2 className="text-base font-bold text-slate-700 uppercase">PENGAWAS SEKOLAH {level}</h2>
          <div className="w-32 h-1 bg-black mx-auto my-3" />
          <p className="text-[10px] text-slate-500 leading-relaxed italic">
            Disusun berdasarkan<br />
            <strong>Peraturan Menteri Pendayagunaan Aparatur Negara dan Reformasi Birokrasi Nomor 7 Tahun 2026</strong><br />
            tentang Jabatan Fungsional di Bidang Pendidik dan Pengawasan Mutu Pendidikan
          </p>
        </div>

        <hr className="border-black my-6" />

        {/* Section A: IDENTITAS PELAKSANA PENGAWASAN */}
        <div className="space-y-3 mt-6">
          <h3 className="font-bold text-xs uppercase tracking-wide border-b border-black pb-1">A. IDENTITAS PELAKSANA PENGAWASAN</h3>
          <table className="w-full text-xs font-serif border-collapse">
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="py-1.5 w-56 font-medium">Nama Pengawas Sekolah</td>
                <td className="py-1.5 w-4 text-center">:</td>
                <td className="py-1.5 font-bold">{metadata.supervisorName}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1.5 font-medium">NIP Pengawas</td>
                <td className="py-1.5 text-center">:</td>
                <td className="py-1.5">{metadata.supervisorNip}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1.5 font-medium">Jenjang / Jabatan</td>
                <td className="py-1.5 text-center">:</td>
                <td className="py-1.5">Pengawas Sekolah Ahli {level}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1.5 font-medium">Unit Kerja</td>
                <td className="py-1.5 text-center">:</td>
                <td className="py-1.5">{metadata.supervisorUnit}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1.5 font-medium">Wilayah Binaan</td>
                <td className="py-1.5 text-center">:</td>
                <td className="py-1.5">{metadata.supervisorWilayah}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section B: IDENTITAS SATUAN PENDIDIKAN & SASARAN */}
        <div className="space-y-3 mt-6">
          <h3 className="font-bold text-xs uppercase tracking-wide border-b border-black pb-1">B. IDENTITAS SATUAN PENDIDIKAN & SASARAN</h3>
          <table className="w-full text-xs font-serif border-collapse">
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="py-1.5 w-56 font-medium">Nama Sekolah</td>
                <td className="py-1.5 w-4 text-center">:</td>
                <td className="py-1.5 font-bold">{metadata.schoolName}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1.5 font-medium">NPSN</td>
                <td className="py-1.5 text-center">:</td>
                <td className="py-1.5">{metadata.schoolNpsn}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1.5 font-medium">Alamat Sekolah</td>
                <td className="py-1.5 text-center">:</td>
                <td className="py-1.5">{metadata.schoolAddress}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1.5 font-medium">Nama Kepala Sekolah</td>
                <td className="py-1.5 text-center">:</td>
                <td className="py-1.5 font-bold">{metadata.principalName || "-"}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1.5 font-medium">NIP Kepala Sekolah</td>
                <td className="py-1.5 text-center">:</td>
                <td className="py-1.5">{metadata.principalNip || "-"}</td>
              </tr>
              {type === "Akademik" && (
                <>
                  <tr className="border-b border-slate-200">
                    <td className="py-1.5 font-medium">Nama Guru Sasaran</td>
                    <td className="py-1.5 text-center">:</td>
                    <td className="py-1.5 font-bold">{metadata.teacherName || "-"}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-1.5 font-medium">NIP Guru</td>
                    <td className="py-1.5 text-center">:</td>
                    <td className="py-1.5">{metadata.teacherNip || "-"}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-1.5 font-medium">Mata Pelajaran / Kelas</td>
                    <td className="py-1.5 text-center">:</td>
                    <td className="py-1.5">{metadata.subjectOrClass || "-"}</td>
                  </tr>
                </>
              )}
              <tr className="border-b border-slate-200">
                <td className="py-1.5 font-medium">Tanggal Pelaksanaan</td>
                <td className="py-1.5 text-center">:</td>
                <td className="py-1.5">{metadata.observationDate}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section C: DASAR HUKUM */}
        <div className="space-y-3 mt-6">
          <h3 className="font-bold text-xs uppercase tracking-wide border-b border-black pb-1">C. DASAR HUKUM</h3>
          <ol className="list-decimal pl-5 space-y-1 text-[11px]">
            <li>Peraturan Menteri PAN-RB Nomor 7 Tahun 2026 Pasal 9 ayat (3): tugas JF Pengawas Sekolah melaksanakan pemantauan, penilaian, dan pembinaan pada Satuan Pendidikan formal.</li>
            <li>Pasal 10 ayat (3) huruf a: Pengawas Sekolah Ahli Muda melakukan analisis mutu melalui pengawasan manajerial dan akademik pada Satuan Pendidikan formal.</li>
            <li>Pasal 10 ayat (3) huruf b: Pengawas Sekolah Ahli Madya melakukan pengendalian dan pengembangan mutu melalui pengawasan manajerial dan akademik pada Satuan Pendidikan formal.</li>
            <li>Ruang lingkup pengawasan akademik meliputi perencanaan, pelaksanaan, dan penilaian pembelajaran, serta penguatan pendidikan karakter.</li>
          </ol>
        </div>

        <div className="page-break-before" style={{ pageBreakBefore: "always" }} />

        {/* Section D: PETUNJUK & RUBRIK */}
        <div className="space-y-4 my-8">
          <h3 className="font-bold text-sm uppercase">D. Petunjuk Pengisian</h3>
          <p className="text-[11px]">
            1. Penilaian menggunakan skala 1-4. Skor diisikan sesuai dengan kesiapan administrasi dan hasil tinjauan observasi nyata.<br />
            2. Kolom Catatan Pengawas diisi dengan rekomendasi terperinci per sektor kinerja.<br />
            3. Penilaian akhir dihitung secara otomatis menggunakan persentase capaian terhadap skor maksimal.
          </p>

          <h3 className="font-bold text-sm uppercase mt-6">E. Rubrik Penilaian</h3>
          <table className="w-full border-collapse border border-slate-300 text-[11px]">
            <thead>
              <tr className="bg-slate-100 font-bold">
                <th className="border border-slate-300 p-2">Skor</th>
                <th className="border border-slate-300 p-2">Kriteria</th>
                <th className="border border-slate-300 p-2">Deskriptor</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-300 p-2 font-bold text-center">4</td>
                <td className="border border-slate-300 p-2 font-bold">Sangat Baik</td>
                <td className="border border-slate-300 p-2">Dilaksanakan secara konsisten, inovatif, dan terdokumentasi dengan sangat baik; berdampak positif nyata pada mutu pendidikan.</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2 font-bold text-center">3</td>
                <td className="border border-slate-300 p-2 font-bold">Baik</td>
                <td className="border border-slate-300 p-2">Dilaksanakan dengan baik dan sebagian besar terdokumentasi; sudah menunjukkan dampak positif.</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2 font-bold text-center">2</td>
                <td className="border border-slate-300 p-2 font-bold">Cukup</td>
                <td className="border border-slate-300 p-2">Sudah dilaksanakan namun belum konsisten; dampak yang ditimbulkan belum optimal.</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2 font-bold text-center">1</td>
                <td className="border border-slate-300 p-2 font-bold">Kurang</td>
                <td className="border border-slate-300 p-2">Belum dilaksanakan atau baru pada tahap perencanaan; perlu pembinaan segera.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="page-break-before" style={{ pageBreakBefore: "always" }} />

        {/* Section F: DETAIL PERTANYAAN */}
        <div className="space-y-4 my-8">
          <h3 className="font-bold text-sm uppercase">F. Hasil Pengawasan Komponen Real-Time ({type})</h3>
          
          <table className="w-full border-collapse border border-slate-300 text-[10px]">
            <thead>
              <tr className="bg-slate-100 font-bold text-center">
                <th className="border border-slate-300 p-2 w-12">No</th>
                <th className="border border-slate-300 p-2">Pernyataan Indikator Kinerja</th>
                <th className="border border-slate-300 p-2 w-12">Skor</th>
              </tr>
            </thead>
            <tbody>
              {activeCategories.map(cat => (
                <React.Fragment key={cat.id}>
                  <tr className="bg-slate-50 font-bold">
                    <td colSpan={3} className="border border-slate-300 p-2 text-indigo-900">{cat.name}</td>
                  </tr>
                  {cat.items.map(item => (
                    <tr key={item.id}>
                      <td className="border border-slate-300 p-1 text-center">{item.id}</td>
                      <td className="border border-slate-300 p-1">{item.text}</td>
                      <td className="border border-slate-300 p-1 text-center font-bold text-sm">{scores[item.id] || "-"}</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={3} className="border border-slate-300 p-2 italic bg-slate-50/50">
                      <strong>Catatan Pengawas Sektor:</strong> {notes[cat.id] || "Tidak ada catatan spesifik."}
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div className="page-break-before" style={{ pageBreakBefore: "always" }} />

        {/* Section G: REKAPITULASI NILAI */}
        <div className="space-y-4 my-8">
          <h3 className="font-bold text-sm uppercase">G. Rekapitulasi Nilai Akhir</h3>
          <table className="w-full border-collapse border border-slate-300 text-[11px]">
            <tbody>
              <tr>
                <td className="border border-slate-300 p-2 font-bold w-1/3">Skor Total Perolehan</td>
                <td className="border border-slate-300 p-2 font-bold">{totalScoreObtained}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2 font-bold">Skor Maksimal</td>
                <td className="border border-slate-300 p-2">{maxScore}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2 font-bold">Nilai Akhir (Skala 100)</td>
                <td className="border border-slate-300 p-2 font-extrabold text-base text-indigo-700">
                  {finalScorePercentage.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2 font-bold">Kategori Mutu Pendidikan</td>
                <td className="border border-slate-300 p-2 font-bold text-indigo-600">{ratingDetails.category}</td>
              </tr>
            </tbody>
          </table>

          <h3 className="font-bold text-sm uppercase mt-8">H. Rekomendasi Tindak Lanjut</h3>
          <p className="bg-slate-50 p-4 border border-slate-200 rounded-lg text-[11px] leading-relaxed italic">
            &ldquo;{ratingDetails.description}&rdquo;
          </p>

          <h3 className="font-bold text-sm uppercase mt-8">I. Catatan Kekuatan & Area Pengembangan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-slate-300 p-4 rounded-lg bg-slate-50/20">
              <span className="font-bold text-xs uppercase block text-emerald-800 border-b border-slate-200 pb-1.5 mb-2">Kekuatan yang Dipertahankan:</span>
              <p className="text-[11px] whitespace-pre-wrap leading-relaxed">{strengths || "Belum ada catatan kekuatan."}</p>
            </div>
            <div className="border border-slate-300 p-4 rounded-lg bg-slate-50/20">
              <span className="font-bold text-xs uppercase block text-rose-800 border-b border-slate-200 pb-1.5 mb-2">Area Pengembangan Prioritas:</span>
              <p className="text-[11px] whitespace-pre-wrap leading-relaxed">{developments || "Belum ada catatan pengembangan."}</p>
            </div>
          </div>
        </div>

        <div className="page-break-before" style={{ pageBreakBefore: "always" }} />

        {/* Section J: RTL PRINT */}
        <div className="space-y-4 my-8">
          <h3 className="font-bold text-sm uppercase">J. Rencana Tindak Lanjut dan Strategi Pembinaan</h3>
          <table className="w-full border-collapse border border-slate-300 text-[10px]">
            <thead>
              <tr className="bg-slate-100 font-bold">
                <th className="border border-slate-300 p-2">Rencana Tindak Lanjut</th>
                <th className="border border-slate-300 p-2">Strategi / Bentuk Pembinaan</th>
                <th className="border border-slate-300 p-2 w-28">Penanggung Jawab</th>
                <th className="border border-slate-300 p-2 w-20">Target Waktu</th>
                <th className="border border-slate-300 p-2">Indikator Keberhasilan</th>
              </tr>
            </thead>
            <tbody>
              {actionPlans.map(item => (
                <tr key={item.id}>
                  <td className="border border-slate-300 p-2">{item.plan || "-"}</td>
                  <td className="border border-slate-300 p-2">{item.strategy || "-"}</td>
                  <td className="border border-slate-300 p-2">{item.pic || "-"}</td>
                  <td className="border border-slate-300 p-2">{item.targetTime || "-"}</td>
                  <td className="border border-slate-300 p-2">{item.successIndicator || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section K: SIGNATURES */}
        <div className="mt-16 pt-8 border-t border-slate-200">
          <div className="grid grid-cols-3 text-center text-[11px] leading-relaxed gap-6">
            <div>
              <span>Guru yang Diobservasi,</span>
              <div className="h-20" />
              <span className="font-bold block">(...............................................)</span>
              <span>NIP. {metadata.teacherNip || "...................................."}</span>
            </div>
            
            <div>
              <span>Mengetahui,<br />Kepala Sekolah</span>
              <div className="h-16" />
              <span className="font-bold block">({metadata.principalName || "..............................................."})</span>
              <span>NIP. {metadata.principalNip || "...................................."}</span>
            </div>

            <div>
              <span>Dibuat oleh,<br />Pengawas Sekolah {level}</span>
              <div className="h-16" />
              <span className="font-bold block">({metadata.supervisorName})</span>
              <span>NIP. {metadata.supervisorNip}</span>
            </div>
          </div>
        </div>

        {/* Developer Footer Acknowledgement */}
        <div className="text-center text-[9px] text-slate-400 mt-20 border-t border-slate-100 pt-4 font-sans uppercase tracking-wider">
          Aplikasi SIPESAT PermenpanRB No. 7 Tahun 2026 dikembangkan secara mandiri oleh Zulfian Yusmana, M.Pd.
        </div>

      </div>
    </div>
  );
}
