"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { FileText, Plus, Upload, Shield, Users, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    setCurrentUserId(localStorage.getItem('activeUserId'));
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    try {
      const res = await api.get('/docs');
      setDocs(res.data);
    } catch (err) {
      console.error("Failed to fetch documents", err);
    } finally {
      setLoading(false);
    }
  };

  const createNewDoc = async () => {
    try {
      const res = await api.post('/docs');
      router.push(`/documents/${res.data._id}`);
    } catch (err) {
      alert("Error creating document");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);

    try {
      const res = await api.post('/docs/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      router.push(`/documents/${res.data._id}`);
    } catch (err) {
      alert("Error uploading file. Make sure it's a valid .txt file.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 space-y-4">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      <p className="text-slate-500 font-medium">Loading workspace...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Documents</h1>
          <p className="text-sm text-slate-500 mt-1.5">Manage, share, and collaborate on your workspace files.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <label className="flex items-center justify-center space-x-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-sm py-2.5 px-5 rounded-xl border border-slate-200 transition-colors cursor-pointer w-full sm:w-auto">
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            <span>{uploading ? 'Importing...' : 'Import .txt'}</span>
            <input type="file" accept=".txt" onChange={handleFileUpload} className="hidden" disabled={uploading} />
          </label>
          
          <button 
            onClick={createNewDoc}
            className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm py-2.5 px-5 rounded-xl shadow-md shadow-blue-600/20 transition-all hover:-translate-y-0.5 w-full sm:w-auto"
          >
            <Plus size={18} />
            <span>New Document</span>
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 px-2">Recent Files</h2>
        {docs.length === 0 ? (
          <div className="bg-white border border-slate-200 border-dashed rounded-3xl p-16 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
              <FileText className="text-slate-300" size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-700">No documents yet</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-sm">Get started by creating a new document or importing an existing text file into your workspace.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {docs.map(doc => {
              const isOwner = doc.ownerId === currentUserId;
              return (
                <Link key={doc._id} href={`/documents/${doc._id}`}>
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-blue-200 transition-all duration-300 flex flex-col justify-between h-44 group cursor-pointer">
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate text-lg">
                          {doc.title}
                        </h3>
                        {isOwner ? (
                          <div className="bg-emerald-100/50 text-emerald-700 p-1.5 rounded-lg shrink-0" title="Owner">
                            <Shield size={14} />
                          </div>
                        ) : (
                          <div className="bg-indigo-100/50 text-indigo-700 p-1.5 rounded-lg shrink-0" title="Shared with me">
                            <Users size={14} />
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: doc.content }} />
                    </div>
                    <div className="text-xs font-medium text-slate-400 pt-4 mt-2 border-t border-slate-100 flex items-center justify-between">
                      <span>Edited {new Date(doc.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}