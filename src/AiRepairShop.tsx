import React, { useState } from 'react';
import { Camera, ArrowRight, Check, Loader2, Wrench, Coins, Star } from 'lucide-react';

const API_BASE_URL = 'https://hackathon-backend-1093557143473.us-central1.run.app';

const AiRepairShop = () => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPreview(URL.createObjectURL(file));
        setLoading(true);
        setResult(null);

        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch(`${API_BASE_URL}/analyze-image`, { method: 'POST', body: formData });
            if (!res.ok) throw new Error("診断失敗");
            let text = await res.text();
            text = text.replace(/```json/g, "").replace(/```/g, "");
            setResult(JSON.parse(text));
        } catch (err) {
            alert("AI診断に失敗しました。");
        } finally {
            setLoading(false);
        }
    };

    // 星評価を表示するヘルパー
    const renderStars = (level: number) => {
        return (
            <div className="flex gap-0.5">
                {Array(5).fill(0).map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < level ? "fill-stone-800 text-stone-800" : "text-stone-300"}`} />
                ))}
            </div>
        );
    };

    return (
        <div className="w-full">
            <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-normal text-stone-800 mb-4 tracking-wider">
                    モノの価値を、<br className="md:hidden"/>正しく測る。
                </h2>
                <p className="text-stone-500 text-sm leading-7">
                    傷んでしまった愛用品も、適切なケアで価値を取り戻します。<br/>
                    AIが修復プランと市場価値をその場で算出します。
                </p>
            </div>

            <div className="bg-white border border-stone-200 p-1 md:p-2 shadow-sm">
                <div className="flex flex-col md:flex-row min-h-[600px]">

                    {/* アップロードエリア */}
                    <div className="md:w-1/2 bg-stone-50 border border-stone-100 relative group overflow-hidden">
                        <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center hover:bg-stone-100 transition-colors duration-500 z-10 relative">
                            {preview ? (
                                <img src={preview} alt="preview" className="absolute inset-0 w-full h-full object-contain p-8 mix-blend-multiply" />
                            ) : (
                                <div className="text-center space-y-4">
                                    <div className="p-4 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform duration-500">
                                        <Camera className="w-6 h-6 text-stone-600 stroke-1" />
                                    </div>
                                    <span className="text-sm text-stone-500 tracking-wide block">写真をアップロード</span>
                                </div>
                            )}
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

                            {loading && (
                                <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center z-20 backdrop-blur-sm">
                                    <Loader2 className="w-8 h-8 text-stone-800 animate-spin mb-4" />
                                    <p className="text-xs tracking-widest text-stone-800 uppercase animate-pulse">AI Analyzing...</p>
                                </div>
                            )}
                        </label>
                    </div>

                    {/* 診断結果エリア */}
                    <div className="md:w-1/2 p-8 md:p-10 flex flex-col justify-center border-l border-stone-100 bg-white relative">
                        {!result ? (
                            <div className="text-center text-stone-400 font-light text-sm flex flex-col items-center gap-4">
                                <div className="w-12 h-12 border border-dashed border-stone-300 rounded-full flex items-center justify-center">
                                    <Wrench className="w-5 h-5 text-stone-300" />
                                </div>
                                <p>写真を選択すると、<br/>診断レポートがここに表示されます。</p>
                            </div>
                        ) : (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div>
                                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Product Name</p>
                                    <h3 className="text-xl text-stone-900 font-medium leading-snug">{result.item_name}</h3>
                                </div>

                                {/* メインの金額表示（ここを強調！） */}
                                <div className="bg-stone-50 border border-stone-100 p-6 rounded-sm relative overflow-hidden">
                                    <div className="grid grid-cols-2 gap-8 relative z-10">
                                        <div>
                                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Current</p>
                                            <p className="text-lg font-light text-stone-600 line-through decoration-stone-300">¥{result.current_value?.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">After Repair</p>
                                            <p className="text-2xl font-bold text-emerald-700">¥{result.future_value?.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    {/* 利益表示 */}
                                    <div className="mt-4 pt-4 border-t border-stone-200 flex justify-between items-center">
                                        <span className="text-xs font-bold text-stone-500 flex items-center gap-2">
                                            <Coins className="w-4 h-4" /> 推定利益
                                        </span>
                                        <span className="text-xl font-bold text-stone-800 bg-yellow-100 px-3 py-1 rounded-sm border border-yellow-200">
                                            +¥{result.estimated_profit?.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                {/* 修理プラン */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Repair Plan</p>
                                        <div className="flex items-center gap-2 bg-stone-100 px-2 py-1 rounded-full">
                                            <span className="text-[10px] text-stone-500">難易度</span>
                                            {renderStars(result.difficulty || 1)}
                                        </div>
                                    </div>

                                    <div className="bg-white border border-stone-100 p-4 rounded-sm space-y-3">
                                        <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">{result.repair_plan}</p>

                                        {/* 必要な道具 */}
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {result.required_tools?.map((tool: string, i: number) => (
                                                <span key={i} className="text-[10px] bg-stone-100 text-stone-600 px-2 py-1 rounded-sm border border-stone-200">
                                                    {tool}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <p className="text-xs text-stone-500 italic bg-stone-50 p-3 rounded-sm border border-stone-100">
                                        💡 <span className="font-bold">Advice:</span> {result.advice}
                                    </p>
                                </div>

                                <div className="pt-2">
                                    <button className="w-full bg-stone-900 text-white py-4 px-6 text-sm tracking-widest hover:bg-stone-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-4 group rounded-sm">
                                        リペアして出品する
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AiRepairShop;