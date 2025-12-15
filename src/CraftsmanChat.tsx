import React, { useState } from 'react';
import { Send, PenTool, Loader2 } from 'lucide-react';

const API_BASE_URL = 'https://hackathon-backend-1093557143473.us-central1.run.app';

const CraftsmanChat = () => {
    const [messages, setMessages] = useState([
        { id: 1, sender: 'craftsman', text: 'こんにちは。Re:Value専属職人の山田です。リペアでお困りのことはありますか？どんな些細なことでも聞いてくださいね。' },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userText = input;
        const userMsg = { id: Date.now(), sender: 'user', text: userText };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/craftsman-chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userText })
            });

            if (res.ok) {
                const data = await res.json();
                const replyMsg = {
                    id: Date.now() + 1,
                    sender: 'craftsman',
                    text: data.reply || '申し訳ありません、少し耳が遠くて...もう一度お願いできますか？'
                };
                setMessages(prev => [...prev, replyMsg]);
            } else {
                throw new Error("Chat failed");
            }
        } catch (error) {
            const errorMsg = {
                id: Date.now() + 1,
                sender: 'craftsman',
                text: 'すまない、通信の調子が悪いようだ。少し時間を置いてからまた話しかけてくれ。'
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white border border-stone-200 h-[450px] flex flex-col text-stone-800 font-sans shadow-xl rounded-lg overflow-hidden">
            {/* ヘッダー部分 */}
            <div className="p-4 border-b border-stone-200 bg-stone-50 flex items-center gap-3">
                <div className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center text-white border border-stone-600 shadow-sm">
                    <PenTool className="w-5 h-5 stroke-1" />
                </div>
                <div>
                    <p className="text-sm font-bold text-stone-800 tracking-wide">職人：山田 匠</p>
                    <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        <p className="text-[10px] text-stone-500 tracking-wider uppercase">Online - Leather Master</p>
                    </div>
                </div>
            </div>

            {/* メッセージエリア */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-stone-50/30 scrollbar-thin scrollbar-thumb-stone-200">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 text-sm leading-relaxed rounded-lg shadow-sm ${
                            msg.sender === 'user'
                                ? 'bg-stone-800 text-white rounded-br-none'
                                : 'bg-white text-stone-700 border border-stone-100 rounded-bl-none'
                        }`}>
                            {msg.sender === 'craftsman' && (
                                <span className="block text-[10px] text-stone-400 mb-1 tracking-widest uppercase font-bold">Yamada</span>
                            )}
                            {msg.text}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white p-3 rounded-lg border border-stone-100 rounded-bl-none flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-stone-400" />
                            <span className="text-xs text-stone-400">山田さんが入力中...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* 入力エリア */}
            <div className="p-4 border-t border-stone-200 bg-white flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="職人に質問する..."
                    className="flex-1 bg-stone-50 border border-stone-200 px-4 py-2 text-sm text-stone-700 focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400 transition-all placeholder-stone-400 rounded-full"
                />
                <button
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    className="w-10 h-10 bg-stone-800 text-white hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center rounded-full shadow-md"
                >
                    <Send className="w-4 h-4 stroke-1 ml-0.5" />
                </button>
            </div>
        </div>
    );
};

export default CraftsmanChat;