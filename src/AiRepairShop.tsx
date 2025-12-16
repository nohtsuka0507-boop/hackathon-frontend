import React, { useState } from 'react';
import { Camera, ArrowRight, Loader2, Wrench, Coins, Star, Sparkles, Building2, XCircle } from 'lucide-react';

const API_BASE_URL = 'https://hackathon-backend-1093557143473.us-central1.run.app';

interface AiRepairShopProps {
    onSelectPlan?: (data: any) => void;
}

const AiRepairShop: React.FC<AiRepairShopProps> = ({ onSelectPlan }) => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadedFile(file);
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

    const handleSelect = (type: 'repair' | 'as_is') => {
        if (!result || !onSelectPlan) return;

        // ★修正ポイント: 区切り線 (----------) を使って、人間が読む説明と、ボタンで開く詳細情報を分ける
        if (type === 'repair') {
            onSelectPlan({
                name: result.item_name,
                price: result.future_value,
                // リペア済みの場合: 前半はアピール、後半に作業ログ
                description: `【AIリペア実施済み】\n\n${result.item_name}です。\nAI診断に基づき、適切なリペアを行いました。\n\n◆プロのアドバイス\n${result.advice}\n\n----------\n◆実施したリペア内容\n${result.repair_plan}\n\n◆使用した道具\n${result.required_tools?.join(', ')}`,
                image: uploadedFile
            });
        } else {
            onSelectPlan({
                name: result.item_name,
                price: result.current_value,
                // そのまま出品の場合: 前半は状態、後半にAIの提案（レシピ）
                description: `${result.item_name}です。\n\n◆状態\n${result.damage_check}\n\n現状品として出品します。ご自身でリペアに挑戦したい方におすすめです。\n\n----------\n◆AIによるリペア提案（DIYレシピ）\n${result.repair_plan}\n\n◆必要な道具\n${result.required_tools?.join(', ')}\n\n※この商品は現状渡しです。上記はAIが提案する「もし直すなら」のプランであり、実施はされていません。`,
                image: uploadedFile
            });
        }
    };

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
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div>
                                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Product Name</p>
                                    <h3 className="text-xl text-stone-900 font-medium leading-snug">{result.item_name}</h3>
                                </div>

                                {/* 収益性比較チャート */}
                                <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 space-y-3">
                                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 text-center">Profitability Analysis</p>

                                    <div className="flex justify-between items-center opacity-50 text-sm">
                                        <div className="flex items-center gap-2">
                                            <XCircle className="w-4 h-4 text-stone-400" />
                                            <span>現状のまま売却</span>
                                        </div>
                                        <span className="font-bold">¥{result.current_value?.toLocaleString()}</span>
                                    </div>

                                    <div className="flex justify-between items-center text-sm bg-white p-2 rounded border border-stone-100 text-stone-500 relative overflow-hidden">
                                        <div className="flex items-center gap-2 z-10">
                                            <Building2 className="w-4 h-4" />
                                            <div className="flex flex-col">
                                                <span>プロ業者に依頼</span>
                                                <span className="text-[10px] text-stone-400">
                                                    費用 ¥{result.pro_service_cost?.toLocaleString()} + 送料 ¥{result.shipping_cost?.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="font-bold z-10">
                                            {result.pro_profit > 0 ? `¥${result.pro_profit?.toLocaleString()}` : <span className="text-red-400">赤字</span>}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center bg-emerald-50 p-3 rounded border border-emerald-200 text-emerald-800 shadow-sm transform scale-105">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                                            <div className="flex flex-col leading-none">
                                                <span className="font-bold text-sm">自分でAIリペア</span>
                                                <span className="text-[10px] text-emerald-600 mt-1">
                                                    材料費のみ / 利益最大！
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-xl font-bold">
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
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {result.required_tools?.map((tool: string, i: number) => (
                                                <span key={i} className="text-[10px] bg-stone-100 text-stone-600 px-2 py-1 rounded-sm border border-stone-200">
                                                    {tool}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* アクションボタン */}
                                <div className="pt-2 space-y-3">
                                    <button
                                        onClick={() => handleSelect('repair')}
                                        className="w-full relative overflow-hidden bg-stone-900 text-white py-4 px-6 text-sm tracking-widest hover:bg-stone-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-4 group rounded-sm ring-2 ring-offset-2 ring-stone-900"
                                    >
                                        <div className="absolute top-0 right-0 -mt-2 -mr-2 w-8 h-8 bg-yellow-400 rotate-45 transform group-hover:scale-150 transition-transform duration-500"></div>
                                        <div className="flex flex-col items-center leading-none">
                                            <span className="flex items-center gap-2 font-bold text-lg">
                                                <Wrench className="w-4 h-4 text-yellow-400" />
                                                自分でリペアして出品
                                            </span>
                                            <span className="text-[10px] text-stone-400 mt-1 font-normal opacity-80">
                                                最大利益 ¥{result.estimated_profit?.toLocaleString()} を獲得
                                            </span>
                                        </div>
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform absolute right-6" />
                                    </button>

                                    <button
                                        onClick={() => handleSelect('as_is')}
                                        className="w-full bg-transparent text-stone-400 py-3 px-6 text-xs hover:text-stone-600 transition-colors flex items-center justify-center gap-2 group"
                                    >
                                        <span>修理せずに ¥{result.current_value?.toLocaleString()} で出品する</span>
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