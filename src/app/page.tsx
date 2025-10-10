'use client';

import { useAppContext } from '@/context/AppProvider';
import DkmDetails from '@/components/DkmDetails';

export default function Home() {
  const { dkmData, isLoading, error, npsn, verifierName } = useAppContext();

  const renderContent = () => {
    if (isLoading) return <p className="text-center animate-pulse">Mencari data untuk NPSN: <b>{npsn}</b>...</p>;
    if (error) return <p className="text-red-500 font-bold bg-red-100 p-4 rounded-lg">Error: {error}</p>;
    
    if (dkmData) {
        return <DkmDetails data={dkmData} />
    }
    
    return (
      <div className="text-center text-gray-500">
        <p>Masukkan NPSN di sidebar untuk mencari data sekolah.</p>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full h-full p-4 bg-gray-50">
      <header className="flex justify-between items-center mb-4 flex-shrink-0">
        <h1 className="text-3xl font-bold text-gray-800">
          Data Sekolah
        </h1>
        
        {verifierName && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-bold text-lg text-gray-800">{verifierName}</p>
              <p className="text-xs text-gray-500">Verifier Aktif</p>
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow p-6 bg-white rounded-lg shadow-md">
        {renderContent()}
      </main>
    </div>
  );
}
