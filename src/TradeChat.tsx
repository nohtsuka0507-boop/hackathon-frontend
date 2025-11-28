import React, { useState, useEffect, useRef } from 'react';
import { Send, X, User } from 'lucide-react';

interface TradeChatProps {
    item: { name: string; price: number };
    onClose: () => void;
}

interface Message {
    id: number;
    text: string;
    sender: 'me' | 'seller';
    time: string;
}

const TradeChat: React.FC<TradeChatProps> = ({ item, onClose }) => {
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, text: `「${item.name}」についてのお問い合わせですね。何でも聞いてください！`, sender: 'seller', time: 'Now' }
    ]);
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 自動スクロール
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (!inputText.trim()) return;

        // 自分のメッセージを追加
        const newMessage: Message = {
            id: Date.now(),
            text: inputText,
            sender: 'me',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, newMessage]);
        setInputText('');

        // ★デモ用：2秒後に売り手から自動返信
        setTimeout(() => {
            const replies = [
                "お問い合わせありがとうございます！",
                "多少のお値下げなら可能ですよ。",
                "状態は非常に良いです。写真の通りです。",
                "発送は明日可能です！"
            ];
            const randomReply = replies[Math.floor(Math.random() * replies.length)];

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: randomReply,
                sender: 'seller',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        }, 1500);
    };

    return (
        <div className="fixed bottom-4 right-4 z-[100] w-80 bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5">
            {/* ヘッダー */}
            <div className="bg-stone-800 p-4 flex justify-between items-center text-white">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-stone-700 rounded-full">
                        <User className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold">出品者とチャット</h3>
                        <p className="text-[10px] text-stone-300 truncate w-40">{item.name}</p>
                    </div>
                </div>
                <button onClick={onClose} className="hover:text-stone-300 transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* メッセージエリア */}
            <div className="h-80 overflow-y-auto p-4 bg-stone-50 space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                            msg.sender === 'me'
                                ? 'bg-indigo-600 text-white rounded-br-none'
                                : 'bg-white text-stone-800 border border-stone-200 rounded-bl-none'
                        }`}>
                            <p>{msg.text}</p>
                            <p className={`text-[9px] mt-1 text-right ${msg.sender === 'me' ? 'text-indigo-200' : 'text-stone-400'}`}>
                                {msg.time}
                            </p>
                        </div>
                    </div>
                ))}
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
                    className="p-2 bg-stone-800 text-white rounded-full hover:bg-stone-700 transition-colors"
                >
                    <Send className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default TradeChat;