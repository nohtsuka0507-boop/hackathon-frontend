import React, { useState, useRef } from 'react';
import { Camera, Sparkles, Tag, DollarSign, Upload, X, Loader2, Wand2 } from 'lucide-react';

const API_BASE_URL = 'https://hackathon-backend-1093557143473.us-central1.run.app';

interface SellItemProps {
    onComplete: () => void;
}

const SellItem: React.FC<SellItemProps> = ({ onComplete }) => {
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        image: null as File | null
    });
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFormData({ ...formData, image: file });
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleAnalyzeImage = async () => {
        if (!formData.image) {
            alert("先に画像を選択してください");
            return;
        }
        setAnalyzing(true);

        const form = new FormData();
        form.append('image', formData.image);

        try {
            const res = await fetch(`${API_BASE_URL}/analyze-listing`, {
                method: 'POST',
                body: form,
            });

            if (res.ok) {
                const data = await res.json();
                setFormData(prev => ({
                    ...prev,
                    name: data.title || prev.name,
                    description: data.description || prev.description,
                    price: data.suggested_price ? String(data.suggested_price) : prev.price
                }));
            } else {
                console.error("AI Analysis failed");
                alert("画像の解析に失敗しました");
            }
        } catch (e) {
            console.error(e);
            alert("エラーが発生しました");
        } finally {
            setAnalyzing(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.image || !formData.name || !formData.price) {
            alert('必須項目を入力してください');
            return;
        }

        setLoading(true);

        try {
            const reader = new FileReader();
            reader.readAsDataURL(formData.image);

            reader.onloadend = async () => {
                const base64Image = reader.result as string;

                const res = await fetch(`${API_BASE_URL}/items`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: formData.name,
                        price: parseInt(formData.price),
                        description: formData.description,
                        image_url: base64Image
                    }),
                });

                if (res.ok) {
                    alert('出品が完了しました！');
                    onComplete();
                } else {
                    alert('出品に失敗しました');
                }
                setLoading(false);
            };
        } catch (error) {
            console.error(error);
            setLoading(false);
            alert('エラーが発生しました');
        }
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-stone-100 max-w-2xl mx-auto">
            <h2 className="text-xl font-normal text-stone-800 tracking-wide mb-8 text-center uppercase">
                New Listing
            </h2>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* 画像アップロード */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest block">Product Image</label>
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full aspect-video bg-stone-50 border-2 border-dashed border-stone-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-stone-100 transition-colors relative overflow-hidden group"
                    >
                        {previewUrl ? (
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                        ) : (
                            <div className="text-center p-4">
                                <Upload className="w-8 h-8 text-stone-300 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                                <p className="text-xs text-stone-400">Click to upload image</p>
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>
                </div>

                {formData.image && (
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={handleAnalyzeImage}
                            disabled={analyzing}
                            className="flex items-center gap-2 text-xs bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full hover:bg-indigo-100 transition-colors"
                        >
                            {analyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                            {analyzing ? "AIが画像を分析中..." : "AIに商品情報を入力してもらう"}
                        </button>
                    </div>
                )}

                {/* 商品名 */}
                <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Product Name</label>
                    <div className="flex items-center border-b border-stone-200 py-2 focus-within:border-stone-800 transition-colors">
                        <Tag className="w-4 h-4 text-stone-400 mr-3" />
                        <input
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            placeholder="商品名"
                            className="flex-1 outline-none text-sm bg-transparent w-full"
                            required
                        />
                    </div>
                </div>

                <div className="flex gap-4">
                    {/* カテゴリ */}
                    {/* ★修正: min-w-0 を追加してはみ出しを防止 */}
                    <div className="flex-1 space-y-1 min-w-0">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Category</label>
                        <div className="flex items-center border-b border-stone-200 py-2 focus-within:border-stone-800 transition-colors">
                            <Tag className="w-4 h-4 text-stone-400 mr-3" />
                            <input
                                type="text"
                                placeholder="カテゴリ"
                                className="flex-1 outline-none text-sm bg-transparent w-full"
                            />
                        </div>
                    </div>

                    {/* 価格 */}
                    {/* ★修正: min-w-0 を追加してはみ出しを防止 */}
                    <div className="flex-1 space-y-1 min-w-0">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Price (JPY)</label>
                        <div className="flex items-center border-b border-stone-200 py-2 focus-within:border-stone-800 transition-colors">
                            <DollarSign className="w-4 h-4 text-stone-400 mr-3 shrink-0" />
                            <input
                                type="number"
                                value={formData.price}
                                onChange={e => setFormData({...formData, price: e.target.value})}
                                placeholder="0"
                                className="flex-1 outline-none text-sm bg-transparent w-full min-w-0"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* 説明文 */}
                <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Description</label>
                    <div className="flex items-start border-b border-stone-200 py-2 focus-within:border-stone-800 transition-colors">
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            placeholder="商品の説明、状態など..."
                            className="flex-1 outline-none text-sm bg-transparent min-h-[100px] resize-none w-full"
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-stone-800 text-white py-4 text-sm tracking-widest hover:bg-stone-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-8"
                >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    LIST ITEM
                </button>
            </form>
        </div>
    );
};

export default SellItem;