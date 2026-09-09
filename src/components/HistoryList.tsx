import React, { useState } from "react";
import { Assessment, NotificationLog } from "../types";
import { Search, FileText, Download, Trash2, Calendar, Award, User, School, BellRing, Printer } from "lucide-react";
import * as XLSX from "xlsx";
import { getMutuCategory, ACADEMIC_CATEGORIES, MANAGERIAL_CATEGORIES } from "../data/instruments";
import { LOGO_LEBAK_BASE64 } from "../data/logo";

interface HistoryListProps {
  assessments: Assessment[];
  onSelect: (assessment: Assessment) => void;
  onDelete: (id: string) => void;
  onSendNotification: (assessment: Assessment) => void;
}

export default function HistoryList({ assessments, onSelect, onDelete, onSendNotification }: HistoryListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"All" | "Akademik" | "Manajerial">("All");
  const [levelFilter, setLevelFilter] = useState<"All" | "Ahli Muda" | "Ahli Madya">("All");

  // Export single assessment to Excel using XLSX
  const exportToExcel = (ass: Assessment) => {
    // We will build a beautifully structured Excel sheet with multiple sections
    const wb = XLSX.utils.book_new();
    
    // Sheet 1: Identitas & Ringkasan
    const summaryData = [
      ["SIPESAT - LAPORAN SUPERVISI DAN PENGAWASAN MUTU SEKOLAH"],
      ["Berdasarkan PermenpanRB No. 7 Tahun 2026"],
      [],
      ["1. IDENTITAS PELAKSANA PENGAWASAN"],
      ["Nama Pengawas", ass.metadata.supervisorName],
      ["NIP Pengawas", ass.metadata.supervisorNip],
      ["Jenjang / Jabatan", `Pengawas Sekolah ${ass.metadata.supervisorLevel}`],
      ["Unit Kerja", ass.metadata.supervisorUnit],
      ["Wilayah Binaan", ass.metadata.supervisorWilayah],
      [],
      ["2. IDENTITAS SEKOLAH & SASARAN SUPERVISI"],
      ["Nama Sekolah", ass.metadata.schoolName],
      ["NPSN", ass.metadata.schoolNpsn],
      ["Alamat Sekolah", ass.metadata.schoolAddress],
      ["Tipe Pengawasan", ass.type],
      ["Tanggal Pelaksanaan", ass.metadata.observationDate],
      [
        ass.type === "Akademik" ? "Nama Guru Sasaran" : "Nama Kepala Sekolah",
        ass.type === "Akademik" ? ass.metadata.teacherName : ass.metadata.principalName
      ],
      [
        ass.type === "Akademik" ? "Mata Pelajaran / Kelas" : "Pendidikan Terakhir",
        ass.type === "Akademik" ? ass.metadata.subjectOrClass : ass.metadata.principalEducation
      ],
      [],
      ["3. REKAPITULASI HASIL PENILAIAN"],
      ["Skor Total Perolehan", Object.values(ass.scores).reduce((a, b) => a + b, 0)],
      ["Skor Maksimal", ass.type === "Akademik" ? 232 : 148],
      ["Nilai Akhir (Skala 100)", ass.finalScore.toFixed(2)],
      ["Kategori Mutu", ass.finalCategory],
      [],
      ["4. CATATAN UTAMA & TINDAK LANJUT"],
      ["Catatan Kekuatan", ass.strengths],
      ["Catatan Area Pengembangan", ass.developments],
      [],
      ["Sistem Pengawasan dikembangkan oleh Zulfian Yusmana, M.Pd."]
    ];

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan Hasil");

    // Sheet 2: Rincian Skor Per Indikator
    const scoreRows = [
      ["No Indikator", "Pernyataan Kinerja", "Skor (1-4)", "Rubrik Keterangan"]
    ];

    Object.entries(ass.scores).forEach(([itemNum, val]) => {
      let desc = "";
      if (val === 4) desc = "Sangat Baik (Konsisten, inovatif, terdokumentasi)";
      else if (val === 3) desc = "Baik (Terlaksana dengan baik, terdokumentasi)";
      else if (val === 2) desc = "Cukup (Terlaksana, belum konsisten, belum optimal)";
      else desc = "Kurang (Belum terlaksana atau baru tahap perencanaan)";

      scoreRows.push([
        itemNum,
        `Indikator Kinerja Nomor ${itemNum}`,
        val.toString(),
        desc
      ]);
    });

    const wsScores = XLSX.utils.aoa_to_sheet(scoreRows);
    XLSX.utils.book_append_sheet(wb, wsScores, "Rincian Skor Indikator");

    // Sheet 3: Rencana Tindak Lanjut (RTL)
    const rtlRows = [
      ["No", "Rencana Tindak Lanjut", "Strategi / Bentuk Pembinaan", "Penanggung Jawab", "Target Waktu", "Indikator Keberhasilan"]
    ];

    ass.actionPlan.forEach((item, index) => {
      rtlRows.push([
        (index + 1).toString(),
        item.plan,
        item.strategy,
        item.pic,
        item.targetTime,
        item.successIndicator
      ]);
    });

    const wsRtl = XLSX.utils.aoa_to_sheet(rtlRows);
    XLSX.utils.book_append_sheet(wb, wsRtl, "Rencana Tindak Lanjut");

    // Write file
    const fileName = `SIPESAT_${ass.type}_${ass.metadata.schoolName.replace(/\s+/g, "_")}_${ass.metadata.observationDate}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const exportToDocx = (ass: Assessment) => {
    const targetName = ass.type === "Akademik" ? ass.metadata.teacherName : ass.metadata.principalName;
    const targetLabel = ass.type === "Akademik" ? "Nama Guru Sasaran" : "Nama Kepala Sekolah Sasaran";
    const targetNipLabel = ass.type === "Akademik" ? "NIP Guru" : "NIP Kepala Sekolah";
    const targetNip = ass.type === "Akademik" ? ass.metadata.teacherNip : ass.metadata.principalNip;
    const targetExtraLabel = ass.type === "Akademik" ? "Mata Pelajaran / Kelas" : "Pendidikan Terakhir";
    const targetExtraVal = ass.type === "Akademik" ? ass.metadata.subjectOrClass : ass.metadata.principalEducation;

    const level = ass.metadata.supervisorLevel;
    const activeCategories = ass.type === "Akademik" ? ACADEMIC_CATEGORIES(level) : MANAGERIAL_CATEGORIES(level);
    const totalItems = ass.type === "Akademik" ? 58 : 37;
    const maxScore = totalItems * 4;
    const totalScoreObtained = (Object.values(ass.scores) as number[]).reduce((sum, curr) => sum + curr, 0);
    const finalScorePercentage = totalItems > 0 ? (totalScoreObtained / maxScore) * 100 : 0;
    const ratingDetails = getMutuCategory(finalScorePercentage);

    // Build categories scores HTML
    let categoriesHtml = "";
    activeCategories.forEach(cat => {
      categoriesHtml += `
        <tr style="background-color: #f1f5f9; font-weight: bold;">
          <td colspan="3" style="border: 1px solid #94a3b8; padding: 8px; color: #1e3a8a; font-family: sans-serif; font-size: 11pt;">${cat.name}</td>
        </tr>
      `;
      cat.items.forEach(item => {
        const score = ass.scores[item.id] || "-";
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
            <strong>Catatan Sektor:</strong> ${ass.notes[cat.id] || "Tidak ada catatan spesifik."}
          </td>
        </tr>
      `;
    });

    // Build action plans HTML
    let actionPlansHtml = "";
    ass.actionPlan.forEach((item, index) => {
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
        <title>Laporan SIPESAT - ${ass.metadata.schoolName}</title>
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
        <div class="subjudul">INSTRUMEN PENGAWASAN ${ass.type.toUpperCase()} (PERMENPAN-RB NO. 7 TAHUN 2026)</div>

        <div class="section-title">A. IDENTITAS PELAKSANA PENGAWASAN</div>
        <table class="info-table" style="width: 100%;">
          <tr>
            <td style="width: 32%; border-bottom: 1px dotted #cccccc;">Nama Pengawas Sekolah</td>
            <td style="width: 3%; border-bottom: 1px dotted #cccccc; text-align: center;">:</td>
            <td style="width: 65%; border-bottom: 1px dotted #cccccc; font-weight: bold;">${ass.metadata.supervisorName}</td>
          </tr>
          <tr>
            <td style="border-bottom: 1px dotted #cccccc;">NIP Pengawas</td>
            <td style="border-bottom: 1px dotted #cccccc; text-align: center;">:</td>
            <td style="border-bottom: 1px dotted #cccccc;">${ass.metadata.supervisorNip}</td>
          </tr>
          <tr>
            <td style="border-bottom: 1px dotted #cccccc;">Jenjang / Jabatan</td>
            <td style="border-bottom: 1px dotted #cccccc; text-align: center;">:</td>
            <td style="border-bottom: 1px dotted #cccccc;">Pengawas Sekolah Ahli ${(ass.metadata.supervisorLevel || "").replace('Pengawas ', '').replace('Ahli ', '')}</td>
          </tr>
          <tr>
            <td style="border-bottom: 1px dotted #cccccc;">Unit Kerja</td>
            <td style="border-bottom: 1px dotted #cccccc; text-align: center;">:</td>
            <td style="border-bottom: 1px dotted #cccccc;">${ass.metadata.supervisorUnit}</td>
          </tr>
          <tr>
            <td style="border-bottom: 1px dotted #cccccc;">Wilayah Binaan</td>
            <td style="border-bottom: 1px dotted #cccccc; text-align: center;">:</td>
            <td style="border-bottom: 1px dotted #cccccc;">${ass.metadata.supervisorWilayah}</td>
          </tr>
        </table>

        <div class="section-title">B. IDENTITAS SATUAN PENDIDIKAN & SASARAN</div>
        <table class="info-table" style="width: 100%;">
          <tr>
            <td style="width: 32%; border-bottom: 1px dotted #cccccc;">Nama Sekolah</td>
            <td style="width: 3%; border-bottom: 1px dotted #cccccc; text-align: center;">:</td>
            <td style="width: 65%; border-bottom: 1px dotted #cccccc; font-weight: bold;">${ass.metadata.schoolName}</td>
          </tr>
          <tr>
            <td style="border-bottom: 1px dotted #cccccc;">NPSN</td>
            <td style="border-bottom: 1px dotted #cccccc; text-align: center;">:</td>
            <td style="border-bottom: 1px dotted #cccccc;">${ass.metadata.schoolNpsn}</td>
          </tr>
          <tr>
            <td style="border-bottom: 1px dotted #cccccc;">Alamat Sekolah</td>
            <td style="border-bottom: 1px dotted #cccccc; text-align: center;">:</td>
            <td style="border-bottom: 1px dotted #cccccc;">${ass.metadata.schoolAddress}</td>
          </tr>
          <tr>
            <td style="border-bottom: 1px dotted #cccccc;">Nama Kepala Sekolah</td>
            <td style="border-bottom: 1px dotted #cccccc; text-align: center;">:</td>
            <td style="border-bottom: 1px dotted #cccccc; font-weight: bold;">${ass.metadata.principalName || "-"}</td>
          </tr>
          <tr>
            <td style="border-bottom: 1px dotted #cccccc;">NIP Kepala Sekolah</td>
            <td style="border-bottom: 1px dotted #cccccc; text-align: center;">:</td>
            <td style="border-bottom: 1px dotted #cccccc;">${ass.metadata.principalNip || "-"}</td>
          </tr>
          ${ass.type === "Akademik" ? `
          <tr>
            <td style="border-bottom: 1px dotted #cccccc;">Nama Guru Sasaran</td>
            <td style="border-bottom: 1px dotted #cccccc; text-align: center;">:</td>
            <td style="border-bottom: 1px dotted #cccccc; font-weight: bold;">${ass.metadata.teacherName || "-"}</td>
          </tr>
          <tr>
            <td style="border-bottom: 1px dotted #cccccc;">NIP Guru</td>
            <td style="border-bottom: 1px dotted #cccccc; text-align: center;">:</td>
            <td style="border-bottom: 1px dotted #cccccc;">${ass.metadata.teacherNip || "-"}</td>
          </tr>
          <tr>
            <td style="border-bottom: 1px dotted #cccccc;">Mata Pelajaran / Kelas</td>
            <td style="border-bottom: 1px dotted #cccccc; text-align: center;">:</td>
            <td style="border-bottom: 1px dotted #cccccc;">${ass.metadata.subjectOrClass || "-"}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="border-bottom: 1px dotted #cccccc;">Tanggal Pelaksanaan</td>
            <td style="border-bottom: 1px dotted #cccccc; text-align: center;">:</td>
            <td style="border-bottom: 1px dotted #cccccc;">${ass.metadata.observationDate}</td>
          </tr>
        </table>

        <div class="section-title">C. DASAR HUKUM</div>
        <ol>
          <li>Peraturan Menteri PAN-RB Nomor 7 Tahun 2026 Pasal 9 ayat (3): tugas JF Pengawas Sekolah melaksanakan pemantauan, penilaian, dan pembinaan pada Satuan Pendidikan formal.</li>
          <li>Pasal 10 ayat (3) huruf a: Pengawas Sekolah Ahli Muda melakukan analisis mutu melalui pengawasan manajerial dan akademik pada Satuan Pendidikan formal.</li>
          <li>Pasal 10 ayat (3) huruf b: Pengawas Sekolah Ahli Madya melakukan pengendalian dan pengembangan mutu melalui pengawasan manajerial dan akademik pada Satuan Pendidikan formal.</li>
        </ol>

        <div style="page-break-after: always;"></div>

        <div class="section-title">D. Hasil Penilaian Kinerja Per Indikator (${ass.type})</div>
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
            <td style="vertical-align: top; height: 100px;">${(ass.strengths || "Belum ada catatan kekuatan.").replace(/\n/g, "<br />")}</td>
            <td style="vertical-align: top; height: 100px;">${(ass.developments || "Belum ada catatan pengembangan.").replace(/\n/g, "<br />")}</td>
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
                <span style="font-weight: bold; text-decoration: underline;">${ass.metadata.principalName || "......................................."}</span><br />
                NIP. ${ass.metadata.principalNip || "......................................."}
              </td>
              <td>
                Dibuat Oleh,<br />Pengawas Sekolah,<br /><br /><br /><br /><br />
                <span style="font-weight: bold; text-decoration: underline;">${ass.metadata.supervisorName}</span><br />
                NIP. ${ass.metadata.supervisorNip}
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
    link.download = `SIPESAT_${ass.type}_${ass.metadata.schoolName.replace(/\s+/g, "_")}_${ass.metadata.observationDate}.doc`;
    link.click();
  };

  // Filter assessments
  const filtered = assessments.filter(ass => {
    const matchesSearch = 
      ass.metadata.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ass.metadata.supervisorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ass.metadata.teacherName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ass.metadata.principalName || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === "All" ? true : ass.type === typeFilter;
    const matchesLevel = levelFilter === "All" ? true : ass.metadata.supervisorLevel === levelFilter;

    return matchesSearch && matchesType && matchesLevel;
  });

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 font-display uppercase tracking-wider">Arsip & Dokumen Supervisi</h2>
          <p className="text-[11px] text-slate-500">Daftar seluruh dokumen penilaian pengawasan akademik dan manajerial yang tersimpan.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">Semua Tipe</option>
            <option value="Akademik">Akademik Only</option>
            <option value="Manajerial">Manajerial Only</option>
          </select>

          <select 
            value={levelFilter} 
            onChange={(e) => setLevelFilter(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">Semua Tingkat Pengawas</option>
            <option value="Ahli Muda">Ahli Muda</option>
            <option value="Ahli Madya">Ahli Madya</option>
          </select>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Cari berdasarkan sekolah, guru, kepala sekolah, atau pengawas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
        />
      </div>

      {/* Grid or Table of History */}
      {filtered.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
          <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h3 className="text-slate-600 font-bold text-xs uppercase tracking-wider font-display">Tidak ada berkas ditemukan</h3>
          <p className="text-slate-400 text-[11px] mt-1">Silakan sesuaikan filter pencarian Anda atau buat laporan pengawasan baru.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((ass) => {
            const sumScore = Object.values(ass.scores).reduce((a, b) => a + b, 0);
            const totalItems = ass.type === "Akademik" ? 58 : 37;
            const avg = getMutuCategory(ass.finalScore);

            return (
              <div 
                key={ass.id} 
                className="group relative border border-slate-200 hover:border-indigo-200 rounded-xl p-4 bg-white shadow-xs hover:shadow-sm transition-all duration-200"
              >
                {/* Score badge at top right */}
                <div className="absolute top-4 right-4 text-right">
                  <span className="text-xl font-black text-slate-900 block leading-none font-display">
                    {ass.finalScore.toFixed(1)}
                  </span>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${avg.color}`}>
                    {ass.finalCategory.split(" ")[0]}
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Title & Level */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded ${ass.type === "Akademik" ? "bg-blue-50 text-blue-600 border border-blue-100" : "bg-fuchsia-50 text-fuchsia-600 border border-fuchsia-100"}`}>
                        {ass.type}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Ahli {ass.metadata.supervisorLevel.split(" ")[1]}</span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 font-display">
                      <School className="w-3.5 h-3.5 shrink-0 text-slate-500" /> {ass.metadata.schoolName}
                    </h3>
                  </div>

                  {/* Metadata fields */}
                  <div className="grid grid-cols-2 gap-y-2.5 gap-x-3 text-xs text-slate-600 border-t border-slate-50 pt-3">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <div className="truncate">
                        <span className="text-[10px] text-slate-400 block font-semibold uppercase leading-none">Sasaran</span>
                        <span className="font-bold text-slate-800">
                          {ass.type === "Akademik" ? ass.metadata.teacherName : ass.metadata.principalName}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold uppercase leading-none">Tanggal</span>
                        <span className="font-semibold text-slate-800">{ass.metadata.observationDate}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <div className="truncate">
                        <span className="text-[10px] text-slate-400 block font-semibold uppercase leading-none">Pengawas</span>
                        <span className="font-semibold text-slate-700">{ass.metadata.supervisorName}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase leading-none">Item Skor</span>
                      <span className="font-semibold text-slate-700">{Object.keys(ass.scores).length} / {totalItems} diisi</span>
                    </div>
                  </div>

                  {/* Description or recommendation preview */}
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100/50 text-[11px] text-slate-500 line-clamp-2 leading-relaxed italic">
                    &ldquo;{ass.strengths.substring(0, 100)}...&rdquo;
                  </div>

                  {/* Interactive Action Buttons */}
                  <div className="flex items-center justify-between gap-2 border-t border-slate-50 pt-4 mt-2">
                    <button 
                      onClick={() => onSelect(ass)}
                      className="text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" /> Buka & Edit
                    </button>

                    <div className="flex items-center gap-1">
                      {/* Notifications trigger */}
                      <button
                        onClick={() => onSendNotification(ass)}
                        title="Kirim Notifikasi Hasil via WhatsApp & Email"
                        className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-amber-100"
                      >
                        <BellRing className="w-4 h-4" />
                      </button>

                      {/* Excel Export */}
                      <button
                        onClick={() => exportToExcel(ass)}
                        title="Ekspor ke Excel (.xlsx)"
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-emerald-100"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      {/* Word Export */}
                      <button
                        onClick={() => exportToDocx(ass)}
                        title="Unduh Laporan Word (.doc)"
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-blue-100"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => {
                          if (confirm("Apakah Anda yakin ingin menghapus arsip supervisi ini? Tindakan ini permanen.")) {
                            onDelete(ass.id);
                          }
                        }}
                        title="Hapus Arsip"
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-rose-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
