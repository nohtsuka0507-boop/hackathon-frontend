import React, { useState } from 'react';
import { User, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8080';

interface AuthProps {
    onLoginSuccess: (token: string, user: any) => void;
}

const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
    const [isLogin, setIsLogin] = useState(true); // ログインモードか登録モードか
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const endpoint = isLogin ? '/login' : '/register';

        try {
            const res = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || '認証に失敗しました');
            }

            const data = await res.json();

            if (isLogin) {
                // ログイン成功時
                onLoginSuccess(data.token, data.user);
            } else {
                // 登録成功時はログインモードに切り替え
                alert('登録が完了しました！ログインしてください。');
                setIsLogin(true);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
            <div className="w-full max-w-md bg-white p-8 border border-stone-200 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-normal text-stone-800 tracking-widest uppercase mb-2">
                        {isLogin ? 'Welcome Back' : 'Join Us'}
                    </h2>
                    <p className="text-xs text-stone-400">
                        {isLogin ? 'アカウントにログイン' : '新しいアカウントを作成'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Name</label>
                            <div className="flex items-center border border-stone-200 px-3 py-2 bg-stone-50 focus-within:border-stone-400 transition-colors">
                                <User className="w-4 h-4 text-stone-400 mr-2" />
                                <input
                                    type="text"
                                    placeholder="山田 太郎"
                                    className="flex-1 bg-transparent outline-none text-sm"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    required={!isLogin}
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Email</label>
                        <div className="flex items-center border border-stone-200 px-3 py-2 bg-stone-50 focus-within:border-stone-400 transition-colors">
                            <Mail className="w-4 h-4 text-stone-400 mr-2" />
                            <input
                                type="email"
                                placeholder="name@example.com"
                                className="flex-1 bg-transparent outline-none text-sm"
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Password</label>
                        <div className="flex items-center border border-stone-200 px-3 py-2 bg-stone-50 focus-within:border-stone-400 transition-colors">
                            <Lock className="w-4 h-4 text-stone-400 mr-2" />
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="flex-1 bg-transparent outline-none text-sm"
                                value={formData.password}
                                onChange={e => setFormData({...formData, password: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-xs text-center">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-stone-800 text-white py-3 text-sm tracking-widest hover:bg-stone-700 transition-colors flex items-center justify-center gap-2 mt-6"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                            <>
                                {isLogin ? 'LOGIN' : 'CREATE ACCOUNT'}
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-xs text-stone-500 hover:text-stone-800 underline underline-offset-4"
                    >
                        {isLogin ? 'アカウントをお持ちでない方はこちら' : 'すでにアカウントをお持ちの方はこちら'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Auth;