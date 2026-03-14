import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { Home as HomeIcon, Compass, Library, Paperclip, ArrowRight, Tag, Percent, TrendingUp } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

export default function Home() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { user, signIn, logOut } = useAuth();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (user) {
      try {
        await addDoc(collection(db, 'searches'), {
          userId: user.uid,
          query: query.trim(),
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'searches');
      }
    }
    
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="bg-[#0A0A0A] text-gray-100 flex h-screen overflow-hidden font-sans">
      {/* Sidebar */}
      <nav className="w-64 border-r border-white/10 flex flex-col p-6 hidden md:flex">
        <div className="mb-10">
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="w-6 h-6 bg-white rounded-md flex items-center justify-center">
              <span className="bg-black w-2 h-2 rounded-full"></span>
            </span>
            Checkout Pro
          </h1>
        </div>
        <div className="space-y-2 flex-1">
          <a href="#" className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-lg text-white font-medium hover:bg-white/10 transition-all">
            <HomeIcon className="w-5 h-5" /> Home
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-400 rounded-lg hover:text-white hover:bg-white/5 transition-all">
            <Compass className="w-5 h-5" /> Discover
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-400 rounded-lg hover:text-white hover:bg-white/5 transition-all">
            <Library className="w-5 h-5" /> Library
          </a>
        </div>
        <div className="mt-auto pt-6 border-t border-white/10">
          <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-4 rounded-xl border border-indigo-500/30">
            <p className="text-xs font-semibold text-indigo-300 uppercase tracking-widest mb-2">Pro Plan</p>
            <p className="text-sm text-gray-300 mb-3">Unlock unlimited AI insights for your shopping.</p>
            <button className="w-full py-2 bg-white text-black text-sm font-bold rounded-lg hover:bg-gray-200 transition-colors">Upgrade</button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-y-auto">
        {/* Top Right Profile */}
        <div className="absolute top-6 right-6 flex items-center gap-4">
          {user ? (
            <>
              <div className="flex items-center gap-2">
                <img src={user.photoURL || ''} alt="Profile" className="w-8 h-8 rounded-full" />
                <span className="text-sm font-medium text-gray-300">{user.displayName}</span>
              </div>
              <button onClick={logOut} className="text-sm font-medium text-gray-400 hover:text-white">Log out</button>
              <button onClick={() => navigate('/datastore')} className="px-4 py-2 bg-white/10 text-white text-sm font-bold rounded-full hover:bg-white/20">DataStore</button>
            </>
          ) : (
            <>
              <button onClick={signIn} className="text-sm font-medium text-gray-400 hover:text-white">Log in</button>
              <button onClick={signIn} className="px-4 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-gray-200">Sign Up</button>
            </>
          )}
        </div>

        {/* Center Hero */}
        <div className="w-full max-w-2xl text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-4xl font-semibold tracking-tight text-white mb-8">Where shopping meets intelligence.</h2>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur-xl opacity-20 group-focus-within:opacity-40 transition-opacity"></div>
            <div className="relative flex items-center bg-[#1A1A1A] border border-white/10 rounded-2xl p-2 shadow-2xl focus-within:border-white/30 transition-all">
              <textarea 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSearch(e);
                  }
                }}
                className="w-full bg-transparent border-none focus:ring-0 text-lg py-3 px-4 resize-none text-white placeholder-gray-500 outline-none" 
                placeholder="Ask anything about products, prices, or trends..." 
                rows={1}
                style={{ height: 'auto', minHeight: '56px', maxHeight: '150px' }}
              />
              <div className="flex items-center gap-2 pr-2">
                <button type="button" className="p-2 text-gray-400 hover:text-white transition-colors" title="Attach file">
                  <Paperclip className="w-6 h-6" />
                </button>
                <button type="submit" className="bg-white/10 p-2.5 rounded-xl text-white hover:bg-white/20 transition-all group-focus-within:bg-indigo-600">
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </form>

          {/* Filter Toggles */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <label className="cursor-pointer">
              <input type="checkbox" className="peer sr-only" value="discount" />
              <div className="px-5 py-2.5 rounded-full border border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:bg-white/10 peer-checked:bg-white peer-checked:text-black peer-checked:border-white transition-all flex items-center gap-2">
                <Tag className="w-4 h-4" />
                <span className="text-sm font-medium">Discount</span>
              </div>
            </label>
            <label className="cursor-pointer">
              <input type="checkbox" className="peer sr-only" value="offers" />
              <div className="px-5 py-2.5 rounded-full border border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:bg-white/10 peer-checked:bg-white peer-checked:text-black peer-checked:border-white transition-all flex items-center gap-2">
                <Percent className="w-4 h-4" />
                <span className="text-sm font-medium">Offers</span>
              </div>
            </label>
            <label className="cursor-pointer">
              <input type="checkbox" className="peer sr-only" value="trending" defaultChecked />
              <div className="px-5 py-2.5 rounded-full border border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:bg-white/10 peer-checked:bg-white peer-checked:text-black peer-checked:border-white transition-all flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">Trending</span>
              </div>
            </label>
          </div>
        </div>

        {/* Quick Suggestions */}
        <div className="absolute bottom-12 w-full max-w-2xl px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 opacity-50 hover:opacity-100 transition-opacity">
            <button onClick={() => setQuery("Best budget sneakers for 2024")} className="text-xs text-left p-3 border border-white/10 rounded-lg hover:bg-white/5">"Best budget sneakers for 2024"</button>
            <button onClick={() => setQuery("Compare RTX 4080 vs 4090")} className="text-xs text-left p-3 border border-white/10 rounded-lg hover:bg-white/5">"Compare RTX 4080 vs 4090"</button>
            <button onClick={() => setQuery("Organic coffee subscriptions")} className="text-xs text-left p-3 border border-white/10 rounded-lg hover:bg-white/5">"Organic coffee subscriptions"</button>
            <button onClick={() => setQuery("Gift ideas for tech lovers")} className="text-xs text-left p-3 border border-white/10 rounded-lg hover:bg-white/5">"Gift ideas for tech lovers"</button>
          </div>
        </div>
      </main>
    </div>
  );
}
