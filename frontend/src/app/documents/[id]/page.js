"use client";
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import api from '@/lib/api';
import { ArrowLeft, Share2, Bold, Italic, Underline as UnderlineIcon, Heading1, Heading2, List, ListOrdered, CheckCircle2, CloudFog, Loader2 } from 'lucide-react';

export default function DocumentEditor() {
  const { id } = useParams();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [docData, setDocData] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'error'
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    setCurrentUserId(localStorage.getItem('activeUserId'));

    api.get(`/docs/${id}`)
      .then(res => {
        setDocData(res.data);
        setTitle(res.data.title);
      })
      .catch(() => router.push('/'));

    api.get('/users')
      .then(res => setAllUsers(res.data))
      .catch(err => console.error(err));
  }, [id, router]);

  const saveDocumentContent = useCallback(async (updatedContent) => {
    setSaveStatus('saving');
    try {
      await api.put(`/docs/${id}`, { content: updatedContent });
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }
  }, [id]);

  const debounce = (fn, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  const debouncedSave = useMemo(() => debounce(saveDocumentContent, 1000), [saveDocumentContent]);

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose-mirror-container',
      },
    },
    onUpdate: ({ editor }) => {
      debouncedSave(editor.getHTML());
    },
  });

  useEffect(() => {
    if (docData && editor && !editor.isDestroyed) {
      const currentContent = editor.getHTML();
      if (currentContent !== docData.content) {
        editor.commands.setContent(docData.content);
      }
    }
  }, [docData, editor]);

  const handleTitleChange = async (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setSaveStatus('saving');
    try {
      await api.put(`/docs/${id}`, { title: newTitle });
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }
  };

  const shareWithUser = async (targetUserId) => {
    try {
      const res = await api.put(`/docs/${id}/share`, { targetUserId });
      setDocData(res.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Action failed');
    }
  };

  if (!docData || !editor || !currentUserId) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-slate-500 font-medium">Loading document...</p>
      </div>
    );
  }

  const isOwner = docData.ownerId === currentUserId;

  const StatusIndicator = () => {
    if (saveStatus === 'saving') return <span className="flex items-center text-slate-400 gap-1.5"><CloudFog size={14} className="animate-pulse" /> Saving...</span>;
    if (saveStatus === 'error') return <span className="flex items-center text-red-500 gap-1.5">Error saving</span>;
    return <span className="flex items-center text-emerald-500 gap-1.5"><CheckCircle2 size={14} /> Saved</span>;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up pb-20">
      
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center flex-1 space-x-2 w-full">
          <button onClick={() => router.push('/')} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 hover:text-slate-800 shrink-0">
            <ArrowLeft size={20} />
          </button>
          <input 
            type="text" 
            value={title} 
            onChange={handleTitleChange}
            className="text-xl sm:text-2xl font-bold text-slate-900 bg-transparent focus:bg-slate-50 focus:outline-none border border-transparent focus:border-slate-200 px-3 py-1.5 rounded-xl w-full max-w-md transition-all truncate"
            placeholder="Untitled Document"
          />
        </div>
        
        <div className="flex items-center justify-between sm:justify-end gap-4 px-2 sm:px-0">
          <div className="text-xs font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 hidden sm:flex">
            <StatusIndicator />
          </div>
          {isOwner && (
            <button 
              onClick={() => setShareModalOpen(true)}
              className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm py-2 px-5 rounded-xl shadow-md transition-all hover:-translate-y-0.5 w-full sm:w-auto justify-center"
            >
              <Share2 size={16} />
              <span>Share</span>
            </button>
          )}
        </div>
      </div>

      {/* Editor Formatting Toolbar (Sticky) */}
      <div className="sticky top-[88px] z-40 bg-white/80 backdrop-blur-md border border-slate-200 rounded-xl p-1.5 shadow-sm flex flex-wrap items-center gap-1">
        <ToolbarButton editor={editor} command="toggleBold" name="bold" icon={Bold} />
        <ToolbarButton editor={editor} command="toggleItalic" name="italic" icon={Italic} />
        <ToolbarButton editor={editor} command="toggleUnderline" name="underline" icon={UnderlineIcon} />
        <div className="h-5 w-px bg-slate-200 mx-1"></div>
        <ToolbarButton editor={editor} command="toggleHeading" args={{ level: 1 }} name="heading" icon={Heading1} />
        <ToolbarButton editor={editor} command="toggleHeading" args={{ level: 2 }} name="heading" icon={Heading2} />
        <div className="h-5 w-px bg-slate-200 mx-1"></div>
        <ToolbarButton editor={editor} command="toggleBulletList" name="bulletList" icon={List} />
        <ToolbarButton editor={editor} command="toggleOrderedList" name="orderedList" icon={ListOrdered} />
        
        {/* Mobile Status Indicator inside toolbar */}
        <div className="ml-auto pr-3 sm:hidden text-xs font-medium">
          <StatusIndicator />
        </div>
      </div>

      {/* Editor Canvas - Guaranteed dark text color */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-12 min-h-[600px] shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 transition-shadow text-slate-800">
        <EditorContent editor={editor} />
      </div>

      {/* Share Modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-fade-in-up">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold text-slate-900">Share Document</h3>
              <button onClick={() => setShareModalOpen(false)} className="text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full p-2 transition-colors">
                ✕
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-6">Grant edit and view permissions to other workspace members.</p>
            
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {allUsers.filter(u => u._id !== currentUserId).map(user => {
                const isAlreadyShared = docData.sharedWith?.some(sharedUser => (sharedUser._id || sharedUser) === user._id);
                return (
                  <div key={user._id} className="flex items-center justify-between p-3 sm:p-4 hover:bg-slate-50 rounded-2xl border border-slate-100 transition-colors">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                    <button 
                      onClick={() => shareWithUser(user._id)}
                      disabled={isAlreadyShared}
                      className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${
                        isAlreadyShared 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100 hover:scale-105 active:scale-95'
                      }`}
                    >
                      {isAlreadyShared ? 'Has Access' : 'Invite'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable Toolbar Button Component
function ToolbarButton({ editor, command, args, name, icon: Icon }) {
  const isActive = args ? editor.isActive(name, args) : editor.isActive(name);
  return (
    <button 
      onClick={() => args ? editor.chain().focus()[command](args).run() : editor.chain().focus()[command]().run()} 
      className={`p-2 sm:p-2.5 rounded-lg transition-all ${isActive ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
    >
      <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
    </button>
  );
}