import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, ChevronRight, TrendingUp, Loader2 } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { getSearchResults, SearchResultData } from '../services/geminiService';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || 'Shoes under 1000 rupees';
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<SearchResultData | null>(null);

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      try {
        const data = await getSearchResults(query);
        setResults(data);
      } catch (error) {
        console.error("Failed to fetch search results", error);
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, [query]);

  return (
    <div className="bg-gray-50 text-gray-900 font-sans antialiased min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="text-2xl font-bold text-blue-600 cursor-pointer" onClick={() => navigate('/')}>SearchAI</div>
            <div className="flex-1 max-w-2xl relative">
              <input 
                type="text" 
                defaultValue={query}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    navigate(`/search?q=${encodeURIComponent(e.currentTarget.value)}`);
                  }
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm" 
                placeholder="Search anything..." 
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>
          <nav className="ml-4 flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <SlidersHorizontal className="w-6 h-6 text-gray-600" />
            </button>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold overflow-hidden">
              {user?.photoURL ? <img src={user.photoURL} alt="User" /> : 'JD'}
            </div>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-gray-500 font-medium">AI is analyzing the market for "{query}"...</p>
          </div>
        ) : results ? (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Content Area */}
            <section className="flex-1 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Sources */}
              <div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Sources</h2>
                <div className="flex overflow-x-auto gap-3 pb-2 custom-scrollbar">
                  {[
                    { name: 'Amazon.in', desc: 'Best sellers in budget footwear...', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnuLAkX7BOSBCw1zinInjfE-J5_RI2D9nYdUhEokL3OlhJCEKWJ2FLHNWjw5qVdwD0S1upCE9CVEQyPrUh8u6F1s9-fmdiyhJf-xzQFIx_J-6fcMVrUCkIIZ2hUWHEM7yLkVXwlpcu1iagXpsPbiu6w4-u1iiZPSaXQAHzDVGJBd7xnJkSUUX5KHkEAwsbrm4c7188m2MHQud7jofiUXwTXk0xfdIvYh6D3wbtXYL-nPnlac9ZRm86agFnKqkkgROe4F2nfu-VBuIk' },
                    { name: 'Myntra', desc: "Men's Shoes under 1k collection", img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7n8-70CfS_6MXqQj5Ibf4jlxj5uwkMv-0MGs0-f3X-3H_KmwtmGslkZA5SN-8wy_zAvo9w77OVg99O8mZVAjJOsMr2l7CLDavHcDXisflV3l47qEWpoTiBqcyUXvnCVCo7yddlyPb_riivrCNCEyyAgAOUsaz343FKnVueoy4xMuUH6Z6h0efBzV9gHLrK2p0S_wX_DJADD3OwH6uN2EaLEPXrktL9ItyOHForERGesOSbtNBm7XkUzgHadVSKXOXPk9lezkYEigi' },
                    { name: 'Adidas India', desc: 'Clearance sale: Performance...', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTPsELlMxbws0VjQ-1B5H0YlkzDk1RckOcdNmHAP_omM9EA1tdn2Ap52SRNZSLZ15J7qc-Z0hu3tzndIWmjRsuN78dPG5ghlGUvRqp6Wp0posBlZ7pzMRl-LPPeMPW1MiUoBVI23KL640LRPT3UeASE5wlkrW-FzkX2LFZg1G8_wJOsytTGrVDx2w9QZScp5pLtPHMTlVBwd29vzSlKDlBAdQhUCEqVfKLcK5ioS_Ld_Ed70H620OJZpXKf9PAeVwR_eaWqP_XOx31' },
                    { name: 'Flipkart', desc: 'Top rated budget casuals...', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjPQrQnxEmICnosufgnvqytuvy1vmx3Av7K_XIbe5IvdpbgZ93ahp0cnXZEe4JQNL5vGSpWvwkW_oCj63aAp9GQOxO4mIEBdeQib_O5VJiwq9rbCZyJoMp7uoI_Nn1V4RryBIizCrpKvix4R3lh-o3i6Tyzk4x8HYXr0fe6XEIN5NPb5j5XqHdVuI9blYjNH9GrmqDF1kYvn7NeUGgi1WxML3n4WFFa0JTL9vPb4oslpzD2Q1feclZANmKUcWUemowuKzjdB9lWz6g' }
                  ].map((source, i) => (
                    <div key={i} className="flex-shrink-0 w-40 p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-center gap-2 mb-2">
                        <img src={source.img} alt={source.name} className="w-4 h-4 rounded-sm" />
                        <span className="text-xs font-medium text-gray-700 truncate">{source.name}</span>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2">{source.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Answer */}
              <article className="prose prose-blue max-w-none">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Recommended for "{query}"</h1>
                <p className="text-gray-700 leading-relaxed mb-6">
                  {results.summary}
                </p>

                {/* Top Suggestion */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl mb-8 relative">
                  <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] px-2 py-1 rounded-bl-lg font-bold uppercase tracking-widest">
                    Based on your history
                  </div>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-1/3">
                      <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQiMIr1M1HvY7OJtZ3EKed2qbLEeoWdgVXDqHnZCsY-BsQbbSCcFqESdII1VxTt1e2_zLcnveTM-qObsfQ8BHjnL6kSGZL2NOOYTBR7KXOiji8KlYKlllrE7clb58udN86jAWl-_7F010pAeleveu38kgfjZjVp32UKBwdL-Q0hPhxECw6mDi5MzVqcQD_GQU118udpai6bGIhLU14hiEGc3IqXRYhuNoGDHlZcom1_KO1g32t4k-mqmaHmwrTjcurhmwn0kzlLDfW" alt={results.topSuggestion.title} className="w-full h-auto rounded-lg shadow-sm mix-blend-multiply" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded uppercase">Top Suggestion</span>
                        <span className="text-sm text-gray-500">{results.topSuggestion.source}</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{results.topSuggestion.title}</h3>
                      <p className="text-sm text-gray-600 mb-4">{results.topSuggestion.description} {results.topSuggestion.reasoning}</p>
                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-bold text-green-600">₹{results.topSuggestion.price}</span>
                        {results.topSuggestion.originalPrice > results.topSuggestion.price && (
                          <span className="text-sm text-gray-400 line-through">₹{results.topSuggestion.originalPrice}</span>
                        )}
                        <button onClick={() => navigate('/checkout', { state: { product: results.topSuggestion } })} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm">View Deal</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.otherProducts.slice(0, 2).map((product, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors bg-white flex flex-col justify-between">
                      <div>
                        <img src={idx === 0 ? "https://lh3.googleusercontent.com/aida-public/AB6AXuCdTS0PtxOpfPNUj6OvYWRxFsHIjEzv3gMD7GGgytwoS6mcT1rLXwN1sg7bV0z991ncz1Z8X6LE6sK7RkoCWYdL-Arc-mhnmK0CTPxndn4QQrcBY3EZ6kPb_DBG1MOPHgbHRIKfzny6UGLF5izJh3VUt7LzFGDP4sFWBjbDzggZlKfrJ8ximI6PqY9m8G4UEs7eE_CN2ny2wR398F0BLNGrbOPtuWiPgWUahh0ZJ5j2h2S_ZtwZFWJsbx78gvmU4zkQnWCa-gUqQ5iq" : "https://lh3.googleusercontent.com/aida-public/AB6AXuDeMyzTJBjvOeVI9WkGwr8FTeueUqOHWv-4ZmDeIf6EY42FILDVaFQwqY7gHWOts65Gt0pvZXHSMvCQnoVSj3qQBwlD_Cdyn3KNBrGrEA6udjDctD5ldYAAln5PkkV2IaGmOYV68il0TudGaqNJTmpB69UiNr8ASZiAsQnzRaItmUpFd1tjyDoOcL95WKobgQsj8dtWu0XKFfqalqeo9nYxKIRy_y6rEMKB3v9ZdYN24M_lFqNniSuGcrftVR-9aM9sWLHrgFeJI1vn"} alt={product.title} className="w-full aspect-video object-cover rounded-md mb-4" />
                        <h4 className="font-bold text-gray-900">{product.title}</h4>
                        <p className="text-xs text-gray-500 mb-2">{product.source} • {product.description}</p>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-bold">₹{product.price}</span>
                        <button onClick={() => navigate('/checkout', { state: { product } })} className="text-blue-600 font-semibold text-sm hover:underline">View on {product.source.split('.')[0]}</button>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </section>

            {/* Sidebar */}
            <aside className="w-full lg:w-80 space-y-8">
              <div className="bg-white border border-gray-200 rounded-xl p-5 sticky top-24">
                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  Related Topics
                </h3>
                <ul className="space-y-3">
                  {results.relatedTopics.slice(0, 4).map((topic, i) => (
                    <li key={i}>
                      <button onClick={() => navigate(`/search?q=${encodeURIComponent(topic)}`)} className="w-full group flex items-center justify-between text-sm text-gray-600 hover:text-blue-600 transition-colors text-left">
                        <span>{topic}</span>
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Price History</h4>
                  <div className="h-24 flex items-end gap-1 px-1">
                    <div className="flex-1 bg-gray-100 h-12 rounded-t hover:bg-blue-200 transition-colors"></div>
                    <div className="flex-1 bg-gray-100 h-16 rounded-t hover:bg-blue-200 transition-colors"></div>
                    <div className="flex-1 bg-gray-100 h-20 rounded-t hover:bg-blue-200 transition-colors"></div>
                    <div className="flex-1 bg-blue-500 h-10 rounded-t"></div>
                    <div className="flex-1 bg-gray-100 h-14 rounded-t hover:bg-blue-200 transition-colors"></div>
                  </div>
                  <p className="text-[10px] text-center text-gray-500 mt-2">Prices are at their lowest point in 30 days</p>
                </div>
              </div>
            </aside>
          </div>
        ) : null}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© 2024 SearchAI. Recommendations generated by AI based on real-time web availability.</p>
        </div>
      </footer>
    </div>
  );
}
