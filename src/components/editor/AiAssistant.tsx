import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Sparkles,
  Brain,
  Languages,
  Wand2,
  Edit3,
  Copy,
  Check,
  RefreshCw,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface AiAssistantProps {
  selectedText: string;
  onReplace: (newText: string) => void;
  onInsertBelow: (newText: string) => void;
  onClose: () => void;
  isOpen: boolean;
  position: { x: number; y: number } | null;
}

export default function AiAssistant({
  selectedText,
  onReplace,
  onInsertBelow,
  onClose,
  isOpen,
  position,
}: AiAssistantProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [showTranslationOptions, setShowTranslationOptions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const runAiCommand = async (endpoint: string, payload: any) => {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch(`/api/ai/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || t("notifications.error"));
      }

      const data = await response.json();
      setResult(data.text);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || t("notifications.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      toast.success(t("notifications.changesSaved") || "Copied to clipboard!");
    }
  };

  const menuItems = [
    {
      id: "summarize",
      label: t("ai.summarize") || "Summarize",
      icon: <Sparkles size={15} className="text-teal-400" />,
      action: () => runAiCommand("summarize", { text: selectedText }),
    },
    {
      id: "brainstorm",
      label: t("ai.brainstorm") || "Brainstorm Ideas",
      icon: <Brain size={15} className="text-amber-400" />,
      action: () => runAiCommand("brainstorm", { topic: selectedText }),
    },
    {
      id: "fix-grammar",
      label: t("ai.fixGrammar") || "Fix Grammar & Style",
      icon: <Wand2 size={15} className="text-purple-400" />,
      action: () => runAiCommand("fix-grammar", { text: selectedText }),
    },
    {
      id: "continue-writing",
      label: t("ai.continueWriting") || "Continue Writing",
      icon: <Edit3 size={15} className="text-indigo-400" />,
      action: () => runAiCommand("continue-writing", { text: selectedText }),
    },
  ];

  const handleTranslate = (lang: "arabic" | "english") => {
    runAiCommand("translate", { text: selectedText, targetLanguage: lang });
    setShowTranslationOptions(false);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;
    runAiCommand("custom", { prompt: customPrompt, text: selectedText });
  };

  // Determine floating positioning
  const style: React.CSSProperties =
    position && window.innerWidth > 640
      ? {
          position: "absolute",
          top: `${position.y + 10}px`,
          left: `${Math.min(position.x, window.innerWidth - 320)}px`,
        }
      : {
          position: "fixed",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 50,
        };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      className="w-[320px] rounded-xl border p-4 shadow-2xl z-50 flex flex-col gap-3"
      style={{
        ...style,
        backgroundColor: "var(--surface)",
        borderColor: "var(--border)",
        boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-2">
        <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider" style={{ color: "var(--accent-glow)" }}>
          <Sparkles size={14} className="animate-pulse" />
          {t("ai.button") || "Waraqa AI Assistant"}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white rounded p-0.5"
          style={{ backgroundColor: "transparent" }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <Loader2 size={32} className="animate-spin" style={{ color: "var(--accent)" }} />
          <div className="text-xs animate-pulse" style={{ color: "var(--text-secondary)" }}>
            {t("ai.loading") || "AI is processing..."}
          </div>
        </div>
      )}

      {/* Result View */}
      {!loading && result && (
        <div className="flex flex-col gap-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            {t("common.done") || "AI Output"}
          </div>
          <div
            className="text-xs p-3 rounded-lg max-h-[160px] overflow-y-auto leading-relaxed border"
            style={{
              backgroundColor: "var(--void)",
              borderColor: "var(--border-subtle)",
              color: "var(--text-primary)",
              whiteSpace: "pre-wrap",
            }}
          >
            {result}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onReplace(result)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white gradient-hero animated-gradient cursor-pointer text-center"
            >
              {t("ai.replace") || "Replace Selection"}
            </button>
            <button
              onClick={() => onInsertBelow(result)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer text-center"
              style={{
                backgroundColor: "var(--surface-light)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
            >
              {t("ai.insertBelow") || "Insert Below"}
            </button>
          </div>
          <div className="flex justify-between items-center border-t pt-2 mt-1">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              <Copy size={12} />
              {t("ai.copy") || "Copy"}
            </button>
            <button
              onClick={() => setResult(null)}
              className="flex items-center gap-1 text-[11px] font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              <RefreshCw size={11} />
              {t("ai.tryAgain") || "Back"}
            </button>
          </div>
        </div>
      )}

      {/* Action Menu (No Result, No Loading) */}
      {!loading && !result && (
        <div className="flex flex-col gap-2.5">
          {/* Custom Prompt Input */}
          <form onSubmit={handleCustomSubmit} className="relative">
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder={t("ai.customPlaceholder") || "Ask AI to edit or write..."}
              className="w-full h-8 px-3 pr-8 rounded-lg text-xs outline-none border"
              style={{
                backgroundColor: "var(--void)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
            />
            <button
              type="submit"
              disabled={!customPrompt.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer disabled:opacity-30"
              style={{ color: "var(--accent)" }}
            >
              <Sparkles size={13} />
            </button>
          </form>

          {/* Quick Menu */}
          {!showTranslationOptions ? (
            <div className="flex flex-col gap-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={item.action}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-left hover:bg-opacity-10 cursor-pointer font-medium"
                  style={{
                    color: "var(--text-primary)",
                    backgroundColor: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "var(--surface-light)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                  }}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}

              {/* Translation Trigger */}
              <button
                onClick={() => setShowTranslationOptions(true)}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-left cursor-pointer font-medium"
                style={{ color: "var(--text-primary)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "var(--surface-light)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                }}
              >
                <Languages size={15} className="text-emerald-400" />
                {t("ai.translate") || "Translate..."}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-2 py-1">
                {t("ai.translate") || "Select Language"}
              </div>
              <button
                onClick={() => handleTranslate("arabic")}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left cursor-pointer"
                style={{ color: "var(--text-primary)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "var(--surface-light)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                }}
              >
                <span>{t("ai.translateToAr") || "Translate to Arabic"}</span>
                <span className="text-[10px] text-gray-500">العربية</span>
              </button>
              <button
                onClick={() => handleTranslate("english")}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left cursor-pointer"
                style={{ color: "var(--text-primary)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "var(--surface-light)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                }}
              >
                <span>{t("ai.translateToEn") || "Translate to English"}</span>
                <span className="text-[10px] text-gray-500">English</span>
              </button>
              <button
                onClick={() => setShowTranslationOptions(false)}
                className="w-full text-center py-1 text-[10px] hover:underline"
                style={{ color: "var(--text-secondary)" }}
              >
                {t("common.cancel") || "Back"}
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
