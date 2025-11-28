import React, { useState } from 'react';
import { Loader2, PenTool } from 'lucide-react';

const API_BASE_URL = 'https://hackathon-backend-1093557143473.us-central1.run.app';

const AiGenerator: React.FC = () => {
    const [productName, setProductName] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        if (!productName) return;
        setIsLoading(true);
        setDescription('');
        try {
            const response = await fetch(`${API_BASE_URL}/generate-description`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productName }),
            });
            const data = await response.json();
            setDescription(data.description);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex gap-0 border border-stone-300 bg-white p-1">
                <input
                    type="text"
                    placeholder="商品名を入力（例：オーク材のアームチェア）"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="flex-1 px-4 py-3 bg-transparent outline-none text-stone-800 placeholder-stone-400"
                    onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
                />
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !productName}
                    className="bg-stone-200 text-stone-800 px-6 py-2 text-sm hover:bg-stone-300 disabled:opacity-50 transition-colors"
                >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "生成"}
                </button>
            </div>

            {description && (
                <div className="mt-8 p-8 bg-white border border-stone-100 relative">
                    <PenTool className="w-4 h-4 text-stone-300 absolute top-4 left-4" />
                    <p className="text-stone-700 leading-8 text-sm font-light whitespace-pre-wrap pl-6">
                        {description}
                    </p>
                </div>
            )}
        </div>
    );
};

export default AiGenerator;