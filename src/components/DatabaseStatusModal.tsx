import React, { useState } from 'react';
import { X, Database, CheckCircle2, AlertTriangle, RefreshCw, KeyRound, Server, FileText } from 'lucide-react';
import { DbStatusInfo } from '../types';
import { api } from '../services/api';

interface DatabaseStatusModalProps {
  isOpen: boolean;
  dbStatus: DbStatusInfo | null;
  onClose: () => void;
  onStatusUpdated: (status: DbStatusInfo) => void;
}

export const DatabaseStatusModal: React.FC<DatabaseStatusModalProps> = ({
  isOpen,
  dbStatus,
  onClose,
  onStatusUpdated,
}) => {
  const [customUri, setCustomUri] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const isMongoConnected = dbStatus?.type === 'mongodb_atlas' && dbStatus?.isConnected;

  const handleConnectMongo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUri.trim()) return;

    try {
      setConnecting(true);
      setTestResult(null);
      const res = await api.connectMongoAtlas(customUri.trim());
      setTestResult({
        success: res.success,
        message: res.message || (res.success ? 'Connected to MongoDB Atlas!' : 'Connection failed'),
      });
      if (res.data) {
        onStatusUpdated(res.data);
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Failed to establish MongoDB connection',
      });
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-neutral-100">
                Database Architecture & Status
              </h2>
              <p className="text-xs text-neutral-400">
                MongoDB Atlas & Mongoose Object Data Modeling (ODM)
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

        {/* Current Connection Status Box */}
        <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-950/80 mb-5 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-neutral-300 uppercase tracking-wider text-[11px]">
              Active Storage Engine
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isMongoConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="font-mono font-medium text-neutral-200">
                {isMongoConnected ? 'MongoDB Atlas (Mongoose)' : 'Local Persistent JSON Store'}
              </span>
            </div>
          </div>
          <p className="text-neutral-400 leading-relaxed">
            {dbStatus?.message || 'Database layer is active.'}
          </p>
          <div className="mt-3 pt-3 border-t border-neutral-800/80 grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-[11px]">
            <div>
              <span className="text-neutral-500 block">Database:</span>
              <span className="text-neutral-200">{dbStatus?.databaseName || 'library'}</span>
            </div>
            <div>
              <span className="text-neutral-500 block">Mongoose Models:</span>
              <span className="text-amber-400">Book, User</span>
            </div>
            <div>
              <span className="text-neutral-500 block">Ready State:</span>
              <span className="text-neutral-200">{dbStatus?.readyState ?? 1}</span>
            </div>
          </div>
        </div>

        {/* Dynamic MongoDB Atlas Connector */}
        <div className="mb-6 p-4 rounded-xl border border-neutral-800 bg-neutral-950/50">
          <h3 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>Connect Live MongoDB Atlas Cluster</span>
          </h3>
          <p className="text-xs text-neutral-400 mb-3 leading-relaxed">
            Enter your MongoDB Atlas connection string below to seamlessly switch from the local adapter to your live cloud database:
          </p>

          <form onSubmit={handleConnectMongo} className="space-y-3">
            <input
              type="text"
              value={customUri}
              onChange={(e) => setCustomUri(e.target.value)}
              placeholder="mongodb+srv://<username>:<password>@cluster.mongodb.net/library?retryWrites=true&w=majority"
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-mono text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500/60"
            />
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-neutral-500">
                Or configure <code className="text-neutral-400">MONGODB_URI</code> in <code className="text-neutral-400">.env</code>
              </span>
              <button
                type="submit"
                disabled={connecting || !customUri.trim()}
                className="px-4 py-1.5 text-xs font-semibold text-neutral-900 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {connecting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <span>Connect & Migrate</span>
                )}
              </button>
            </div>
          </form>

          {testResult && (
            <div
              className={`mt-3 p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                testResult.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>

        {/* Mongoose Schema Architecture Breakdown */}
        <div className="space-y-3 text-xs">
          <h3 className="font-semibold text-neutral-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Mongoose Schemas in this Application</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800/80 font-mono text-[11px]">
              <div className="text-amber-400 font-bold mb-1">BookSchema (BookModel)</div>
              <ul className="text-neutral-400 space-y-0.5">
                <li>• title: String (required, trim)</li>
                <li>• author: String (required, trim)</li>
                <li>• category: String (required, trim)</li>
                <li>• status: 'Available' | 'Issued'</li>
                <li>• borrowerName: String</li>
                <li>• isbn: String</li>
                <li>• publisher: String</li>
                <li>• publishedYear: Number</li>
                <li>• issuedDate, dueDate: Date</li>
              </ul>
            </div>

            <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800/80 font-mono text-[11px]">
              <div className="text-amber-400 font-bold mb-1">UserSchema (UserModel)</div>
              <ul className="text-neutral-400 space-y-0.5">
                <li>• name: String (required)</li>
                <li>• email: String (unique, regex validated)</li>
                <li>• password: String (minlength: 6)</li>
                <li>• role: 'admin' | 'librarian' | 'member'</li>
                <li>• createdAt: Date (timestamps)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
};
