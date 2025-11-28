import React, { useEffect, useState } from 'react';
import AiRepairShop from './AiRepairShop';
import AiGenerator from './AiGenerator';
// エラー回避のため、ファイルがない場合はコメントアウトしてください
import DigitalCertificate from './DigitalCertificate';
import CraftsmanChat from './CraftsmanChat';
import Auth from './Auth'; // ★ 新しく作った認証画面をインポート
import SellItem from './SellItem'; // ★ インポート追加
import { ShoppingBag, RefreshCw, ChevronRight, MessageCircle, Shield, LogOut, Plus } from 'lucide-react';

const API_BASE_URL = 'https://hackathon-backend-1093557143473.us-central1.run.app';

// --- 型定義 ---
interface Item { id: string; name: string; price: number; description: string; sold_out: boolean; has_certificate?: boolean; }

// ダミーデータ
const MOCK_ITEMS: Item[] = [
    {
        id: 'mock-1',
        name: 'レザーショルダーバッグ',
        price: 28000,
        description: '【リペア済】角スレを補修し、オイルメンテナンスを行いました。革本来の艶が戻っています。',
        sold_out: false,
        has_certificate: true,
    },
    {
        id: 'mock-2',
        name: 'キャンバススニーカー',
        price: 8500,
        description: 'ソールを交換済み。アッパーは専用洗剤で洗浄し、撥水加工を施しています。',
        sold_out: false,
    },
    {
        id: 'mock-3',
        name: 'カシミヤブレンドコート',
        price: 32000,
        description: 'クリーニングと防虫加工済み。風合いを損なわないよう、スチームで丁寧に仕上げました。',
        sold_out: false,
        has_certificate: true,
    },
];

function App() {
    const [items, setItems] = useState<Item[]>([]);
    const [showChat, setShowChat] = useState(false);

    // ★ 認証状態の管理（最初はnull＝未ログイン）
    const [user, setUser] = useState<any>(null);
    const [token, setToken] = useState<string | null>(null);
    const [view, setView] = useState<'home' | 'sell'>('home'); // ★ 画面切り替え用State

    const fetchItems = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/items`);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) setItems(data);
                else setItems(MOCK_ITEMS);
            } else setItems(MOCK_ITEMS);
        } catch (e) { setItems(MOCK_ITEMS); }
    };

    const handlePurchase = (item: Item) => {
        if (item.sold_out) return;
        if (window.confirm(`「${item.name}」を購入しますか？\n価格: ¥${item.price.toLocaleString()}`)) {
            alert('ありがとうございます。購入手続きへ進みます。');
        }
    };

    // ★ ログイン成功時にAuthコンポーネントから呼ばれる関数
    const handleLoginSuccess = (token: string, userData: any) => {
        setToken(token);
        setUser(userData);
        // 必要ならここでlocalStorageに保存すると、リロードしてもログイン維持できます
    };

    // ★ ログアウト処理
    const handleLogout = () => {
        setToken(null);
        setUser(null);
        setShowChat(false);
        setView('home');
    };

    useEffect(() => {
        // ログインしている時だけアイテムを取得
        if (token) fetchItems();
    }, [token]);

    // ★ ログインしていなければ、認証画面（Auth）を表示して終了
    if (!token) {
        return <Auth onLoginSuccess={handleLoginSuccess} />;
    }

    // --- ここから下はログイン後に表示されるメイン画面 ---
    return (
        <div className="min-h-screen bg-stone-50 text-stone-800 font-sans pb-24 selection:bg-stone-200 relative">

            {/* Header */}
            <header className="sticky top-0 z-50 bg-stone-50/90 backdrop-blur-sm border-b border-stone-200">
                <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => setView('home')} // ロゴクリックでホームに戻る
                    >
                        <div className="text-stone-800 p-1 border border-stone-800 rounded-sm">
                            <RefreshCw className="w-4 h-4" />
                        </div>
                        <h1 className="text-xl font-normal tracking-widest text-stone-800 uppercase">
                            Re:Value
                        </h1>
                    </div>
                    <nav className="flex items-center gap-6 text-sm tracking-wide text-stone-600">
                        {/* ログインユーザー名表示 */}
                        <span className="text-[10px] text-stone-400 uppercase tracking-wider hidden md:inline">
                            Welcome, {user?.name}
                        </span>

                        {/* ★ 出品ボタンを追加 */}
                        <button
                            onClick={() => setView('sell')}
                            className={`flex items-center gap-2 px-4 py-2 border rounded-sm transition-colors ${view === 'sell' ? 'bg-stone-800 text-white border-stone-800' : 'bg-white border-stone-300 hover:border-stone-800'}`}
                        >
                            <Plus className="w-3 h-3" />
                            <span className="text-xs font-bold tracking-widest uppercase">Sell</span>
                        </button>

                        <button onClick={() => setShowChat(!showChat)} className="flex items-center gap-2 hover:text-stone-900 transition-colors">
                            <MessageCircle className="w-4 h-4" />
                            <span className="hidden md:inline">Support</span>
                        </button>

                        {/* ログアウトボタン */}
                        <button onClick={handleLogout} className="flex items-center gap-1 hover:text-red-500 transition-colors ml-2" title="ログアウト">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </nav>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-16 space-y-24">

                {/* ★ 画面切り替えロジック */}
                {view === 'sell' ? (
                    <SellItem />
                ) : (
                    <>
                        {/* ホーム画面のコンテンツ */}

                        {/* Chat Modal */}
                        {showChat && (
                            <div className="fixed bottom-24 right-6 z-50 w-80 shadow-2xl animate-in slide-in-from-bottom-10 border border-stone-200 rounded-lg overflow-hidden">
                                <div className="bg-stone-800 text-white p-2 flex justify-between items-center">
                                    <span className="text-xs font-bold tracking-widest pl-2">CRAFTSMAN SUPPORT</span>
                                    <button onClick={() => setShowChat(false)} className="px-2 hover:text-stone-300">×</button>
                                </div>
                                <CraftsmanChat />
                            </div>
                        )}

                        <section>
                            <AiRepairShop />
                        </section>

                        <section className="pt-12 border-t border-stone-200">
                            <div className="text-center mb-10">
                                <h3 className="text-lg font-normal text-stone-700 tracking-wide mb-2">言葉を整える</h3>
                                <p className="text-sm text-stone-500">商品の魅力を、過不足なく伝えます。</p>
                            </div>
                            <AiGenerator />
                        </section>

                        <section className="pt-12 border-t border-stone-200">
                            <div className="flex items-end justify-between mb-8">
                                <div>
                                    <h3 className="text-xl font-normal text-stone-800 tracking-wide mb-1">
                                        整えられたモノたち
                                    </h3>
                                    <p className="text-sm text-stone-500">次の使い手のためにメンテナンスされた商品</p>
                                </div>
                                <a href="#" className="text-sm border-b border-stone-800 pb-0.5 hover:opacity-60 transition-opacity">
                                    すべて見る
                                </a>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {items.map((item) => (
                                    <div key={item.id} className="group bg-white flex flex-col h-full relative">
                                        {/* 画像エリア */}
                                        <div className="aspect-square bg-stone-100 relative overflow-hidden mb-4 cursor-pointer">
                                            <div className="absolute inset-0 flex items-center justify-center text-stone-300">
                                                <ShoppingBag className="w-12 h-12 stroke-1" />
                                            </div>
                                            {/* 証明書ありバッジ */}
                                            {item.has_certificate && (
                                                <div className="absolute top-2 left-2 bg-stone-800/80 backdrop-blur text-white text-[10px] px-2 py-1 rounded-sm flex items-center gap-1">
                                                    <Shield className="w-3 h-3" /> Verified
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-stone-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                            {item.sold_out && (
                                                <div className="absolute inset-0 bg-stone-50/80 flex items-center justify-center">
                                                    <span className="text-stone-400 tracking-widest text-sm border border-stone-400 px-3 py-1">SOLD OUT</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-3 flex-1 flex flex-col">
                                            <div className="flex justify-between items-baseline">
                                                <h4 className="text-sm font-medium text-stone-800 line-clamp-1">{item.name}</h4>
                                                <span className="text-sm text-stone-600 font-normal">¥{item.price.toLocaleString()}</span>
                                            </div>
                                            <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed flex-1">
                                                {item.description}
                                            </p>

                                            {/* 証明書コンポーネントの表示 */}
                                            {item.has_certificate && (
                                                <div className="mt-2 mb-2 scale-75 origin-left w-[130%] -ml-[15%]">
                                                    <DigitalCertificate itemName={item.name} date="2024.11.27" />
                                                </div>
                                            )}

                                            {/* 購入ボタン */}
                                            <button
                                                onClick={() => handlePurchase(item)}
                                                disabled={item.sold_out}
                                                className={`
                                                    w-full mt-auto py-3 text-xs tracking-widest border transition-all duration-300 flex items-center justify-center gap-2
                                                    ${item.sold_out
                                                    ? 'border-stone-200 text-stone-300 cursor-not-allowed'
                                                    : 'border-stone-300 text-stone-600 hover:bg-stone-800 hover:text-white hover:border-stone-800'
                                                }
                                                `}
                                            >
                                                {item.sold_out ? '売り切れ' : (
                                                    <>
                                                        購入手続きへ <ChevronRight className="w-3 h-3" />
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
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