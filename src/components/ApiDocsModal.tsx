import React, { useState } from 'react';
import { X, Code, Copy, Check, Send } from 'lucide-react';

interface ApiDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  sampleBody?: any;
}

const ENDPOINTS: Endpoint[] = [
  {
    method: 'GET',
    path: '/api/books',
    description: 'List all books. Supports ?search=..., ?status=Available|Issued, ?category=...',
  },
  {
    method: 'POST',
    path: '/api/books',
    description: 'Create a new book record with title, author, category, status, isbn, etc.',
    sampleBody: {
      title: 'Site Reliability Engineering',
      author: 'Betsy Beyer, Chris Jones',
      category: 'Software Engineering',
      status: 'Available',
      isbn: '978-1491929124',
      publishedYear: 2022,
    },
  },
  {
    method: 'GET',
    path: '/api/books/:id',
    description: 'Fetch details of a single book by ID.',
  },
  {
    method: 'PUT',
    path: '/api/books/:id',
    description: 'Update an existing book record fields by ID.',
    sampleBody: {
      title: 'Site Reliability Engineering (2nd Edition)',
      category: 'Architecture',
      status: 'Available',
    },
  },
  {
    method: 'DELETE',
    path: '/api/books/:id',
    description: 'Remove a book record permanently from the database.',
  },
  {
    method: 'PATCH',
    path: '/api/books/:id/status',
    description: 'Quick-toggle availability status between "Available" and "Issued".',
    sampleBody: {
      status: 'Issued',
      borrowerName: 'Patron #4092',
    },
  },
  {
    method: 'POST',
    path: '/api/auth/signup',
    description: 'Register a new library user or staff account.',
    sampleBody: {
      name: 'Elena Rostova',
      email: 'elena@library.org',
      password: 'password123',
      role: 'librarian',
    },
  },
  {
    method: 'POST',
    path: '/api/auth/login',
    description: 'Authenticate user and return session token.',
    sampleBody: {
      email: 'librarian@citylibrary.org',
      password: 'password123',
    },
  },
  {
    method: 'GET',
    path: '/api/books/stats/overview',
    description: 'Returns real-time summary statistics of catalog volumes and loans.',
  },
];

export const ApiDocsModal: React.FC<ApiDocsModalProps> = ({ isOpen, onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyCurl = (ep: Endpoint, index: number) => {
    let curl = `curl -X ${ep.method} "http://localhost:3000${ep.path}"`;
    if (ep.sampleBody) {
      curl += ` \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(ep.sampleBody)}'`;
    }
    navigator.clipboard.writeText(curl);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'GET':
        return 'text-sky-400 bg-sky-500/10 border-sky-500/30';
      case 'POST':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'PUT':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'PATCH':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      case 'DELETE':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      default:
        return 'text-neutral-400 bg-neutral-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl my-8 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Code className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-neutral-100">
                Express REST API Endpoints
              </h2>
              <p className="text-xs text-neutral-400">
                Connected to MongoDB / Mongoose backend controllers
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

        {/* List of endpoints */}
        <div className="overflow-y-auto space-y-3 pr-1 text-xs">
          {ENDPOINTS.map((ep, idx) => (
            <div
              key={idx}
              className="p-3 bg-neutral-950 rounded-xl border border-neutral-800/80 hover:border-neutral-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border ${getMethodBadge(
                      ep.method
                    )}`}
                  >
                    {ep.method}
                  </span>
                  <span className="font-mono text-neutral-200 font-medium">
                    {ep.path}
                  </span>
                </div>
                <button
                  onClick={() => copyCurl(ep, idx)}
                  className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-amber-300 transition-colors px-2 py-1 bg-neutral-900 hover:bg-neutral-800 rounded border border-neutral-800 cursor-pointer"
                  title="Copy cURL command"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>cURL</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-neutral-400 text-xs mb-2">{ep.description}</p>

              {ep.sampleBody && (
                <div className="mt-2 bg-neutral-900/80 p-2.5 rounded-lg border border-neutral-800/60 font-mono text-[10px] text-neutral-300 overflow-x-auto">
                  <div className="text-neutral-500 mb-1 text-[9px] uppercase tracking-wider">
                    Payload Example:
                  </div>
                  <pre>{JSON.stringify(ep.sampleBody, null, 2)}</pre>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-neutral-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
};
