import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Send,
  Sparkles,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

/* ─── Floating Gold Particles ─── */
function GoldParticles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    size: Math.random() * 6 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 12 + 10,
    delay: Math.random() * 6,
    opacity: Math.random() * 0.35 + 0.08,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            background: `radial-gradient(circle, rgba(212,175,55,${p.opacity + 0.15}), rgba(212,175,55,${p.opacity * 0.3}))`,
            boxShadow: `0 0 ${p.size * 3}px rgba(212,175,55,${p.opacity})`,
          }}
          animate={{
            y: [0, -80, -30, -110, 0],
            x: [0, 30, -20, 15, 0],
            opacity: [p.opacity, p.opacity * 2, p.opacity, p.opacity * 1.5, p.opacity],
            scale: [1, 1.3, 0.9, 1.2, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ─── Email Validator ─── */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ─── Main Page Component ─── */
function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("يرجى إدخال البريد الإلكتروني");
      return;
    }

    if (!isValidEmail(email.trim())) {
      toast.error("صيغة البريد الإلكتروني غير صحيحة");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error(error.message || "حدث خطأ أثناء إرسال رابط الاستعادة");
      } else {
        setIsSuccess(true);
        toast.success("تم إرسال رابط الاستعادة بنجاح");
      }
    } catch {
      toast.error("تعذّر الاتصال بالخادم، حاول مرة أخرى");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      dir="rtl"
      lang="ar"
      className="hsm-bg relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12"
      style={{ fontFamily: '"Noto Sans Arabic","Inter",sans-serif' }}
    >
      {/* Floating gold particles */}
      <GoldParticles />

      {/* Ambient glow top */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2">
        <div
          className="h-[500px] w-[800px] rounded-full opacity-30 blur-[120px]"
          style={{
            background:
              "radial-gradient(circle, rgba(212,175,55,0.25) 0%, rgba(212,175,55,0.05) 50%, transparent 80%)",
          }}
        />
      </div>

      {/* Ambient glow bottom-right */}
      <div className="pointer-events-none absolute bottom-0 right-0">
        <div
          className="h-[400px] w-[600px] rounded-full opacity-20 blur-[100px]"
          style={{
            background:
              "radial-gradient(circle, rgba(212,175,55,0.2) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="hsm-glass relative z-10 w-full max-w-md rounded-3xl p-8 sm:p-10"
      >
        {/* Neon border glow */}
        <div className="pointer-events-none absolute -inset-px rounded-3xl opacity-40"
          style={{
            background: "linear-gradient(135deg, rgba(212,175,55,0.2), transparent 40%, transparent 60%, rgba(212,175,55,0.12))",
          }}
        />

        <AnimatePresence mode="wait">
          {!isSuccess ? (
            /* ─── FORM STATE ─── */
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Logo */}
              <motion.div
                className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-gold to-amber-600 shadow-2xl shadow-gold/30"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.15 }}
              >
                <Sparkles className="h-9 w-9 text-gold-foreground" />
              </motion.div>

              <motion.p
                className="mb-6 text-center text-xs font-medium tracking-wide text-gold/70"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Nour AI Studio
              </motion.p>

              {/* Decorative Key icon */}
              <motion.div
                className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10 ring-1 ring-gold/20"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35, type: "spring", stiffness: 180, damping: 14 }}
              >
                <KeyRound className="h-6 w-6 text-gold" />
              </motion.div>

              {/* Title */}
              <motion.h1
                className="mb-2 text-center text-2xl font-bold text-white"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                استعادة كلمة المرور
              </motion.h1>

              <motion.p
                className="mb-8 text-center text-sm leading-relaxed text-slate-400"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                أدخل بريدك الإلكتروني وسنرسل لك رابط الاستعادة
              </motion.p>

              {/* Form */}
              <motion.form
                onSubmit={handleSubmit}
                className="space-y-5"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
              >
                {/* Email field */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="flex items-center gap-2 text-sm font-medium text-slate-300"
                  >
                    <Mail className="h-4 w-4 text-gold/70" />
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      dir="ltr"
                      className="w-full rounded-xl border border-gold/20 bg-white/5 px-4 py-3 text-right text-sm text-white outline-none transition-all duration-300 placeholder:text-slate-500 focus:border-gold/60 focus:bg-white/[0.07] focus:ring-2 focus:ring-gold/20"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="hsm-glow-btn flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-gold to-amber-500 px-6 py-3.5 text-sm font-bold text-gold-foreground shadow-lg shadow-gold/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                      جارٍ الإرسال...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      إرسال رابط الاستعادة
                    </>
                  )}
                </button>
              </motion.form>

              {/* Back to login */}
              <motion.div
                className="mt-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <Link
                  to="/login"
                  className="group inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors duration-300 hover:text-gold"
                >
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-[-3px]" />
                  العودة لتسجيل الدخول
                </Link>
              </motion.div>
            </motion.div>
          ) : (
            /* ─── SUCCESS STATE ─── */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center py-4"
            >
              {/* Success check animation */}
              <motion.div
                className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/10 ring-2 ring-emerald-500/30"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.1 }}
              >
                <motion.div
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 250, damping: 16, delay: 0.35 }}
                >
                  <CheckCircle2 className="h-12 w-12 text-emerald-400" />
                </motion.div>
              </motion.div>

              {/* Radiating rings */}
              <motion.div
                className="pointer-events-none absolute left-1/2 top-1/3 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-emerald-400/20"
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 3, opacity: 0 }}
                transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
              />

              <motion.h2
                className="mb-3 text-center text-xl font-bold text-white"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                تم بنجاح!
              </motion.h2>

              <motion.p
                className="mb-2 text-center text-sm leading-relaxed text-slate-300"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                تم إرسال رابط الاستعادة إلى بريدك الإلكتروني
              </motion.p>

              <motion.p
                className="mb-8 text-center text-xs text-slate-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                تحقق من بريدك الإلكتروني واتبع التعليمات لإعادة تعيين كلمة المرور
              </motion.p>

              {/* Sent-to email badge */}
              <motion.div
                className="mb-8 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-4 py-2 text-xs text-gold"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
              >
                <Mail className="h-3.5 w-3.5" />
                {email}
              </motion.div>

              {/* Resend + Back to login */}
              <motion.div
                className="flex w-full flex-col items-center gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.75 }}
              >
                <button
                  onClick={() => {
                    setIsSuccess(false);
                    setEmail("");
                  }}
                  className="text-sm font-medium text-slate-400 transition-colors hover:text-gold"
                >
                  إرسال مرة أخرى
                </button>

                <Link
                  to="/login"
                  className="group inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors duration-300 hover:text-gold"
                >
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-[-3px]" />
                  العودة لتسجيل الدخول
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Footer credit */}
      <motion.p
        className="absolute bottom-6 text-center text-[11px] text-slate-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Nour AI Studio · جميع الحقوق محفوظة
      </motion.p>

      {/* Sonner toaster */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "rgba(9, 9, 11, 0.9)",
            border: "1px solid rgba(212, 175, 55, 0.2)",
            color: "#f1f1f1",
            backdropFilter: "blur(12px)",
            fontFamily: '"Noto Sans Arabic","Inter",sans-serif',
          },
        }}
        dir="rtl"
      />
    </div>
  );
}
