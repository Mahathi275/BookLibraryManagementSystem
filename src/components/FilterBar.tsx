import React from 'react';
import { Search, X, LayoutGrid, List, SlidersHorizontal } from 'lucide-react';

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (status: 'All' | 'Available' | 'Issued') => void;
  categoryFilter: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  totalFiltered: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  categoryFilter,
  onCategoryChange,
  categories,
  viewMode,
  onViewModeChange,
  totalFiltered,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6 bg-neutral-900/80 p-3 rounded-xl border border-neutral-800">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[240px]">
        <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by title, author, or category..."
          className="w-full pl-9 pr-8 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 transition-colors"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter Segmented Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status Filter Tabs (Allowed interactive segmented buttons per constitution) */}
        <div className="flex items-center p-1 bg-neutral-950 border border-neutral-800 rounded-lg">
          {(['All', 'Available', 'Issued'] as const).map((status) => (
            <button
              key={status}
              onClick={() => onStatusChange(status)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === status
                  ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Category Dropdown */}
        <div className="relative min-w-[140px]">
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full appearance-none px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs font-medium text-neutral-200 focus:outline-none focus:border-amber-500/60 pr-8 cursor-pointer"
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center p-1 bg-neutral-950 border border-neutral-800 rounded-lg">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-neutral-800 text-amber-400'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title="Grid card view"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onViewModeChange('table')}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              viewMode === 'table'
                ? 'bg-neutral-800 text-amber-400'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title="Inventory table view"
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Count */}
        <div className="text-xs text-neutral-400 tabular-nums px-2 hidden sm:block">
          {totalFiltered} {totalFiltered === 1 ? 'record' : 'records'}
        </div>
      </div>
    </div>
  );
};
