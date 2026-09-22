import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Sparkles, LogIn } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

/* ── Floating gold particle orbs ─────────────────────────────── */
const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  size: Math.random() * 6 + 3,
  x: Math.random() * 100,
  y: Math.random() * 100,
  duration: Math.random() * 12 + 10,
  delay: Math.random() * 6,
  opacity: Math.random() * 0.3 + 0.08,
}));

function GoldParticles() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            background: `radial-gradient(circle, rgba(212,175,55,${p.opacity + 0.25}), rgba(212,175,55,0))`,
            boxShadow: `0 0 ${p.size * 3}px rgba(212,175,55,${p.opacity})`,
          }}
          animate={{
            y: [0, -40, 10, -25, 0],
            x: [0, 15, -10, 20, 0],
            opacity: [p.opacity, p.opacity + 0.15, p.opacity, p.opacity + 0.1, p.opacity],
            scale: [1, 1.3, 0.9, 1.15, 1],
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

/* ── Animated Logo ───────────────────────────────────────────── */
function AnimatedLogo() {
  return (
    <motion.div
      className="mx-auto mb-6 flex flex-col items-center gap-3"
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 180, damping: 18, delay: 0.15 }}
    >
      {/* Gold gradient circle with sparkles */}
      <motion.div
        className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gold to-amber-600 shadow-lg"
        style={{
          boxShadow: "0 0 32px 4px rgba(212,175,55,0.35), 0 0 64px 8px rgba(212,175,55,0.12)",
        }}
        animate={{ rotate: [0, 8, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Sparkles className="h-8 w-8 text-black/80" strokeWidth={2.2} />
        {/* Orbiting dot */}
        <motion.span
          className="absolute h-2 w-2 rounded-full bg-white/80"
          style={{ top: -2, right: -2 }}
          animate={{ scale: [1, 1.6, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      <motion.h1
        className="text-2xl font-bold tracking-wide text-gold glow-gold"
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.5 }}
      >
        Nour AI Studio
      </motion.h1>
    </motion.div>
  );
}

/* ── Login Page ──────────────────────────────────────────────── */
function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    /* ── Validation ─── */
    if (!email.trim()) {
      toast.error("يرجى إدخال البريد الإلكتروني");
      return;
    }
    if (!password.trim()) {
      toast.error("يرجى إدخال كلمة المرور");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        toast.error(error.message || "فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.");
      } else {
        toast.success("تم تسجيل الدخول بنجاح! 🎉");
      }
    } catch {
      toast.error("حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      dir="rtl"
      lang="ar"
      className="hsm-bg relative flex min-h-screen items-center justify-center overflow-hidden px-4"
      style={{ fontFamily: '"Noto Sans Arabic","Inter",sans-serif' }}
    >
      {/* Background particles */}
      <GoldParticles />

      {/* ── Card ──────────────────────────────────────────────── */}
      <motion.div
        className="hsm-glass hsm-neon relative z-10 w-full max-w-md rounded-2xl p-8 sm:p-10"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Logo */}
        <AnimatedLogo />

        {/* Title & Subtitle */}
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-foreground">تسجيل الدخول</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            مرحباً بك مجدداً في{" "}
            <span className="font-semibold text-gold">Nour AI Studio</span>
          </p>
        </motion.div>

        {/* ── Form ─────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email field */}
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.45 }}
          >
            <Label htmlFor="email" className="text-sm text-foreground/80">
              البريد الإلكتروني
            </Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gold/50" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 w-full rounded-xl border border-gold/20 bg-white/5 pr-10 pl-4 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors duration-200 focus:border-gold/60 focus:outline-none focus:ring-1 focus:ring-gold/30"
                dir="ltr"
              />
            </div>
          </motion.div>

          {/* Password field */}
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.45 }}
          >
            <Label htmlFor="password" className="text-sm text-foreground/80">
              كلمة المرور
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gold/50" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 w-full rounded-xl border border-gold/20 bg-white/5 pr-10 pl-10 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors duration-200 focus:border-gold/60 focus:outline-none focus:ring-1 focus:ring-gold/30"
                dir="ltr"
              />
              <button
                type="button"
                aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 transition-colors hover:text-gold/80"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </motion.div>

          {/* Remember me + Forgot password */}
          <motion.div
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
                className="border-gold/30 data-[state=checked]:bg-gold data-[state=checked]:text-black"
              />
              <Label
                htmlFor="remember"
                className="cursor-pointer text-xs text-muted-foreground hover:text-foreground/80 transition-colors"
              >
                تذكرني
              </Label>
            </div>

            <Link
              to="/forgot-password"
              className="text-xs text-gold/70 transition-colors hover:text-gold hover:underline"
            >
              نسيت كلمة المرور؟
            </Link>
          </motion.div>

          {/* Submit button */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.45 }}
          >
            <button
              type="submit"
              disabled={isLoading}
              className="hsm-glow-btn animate-pulse-gold flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold to-amber-500 text-sm font-bold text-black transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <motion.div
                  className="h-5 w-5 rounded-full border-2 border-black/30 border-t-black"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  تسجيل الدخول
                </>
              )}
            </button>
          </motion.div>
        </form>

        {/* ── Divider ──────────────────────────────────────── */}
        <motion.div
          className="my-6 flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
        >
          <span className="h-px flex-1 bg-gold/10" />
          <span className="text-[11px] text-muted-foreground/50">أو</span>
          <span className="h-px flex-1 bg-gold/10" />
        </motion.div>

        {/* ── Sign up link ─────────────────────────────────── */}
        <motion.p
          className="text-center text-sm text-muted-foreground"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.4 }}
        >
          ليس لديك حساب؟{" "}
          <Link
            to="/signup"
            className="font-semibold text-gold transition-colors hover:text-amber-400 hover:underline"
          >
            أنشئ حساب
          </Link>
        </motion.p>
      </motion.div>

      {/* Toast container */}
      <Toaster position="top-center" dir="rtl" />
    </div>
  );
}
