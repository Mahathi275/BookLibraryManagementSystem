import React from 'react';
import { BookOpen, Database, Plus, User as UserIcon, LogOut, Code, ShieldCheck } from 'lucide-react';
import { User, DbStatusInfo } from '../types';

interface NavbarProps {
  user: User | null;
  dbStatus: DbStatusInfo | null;
  activeTab: 'catalog' | 'circulation' | 'patrons';
  onSelectTab: (tab: 'catalog' | 'circulation' | 'patrons') => void;
  onOpenAddBook: () => void;
  onOpenAuth: () => void;
  onOpenDbStatus: () => void;
  onOpenApiDocs: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  dbStatus,
  activeTab,
  onSelectTab,
  onOpenAddBook,
  onOpenAuth,
  onOpenDbStatus,
  onOpenApiDocs,
  onLogout,
}) => {
  const isMongoConnected = dbStatus?.type === 'mongodb_atlas' && dbStatus?.isConnected;

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-800 bg-neutral-900/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single-element Brand Wordmark */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectTab('catalog')}
              className="flex items-center gap-2.5 text-left text-neutral-100 group transition-colors focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:border-amber-400 transition-colors">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <span className="font-serif font-bold text-lg tracking-tight text-neutral-100 group-hover:text-amber-200 transition-colors">
                  Athenaeum
                </span>
                <span className="text-xs text-neutral-400 ml-2 font-sans hidden sm:inline">
                  Library Management
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: 4-6 Clean Text Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button
              onClick={() => onSelectTab('catalog')}
              className={`transition-colors whitespace-nowrap ${
                activeTab === 'catalog'
                  ? 'text-amber-400 font-semibold border-b-2 border-amber-400 pb-1 pt-1'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Catalog
            </button>
            <button
              onClick={() => onSelectTab('circulation')}
              className={`transition-colors whitespace-nowrap ${
                activeTab === 'circulation'
                  ? 'text-amber-400 font-semibold border-b-2 border-amber-400 pb-1 pt-1'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Circulation
            </button>
            <button
              onClick={() => onSelectTab('patrons')}
              className={`transition-colors whitespace-nowrap ${
                activeTab === 'patrons'
                  ? 'text-amber-400 font-semibold border-b-2 border-amber-400 pb-1 pt-1'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Patrons
            </button>
            <button
              onClick={onOpenDbStatus}
              className="flex items-center gap-1.5 text-neutral-400 hover:text-neutral-200 transition-colors text-xs"
              title="Database connection state"
            >
              <Database className="w-3.5 h-3.5" />
              <span>
                {isMongoConnected ? 'MongoDB Atlas' : 'Local Store'}
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  isMongoConnected ? 'bg-emerald-500' : 'bg-amber-400'
                }`}
              />
            </button>
            <button
              onClick={onOpenApiDocs}
              className="flex items-center gap-1 text-neutral-400 hover:text-neutral-200 transition-colors text-xs"
            >
              <Code className="w-3.5 h-3.5" />
              <span>REST APIs</span>
            </button>
          </nav>

          {/* Zone 3: 1-2 Primary Action Points */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAddBook}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-neutral-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Book</span>
            </button>

            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-neutral-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-neutral-700 bg-neutral-800 flex items-center justify-center shrink-0">
                    <img
                      src="/src/assets/images/avatar_librarian_admin_1790701239443.jpg"
                      alt={user.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                    <UserIcon className="w-4 h-4 text-neutral-300" />
                  </div>
                  <div className="hidden lg:block text-left text-xs leading-tight">
                    <div className="font-medium text-neutral-200 truncate max-w-[110px]">
                      {user.name}
                    </div>
                    <div className="text-neutral-500 capitalize">{user.role}</div>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  className="p-1.5 text-neutral-400 hover:text-rose-400 transition-colors rounded hover:bg-neutral-800"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
