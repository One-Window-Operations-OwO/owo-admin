"use client";

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
  useCallback,
} from "react";
import { validateHisenseCookie } from "@/helpers/HisenseCookie";
import LoginComponent from "@/components/LoginComponent";
import Sidebar from "@/components/Sidebar";

// Based on output_owo_api.json
export interface Ptk {
  ptk_terdaftar_id?: string;
  ptk_id?: string;
  nama?: string;
  jenis_kelamin?: 'L' | 'P';
  tanggal_lahir?: string;
  nik?: string;
  nuptk?: string | null;
  nip?: string | null;
  nrg?: string | null;
  kepegawaian?: string;
  jenis_ptk?: string;
  jabatan_ptk?: string;
  nomor_surat_tugas?: string;
  tanggal_surat_tugas?: string;
  tmt_tugas?: string;
  ptk_induk?: 'Ya' | 'Tidak';
  last_update?: string;
}

export interface DatadikData {
  id?: string;
  name?: string;
  address?: string;
  kecamatan?: string;
  kabupaten?: string;
  provinsi?: string;
  kepalaSekolah?: string;
  ptk?: Ptk[];
  error?: string; // untuk kasus error response
}

export interface HisenseSchoolInfo {
  NPSN?: string;
  Nama?: string;
  Alamat?: string;
  Provinsi?: string;
  Kabupaten?: string;
  Kecamatan?: string;
  "Kelurahan/Desa"?: string;
  Jenjang?: string;
  Bentuk?: string;
  Sekolah?: string;
  Formal?: string;
  PIC?: string;
  "Telp PIC"?: string;
  "Resi Pengiriman"?: string;
  "Serial Number"?: string;
  Status?: string;
  // tambahkan field lain jika ada
}

export interface HisenseProcessHistory {
  tanggal?: string;
  status?: string;
  keterangan?: string;
}

export interface HisenseData {
  isGreen: boolean;
  nextPath?: string | null;
  schoolInfo?: HisenseSchoolInfo;
  note?: Record<string, string>;
  images?: Record<string, string>;
  processHistory?: HisenseProcessHistory[];
  q?: string;
  npsn?: string;
  iprop?: string;
  ikab?: string;
  ikec?: string;
  iins?: string;
  ijenjang?: string;
  ibp?: string;
  iss?: string;
  isf?: string;
  istt?: string;
  itgl?: string;
  itgla?: string;
  itgle?: string;
  ipet?: string;
  ihnd?: string;
}

export interface DkmData {
  datadik: DatadikData;
  hisense: HisenseData;
}

interface AppContextType {
  dkmData: DkmData | null;
  isLoading: boolean;
  error: string | null;
  npsn: string;
  setNpsn: React.Dispatch<React.SetStateAction<string>>;
  fetchDataByNpsn: () => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  verifierName: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [verifierName, setVerifierName] = useState<string | null>(null);
  const [cookieValid, setCookieValid] = useState(false);
  const [dkmData, setDkmData] = useState<DkmData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [npsn, setNpsn] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  const getRefreshedCookie = useCallback(async (): Promise<string | null> => {
    const username = localStorage.getItem("hisense_username");
    const password = localStorage.getItem("hisense_password");

    if (!username || !password) {
      return null;
    }

    try {
      const res = await fetch("api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.phpsessid) {
        localStorage.setItem("hisense_cookie", data.phpsessid);
        return data.phpsessid;
      }
      return null;
    } catch (err) {
      return null;
    }
  }, []);

  const fetchDataByNpsn = useCallback(async () => {
    if (!npsn) {
      setError("NPSN tidak boleh kosong.");
      return;
    }
    setIsLoading(true);
    setDkmData(null);
    setError(null);

    try {
      let cookie = localStorage.getItem("hisense_cookie");
      if (!cookie) {
        const newCookie = await getRefreshedCookie();
        if (newCookie) {
          cookie = newCookie;
        } else {
          setShowLoginModal(true);
          throw new Error("Cookie Hisense tidak ditemukan.");
        }
      }

      let validName = await validateHisenseCookie(cookie);
      if (!validName) {
        const newCookie = await getRefreshedCookie();
        if (newCookie) {
          cookie = newCookie;
          validName = await validateHisenseCookie(cookie);
        }
      }

      if (!validName) {
        setVerifierName(null);
        setShowLoginModal(true);
        throw new Error("Cookie Hisense kadaluarsa atau tidak valid.");
      }
      setVerifierName(validName);

      const response = await fetch("api/combined", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: npsn, cookie }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Gagal mengambil data dari API.");
      }

      const data: DkmData = await response.json();
      setDkmData(data);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [npsn, getRefreshedCookie]);

  const authenticate = useCallback(async () => {
    const savedCookie = localStorage.getItem("hisense_cookie");

    if (savedCookie) {
      const validName = await validateHisenseCookie(savedCookie);
      if (validName) {
        setCookieValid(true);
        setVerifierName(validName);
        setShowLoginModal(false);
        return;
      }
    }

    const newCookie = await getRefreshedCookie();
    if (newCookie) {
      const validName = await validateHisenseCookie(newCookie);
      if (validName) {
        setCookieValid(true);
        setVerifierName(validName);
        setShowLoginModal(false);
        return;
      }
    }

    setShowLoginModal(true);
  }, [getRefreshedCookie]);

  useEffect(() => {
    authenticate();
  }, [authenticate]);

  const handleLoginSuccess = () => {
    authenticate();
  };

  if (showLoginModal) {
    return <LoginComponent onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <AppContext.Provider
      value={{
        dkmData,
        isLoading,
        error,
        npsn,
        setNpsn,
        fetchDataByNpsn,
        isSidebarOpen,
        toggleSidebar,
        verifierName,
      }}
    >
      <div className="flex h-screen bg-gray-200">
        <Sidebar />
        <main className="relative flex-grow p-6 overflow-y-auto bg-gray-100 text-gray-900">
          {children}
        </main>
      </div>
      {isSidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="md:hidden fixed inset-0 bg-black/50 z-20"
        />
      )}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined)
    throw new Error("useAppContext must be used within an AppProvider");
  return context;
}
