import React, { useState } from 'react';
import { Camera, Sparkles, Tag, DollarSign, Upload, Loader2, X } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8080';

const SellItem = () => {
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        tags: [] as string[],
        price: '',
    });

    // 画像アップロード & AI分析
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setPreview(URL.createObjectURL(file));
        setLoading(true);

        const uploadData = new FormData();
        uploadData.append('image', file);

        try {
            // ★ 新しいエンドポイントを使用
            const res = await fetch(`${API_BASE_URL}/analyze-listing`, {
                method: 'POST',
                body: uploadData
            });
            if (!res.ok) throw new Error("AI分析失敗");

            let text = await res.text();
            text = text.replace(/```json/g, "").replace(/```/g, "");
            const data = JSON.parse(text);

            // AIの結果をフォームに自動入力
            setFormData({
                title: data.title || '',
                description: data.description || '',
                category: data.category || '',
                tags: data.tags || [],
                price: data.suggested_price ? String(data.suggested_price) : '',
            });
        } catch (err) {
            alert("AI分析に失敗しました。手動で入力してください。");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = () => {
        alert("出品が完了しました！\n（デモのため実際には保存されません）");
        setPreview(null);
        setFormData({ title: '', description: '', category: '', tags: [], price: '' });
    };

    return (
        <div className="max-w-3xl mx-auto py-12 px-6">
            <div className="text-center mb-10">
                <h2 className="text-2xl font-normal text-stone-800 tracking-widest uppercase mb-3">Sell Your Item</h2>
                <p className="text-stone-500 text-sm">写真を撮るだけ。AIがすべて入力します。</p>
            </div>

            <div className="bg-white border border-stone-200 p-8 shadow-sm">
                <div className="grid md:grid-cols-2 gap-10">

                    {/* 左：画像アップロード */}
                    <div className="space-y-4">
                        <label className={`
                            relative cursor-pointer flex flex-col items-center justify-center 
                            w-full aspect-square border-2 border-dashed 
                            transition-all duration-300 overflow-hidden bg-stone-50
                            ${preview ? 'border-stone-300' : 'border-stone-300 hover:border-stone-500 hover:bg-stone-100'}
                        `}>
                            {preview ? (
                                <>
                                    <img src={preview} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
                                    <div className="absolute top-2 right-2 bg-white/80 p-1 rounded-full shadow-sm hover:bg-white text-stone-600"
                                         onClick={(e) => { e.preventDefault(); setPreview(null); }}>
                                        <X className="w-4 h-4" />
                                    </div>
                                </>
                            ) : (
                                <div className="text-center p-6 space-y-3">
                                    <div className="w-12 h-12 bg-stone-200 rounded-full flex items-center justify-center mx-auto text-stone-600">
                                        <Camera className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm font-medium text-stone-600">写真をアップロード</p>
                                    <p className="text-xs text-stone-400">ドラッグ＆ドロップまたはクリック</p>
                                </div>
                            )}
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

                            {loading && (
                                <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center z-20">
                                    <Sparkles className="w-8 h-8 text-yellow-500 animate-spin mb-3" />
                                    <p className="text-sm font-bold text-stone-800 animate-pulse">AIが商品を分析中...</p>
                                    <p className="text-xs text-stone-400 mt-1">タイトル・価格・説明文を生成しています</p>
                                </div>
                            )}
                        </label>
                    </div>

                    {/* 右：入力フォーム */}
                    <div className="space-y-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Title</label>
                            <input
                                type="text"
                                className="w-full border-b border-stone-200 py-2 text-stone-800 focus:border-stone-800 outline-none transition-colors font-medium"
                                placeholder="商品名"
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                            />
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1 space-y-1">
                                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Category</label>
                                <div className="flex items-center border-b border-stone-200 py-2">
                                    <Tag className="w-4 h-4 text-stone-400 mr-2" />
                                    <input
                                        type="text"
                                        className="flex-1 bg-transparent outline-none text-stone-800"
                                        placeholder="カテゴリ"
                                        value={formData.category}
                                        onChange={e => setFormData({...formData, category: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="flex-1 space-y-1">
                                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Price</label>
                                <div className="flex items-center border-b border-stone-200 py-2">
                                    <DollarSign className="w-4 h-4 text-stone-400 mr-1" />
                                    <input
                                        type="number"
                                        className="flex-1 bg-transparent outline-none text-stone-800 font-bold"
                                        placeholder="0"
                                        value={formData.price}
                                        onChange={e => setFormData({...formData, price: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex justify-between">
                                Description
                                {formData.description && <span className="text-yellow-600 text-[9px] flex items-center gap-1"><Sparkles className="w-3 h-3"/> AI Generated</span>}
                            </label>
                            <textarea
                                className="w-full border border-stone-200 bg-stone-50 p-3 text-sm text-stone-700 h-32 focus:border-stone-400 outline-none resize-none leading-relaxed"
                                placeholder="商品の説明..."
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                            />
                        </div>

                        {/* タグ表示 */}
                        {formData.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {formData.tags.map((tag, i) => (
                                    <span key={i} className="text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded-sm">#{tag}</span>
                                ))}
                            </div>
                        )}

                        <button
                            onClick={handleSubmit}
                            disabled={!formData.title || !formData.price}
                            className="w-full bg-stone-800 text-white py-4 text-sm tracking-widest hover:bg-stone-700 transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                        >
                            <Upload className="w-4 h-4" />
                            出品する
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellItem;