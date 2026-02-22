import React from 'react';
import { X, Bot, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  result: string;
}

export const AnalysisModal: React.FC<Props> = ({ isOpen, onClose, loading, result }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
        <div className="bg-gradient-to-r from-brand-600 to-indigo-600 p-6 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <Bot size={24} />
            <h3 className="text-xl font-bold">Gemini AI 분석 결과</h3>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
              <p className="text-slate-500 text-sm animate-pulse">토지 데이터를 분석 중입니다...</p>
            </div>
          ) : (
            <div className="prose prose-sm prose-slate max-w-none">
              <div className="flex items-start gap-3 mb-4 p-3 bg-indigo-50 text-indigo-800 rounded-lg border border-indigo-100">
                <Sparkles size={20} className="mt-0.5 shrink-0" />
                <p className="text-sm">입력된 32개 변수와 도시계획 모델을 기반으로 분석한 결과입니다:</p>
              </div>
              <p className="whitespace-pre-wrap leading-relaxed">{result}</p>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400">AI 분석 결과는 참고용이며, 정확한 산정은 감정평가사와 상담하세요.</p>
        </div>
      </div>
    </div>
  );
};