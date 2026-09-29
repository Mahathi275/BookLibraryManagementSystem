import React from 'react';
import { Book as BookType } from '../types';
import { CheckCircle2, AlertCircle, Edit2, Trash2, ArrowUpRight, Check } from 'lucide-react';

interface BookTableProps {
  books: BookType[];
  onEdit: (book: BookType) => void;
  onDelete: (id: string, title: string) => void;
  onOpenIssue: (book: BookType) => void;
  onReturnBook: (id: string) => void;
}

export const BookTable: React.FC<BookTableProps> = ({
  books,
  onEdit,
  onDelete,
  onOpenIssue,
  onReturnBook,
}) => {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900/90 shadow-sm">
      <table className="w-full text-left text-xs">
        <thead className="bg-neutral-950/70 border-b border-neutral-800 text-neutral-400 font-medium uppercase tracking-wider">
          <tr>
            <th className="py-3 px-4">Title & Author</th>
            <th className="py-3 px-4">Category</th>
            <th className="py-3 px-4">Status & Circulation</th>
            <th className="py-3 px-4 font-mono">ISBN</th>
            <th className="py-3 px-4 font-mono text-right">Year</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800/60">
          {books.map((book) => {
            const isAvailable = book.status === 'Available';
            const bookId = book._id || book.id || '';

            return (
              <tr
                key={bookId}
                className="hover:bg-neutral-800/40 transition-colors group"
              >
                {/* Title & Author */}
                <td className="py-3.5 px-4 max-w-[260px]">
                  <div className="font-semibold text-neutral-100 group-hover:text-amber-300 transition-colors truncate">
                    {book.title}
                  </div>
                  <div className="text-neutral-400 text-[11px] truncate">
                    by {book.author}
                  </div>
                </td>

                {/* Category */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span className="text-neutral-300 font-medium">
                    {book.category}
                  </span>
                </td>

                {/* Status & Borrower */}
                <td className="py-3.5 px-4">
                  {isAvailable ? (
                    <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Available</span>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 text-amber-400 font-medium">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Issued</span>
                      </div>
                      <div className="text-[11px] text-neutral-400 truncate max-w-[180px]">
                        {book.borrowerName || 'Patron on file'}
                      </div>
                    </div>
                  )}
                </td>

                {/* ISBN */}
                <td className="py-3.5 px-4 font-mono text-neutral-400 tabular-nums whitespace-nowrap">
                  {book.isbn || '—'}
                </td>

                {/* Year */}
                <td className="py-3.5 px-4 font-mono text-neutral-300 tabular-nums text-right whitespace-nowrap">
                  {book.publishedYear || '—'}
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5">
                    {isAvailable ? (
                      <button
                        onClick={() => onOpenIssue(book)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded transition-colors cursor-pointer"
                        title="Issue book to borrower"
                      >
                        <span>Issue</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onReturnBook(bookId)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded transition-colors cursor-pointer"
                        title="Mark as returned to inventory"
                      >
                        <Check className="w-3 h-3" />
                        <span>Return</span>
                      </button>
                    )}

                    <button
                      onClick={() => onEdit(book)}
                      className="p-1 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded transition-colors cursor-pointer"
                      title="Edit book"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDelete(bookId, book.title)}
                      className="p-1 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded transition-colors cursor-pointer"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
