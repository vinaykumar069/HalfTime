import React, { useState, useEffect } from 'react';
import { Key, Check, X, Eye, EyeOff, Sparkles, ExternalLink, AlertTriangle, AlertCircle, RefreshCw } from 'lucide-react';
import { getCustomApiKey, setCustomApiKey, removeCustomApiKey, validateCustomApiKey } from '../../services/aiService';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyChanged?: () => void;
  quotaExceededReason?: string | null;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onKeyChanged,
  quotaExceededReason,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [hasCustomKey, setHasCustomKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const existing = getCustomApiKey();
      setApiKeyInput(existing || '');
      setHasCustomKey(Boolean(existing));
      setError(null);
      setSuccessMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const trimmed = apiKeyInput.trim();
    if (!trimmed) {
      setError('Please paste a valid Google Gemini API Key.');
      return;
    }

    setIsValidating(true);
    try {
      const result = await validateCustomApiKey(trimmed);
      if (result.valid) {
        setCustomApiKey(trimmed);
        setHasCustomKey(true);
        setSuccessMsg(hasCustomKey ? 'API key updated & saved successfully!' : 'API key verified & saved successfully!');
        if (onKeyChanged) onKeyChanged();
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setError(result.error || 'Invalid Gemini API key. Please check your key from Google AI Studio.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to validate API key.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleResetToDefault = () => {
    removeCustomApiKey();
    setApiKeyInput('');
    setHasCustomKey(false);
    setSuccessMsg('Switched back to shared server key.');
    if (onKeyChanged) onKeyChanged();
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const handleClearKey = () => {
    setApiKeyInput('');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-[#0A0E18] border border-white/15 p-6 sm:p-8 shadow-2xl relative space-y-5 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-[#64748B] hover:text-white hover:bg-white/[0.06] transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#00FF88] uppercase">
            <Key className="w-4 h-4" />
            <span>Gemini API Key Settings</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-display">
            {hasCustomKey ? 'Update Gemini API Key' : 'Add Your Gemini API Key'}
          </h2>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            {hasCustomKey 
              ? 'Update or replace your personal Gemini key anytime if you hit your project limits.'
              : 'Add your free Google Gemini API key to avoid shared server quota limits.'}
          </p>
        </div>

        {/* Quota Exceeded Alert (if automatically triggered) */}
        {quotaExceededReason && (
          <div className="p-3.5 rounded-2xl bg-[#FFAA00]/15 border border-[#FFAA00]/40 text-[#FFAA00] text-xs font-mono space-y-1 animate-in shake duration-300">
            <div className="flex items-center gap-2 font-bold uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Quota Limit Reached</span>
            </div>
            <p className="text-xs text-[#CBD5E1] leading-relaxed">
              {quotaExceededReason}
            </p>
          </div>
        )}

        {/* Status Badge */}
        <div className="p-3 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between text-xs font-mono">
          <span className="text-[#64748B]">Active Mode:</span>
          {hasCustomKey ? (
            <span className="text-[#00FF88] font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse" />
              Custom API Key Active
            </span>
          ) : (
            <span className="text-[#00F0FF] font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00F0FF]" />
              Shared Server Key
            </span>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-mono text-[#94A3B8] uppercase font-bold">
                {hasCustomKey ? 'New / Replacement API Key' : 'Google Gemini API Key'}
              </label>
              {apiKeyInput && (
                <button
                  type="button"
                  onClick={handleClearKey}
                  className="text-[10px] font-mono text-[#64748B] hover:text-[#FF4D4D] transition"
                >
                  Clear field
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                required
                value={apiKeyInput}
                onChange={e => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-black/80 border border-white/15 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-[#FF4D4D]/10 border border-[#FF4D4D]/20 text-[#FF4D4D] text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-[#00FF88]/10 border border-[#00FF88]/20 text-[#00FF88] text-xs font-mono flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="space-y-2 pt-1">
            <button
              type="submit"
              disabled={isValidating}
              className="w-full py-3 rounded-xl bg-[#00FF88] hover:brightness-110 disabled:opacity-50 text-[#07090E] font-mono text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              {isValidating ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-[#07090E]" />
                  <span>Validating Key with Google...</span>
                </>
              ) : (
                <span>{hasCustomKey ? 'Update & Save Key' : 'Test & Save API Key'}</span>
              )}
            </button>

            {hasCustomKey && (
              <button
                type="button"
                onClick={handleResetToDefault}
                className="w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-[#94A3B8] hover:text-white font-mono text-xs transition cursor-pointer"
              >
                Reset to Shared Server Quota
              </button>
            )}
          </div>
        </form>

        {/* Free key helper */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono text-[#64748B]">
          <span>Need a new free key?</span>
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noreferrer"
            className="text-[#00F0FF] hover:underline flex items-center gap-1"
          >
            <span>Google AI Studio</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
