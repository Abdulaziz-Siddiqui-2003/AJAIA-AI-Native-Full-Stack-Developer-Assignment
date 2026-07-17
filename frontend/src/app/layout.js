"use client";
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import './globals.css';

export default function RootLayout({ children }) {
  const [users, setUsers] = useState([]);
  const [activeUserId, setActiveUserId] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    api.get('/users')
      .then(res => {
        setUsers(res.data);
        const stored = localStorage.getItem('activeUserId');
        if (stored) {
          setActiveUserId(stored);
        } else if (res.data.length > 0) {
          localStorage.setItem('activeUserId', res.data[0]._id);
          setActiveUserId(res.data[0]._id);
        }
      })
      .catch(err => console.error("Error fetching users:", err));
  }, []);

  const handleUserChange = (e) => {
    const id = e.target.value;
    localStorage.setItem('activeUserId', id);
    setActiveUserId(id);
    window.location.reload(); 
  };

  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
        {mounted && (
          <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center justify-between shadow-sm transition-all">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-inner">
                <span className="text-white font-bold text-lg leading-none">A</span>
              </div>
              <span className="text-xl font-bold text-slate-800 tracking-tight hidden sm:block">AjaiaDocs</span>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-3 bg-slate-100/50 p-1.5 px-3 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse hidden sm:block"></div>
              <label className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:block">Active:</label>
              <select 
                value={activeUserId} 
                onChange={handleUserChange}
                className="bg-transparent text-sm font-semibold text-slate-700 focus:outline-none cursor-pointer max-w-[120px] sm:max-w-none truncate"
              >
                <option value="" disabled>Loading users...</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          </header>
        )}
        <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </body>
    </html>
  );
}