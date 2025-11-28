import React, { useState } from 'react';
import { Camera, ArrowRight, Check, Loader2 } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8080';

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

            <div className="bg-white border border-stone-200 p-1 md:p-2">
                <div className="flex flex-col md:flex-row min-h-[500px]">

                    {/* アップロードエリア */}
                    <div className="md:w-1/2 bg-stone-50 border border-stone-100 relative">
                        <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center hover:bg-stone-100 transition-colors duration-500">
                            {preview ? (
                                <img src={preview} alt="preview" className="absolute inset-0 w-full h-full object-contain p-8 mix-blend-multiply" />
                            ) : (
                                <div className="text-center space-y-4">
                                    <Camera className="w-8 h-8 text-stone-400 mx-auto stroke-1" />
                                    <span className="text-sm text-stone-500 tracking-wide block">写真をアップロード</span>
                                </div>
                            )}
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

                            {loading && (
                                <div className="absolute inset-0 bg-stone-50/80 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
                                    <Loader2 className="w-8 h-8 text-stone-800 animate-spin mb-4" />
                                    <p className="text-xs tracking-widest text-stone-800 uppercase">Analyzing</p>
                                </div>
                            )}
                        </label>
                    </div>

                    {/* 診断結果エリア */}
                    <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center border-l border-stone-100">
                        {!result ? (
                            <div className="text-center text-stone-400 font-light text-sm">
                                写真を選択すると、<br/>診断レポートがここに表示されます。
                            </div>
                        ) : (
                            <div className="space-y-8 animate-in fade-in duration-700">
                                <div>
                                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Product</p>
                                    <h3 className="text-xl text-stone-800 font-normal">{result.item_name}</h3>
                                </div>

                                <div className="grid grid-cols-2 gap-8 py-6 border-y border-stone-200">
                                    <div>
                                        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Current</p>
                                        <p className="text-2xl font-light text-stone-800">¥{result.current_value.toLocaleString()}</p>
                                        <p className="text-xs text-stone-500 mt-1">現状の価値</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Potential</p>
                                        <p className="text-2xl font-light text-stone-800">¥{result.future_value.toLocaleString()}</p>
                                        <p className="text-xs text-stone-500 mt-1">リペア後の価値</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Repair Plan</p>
                                    <ul className="space-y-2">
                                        <li className="flex items-start gap-3 text-sm text-stone-700">
                                            <Check className="w-4 h-4 text-stone-400 mt-0.5 flex-shrink-0" />
                                            {result.repair_plan}
                                        </li>
                                        <li className="flex items-start gap-3 text-sm text-stone-700">
                                            <Check className="w-4 h-4 text-stone-400 mt-0.5 flex-shrink-0" />
                                            想定コスト: ¥{result.repair_cost.toLocaleString()}
                                        </li>
                                    </ul>
                                </div>

                                <div className="pt-4">
                                    <button className="w-full bg-stone-800 text-white py-4 px-6 text-sm tracking-widest hover:bg-stone-700 transition-colors flex items-center justify-center gap-4 group">
                                        リペアを依頼する
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