import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, Info, ShoppingBag, CreditCard, ArrowRight, TrendingUp } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

interface Purchase {
  id: string;
  itemName: string;
  category: string;
  date: string;
  price: number;
}

export default function DataStore() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'purchases'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newPurchases = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Purchase[];
      setPurchases(newPurchases);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'purchases');
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="bg-slate-50 text-slate-900 font-sans antialiased min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-blue-600 p-2 rounded-lg">
              <Database className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">DataStore Snapshot</h1>
              <p className="text-xs text-slate-500 uppercase font-semibold">AI Decision Context Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{user?.displayName || 'User'}</p>
              <p className="text-xs text-slate-400 italic font-mono">ID: {user?.uid.substring(0, 8).toUpperCase()}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-slate-200 border border-slate-300 overflow-hidden">
              <img src={user?.photoURL || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUcVB5A-3GIDEhdVqk3EmPCpkwt1XtYLT_rGDZP6KWleYIRON2QimYm0yR_bggbHZLGFEtcb1P40vJZnGc6Kc5rQ97X8y6WBl9oyDdZPtIzv-sMMjzbziLtpDkMsUmyB0WQxmbZscDMzNDXej6ku6E6z6WC1wfin3dGDMftnKo8hWWKiEKbin5Otad1Z7KHJqNDk3t404T2DHLcHsnO_gwRP3tbsI7sX4HnmegN1dexrMwvnNGyppViqo_nUIbW_suq7nTZbTcqV0p'} alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Context Alert */}
        <section className="mb-8 bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-4">
          <div className="text-blue-600 mt-1">
            <Info className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-blue-900">Active Intelligence Snapshot</h2>
            <p className="text-sm text-blue-700">The data displayed below is the primary context used by your Personal Shopping Agent to recommend products, manage payments, and predict future needs.</p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Panel */}
          <section className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-slate-400" />
                  Purchase History
                </h3>
                <span className="text-xs font-medium text-slate-400">Showing last 12 months</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                    <tr>
                      <th className="px-6 py-3 border-b border-slate-100">Item Name</th>
                      <th className="px-6 py-3 border-b border-slate-100">Category</th>
                      <th className="px-6 py-3 border-b border-slate-100">Date</th>
                      <th className="px-6 py-3 border-b border-slate-100 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {purchases.map((purchase) => (
                      <tr key={purchase.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">{purchase.itemName}</td>
                        <td className="px-6 py-4 text-slate-500">{purchase.category}</td>
                        <td className="px-6 py-4 text-slate-500">{purchase.date}</td>
                        <td className="px-6 py-4 text-right font-mono">₹{purchase.price.toFixed(2)}</td>
                      </tr>
                    ))}
                    {purchases.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-slate-500">No purchases found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
                <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1">
                  View Detailed Analytics
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Meta Data */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Top Vendor</p>
                <p className="text-lg font-bold text-slate-800">Adidas</p>
                <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full w-[65%]"></div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Budget Index</p>
                <p className="text-lg font-bold text-green-600">Stable</p>
                <p className="text-xs text-slate-500 mt-1">Avg. ₹1,142/order</p>
              </div>
            </div>
          </section>

          {/* Right Panel */}
          <section className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-slate-400" />
                  Saved Cards
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {/* Card 1 */}
                <div className="relative group cursor-default">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl opacity-10 group-hover:opacity-20 transition duration-300"></div>
                  <div className="relative bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-6 bg-slate-800 rounded flex items-center justify-center">
                          <span className="text-[8px] text-white font-bold italic">VISA</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">Visa Signature</p>
                          <p className="text-xs text-slate-500">Ending in 4429</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 uppercase">Primary</span>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2.5 flex items-center gap-3 border border-slate-100">
                      <div className="p-1.5 bg-blue-50 text-blue-600 rounded">
                        <TrendingUp className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">AI Insight</p>
                        <p className="text-xs font-medium text-slate-700">Most Used for Electronics</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="relative group cursor-default">
                  <div className="relative bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-6 bg-orange-500 rounded flex items-center justify-center">
                          <div className="flex -space-x-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-600 opacity-90"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-400 opacity-90"></div>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">Mastercard Gold</p>
                          <p className="text-xs text-slate-500">Ending in 1088</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2.5 flex items-center gap-3 border border-slate-100">
                      <div className="p-1.5 bg-orange-50 text-orange-600 rounded">
                        <TrendingUp className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">AI Insight</p>
                        <p className="text-xs font-medium text-slate-700">Frequent use for International Travel</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-slate-900 rounded-2xl p-6 text-white overflow-hidden relative shadow-lg">
              <div className="relative z-10">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4">Agent Confidence Score</h4>
                <div className="flex items-end gap-3 mb-4">
                  <span className="text-4xl font-bold tracking-tight">94.2%</span>
                  <span className="text-green-400 text-sm mb-1 font-medium flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    +2.4%
                  </span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">Based on current transaction depth and card metadata accuracy. Higher scores lead to more autonomous purchasing capabilities.</p>
              </div>
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl"></div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
