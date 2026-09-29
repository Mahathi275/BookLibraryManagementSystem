import React from 'react';
import { BookCheck, BookMarked, Layers, Library } from 'lucide-react';
import { LibraryStats } from '../types';

interface StatsOverviewProps {
  stats: LibraryStats;
  selectedStatus: string;
  onFilterStatus: (status: 'All' | 'Available' | 'Issued') => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  stats,
  selectedStatus,
  onFilterStatus,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Books */}
      <button
        onClick={() => onFilterStatus('All')}
        className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
          selectedStatus === 'All'
            ? 'bg-neutral-900 border-amber-500/50 ring-1 ring-amber-500/30'
            : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
        }`}
      >
        <div className="flex items-center justify-between text-neutral-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Total Collection</span>
          <Library className="w-4 h-4 text-neutral-400" />
        </div>
        <div className="text-2xl font-bold font-mono tabular-nums text-neutral-100">
          {stats.totalBooks}
        </div>
        <div className="text-xs text-neutral-500 mt-1">
          Cataloged volume count
        </div>
      </button>

      {/* Available for loan */}
      <button
        onClick={() => onFilterStatus('Available')}
        className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
          selectedStatus === 'Available'
            ? 'bg-neutral-900 border-emerald-500/50 ring-1 ring-emerald-500/30'
            : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
        }`}
      >
        <div className="flex items-center justify-between text-neutral-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider text-emerald-400">Available</span>
          <BookCheck className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400">
          {stats.availableBooks}
        </div>
        <div className="text-xs text-neutral-500 mt-1">
          Ready on shelf for checkout
        </div>
      </button>

      {/* Currently Issued */}
      <button
        onClick={() => onFilterStatus('Issued')}
        className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
          selectedStatus === 'Issued'
            ? 'bg-neutral-900 border-amber-500/50 ring-1 ring-amber-500/30'
            : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
        }`}
      >
        <div className="flex items-center justify-between text-neutral-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider text-amber-400">Issued / On Loan</span>
          <BookMarked className="w-4 h-4 text-amber-400" />
        </div>
        <div className="text-2xl font-bold font-mono tabular-nums text-amber-400">
          {stats.issuedBooks}
        </div>
        <div className="text-xs text-neutral-500 mt-1">
          Circulating with patrons
        </div>
      </button>

      {/* Categories */}
      <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/60">
        <div className="flex items-center justify-between text-neutral-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider text-neutral-400">Genres & Subjects</span>
          <Layers className="w-4 h-4 text-neutral-400" />
        </div>
        <div className="text-2xl font-bold font-mono tabular-nums text-neutral-100">
          {stats.categoriesCount}
        </div>
        <div className="text-xs text-neutral-500 mt-1">
          Distinct academic categories
        </div>
      </div>
    </div>
  );
};
