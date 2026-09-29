import React, { useState, useEffect } from 'react';
import { X, BookOpen, AlertCircle } from 'lucide-react';
import { Book, BookStatus } from '../types';

interface BookModalProps {
  isOpen: boolean;
  bookToEdit: Book | null;
  onClose: () => void;
  onSubmit: (data: Partial<Book>) => Promise<void>;
  categories: string[];
}

const PRESET_CATEGORIES = [
  'Architecture',
  'Software Engineering',
  'Artificial Intelligence',
  'Databases',
  'Design',
  'Computer Science',
  'Philosophy',
  'History',
  'Mathematics',
];

const PRESET_COVERS = [
  { label: 'Architectural Blueprint', url: '/src/assets/images/book_cover_architecture_1790701250913.jpg' },
  { label: 'Algorithm Waves', url: '/src/assets/images/book_cover_algorithms_1790701262759.jpg' },
];

export const BookModal: React.FC<BookModalProps> = ({
  isOpen,
  bookToEdit,
  onClose,
  onSubmit,
  categories,
}) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('Software Engineering');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [status, setStatus] = useState<BookStatus>('Available');
  const [borrowerName, setBorrowerName] = useState('');
  const [isbn, setIsbn] = useState('');
  const [publisher, setPublisher] = useState('');
  const [publishedYear, setPublishedYear] = useState<string>('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bookToEdit) {
      setTitle(bookToEdit.title || '');
      setAuthor(bookToEdit.author || '');
      if (PRESET_CATEGORIES.includes(bookToEdit.category)) {
        setCategory(bookToEdit.category);
        setIsCustomCategory(false);
        setCustomCategory('');
      } else {
        setIsCustomCategory(true);
        setCustomCategory(bookToEdit.category);
        setCategory('custom');
      }
      setStatus(bookToEdit.status || 'Available');
      setBorrowerName(bookToEdit.borrowerName || '');
      setIsbn(bookToEdit.isbn || '');
      setPublisher(bookToEdit.publisher || '');
      setPublishedYear(bookToEdit.publishedYear ? String(bookToEdit.publishedYear) : '');
      setDescription(bookToEdit.description || '');
      setCoverImage(bookToEdit.coverImage || '');
    } else {
      // Defaults for new book
      setTitle('');
      setAuthor('');
      setCategory('Software Engineering');
      setCustomCategory('');
      setIsCustomCategory(false);
      setStatus('Available');
      setBorrowerName('');
      setIsbn('');
      setPublisher('');
      setPublishedYear(new Date().getFullYear().toString());
      setDescription('');
      setCoverImage('');
    }
    setError(null);
  }, [bookToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const finalCategory = isCustomCategory ? customCategory.trim() : category;

    if (!title.trim()) {
      setError('Please provide a book title');
      return;
    }
    if (!author.trim()) {
      setError('Please provide an author name');
      return;
    }
    if (!finalCategory) {
      setError('Please specify a category');
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        title: title.trim(),
        author: author.trim(),
        category: finalCategory,
        status,
        borrowerName: status === 'Issued' ? borrowerName.trim() : '',
        isbn: isbn.trim(),
        publisher: publisher.trim(),
        publishedYear: publishedYear ? parseInt(publishedYear, 10) : undefined,
        description: description.trim(),
        coverImage: coverImage.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save book record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-neutral-100">
                {bookToEdit ? 'Edit Book Record' : 'Add New Book to Collection'}
              </h2>
              <p className="text-xs text-neutral-400">
                {bookToEdit
                  ? `Updating record ID: ${bookToEdit._id || bookToEdit.id}`
                  : 'Enter bibliographic details and circulation status'}
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

        {/* Error notification */}
        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center gap-2 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Title */}
          <div>
            <label className="block text-neutral-300 font-medium mb-1">
              Book Title <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Structure and Interpretation of Computer Programs"
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500/60"
            />
          </div>

          {/* Author and Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                Author(s) <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Harold Abelson, Gerald Jay Sussman"
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500/60"
              />
            </div>

            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                Category / Subject <span className="text-amber-400">*</span>
              </label>
              <select
                value={isCustomCategory ? 'custom' : category}
                onChange={(e) => {
                  if (e.target.value === 'custom') {
                    setIsCustomCategory(true);
                  } else {
                    setIsCustomCategory(false);
                    setCategory(e.target.value);
                  }
                }}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 focus:outline-none focus:border-amber-500/60 cursor-pointer"
              >
                {PRESET_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="custom">+ Other / Custom Category...</option>
              </select>

              {isCustomCategory && (
                <input
                  type="text"
                  required
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Enter custom category name"
                  className="mt-2 w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500/60"
                />
              )}
            </div>
          </div>

          {/* Status & Borrower */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/80">
            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                Availability Status
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('Available')}
                  className={`flex-1 py-1.5 px-3 rounded-lg border text-center transition-colors cursor-pointer ${
                    status === 'Available'
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300 font-semibold'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  Available
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('Issued')}
                  className={`flex-1 py-1.5 px-3 rounded-lg border text-center transition-colors cursor-pointer ${
                    status === 'Issued'
                      ? 'bg-amber-500/10 border-amber-500/50 text-amber-300 font-semibold'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  Issued
                </button>
              </div>
            </div>

            {status === 'Issued' && (
              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Issued To (Borrower Name / ID)
                </label>
                <input
                  type="text"
                  value={borrowerName}
                  onChange={(e) => setBorrowerName(e.target.value)}
                  placeholder="e.g. Jordan Lee (MEM-2983)"
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500/60"
                />
              </div>
            )}
          </div>

          {/* ISBN, Publisher, Year */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-neutral-400 mb-1">ISBN</label>
              <input
                type="text"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                placeholder="978-0262033848"
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-500 font-mono text-[11px] focus:outline-none focus:border-amber-500/60"
              />
            </div>
            <div>
              <label className="block text-neutral-400 mb-1">Publisher</label>
              <input
                type="text"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                placeholder="e.g. MIT Press"
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500/60"
              />
            </div>
            <div>
              <label className="block text-neutral-400 mb-1">Year</label>
              <input
                type="number"
                min="1800"
                max={new Date().getFullYear() + 2}
                value={publishedYear}
                onChange={(e) => setPublishedYear(e.target.value)}
                placeholder="2024"
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-500 font-mono text-[11px] focus:outline-none focus:border-amber-500/60"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-neutral-400 mb-1">Synopsis / Notes</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief bibliographic abstract or volume notes..."
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500/60 resize-none"
            />
          </div>

          {/* Cover Art selection */}
          <div>
            <label className="block text-neutral-400 mb-1">Cover Image (Optional)</label>
            <div className="flex gap-2 mb-2">
              {PRESET_COVERS.map((preset) => (
                <button
                  key={preset.url}
                  type="button"
                  onClick={() => setCoverImage(preset.url)}
                  className={`px-2.5 py-1 text-[11px] rounded border transition-colors cursor-pointer ${
                    coverImage === preset.url
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  Use {preset.label}
                </button>
              ))}
              {coverImage && (
                <button
                  type="button"
                  onClick={() => setCoverImage('')}
                  className="px-2 py-1 text-[11px] text-neutral-400 hover:text-rose-400"
                >
                  Clear
                </button>
              )}
            </div>
            <input
              type="text"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="Image asset path or leave empty for geometric spine fallback"
              className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-500 text-[11px] font-mono focus:outline-none focus:border-amber-500/60"
            />
          </div>

          {/* Form Actions */}
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
              {loading
                ? 'Saving Record...'
                : bookToEdit
                ? 'Update Record'
                : 'Catalog Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
