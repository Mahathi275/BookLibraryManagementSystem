import React from 'react';
import { User, Book } from '../types';
import { Users, UserCheck, Shield, BookMarked, ArrowUpRight } from 'lucide-react';

interface PatronsListProps {
  users: User[];
  books: Book[];
  onOpenIssueToUser: (user: User) => void;
  onOpenAuth: () => void;
}

export const PatronsList: React.FC<PatronsListProps> = ({
  users,
  books,
  onOpenIssueToUser,
  onOpenAuth,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
        <div>
          <h2 className="font-serif text-xl font-bold text-neutral-100">
            Registered Patrons & Staff
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Active library card holders and circulation privileges
          </p>
        </div>
        <button
          onClick={onOpenAuth}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Register New Card / User</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => {
          const userId = user._id || user.id || '';
          // Find books borrowed by this user (by name or email matching borrowerName)
          const borrowedBooks = books.filter(
            (b) =>
              b.status === 'Issued' &&
              b.borrowerName &&
              (b.borrowerName.toLowerCase().includes(user.name.toLowerCase()) ||
                b.borrowerName.toLowerCase().includes(user.email.toLowerCase()))
          );

          return (
            <div
              key={userId || user.email}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center font-serif text-sm font-bold text-amber-400">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="text-[11px] font-mono capitalize px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-400">
                    {user.role}
                  </span>
                </div>

                <h3 className="font-semibold text-neutral-100 text-sm truncate">
                  {user.name}
                </h3>
                <p className="text-xs text-neutral-400 truncate mb-3">
                  {user.email}
                </p>

                {/* Active loans summary */}
                <div className="pt-2 border-t border-neutral-800/80 text-xs">
                  <div className="flex items-center justify-between text-neutral-400 mb-1.5">
                    <span className="text-[11px] uppercase tracking-wider">Active Loans</span>
                    <span className="font-mono tabular-nums text-neutral-200">
                      {borrowedBooks.length}
                    </span>
                  </div>

                  {borrowedBooks.length > 0 ? (
                    <div className="space-y-1">
                      {borrowedBooks.map((b) => (
                        <div
                          key={b._id || b.id}
                          className="flex items-center gap-1.5 text-[11px] text-amber-300 truncate"
                        >
                          <BookMarked className="w-3 h-3 shrink-0" />
                          <span className="truncate">{b.title}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-neutral-500 italic">
                      No titles currently checked out
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-800 flex justify-end">
                <span className="text-[10px] text-neutral-500 font-mono">
                  Member since {user.createdAt ? new Date(user.createdAt).getFullYear() : '2026'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
