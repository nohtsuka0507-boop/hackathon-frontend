import React, { useState } from 'react';
import { Send, User, PenTool } from 'lucide-react';

const CraftsmanChat = () => {
    const [messages, setMessages] = useState([
        { id: 1, sender: 'craftsman', text: 'こんにちは。Re:Value専属職人の山田です。お品物の状態について、何かご不明な点はありますか？' },
    ]);
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (!input.trim()) return;
        const userMsg = { id: Date.now(), sender: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // 自動返信（デモ用）
        setTimeout(() => {
            const replyMsg = {
                id: Date.now() + 1,
                sender: 'craftsman',
                text: '承知いたしました。写真の状態ですと、クリーニングと保湿ケアで十分に風合いを取り戻せるかと存じます。'
            };
            setMessages(prev => [...prev, replyMsg]);
        }, 1500);
    };

    return (
        <div className="bg-white border border-stone-200 h-[450px] flex flex-col text-stone-800 font-sans">
            {/* ヘッダー部分 */}
            <div className="p-4 border-b border-stone-200 bg-stone-50 flex items-center gap-3">
                <div className="w-10 h-10 bg-stone-200 rounded-full flex items-center justify-center text-stone-600 border border-stone-300">
                    <PenTool className="w-5 h-5 stroke-1" />
                </div>
                <div>
                    <p className="text-sm font-medium text-stone-800 tracking-wide">職人：山田 匠</p>
                    <p className="text-[10px] text-stone-500 tracking-wider uppercase">Leather Care Meister</p>
                </div>
            </div>

            {/* メッセージエリア */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-white">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 text-sm leading-relaxed ${
                            msg.sender === 'user'
                                ? 'bg-stone-100 text-stone-800 border border-stone-200'
                                : 'bg-white text-stone-700'
                        }`}>
                            {msg.sender === 'craftsman' && (
                                <span className="block text-[10px] text-stone-400 mb-1 tracking-widest uppercase">Re:Value Craftsman</span>
                            )}
                            {msg.text}
                        </div>
                    </div>
                ))}
            </div>

            {/* 入力エリア */}
            <div className="p-4 border-t border-stone-200 bg-stone-50 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="メッセージを入力..."
                    className="flex-1 bg-white border border-stone-300 px-4 py-2 text-sm text-stone-700 focus:outline-none focus:border-stone-500 transition-colors placeholder-stone-400"
                />
                <button
                    onClick={handleSend}
                    className="px-4 bg-stone-800 text-white hover:bg-stone-700 transition-colors flex items-center justify-center"
                >
                    <Send className="w-4 h-4 stroke-1" />
                </button>
            </div>
        </div>
    );
};

export default CraftsmanChat;