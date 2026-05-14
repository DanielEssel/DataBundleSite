"use client";

import { useState, useEffect, useRef } from "react";
import { X, MessageSquare, CheckCircle2, XCircle, Send, RotateCcw, Users } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type SmsResult = {
  user: string;
  status: "success" | "failed";
  error?: {
    rate: number;
    messageId: string;
    status: number;
    statusDescription: string;
    networkId: null | string;
  };
};

interface SendSmsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (message: string) => Promise<void>;
  loading: boolean;
  results: SmsResult[] | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_CHARS = 160;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ResultSummary({ results }: { results: SmsResult[] }) {
  const successCount = results.filter((r) => r.status === "success").length;
  const failedCount  = results.filter((r) => r.status === "failed").length;

  return (
    <div className="grid grid-cols-2 gap-3 mb-5">
      <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
        <div>
          <p className="text-lg font-bold text-emerald-700 leading-none">{successCount}</p>
          <p className="text-xs text-emerald-600 mt-0.5">Delivered</p>
        </div>
      </div>
      <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
        <XCircle className="w-5 h-5 text-red-400 shrink-0" />
        <div>
          <p className="text-lg font-bold text-red-600 leading-none">{failedCount}</p>
          <p className="text-xs text-red-500 mt-0.5">Failed</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SendSmsModal({
  isOpen,
  onClose,
  onSubmit,
  loading,
  results,
}: SendSmsModalProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus textarea when modal opens
  useEffect(() => {
    if (isOpen && !results) {
      setTimeout(() => textareaRef.current?.focus(), 80);
    }
  }, [isOpen, results]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !loading) onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, loading, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || loading) return;
    await onSubmit(message);
  };

  const handleReset = () => {
    setMessage("");
    onClose();
  };

  const charCount   = message.length;
  const smsSegments = Math.ceil(charCount / MAX_CHARS) || 1;
  const isOverLimit = charCount > MAX_CHARS;
  const isEmpty     = !message.trim();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}
        aria-modal="true"
        role="dialog"
        aria-labelledby="sms-modal-title"
      >
        <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">

          {/* ── Header ──────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-xl">
                <MessageSquare className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h2 id="sms-modal-title" className="text-base font-semibold text-gray-900">
                  {results ? "Delivery report" : "Broadcast SMS"}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {results
                    ? `${results.length} recipient${results.length !== 1 ? "s" : ""}`
                    : "Send to all registered users"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              aria-label="Close modal"
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ── Body ────────────────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto px-6 py-5">

            {!results ? (
              /* ── Compose view ── */
              <form id="sms-form" onSubmit={handleSubmit} className="space-y-4">

                {/* Recipient hint */}
                <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                  <Users className="w-4 h-4 text-gray-400 shrink-0" />
                  This message will be delivered to <strong className="text-gray-700">all active users</strong>.
                </div>

                {/* Textarea */}
                <div>
                  <label htmlFor="sms-message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <div className="relative">
                    <textarea
                      id="sms-message"
                      ref={textareaRef}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message here…"
                      rows={5}
                      disabled={loading}
                      className={`w-full border rounded-xl p-4 pr-4 pb-8 resize-none text-sm text-gray-800 placeholder-gray-300 outline-none transition-all
                        ${isOverLimit
                          ? "border-red-300 focus:ring-2 focus:ring-red-200 bg-red-50/30"
                          : "border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white"
                        } disabled:bg-gray-50 disabled:text-gray-400`}
                    />
                    {/* Char counter */}
                    <span
                      className={`absolute bottom-3 right-4 text-xs font-medium tabular-nums transition-colors
                        ${isOverLimit ? "text-red-500" : charCount > MAX_CHARS * 0.85 ? "text-amber-500" : "text-gray-300"}`}
                    >
                      {charCount}/{MAX_CHARS}
                    </span>
                  </div>

                  {/* SMS segment hint */}
                  {charCount > 0 && (
                    <p className={`text-xs mt-1.5 ${isOverLimit ? "text-red-500" : "text-gray-400"}`}>
                      {isOverLimit
                        ? `${charCount - MAX_CHARS} characters over limit — message will be split into ${smsSegments} SMS segments.`
                        : smsSegments > 1
                          ? `${smsSegments} SMS segments`
                          : "Standard SMS length"}
                    </p>
                  )}
                </div>

                {/* Loading indicator */}
                {loading && (
                  <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin shrink-0" />
                    <p className="text-sm text-blue-700 font-medium">Sending to all users…</p>
                  </div>
                )}
              </form>

            ) : (
              /* ── Results view ── */
              <div>
                <ResultSummary results={results} />

                <div className="space-y-2 max-h-72 overflow-y-auto pr-0.5">
                  {results.map((result, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border text-sm
                        ${result.status === "success"
                          ? "bg-emerald-50/60 border-emerald-100"
                          : "bg-red-50/60 border-red-100"}`}
                    >
                      {/* Icon */}
                      {result.status === "success"
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        : <XCircle     className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      }

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{result.user}</p>
                        {result.status === "failed" && (
                          <p className="text-xs text-red-600 mt-0.5 truncate">
                            {result.error?.statusDescription || "Delivery failed"}
                          </p>
                        )}
                        {result.error?.messageId && (
                          <p className="text-xs text-gray-400 mt-0.5 font-mono">
                            {result.error.messageId}
                          </p>
                        )}
                      </div>

                      {/* Badge */}
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize shrink-0
                        ${result.status === "success"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"}`}
                      >
                        {result.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Footer ──────────────────────────────────────────────────── */}
          <div className="px-6 py-4 border-t border-gray-100 shrink-0">
            {!results ? (
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="sms-form"
                  disabled={loading || isEmpty}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  {loading ? "Sending…" : "Send SMS"}
                </button>
              </div>
            ) : (
              <div className="flex gap-2 justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Send another
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}