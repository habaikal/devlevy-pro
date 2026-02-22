import React from 'react';
import { X, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import userManualContent from '../USER_MANUAL.md?raw';

interface UserManualModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function UserManualModal({ isOpen, onClose }: UserManualModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-4xl h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50 shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="bg-brand-100 p-1.5 rounded-lg text-brand-700">
                            <BookOpen size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">DevLevy Pro 이용 가이드</h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 lg:p-10 bg-white">
                    <div className="prose prose-slate prose-brand max-w-none prose-headings:border-b-0 prose-h2:border-b prose-h2:border-slate-200 prose-h2:pb-2 prose-h2:mt-8 prose-h2:mb-4 prose-p:text-slate-600 prose-li:text-slate-600">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {userManualContent}
                        </ReactMarkdown>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition shadow-sm"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
}
