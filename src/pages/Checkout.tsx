import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Check, Key, ArrowRight } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const product = location.state?.product || {
    title: 'Adidas Adisun Slides',
    price: 899,
    source: 'Adidas India'
  };

  const handleProceed = async () => {
    if (user) {
      try {
        await addDoc(collection(db, 'purchases'), {
          userId: user.uid,
          itemName: product.title,
          category: 'Shopping',
          date: new Date().toISOString().split('T')[0],
          price: product.price,
          timestamp: new Date().toISOString()
        });
        navigate('/datastore');
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'purchases');
      }
    }
  };

  return (
    <div className="bg-gray-50 text-gray-900 font-sans antialiased min-h-screen flex flex-col items-center p-4 md:p-6">
      <main className="w-full max-w-md flex flex-col gap-6">
        {/* Header */}
        <header className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-bold">Checkout</h1>
          </div>
          <div className="flex items-center gap-1 opacity-80">
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Powered by</span>
            <div className="flex items-center font-bold text-blue-900 text-sm">
              <span className="text-blue-600">Pine</span>Labs
            </div>
          </div>
        </header>

        {/* Order Summary */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex gap-4 mb-4">
            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQiMIr1M1HvY7OJtZ3EKed2qbLEeoWdgVXDqHnZCsY-BsQbbSCcFqESdII1VxTt1e2_zLcnveTM-qObsfQ8BHjnL6kSGZL2NOOYTBR7KXOiji8KlYKlllrE7clb58udN86jAWl-_7F010pAeleveu38kgfjZjVp32UKBwdL-Q0hPhxECw6mDi5MzVqcQD_GQU118udpai6bGIhLU14hiEGc3IqXRYhuNoGDHlZcom1_KO1g32t4k-mqmaHmwrTjcurhmwn0kzlLDfW" alt={product.title} className="w-full h-full object-cover mix-blend-multiply" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 line-clamp-2">{product.title}</h3>
              <p className="text-xs text-gray-500 mt-1">Sold by {product.source}</p>
            </div>
          </div>
          <div className="flex justify-between items-center mb-2 pt-2 border-t border-gray-100">
            <span className="text-gray-500">Amount Payable</span>
            <span className="text-2xl font-extrabold text-gray-900">₹{product.price}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
            <Check className="h-4 w-4" />
            <span>Best price guaranteed by AI optimization</span>
          </div>
        </section>

        {/* AI Recommendation Card */}
        <section className="rounded-2xl p-5 relative overflow-hidden shadow-lg border-2 border-transparent" style={{ backgroundImage: 'linear-gradient(white, white), linear-gradient(to right, #2563eb, #7c3aed)', backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box' }}>
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-100 rounded-full blur-3xl opacity-50"></div>
          
          <div className="flex items-center gap-2 mb-4 relative z-10">
            <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">AI Recommended</span>
            <span className="text-xs text-gray-500 font-medium">Best Payment Route</span>
          </div>
          
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
              <h2 className="text-lg font-bold text-gray-900">HDFC Bank Credit Card</h2>
              <p className="text-sm text-gray-600">Ending in •••• 4242</p>
            </div>
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBx_y7BMMUeXjs8iFj60jAQOsBWQ2N9IW8hnA1V4aqgo9qfm9T8ktkj8k4UD45uDfjIH4zwaYAfzO0ix7r2Yfh_6VvEwBPMyL__JEmbs5TOcnrPZq0F0oRdPHV6db3n37uHEBfE4d8M-kZcZss9bwpTj_S9xIruwTU9cARi9X7y_Yf01KH94uG8c6YoL2Z3cJV1jaeTfHgjKS9re773LGY1EY9JNhfTbsygUw6XXXShOs52zD_JttQ6p6PJzp3rZIzmDTSZNeOcjARr" alt="HDFC" className="rounded shadow-sm w-12" />
          </div>

          <div className="space-y-3 mb-6 relative z-10">
            <div className="flex items-center gap-3 bg-green-50 p-3 rounded-xl border border-green-100">
              <div className="bg-green-100 p-1.5 rounded-full">
                <Key className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-green-700">10% Instant Discount</p>
                <p className="text-xs text-green-600">Save ₹{Math.round(product.price * 0.1)} immediately</p>
              </div>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-200 pt-4 mt-2 relative z-10">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">Total Savings</span>
              <span className="text-xl font-extrabold text-green-600">₹{Math.round(product.price * 0.1)}</span>
            </div>
          </div>
        </section>

        {/* Comparison List */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest px-1">Other cards in your wallet</h3>
          
          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 opacity-70 grayscale-[0.5]">
            <div className="flex items-center gap-3">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAkqgnMXLxxXnjEOIn33wmvMzaJFwDBaEGyle40R62iu4NIVvp9WS7iTYvp6kqQi9bBGAowRIEm_PSA1PQ5tYF_1vkHeQ661NOaNsaS_WS438OrpHeSkyEA-48Gu36NIHw7Dn94a4jH3z6p478tIMQ_n9MZhWMtBZuSXnzwIztdID9MT7ZQzSRUFzsDjnARPypaf0roQzqRpCI6cXitcpHuwnoOQ8rQtd3yR5IPLfgQnoHkIiKfD2j2T4m8R039v69LdIVExvzXz6sG" alt="ICICI" className="rounded w-10" />
              <div>
                <p className="text-sm font-bold">ICICI Bank Credit Card</p>
                <p className="text-[10px] text-gray-500">5% Cashback</p>
              </div>
            </div>
            <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
          </div>

          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 opacity-70 grayscale-[0.5]">
            <div className="flex items-center gap-3">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAmUrUNYalNcc72SurvsIM0-ghdiZWj9nJlbiabqmu51_kFHsiJNO71nE-oijeZ2_cA4AstSl1O_i6UF8knc31eZhJKgAeXbGt16kKKmZ-2BV37EMTt8M594ec3KRYxA2jpaz44zO2kjdQVNlkg6vgDhE03-kUNl8Lx2WJN2hCpUbJtfRa6y8ySEsdjFD1DTXvvBdgIbUdhfyWUaXmyhp3s6Z4fe7X-rZv5sHo0IwuQFJk3OmNz_9Zev1sS1Sla7CHYcIaRNu1f5oVK" alt="SBI" className="rounded w-10" />
              <div>
                <p className="text-sm font-bold">SBI Credit Card</p>
                <p className="text-[10px] text-gray-500">No offers available</p>
              </div>
            </div>
            <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
          </div>
        </section>

        {/* Action Buttons */}
        <section className="mt-auto pt-6 space-y-3">
          <button onClick={handleProceed} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
            <span>Proceed with Recommended</span>
            <ArrowRight className="h-5 w-5" />
          </button>
          <button className="w-full bg-transparent hover:bg-gray-100 text-gray-600 font-semibold py-3 rounded-xl transition-colors">
            Choose Another Method
          </button>
          <p className="text-center text-[10px] text-gray-400 mt-4">
            Secure encrypted checkout provided by Pine Labs Gateway.
          </p>
        </section>
      </main>
    </div>
  );
}
