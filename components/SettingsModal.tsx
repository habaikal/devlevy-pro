import React, { useState, useEffect } from 'react';
import { X, Key, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const [apiKey, setApiKey] = useState('');
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    useEffect(() => {
        if (isOpen) {
            const storedKey = localStorage.getItem('gemini_api_key');
            if (storedKey) {
                setApiKey(storedKey);
            }
            setStatus('idle');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (apiKey.trim()) {
            localStorage.setItem('gemini_api_key', apiKey.trim());
            setStatus('success');
            setTimeout(() => {
                onClose();
            }, 1500);
        } else {
            localStorage.removeItem('gemini_api_key');
            setStatus('success');
            setTimeout(() => {
                onClose();
            }, 1500);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
                    <div className="flex items-center gap-2">
                        <div className="bg-slate-200 p-1.5 rounded-lg text-slate-700">
                            <Key size={18} />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">환경 설정</h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="bg-blue-50 border border-blue-100 p-3 flex gap-3 text-sm text-blue-800 rounded-lg">
                        <AlertCircle className="w-5 h-5 shrink-0 text-blue-600 mt-0.5" />
                        <p>
                            AI 분석 기능을 사용하려면 Google Gemini API 키가 필요합니다. 입력하신 키는 브라우저 내부(LocalStorage)에만 저장되며 서버로 전송되지 않습니다.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700">Gemini API Key</label>
                        <input
                            type="password"
                            placeholder="AIzaSy..."
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition font-mono"
                        />
                        <p className="text-xs text-slate-500">키가 없으신 경우 Google AI Studio에서 무료로 발급받을 수 있습니다.</p>
                    </div>

                    {status === 'success' && (
                        <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
                            <CheckCircle2 size={16} /> 설정이 저장되었습니다.
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-5 py-2 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition flex items-center gap-2 shadow-sm"
                    >
                        <Save size={18} /> 설정 저장
                    </button>
                </div>
            </div>
        </div>
    );
}
