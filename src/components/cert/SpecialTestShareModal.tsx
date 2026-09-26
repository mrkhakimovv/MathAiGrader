import React, { useState } from 'react';
import { CertTest } from '../../types';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, Send, ExternalLink, Share2 } from 'lucide-react';

interface SpecialTestShareModalProps {
  test: CertTest;
  onClose: () => void;
}

export const SpecialTestShareModal: React.FC<SpecialTestShareModalProps> = ({ test, onClose }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/maxsus-test/${test.id}` 
    : `/maxsus-test/${test.id}`;

  const readyMessage = `🎯 ${test.title} — Milliy Sertifikat Testi\n\n📋 Savollar: 45 ta (55 birlik)\n📊 Baholash: Rasch modeli (A+, A, B+, B, C+, C)\n\n👇 Testni yechish uchun havola:\n${shareUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyMsg = () => {
    navigator.clipboard.writeText(readyMessage);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2000);
  };

  const handleShareTelegram = () => {
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(readyMessage)}`;
    window.open(tgUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Maxsus Test Havolasini Ulashish
              </h3>
              <p className="text-xs text-slate-500 truncate max-w-xs">{test.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* QR Code */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
            <div className="p-3 bg-white rounded-2xl shadow-xs">
              <QRCodeSVG value={shareUrl} size={160} />
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">
              Kamerangiz orqali skaner qilib to'g'ridan-to'g'ri kiring
            </p>
          </div>

          {/* Web URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Veb havola:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300 select-all"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? "Nusxalandi" : "Nusxalash"}</span>
              </button>
            </div>
          </div>

          {/* Ready Message */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Tayyor xabar matni:
              </label>
              <button
                onClick={handleCopyMsg}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedMsg ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedMsg ? "Nusxa olindi" : "Matnni nusxalash"}</span>
              </button>
            </div>
            <textarea
              readOnly
              rows={4}
              value={readyMessage}
              className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 resize-none font-mono"
            />
          </div>

          {/* Telegram Share Button */}
          <button
            onClick={handleShareTelegram}
            className="w-full py-3 rounded-2xl bg-[#229ED9] hover:bg-[#1E88E5] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Telegram orqali ulashish</span>
          </button>
        </div>
      </div>
    </div>
  );
};
