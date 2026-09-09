import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User, 
  signOut 
} from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  createdTime?: string;
  modifiedTime?: string;
  webViewLink?: string;
  size?: string;
}

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // User logged in via session, but token not cached yet. User needs to click Sign In to grant Drive scope token.
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const provider = new GoogleAuthProvider();
    provider.addScope("https://www.googleapis.com/auth/drive");
    provider.addScope("https://www.googleapis.com/auth/drive.file");
    provider.setCustomParameters({
      prompt: "consent select_account"
    });

    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("Gagal mendapatkan Token Akses Google OAuth dari Firebase Auth");
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error("Sign in error:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const logoutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

// ===================================================
// GOOGLE DRIVE API FUNCTIONS
// ===================================================

const FOLDER_NAME = "SIPESAT - Laporan Pengawasan";

/**
 * Find or create the application folder in Google Drive
 */
export const getOrCreateAppFolder = async (token: string): Promise<string> => {
  // Search for folder
  const query = encodeURIComponent(`name = '${FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
  const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id, name)`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || "Gagal mengakses Google Drive");
  }

  const data = await res.json();
  if (data.files && data.files.length > 0) {
    return data.files[0].id;
  }

  // Create folder
  const createRes = await fetch("https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: FOLDER_NAME,
      mimeType: "application/vnd.google-apps.folder"
    })
  });

  if (!createRes.ok) {
    const err = await createRes.json();
    throw new Error(err.error?.message || "Gagal membuat folder di Google Drive");
  }

  const newFolder = await createRes.json();
  return newFolder.id;
};

/**
 * Upload or update a file in Google Drive
 */
export const uploadFileToDrive = async (
  token: string,
  filename: string,
  content: string,
  mimeType: string = "application/json"
): Promise<DriveFileItem> => {
  const folderId = await getOrCreateAppFolder(token);

  // Check if file already exists in this folder to avoid duplicates
  const query = encodeURIComponent(`name = '${filename}' and '${folderId}' in parents and trashed = false`);
  const checkRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id, name)`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  const checkData = await checkRes.json();
  const existingFile = checkData.files && checkData.files.length > 0 ? checkData.files[0] : null;

  const metadata = {
    name: filename,
    mimeType: mimeType,
    parents: existingFile ? undefined : [folderId]
  };

  const formData = new FormData();
  formData.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  formData.append("file", new Blob([content], { type: mimeType }));

  let url = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,createdTime,modifiedTime";
  let method = "POST";

  if (existingFile) {
    url = `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=multipart&fields=id,name,mimeType,webViewLink,createdTime,modifiedTime`;
    method = "PATCH";
  }

  const uploadRes = await fetch(url, {
    method: method,
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.json();
    throw new Error(err.error?.message || "Gagal mengunggah berkas ke Google Drive");
  }

  return await uploadRes.json();
};

/**
 * List all backup files in the SIPESAT Google Drive folder
 */
export const listDriveFiles = async (token: string): Promise<DriveFileItem[]> => {
  const folderId = await getOrCreateAppFolder(token);
  const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
  
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,webViewLink,createdTime,modifiedTime,size)&orderBy=modifiedTime desc`, 
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || "Gagal mengambil daftar berkas dari Google Drive");
  }

  const data = await res.json();
  return data.files || [];
};

/**
 * Read the string content of a file from Drive
 */
export const downloadDriveFile = async (token: string, fileId: string): Promise<string> => {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    throw new Error("Gagal mengunduh berkas dari Google Drive");
  }

  return await res.text();
};

/**
 * Delete a file from Google Drive
 */
export const deleteDriveFile = async (token: string, fileId: string): Promise<void> => {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok && res.status !== 204) {
    const err = await res.json();
    throw new Error(err.error?.message || "Gagal menghapus berkas dari Google Drive");
  }
};
