import React from 'react';
import { ShieldCheck, Hexagon, QrCode } from 'lucide-react';

const DigitalCertificate = ({ itemName, date }: { itemName: string; date: string }) => {
    return (
        <div className="relative w-full max-w-md mx-auto aspect-[1.6/1] bg-stone-900 text-stone-200 rounded-xl overflow-hidden shadow-2xl border border-stone-700 p-6 flex flex-col justify-between group">
            {/* 背景の装飾（ホログラム風） */}
            <div className="absolute inset-0 bg-gradient-to-br from-stone-800 via-stone-900 to-black opacity-50" />
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />

            {/* カード内容 */}
            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Hexagon className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
                        <span className="text-[10px] tracking-[0.2em] text-emerald-500 uppercase font-bold">Blockchain Verified</span>
                    </div>
                    <h3 className="text-xl font-serif tracking-wide text-white">Repair Certificate</h3>
                </div>
                <ShieldCheck className="w-8 h-8 text-stone-400" />
            </div>

            <div className="relative z-10">
                <p className="text-xs text-stone-500 tracking-widest uppercase mb-1">Item Name</p>
                <p className="text-lg font-medium text-white mb-4">{itemName}</p>

                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-xs text-stone-500 tracking-widest uppercase mb-1">Issue Date</p>
                        <p className="text-sm font-mono text-stone-300">{date}</p>
                        <p className="text-[10px] font-mono text-stone-600 mt-1">Hash: 0x7f...3a9b</p>
                    </div>
                    <QrCode className="w-12 h-12 text-white bg-white/10 p-1 rounded" />
                </div>
            </div>

            {/* 光の反射エフェクト */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />
        </div>
    );
};

export default DigitalCertificate;