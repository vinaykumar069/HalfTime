import React from 'react';
import { CheckCircle2, AlertCircle, Sparkles, X, Info } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'info' | 'ai';
  title: string;
  message: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const getIcon = () => {
          switch (toast.type) {
            case 'success':
              return <CheckCircle2 className="w-4 h-4 text-[#00F59B]" />;
            case 'warning':
              return <AlertCircle className="w-4 h-4 text-[#FFAA00]" />;
            case 'ai':
              return <Sparkles className="w-4 h-4 text-[#00D2FF]" />;
            default:
              return <Info className="w-4 h-4 text-[#00D2FF]" />;
          }
        };

        const getBorder = () => {
          switch (toast.type) {
            case 'success':
              return 'border-[#00F59B]/40 bg-[#0E1322]/90 text-white shadow-[0_0_25px_-5px_rgba(0,245,155,0.25)]';
            case 'warning':
              return 'border-[#FFAA00]/40 bg-[#0E1322]/90 text-white shadow-[0_0_25px_-5px_rgba(255,170,0,0.25)]';
            case 'ai':
              return 'border-[#00D2FF]/50 bg-[#0E1322]/90 text-white shadow-[0_0_25px_-5px_rgba(0,210,255,0.3)]';
            default:
              return 'border-white/10 bg-[#0E1322]/90 text-white';
          }
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl border backdrop-blur-2xl shadow-2xl flex items-start gap-3 animate-in slide-in-from-bottom-4 duration-200 ${getBorder()}`}
          >
            <div className="mt-0.5 shrink-0">{getIcon()}</div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold font-mono tracking-tight text-white">
                {toast.title}
              </div>
              <div className="text-xs text-[#94A3B8] mt-0.5 leading-snug">
                {toast.message}
              </div>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-[#64748B] hover:text-white p-0.5 rounded transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
