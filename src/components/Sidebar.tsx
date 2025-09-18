'use client';

import { useAppContext } from '@/context/AppProvider';

export default function Sidebar() {
  const { npsn, setNpsn, fetchDataByNpsn, isLoading } = useAppContext();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDataByNpsn();
  };

  return (
    <aside className="w-96 bg-gray-800 text-white flex-shrink-0 flex flex-col p-4">
      <h1 className="text-xl font-bold border-b border-gray-700 pb-4 flex-shrink-0">
        Pencarian Sekolah
      </h1>
      <div className="flex-grow mt-4">
        <form onSubmit={handleSearch} className="flex flex-col gap-4">
          <div>
            <label htmlFor="npsn" className="font-semibold text-gray-300 mb-2 block">
              NPSN
            </label>
            <input
              id="npsn"
              type="text"
              value={npsn}
              onChange={(e) => setNpsn(e.target.value)}
              className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan NPSN sekolah..."
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !npsn}
            className="w-full p-3 bg-blue-600 rounded-md text-white font-bold hover:bg-blue-500 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Mencari...' : 'Cari Data Sekolah'}
          </button>
        </form>
      </div>
    </aside>
  );
}