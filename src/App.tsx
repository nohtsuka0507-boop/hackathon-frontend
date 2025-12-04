import React, { useEffect, useState } from 'react';
import AiRepairShop from './AiRepairShop';
import DigitalCertificate from './DigitalCertificate';
import CraftsmanChat from './CraftsmanChat';
import Auth from './Auth';
import SellItem from './SellItem';
import TradeChat from './TradeChat';
// ★修正: Search アイコンを追加
import { ShoppingBag, RefreshCw, ChevronRight, MessageCircle, Shield, LogOut, Plus, Wrench, MessageSquareText, Heart, Search } from 'lucide-react';

const API_BASE_URL = 'https://hackathon-backend-1093557143473.us-central1.run.app';

interface Item {
    id: string;
    name: string;
    price: number;
    description: string;
    sold_out: boolean;
    has_certificate?: boolean;
    image_url?: string;
    like_count?: number;
}

function App() {
    const [items, setItems] = useState<Item[]>([]);
    const [showSupportChat, setShowSupportChat] = useState(false);
    const [selectedItemForChat, setSelectedItemForChat] = useState<Item | null>(null);

    const [user, setUser] = useState<any>(null);
    const [token, setToken] = useState<string | null>(null);
    const [view, setView] = useState<'home' | 'sell'>('home');
    const [likedItemIds, setLikedItemIds] = useState<string[]>([]);

    // ★追加: 検索キーワード
    const [searchKeyword, setSearchKeyword] = useState('');

    const fetchItems = async (keyword = '') => {
        try {
            // ★修正: キーワードがあればクエリパラメータを付ける
            const url = keyword
                ? `${API_BASE_URL}/items?q=${encodeURIComponent(keyword)}`
                : `${API_BASE_URL}/items`;

            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    // 検索時はサーバー側で並び替えや絞り込み済み
                    setItems(data);
                }
            }
        } catch (e) {
            console.error("データ取得エラー:", e);
        }
    };

    // ★追加: 検索実行
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setView('home'); // 検索したらホームに戻る
        fetchItems(searchKeyword);
    };

    const fetchLikes = async () => {
        if (!user?.id) return;
        try {
            const res = await fetch(`${API_BASE_URL}/likes?user_id=${user.id}`);
            if (res.ok) {
                const ids = await res.json();
                setLikedItemIds(ids || []);
            }
        } catch (e) {
            console.error("いいね取得エラー:", e);
        }
    };

    const handleToggleLike = async (itemId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user?.id) return;

        const isCurrentlyLiked = likedItemIds.includes(itemId);
        if (isCurrentlyLiked) {
            setLikedItemIds(prev => prev.filter(id => id !== itemId));
            setItems(prev => prev.map(i => i.id === itemId ? { ...i, like_count: (i.like_count || 0) - 1 } : i));
        } else {
            setLikedItemIds(prev => [...prev, itemId]);
            setItems(prev => prev.map(i => i.id === itemId ? { ...i, like_count: (i.like_count || 0) + 1 } : i));
        }

        try {
            await fetch(`${API_BASE_URL}/likes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.id, item_id: itemId })
            });
        } catch (error) {
            console.error("いいね更新エラー", error);
        }
    };

    const handlePurchase = async (item: Item) => {
        if (item.sold_out) return;
        if (window.confirm(`「${item.name}」を購入しますか？\n価格: ¥${item.price.toLocaleString()}`)) {
            try {
                await fetch(`${API_BASE_URL}/items/purchase?id=${item.id}`, { method: 'POST' });
                alert('購入が完了しました！');
                // 購入後は検索状態を維持するか、リセットするか。今回はリセットせず再取得
                fetchItems(searchKeyword);
            } catch (e) {
                alert('購入処理に失敗しました');
            }
        }
    };

    const handleLoginSuccess = (token: string, userData: any) => {
        setToken(token);
        setUser(userData);
    };

    const handleLogout = () => {
        setToken(null);
        setUser(null);
        setShowSupportChat(false);
        setSelectedItemForChat(null);
        setLikedItemIds([]);
        setView('home');
        setSearchKeyword(''); // ログアウト時に検索クリア
    };

    const handleSellComplete = () => {
        setView('home');
        setSearchKeyword(''); // 出品後は全件表示に戻す
        fetchItems();
    };

    useEffect(() => {
        if (token) {
            fetchItems(); // 初回は全件取得
            if (user?.id) {
                fetchLikes().catch(console.error);
            }
        }
    }, [token, user?.id]);
    // viewが変わった時に再取得すると検索結果が消えるので、view依存は外しました

    if (!token) {
        return <Auth onLoginSuccess={handleLoginSuccess} />;
    }

    return (
        <div className="min-h-screen bg-stone-50 text-stone-800 font-sans pb-24 selection:bg-stone-200 relative">

            <header className="sticky top-0 z-50 bg-stone-50/90 backdrop-blur-sm border-b border-stone-200">
                <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => {
                        setView('home');
                        setSearchKeyword('');
                        fetchItems(''); // ロゴクリックでリセット
                    }}>
                        <div className="text-stone-800 p-1 border border-stone-800 rounded-sm">
                            <RefreshCw className="w-4 h-4" />
                        </div>
                        <h1 className="text-xl font-normal tracking-widest text-stone-800 uppercase hidden sm:block">
                            Re:Value
                        </h1>
                    </div>

                    {/* ★追加: 検索バー */}
                    <form onSubmit={handleSearch} className="flex-1 max-w-md relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-stone-600 transition-colors" />
                        <input
                            type="text"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            placeholder="何をお探しですか？"
                            className="w-full bg-stone-100 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-stone-300 outline-none transition-all"
                        />
                    </form>

                    <nav className="flex items-center gap-4 text-sm tracking-wide text-stone-600 shrink-0">
                        <button
                            onClick={() => setView('sell')}
                            className={`flex items-center gap-2 px-3 py-2 border rounded-sm transition-colors ${view === 'sell' ? 'bg-stone-800 text-white border-stone-800' : 'bg-white border-stone-300 hover:border-stone-800'}`}
                        >
                            <Plus className="w-3 h-3" />
                            <span className="text-xs font-bold tracking-widest uppercase hidden md:inline">Sell</span>
                        </button>

                        <button onClick={() => setShowSupportChat(!showSupportChat)} className="flex items-center gap-2 hover:text-stone-900 transition-colors">
                            <MessageCircle className="w-4 h-4" />
                        </button>

                        <button onClick={handleLogout} className="flex items-center gap-1 hover:text-red-500 transition-colors" title="ログアウト">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </nav>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-16 space-y-24">

                {selectedItemForChat && (
                    <TradeChat
                        item={selectedItemForChat}
                        currentUserId={user?.id}
                        onClose={() => setSelectedItemForChat(null)}
                    />
                )}

                {view === 'sell' ? (
                    <div className="space-y-20 animate-in fade-in duration-500">
                        <section className="bg-white p-8 rounded-lg shadow-sm border border-stone-100">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-100">
                                <div className="bg-indigo-50 p-2 rounded-full text-indigo-600">
                                    <Wrench className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-stone-800">AI Repair & Value Check</h3>
                                    <p className="text-xs text-stone-500">出品前に、修復プランと適正価格をAIが診断します。</p>
                                </div>
                            </div>
                            <AiRepairShop />
                        </section>

                        <section className="relative">
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-stone-200 text-stone-500 text-[10px] px-3 py-1 rounded-full uppercase tracking-widest">
                                Step 2
                            </div>
                            <SellItem onComplete={handleSellComplete} />
                        </section>
                    </div>
                ) : (
                    <>
                        {showSupportChat && (
                            <div className="fixed bottom-24 right-6 z-50 w-80 shadow-2xl animate-in slide-in-from-bottom-10 border border-stone-200 rounded-lg overflow-hidden">
                                <div className="bg-stone-800 text-white p-2 flex justify-between items-center">
                                    <span className="text-xs font-bold tracking-widest pl-2">CRAFTSMAN SUPPORT</span>
                                    <button onClick={() => setShowSupportChat(false)} className="px-2 hover:text-stone-300">×</button>
                                </div>
                                <CraftsmanChat />
                            </div>
                        )}

                        <section>
                            <div className="flex items-end justify-between mb-8">
                                <div>
                                    <h3 className="text-xl font-normal text-stone-800 tracking-wide mb-1">
                                        Marketplace
                                    </h3>
                                    <p className="text-sm text-stone-500">
                                        {searchKeyword ? `「${searchKeyword}」の検索結果` : '出品商品一覧'}
                                    </p>
                                </div>
                            </div>

                            {items.length === 0 ? (
                                <div className="text-center py-20 bg-white border border-dashed border-stone-300 rounded-lg">
                                    <p className="text-stone-400">
                                        {searchKeyword ? '該当する商品は見つかりませんでした' : '現在出品されている商品はありません'}
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {items.map((item) => (
                                        <div key={item.id} className="group bg-white flex flex-col h-full relative border border-stone-100 transition hover:shadow-lg">
                                            <div className="aspect-square bg-stone-100 relative overflow-hidden mb-4 cursor-pointer">
                                                {item.image_url ? (
                                                    <img
                                                        src={item.image_url}
                                                        alt={item.name}
                                                        loading="lazy"
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center text-stone-300">
                                                        <ShoppingBag className="w-12 h-12 stroke-1" />
                                                    </div>
                                                )}

                                                <button
                                                    onClick={(e) => handleToggleLike(item.id, e)}
                                                    className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur rounded-lg shadow-sm hover:bg-white transition-all z-20 group-hover:scale-110 duration-300 flex flex-col items-center min-w-[32px]"
                                                >
                                                    <Heart
                                                        className={`w-5 h-5 transition-colors mb-0.5 ${
                                                            likedItemIds.includes(item.id)
                                                                ? "fill-rose-500 text-rose-500"
                                                                : "text-stone-400 hover:text-rose-500"
                                                        }`}
                                                    />
                                                    <span className={`text-[9px] font-bold leading-none ${
                                                        likedItemIds.includes(item.id) ? "text-rose-500" : "text-stone-500"
                                                    }`}>
                                                        {item.like_count || 0}
                                                    </span>
                                                </button>

                                                {item.has_certificate && (
                                                    <div className="absolute top-2 left-2 bg-stone-800/80 backdrop-blur text-white text-[10px] px-2 py-1 rounded-sm flex items-center gap-1">
                                                        <Shield className="w-3 h-3" /> Verified
                                                    </div>
                                                )}

                                                {item.sold_out && (
                                                    <div className="absolute inset-0 bg-stone-50/80 flex items-center justify-center z-10">
                                                        <span className="text-stone-400 tracking-widest text-sm border border-stone-400 px-3 py-1">SOLD OUT</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-4 pt-0 space-y-3 flex-1 flex flex-col">
                                                <div className="flex justify-between items-baseline">
                                                    <h4 className="text-sm font-medium text-stone-800 line-clamp-1">{item.name}</h4>
                                                    <span className="text-sm text-stone-600 font-normal">¥{item.price.toLocaleString()}</span>
                                                </div>
                                                <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed flex-1">
                                                    {item.description}
                                                </p>

                                                {item.has_certificate && (
                                                    <div className="mt-2 mb-2 scale-75 origin-left w-[130%] -ml-[15%]">
                                                        <DigitalCertificate itemName={item.name} date="2024.11.27" />
                                                    </div>
                                                )}

                                                <div className="mt-auto flex gap-2">
                                                    <button
                                                        onClick={() => setSelectedItemForChat(item)}
                                                        disabled={item.sold_out}
                                                        className={`
                                                            p-3 border border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-800 transition-colors
                                                            ${item.sold_out ? 'opacity-50 cursor-not-allowed' : ''}
                                                        `}
                                                        title="出品者とチャット"
                                                    >
                                                        <MessageSquareText className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => handlePurchase(item)}
                                                        disabled={item.sold_out}
                                                        className={`
                                                            flex-1 py-3 text-xs tracking-widest border transition-all duration-300 flex items-center justify-center gap-2
                                                            ${item.sold_out
                                                            ? 'border-stone-200 text-stone-300 cursor-not-allowed'
                                                            : 'border-stone-300 text-stone-600 hover:bg-stone-800 hover:text-white hover:border-stone-800'
                                                        }
                                                        `}
                                                    >
                                                        {item.sold_out ? '売り切れ' : (
                                                            <>
                                                                購入へ <ChevronRight className="w-3 h-3" />
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </>
                )}
            </main>

            <footer className="py-12 border-t border-stone-200 mt-20 text-center text-xs text-stone-400">
                <p>&copy; 2024 Re:Value Project. All rights reserved.</p>
            </footer>
        </div>
    );
}

export default App;