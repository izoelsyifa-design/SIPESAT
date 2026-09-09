import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini AI client to prevent startup crash if API key is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// In-memory logs for automatic notifications
interface NotificationLog {
  id: string;
  assessmentId: string;
  schoolName: string;
  targetName: string;
  type: string;
  score: number;
  category: string;
  sentAt: string;
  channel: string;
  status: string;
  message: string;
}

const notificationLogs: NotificationLog[] = [
  {
    id: "notif-1",
    assessmentId: "sample-1",
    schoolName: "SMA Negeri 1 Permata",
    targetName: "Budi Santoso, S.Pd.",
    type: "Akademik",
    score: 88.5,
    category: "A (Sangat Baik)",
    sentAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    channel: "WhatsApp & Email",
    status: "Success",
    message: "Yth. Budi Santoso, S.Pd., hasil penilaian supervisi Akademik Anda adalah Sangat Baik (88.5). Rekomendasi: Pertahankan prestasi dan bagikan praktik baik di forum MGMP."
  },
  {
    id: "notif-2",
    assessmentId: "sample-2",
    schoolName: "SMP Harapan Bangsa",
    targetName: "Dra. Siti Aminah",
    type: "Manajerial",
    score: 72.3,
    category: "B (Baik)",
    sentAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    channel: "Email",
    status: "Success",
    message: "Yth. Ibu Dra. Siti Aminah (Kepala Sekolah), hasil supervisi Manajerial di SMP Harapan Bangsa berpredikat Baik (72.3). Rekomendasi: Tingkatkan pengawasan pada aspek manajemen sarana prasarana."
  }
];

// ==========================================
// API ROUTES
// ==========================================

// Get Notification Logs
app.get("/api/notifications", (req, res) => {
  res.json({ logs: notificationLogs });
});

// Trigger Notification
app.post("/api/send-notification", (req, res) => {
  const { assessmentId, schoolName, targetName, type, score, category, email } = req.body;
  
  if (!assessmentId || !schoolName || !targetName) {
    return res.status(400).json({ error: "Data supervisi tidak lengkap untuk notifikasi." });
  }

  const notificationMessage = `Yth. ${targetName}, laporan supervisi ${type} di ${schoolName} telah selesai diproses dengan nilai akhir ${Number(score).toFixed(1)} - Predikat: ${category}. Rincian catatan, kekuatan, dan rencana tindak lanjut dapat diakses di portal arsip SIPESAT.`;

  const newLog: NotificationLog = {
    id: `notif-${Date.now()}`,
    assessmentId,
    schoolName,
    targetName,
    type,
    score: Number(score),
    category,
    sentAt: new Date().toISOString(),
    channel: email ? "WhatsApp & Email" : "WhatsApp & Sistem",
    status: "Success",
    message: notificationMessage
  };

  notificationLogs.unshift(newLog);

  res.json({
    success: true,
    log: newLog,
    alertText: `Notifikasi otomatis berhasil dikirim ke WhatsApp ${targetName} dan Email ${email || "sekolah@edu.go.id"}!`
  });
});

// AI Generation Route using Google GenAI SDK
app.post("/api/generate-notes", async (req, res) => {
  const { type, level, scores, categories } = req.body;

  if (!type || !level || !scores || !categories) {
    return res.status(400).json({ error: "Missing required parameters for notes generation" });
  }

  const client = getGeminiClient();

  if (!client) {
    console.log("Gemini API Key missing or default placeholder. Using robust offline generator fallback.");
    return res.json({ isFallback: true });
  }

  try {
    const prompt = `Anda adalah sistem kecerdasan buatan (AI) yang bertindak sebagai Asisten Pengawas Sekolah Ahli Madya/Muda dalam supervisi akademik & manajerial berdasarkan PermenpanRB No. 7 Tahun 2026.
Berdasarkan data berikut:
- Tipe Pengawasan: ${type}
- Tingkat Pengawas: ${level}
- Hasil Skor Penilaian Indikator (skala 1-4): ${JSON.stringify(scores)}
- Komponen & Deskripsi Sektor: ${JSON.stringify(categories.map((c: any) => ({ id: c.id, name: c.name })))}

Tolong buatkan secara otomatis dan terstruktur:
1. Catatan Pengawas (narasi temuannya/rekomendasi spesifik) untuk masing-masing kode komponen (seperti "I-A", "I-B", dst). Berikan narasi formal bahasa Indonesia yang realistis, konstruktif, dan menyentuh temuan faktual sesuai skor rata-ratanya (skor rendah 1-2 = perlu pembinaan segera/kurang konsisten, skor tinggi 3-4 = apresiasi/konsisten/inovatif).
2. Catatan Kekuatan: Paragraf terstruktur mengenai kekuatan utama guru/sekolah berdasarkan skor tinggi (skor 4).
3. Area Pengembangan: Paragraf terstruktur mengenai area yang perlu diprioritaskan untuk diperbaiki berdasarkan skor rendah (skor <= 2).
4. Rencana Tindak Lanjut: Berikan 2 butir rencana tindakan konkret dengan bentuk pembinaan, penanggung jawab, target waktu, dan indikator keberhasilan.

Harap kembalikan respon Anda STRICTLY dalam bentuk JSON yang valid dengan skema berikut:
{
  "notes": {
    "I-A": "narasi...",
    "I-B": "narasi...",
    ... (isi semua kode komponen)
  },
  "strengths": "narasi kekuatan...",
  "developments": "narasi pengembangan...",
  "actionPlan": [
    {
      "plan": "Rencana tindakan...",
      "strategy": "Strategi pembinaan...",
      "pic": "Penanggung jawab...",
      "targetTime": "Target waktu...",
      "successIndicator": "Indikator keberhasilan..."
    }
  ]
}
Kembalikan HANYA string JSON tersebut saja, tanpa markdown formatting (TIDAK BOLEH dibungkus dengan \`\`\`json atau tanda kutip markdown lainnya, langsung { ... }).`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const responseText = response.text || "";
    const cleanJson = responseText.trim().replace(/^```json\s*/, "").replace(/```$/, "");
    const parsedData = JSON.parse(cleanJson);

    return res.json({
      success: true,
      isFallback: false,
      data: parsedData
    });

  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    return res.json({
      success: false,
      isFallback: true,
      error: error.message
    });
  }
});

// ==========================================
// VITE OR STATIC ASSETS MIDDLEWARE
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SIPESAT Server running on http://localhost:${PORT}`);
  });
}

startServer();
