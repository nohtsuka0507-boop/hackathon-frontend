import React, { useState, useEffect, useRef } from 'react';
import { Send, X, User } from 'lucide-react';

const API_BASE_URL = 'https://hackathon-backend-1093557143473.us-central1.run.app';

interface TradeChatProps {
    item: {
        id: string;
        name: string;
        price: number;
        image_url?: string;
    };
    currentUserId: string; // ★追加: ログイン中のユーザーIDを受け取る
    onClose: () => void;
}

interface Message {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
}

const TradeChat: React.FC<TradeChatProps> = ({ item, currentUserId, onClose }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // メッセージ取得関数
    const fetchMessages = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/messages?item_id=${item.id}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (error) {
            console.error("チャット取得エラー:", error);
        }
    };

    // 初回＆3秒ごとに更新 (ポーリング)
    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [item.id]);

    // 自動スクロール
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!inputText.trim()) return;

        try {
            await fetch(`${API_BASE_URL}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    item_id: item.id,
                    sender_id: currentUserId, // ★修正: "me" ではなく本物のIDを送る
                    content: inputText
                })
            });
            setInputText('');
            fetchMessages();
        } catch (error) {
            console.error("送信エラー:", error);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-[100] w-80 bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5">
            {/* ヘッダー */}
            <div className="bg-stone-800 p-4 flex justify-between items-center text-white">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-stone-700 rounded-full flex items-center justify-center overflow-hidden">
                        {item.image_url ? (
                            <img src={item.image_url} alt="" className="w-full h-full object-cover"/>
                        ) : (
                            <User className="w-4 h-4" />
                        )}
                    </div>
                    <div>
                        <h3 className="text-sm font-bold">取引チャット</h3>
                        <p className="text-[10px] text-stone-300 truncate w-40">{item.name}</p>
                    </div>
                </div>
                <button onClick={onClose} className="hover:text-stone-300 transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* メッセージエリア */}
            <div className="h-80 overflow-y-auto p-4 bg-stone-50 space-y-4">
                {messages.length === 0 ? (
                    <p className="text-center text-xs text-stone-400 mt-10">
                        まだメッセージはありません。<br/>質問や挨拶を送ってみましょう！
                    </p>
                ) : (
                    messages.map((msg) => {
                        // ★修正: 送信者IDと自分のIDを比較して、左右を出し分ける
                        const isMe = msg.sender_id === currentUserId;
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                                    isMe
                                        ? 'bg-indigo-600 text-white rounded-br-none'
                                        : 'bg-white text-stone-800 border border-stone-200 rounded-bl-none'
                                }`}>
                                    <p>{msg.content}</p>
                                    <p className={`text-[9px] mt-1 text-right ${isMe ? 'text-indigo-200' : 'text-stone-400'}`}>
                                        {msg.created_at}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* 入力エリア */}
            <div className="p-3 bg-white border-t border-stone-100 flex gap-2">
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="メッセージを入力..."
                    className="flex-1 bg-stone-100 border-none rounded-full px-4 py-2 text-sm focus:ring-1 focus:ring-stone-300 outline-none"
                />
                <button
                    onClick={handleSend}
                    disabled={!inputText.trim()}
                    className="p-2 bg-stone-800 text-white rounded-full hover:bg-stone-700 transition-colors disabled:opacity-50"
                >
                    <Send className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default TradeChat;