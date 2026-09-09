import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { 
  googleSignIn, 
  logoutGoogle, 
  initAuth, 
  getAccessToken,
  uploadFileToDrive, 
  listDriveFiles, 
  downloadDriveFile, 
  deleteDriveFile,
  DriveFileItem 
} from "../lib/googleDrive";
import { Assessment } from "../types";
import { 
  HardDrive, 
  CloudUpload, 
  CloudDownload, 
  RefreshCw, 
  Trash2, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  FolderCheck,
  ShieldCheck,
  FileJson,
  FileText
} from "lucide-react";

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessments: Assessment[];
  onImportAssessments: (imported: Assessment[]) => void;
  showToast: (msg: string) => void;
}

export default function GoogleDriveModal({
  isOpen,
  onClose,
  assessments,
  onImportAssessments,
  showToast
}: GoogleDriveModalProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getAccessToken());
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isDriveLoading, setIsDriveLoading] = useState(false);
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [activeTab, setActiveTab] = useState<"backup" | "restore">("backup");

  // State for deletion confirmation dialog
  const [fileToDelete, setFileToDelete] = useState<DriveFileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const unsubscribe = initAuth(
        (user, accessToken) => {
          setCurrentUser(user);
          setToken(accessToken);
          loadDriveFileList(accessToken);
        },
        () => {
          setCurrentUser(null);
          setToken(null);
        }
      );
      return () => unsubscribe();
    }
  }, [isOpen]);

  const [scopeError, setScopeError] = useState(false);

  const loadDriveFileList = async (accessToken: string) => {
    setIsDriveLoading(true);
    setScopeError(false);
    try {
      const files = await listDriveFiles(accessToken);
      setDriveFiles(files);
    } catch (err: any) {
      console.error("Error loading drive files:", err);
      if (err.message && (err.message.includes("insufficient") || err.message.includes("scope") || err.message.includes("403"))) {
        setScopeError(true);
        showToast("Izin Google Drive belum lengkap. Silakan klik 'Beri Izin Google Drive' di bawah.");
      } else {
        showToast("Gagal memuat daftar berkas dari Google Drive: " + err.message);
      }
    } finally {
      setIsDriveLoading(false);
    }
  };

  const handleLogin = async () => {
    setIsAuthLoading(true);
    setScopeError(false);
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setToken(res.accessToken);
        showToast(`Berhasil terhubung dengan Google Drive (${res.user.email})!`);
        await loadDriveFileList(res.accessToken);
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      showToast("Gagal terhubung dengan Google: " + (err.message || "Izin dibatalkan."));
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutGoogle();
    setCurrentUser(null);
    setToken(null);
    setDriveFiles([]);
    setScopeError(false);
    showToast("Sesi Google Drive telah diakhiri.");
  };

  // 1-Click Backup All Assessments to Drive
  const handleBackupAllToDrive = async () => {
    if (!token) {
      handleLogin();
      return;
    }
    setIsDriveLoading(true);
    try {
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const filename = `sipesat_backup_semua_${dateStr}.json`;
      const content = JSON.stringify(assessments, null, 2);

      const fileItem = await uploadFileToDrive(token, filename, content, "application/json");
      showToast(`Berhasil mencadangkan ${assessments.length} berkas supervisi ke Google Drive (${fileItem.name})!`);
      await loadDriveFileList(token);
    } catch (err: any) {
      console.error("Backup error:", err);
      if (err.message && (err.message.includes("insufficient") || err.message.includes("scope") || err.message.includes("403"))) {
        setScopeError(true);
        showToast("Izin Google Drive belum lengkap. Membuka jendela login izin...");
        await handleLogin();
      } else {
        showToast("Gagal mencadangkan ke Google Drive: " + err.message);
      }
    } finally {
      setIsDriveLoading(false);
    }
  };

  // Restore/Import single file from Drive
  const handleRestoreFromDrive = async (file: DriveFileItem) => {
    if (!token) return;
    const confirmed = window.confirm(`Apakah Anda yakin ingin memulihkan dan mengimpor berkas '${file.name}' ke dalam arsip lokal SIPESAT?`);
    if (!confirmed) return;

    setIsDriveLoading(true);
    try {
      const rawText = await downloadDriveFile(token, file.id);
      const parsedData = JSON.parse(rawText);

      if (Array.isArray(parsedData)) {
        onImportAssessments(parsedData);
        showToast(`Berhasil mengimpor ${parsedData.length} laporan supervisi dari Google Drive!`);
      } else if (parsedData && parsedData.id && parsedData.metadata) {
        onImportAssessments([parsedData]);
        showToast(`Berhasil mengimpor laporan ${parsedData.metadata.schoolName} dari Google Drive!`);
      } else {
        throw new Error("Format berkas JSON tidak sesuai dengan struktur laporan SIPESAT.");
      }
    } catch (err: any) {
      console.error("Restore error:", err);
      showToast("Gagal memulihkan berkas: " + err.message);
    } finally {
      setIsDriveLoading(false);
    }
  };

  // Delete File Confirmation Process
  const confirmDeleteFile = async () => {
    if (!token || !fileToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDriveFile(token, fileToDelete.id);
      showToast(`Berkas '${fileToDelete.name}' telah dihapus dari Google Drive.`);
      setFileToDelete(null);
      await loadDriveFileList(token);
    } catch (err: any) {
      console.error("Delete error:", err);
      showToast("Gagal menghapus berkas: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/80 border border-indigo-400/30 flex items-center justify-center shadow-inner">
              <HardDrive className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                Integrasi Cloud Google Drive
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30 font-semibold uppercase">
                  Pencadangan Resmi
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Simpan, cadangkan, dan sinkronkan instrumen pengawasan sekolah ke akun Google Anda.
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Box Section */}
        <div className="p-6 bg-slate-50 border-b border-slate-200">
          {!currentUser ? (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <p className="text-xs font-bold text-slate-800 flex items-center justify-center sm:justify-start gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Hubungkan Google Drive
                </p>
                <p className="text-[11px] text-slate-500 max-w-sm">
                  Otentikasi aman dengan protokol OAuth2. Seluruh berkas cadangan disimpan di folder khusus <span className="font-semibold text-slate-700">"SIPESAT - Laporan Pengawasan"</span>.
                </p>
              </div>

              {/* Official Google Sign-In Button */}
              <button
                onClick={handleLogin}
                disabled={isAuthLoading}
                className="gsi-material-button shrink-0 shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <div className="gsi-material-button-state"></div>
                <div className="gsi-material-button-content-wrapper">
                  <div className="gsi-material-button-icon">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: "block" }}>
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents">
                    {isAuthLoading ? "Menghubungkan..." : "Masuk dengan Google"}
                  </span>
                </div>
              </button>
            </div>
          ) : (
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt="Google Avatar" className="w-10 h-10 rounded-full border border-slate-200" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center">
                    {currentUser.displayName ? currentUser.displayName.charAt(0) : "G"}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800">{currentUser.displayName || "Pengguna Google"}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <p className="text-[11px] text-slate-500">{currentUser.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => token && loadDriveFileList(token)}
                  disabled={isDriveLoading}
                  className="px-2.5 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isDriveLoading ? "animate-spin" : ""}`} />
                  Segarkan
                </button>
                <button
                  onClick={handleLogout}
                  className="px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  Keluar
                </button>
              </div>
            </div>
          )}

          {currentUser && scopeError && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Izin akses Google Drive belum aktif atau memerlukan konfirmasi ulang.</span>
              </div>
              <button
                onClick={handleLogin}
                disabled={isAuthLoading}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[11px] transition-colors cursor-pointer shrink-0"
              >
                {isAuthLoading ? "Memproses..." : "Beri Izin Google Drive"}
              </button>
            </div>
          )}
        </div>

        {/* Content Tabs & Actions */}
        <div className="p-6">
          {currentUser && (
            <div className="flex border-b border-slate-200 mb-5 gap-4">
              <button
                onClick={() => setActiveTab("backup")}
                className={`pb-2.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors border-b-2 ${
                  activeTab === "backup" 
                    ? "border-indigo-600 text-indigo-700" 
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <CloudUpload className="w-4 h-4" /> Cadangkan Laporan Local ({assessments.length})
              </button>
              <button
                onClick={() => setActiveTab("restore")}
                className={`pb-2.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors border-b-2 ${
                  activeTab === "restore" 
                    ? "border-indigo-600 text-indigo-700" 
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <CloudDownload className="w-4 h-4" /> Berkas di Drive ({driveFiles.length})
              </button>
            </div>
          )}

          {!currentUser ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <HardDrive className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Silakan klik tombol <span className="font-bold text-slate-700">"Masuk dengan Google"</span> di atas untuk membuka fitur pencadangan otomatis dan pemulihan berkas laporan supervisi.
              </p>
            </div>
          ) : activeTab === "backup" ? (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl flex items-start gap-3">
                <FolderCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="text-xs text-indigo-950 space-y-1">
                  <p className="font-bold">Pencadangan Berkas Pengawasan (1-Klik)</p>
                  <p className="text-slate-600 leading-relaxed">
                    Aksi ini akan mengompilasi seluruh <span className="font-semibold text-slate-800">{assessments.length} laporan supervisi</span> lokal Anda dan menyimpannya secara otomatis ke akun Google Drive Anda di folder <span className="font-bold text-indigo-900">"SIPESAT - Laporan Pengawasan"</span>.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleBackupAllToDrive}
                  disabled={isDriveLoading || assessments.length === 0}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-sm hover:shadow flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <CloudUpload className="w-4 h-4" />
                  {isDriveLoading ? "Mengunggah ke Google Drive..." : "Cadangkan Semua Laporan Sekarang"}
                </button>
              </div>

              {/* Local Assessments list summary */}
              <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-3.5 py-2 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider flex justify-between">
                  <span>Daftar Berkas Siap Dicadangkan</span>
                  <span>{assessments.length} Item</span>
                </div>
                <div className="max-h-48 overflow-y-auto divide-y divide-slate-100">
                  {assessments.map((a) => (
                    <div key={a.id} className="p-2.5 text-xs flex items-center justify-between hover:bg-slate-50">
                      <div>
                        <span className="font-bold text-slate-800">{a.metadata.schoolName}</span>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2">
                          <span>Jenis: {a.type}</span>
                          <span>•</span>
                          <span>Tgl: {a.metadata.observationDate}</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                        Skor: {a.finalScore.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Restore Tab */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  Daftar Berkas di Google Drive ("SIPESAT - Laporan Pengawasan")
                </span>
                <span className="text-[10px] text-slate-400">{driveFiles.length} Berkas Ditemukan</span>
              </div>

              {isDriveLoading ? (
                <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
                  <span>Memuat daftar berkas dari Google Drive...</span>
                </div>
              ) : driveFiles.length === 0 ? (
                <div className="py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 p-6 space-y-2">
                  <AlertCircle className="w-6 h-6 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">Belum Ada Berkas Cadangan di Google Drive</p>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    Buka tab "Cadangkan Laporan Local" di atas lalu klik tombol "Cadangkan Semua Laporan Sekarang".
                  </p>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-64 overflow-y-auto">
                  {driveFiles.map((file) => (
                    <div key={file.id} className="p-3 hover:bg-slate-50 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
                          {file.mimeType.includes("json") ? <FileJson className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 truncate" title={file.name}>{file.name}</p>
                          <p className="text-[10px] text-slate-400">
                            Diperbarui: {file.modifiedTime ? new Date(file.modifiedTime).toLocaleString("id-ID") : "-"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Buka di Google Drive"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => handleRestoreFromDrive(file)}
                          className="px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold rounded-md text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <CloudDownload className="w-3.5 h-3.5" /> Impord/Pulihkan
                        </button>
                        <button
                          onClick={() => setFileToDelete(file)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus dari Drive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex justify-between items-center text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Folder Cloud: SIPESAT - Laporan Pengawasan</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* MANDATORY USER CONFIRMATION MODAL FOR DELETING DRIVE FILES */}
      {fileToDelete && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-rose-100 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Konfirmasi Hapus Berkas Drive</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus berkas <span className="font-bold text-slate-900">"{fileToDelete.name}"</span> secara permanen dari Google Drive?
            </p>
            <p className="text-[11px] text-rose-600 bg-rose-50 p-2.5 rounded-lg font-medium border border-rose-100">
              ⚠️ Peringatan: Tindakan ini tidak dapat dibatalkan dan berkas tidak dapat dipulihkan kembali dari cloud.
            </p>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setFileToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={confirmDeleteFile}
                disabled={isDeleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {isDeleting ? "Menghapus..." : "Hapus Permanen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
