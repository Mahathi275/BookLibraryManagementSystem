import React, { useState, useEffect } from 'react';
import { X, BookMarked, UserCheck, Calendar } from 'lucide-react';
import { Book, User } from '../types';
import { api } from '../services/api';

interface IssueModalProps {
  isOpen: boolean;
  book: Book | null;
  onClose: () => void;
  onConfirmIssue: (bookId: string, borrowerName: string) => Promise<void>;
}

export const IssueModal: React.FC<IssueModalProps> = ({
  isOpen,
  book,
  onClose,
  onConfirmIssue,
}) => {
  const [borrowerName, setBorrowerName] = useState('');
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);
  const [selectedPatronEmail, setSelectedPatronEmail] = useState('');
  const [loanDays, setLoanDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setBorrowerName('');
      setSelectedPatronEmail('');
      setError(null);
      // Fetch users for convenient autofill
      api.getUsers().then((res) => {
        if (res.data) setRegisteredUsers(res.data);
      }).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen || !book) return null;

  const bookId = book._id || book.id || '';

  const handleSelectPatron = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const email = e.target.value;
    setSelectedPatronEmail(email);
    const found = registeredUsers.find((u) => u.email === email);
    if (found) {
      setBorrowerName(`${found.name} (${found.email})`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!borrowerName.trim()) {
      setError('Please provide a borrower or patron name');
      return;
    }

    try {
      setLoading(true);
      await onConfirmIssue(bookId, borrowerName.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to issue book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BookMarked className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-neutral-100">
                Issue Book to Patron
              </h3>
              <p className="text-xs text-neutral-400">
                Loan checkout and circulation registration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Book Preview summary */}
        <div className="p-3 bg-neutral-950 border border-neutral-800/80 rounded-xl mb-4 text-xs">
          <div className="text-amber-400/80 font-mono text-[10px] uppercase">
            {book.category}
          </div>
          <div className="font-semibold text-neutral-100 font-serif mt-0.5 text-sm">
            {book.title}
          </div>
          <div className="text-neutral-400 mt-0.5">by {book.author}</div>
        </div>

        {error && (
          <div className="mb-4 p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Registered Patron Quick Select */}
          {registeredUsers.length > 0 && (
            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                Select Registered Patron (Optional Autofill)
              </label>
              <select
                value={selectedPatronEmail}
                onChange={handleSelectPatron}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 focus:outline-none focus:border-amber-500/60 cursor-pointer"
              >
                <option value="">-- Choose patron or enter manually below --</option>
                {registeredUsers.map((u) => (
                  <option key={u.email} value={u.email}>
                    {u.name} · {u.email} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Borrower Name */}
          <div>
            <label className="block text-neutral-300 font-medium mb-1">
              Borrower Name / Card ID <span className="text-amber-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={borrowerName}
                onChange={(e) => setBorrowerName(e.target.value)}
                placeholder="e.g. Jordan Smith (Patron #1042)"
                className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500/60"
              />
              <UserCheck className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Loan Duration */}
          <div>
            <label className="block text-neutral-300 font-medium mb-1">
              Circulation Loan Period
            </label>
            <div className="flex gap-2">
              {[14, 30, 60].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setLoanDays(days)}
                  className={`flex-1 py-1.5 px-3 rounded-lg border text-center transition-colors cursor-pointer ${
                    loanDays === days
                      ? 'bg-amber-500/10 border-amber-500 text-amber-300 font-semibold'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-neutral-500 text-[11px] mt-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                Due date will be set to{' '}
                {new Date(Date.now() + loanDays * 86400000).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-300 hover:text-neutral-100 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold text-neutral-900 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              {loading ? 'Processing Checkout...' : 'Confirm Loan Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
