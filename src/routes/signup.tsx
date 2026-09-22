import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import {
  UserPlus,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

/* ─── floating gold particles ─── */
const particles = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  size: Math.random() * 6 + 3,
  x: Math.random() * 100,
  y: Math.random() * 100,
  duration: Math.random() * 8 + 10,
  delay: Math.random() * 4,
  opacity: Math.random() * 0.35 + 0.08,
}));

function GoldParticles() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            background:
              "radial-gradient(circle, oklch(0.82 0.14 85) 0%, oklch(0.72 0.14 75 / 0) 70%)",
          }}
          animate={{
            y: [0, -60, 20, -40, 0],
            x: [0, 30, -20, 10, 0],
            opacity: [p.opacity, p.opacity * 2, p.opacity, p.opacity * 1.5, p.opacity],
            scale: [1, 1.4, 0.9, 1.2, 1],
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

/* ─── animated logo ─── */
function AnimatedLogo() {
  return (
    <motion.div
      className="mx-auto mb-6 flex flex-col items-center gap-3"
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.1 }}
    >
      <motion.div
        className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gold to-amber-600 shadow-lg shadow-gold/30"
        animate={{ boxShadow: [
          "0 0 20px oklch(0.82 0.14 85 / 0.3)",
          "0 0 40px oklch(0.82 0.14 85 / 0.5)",
          "0 0 20px oklch(0.82 0.14 85 / 0.3)",
        ]}}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <Sparkles className="h-8 w-8 text-black/80" />
      </motion.div>
      <motion.span
        className="text-sm font-semibold tracking-wider text-gold/80"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        style={{ fontFamily: '"Urbanist","Inter",sans-serif' }}
      >
        NOUR AI STUDIO
      </motion.span>
    </motion.div>
  );
}

/* ─── signup page component ─── */
function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    /* ── validation ── */
    if (!fullName.trim()) {
      toast.error("يرجى إدخال الاسم الكامل");
      return;
    }
    if (!email.trim()) {
      toast.error("يرجى إدخال البريد الإلكتروني");
      return;
    }
    if (!validateEmail(email)) {
      toast.error("صيغة البريد الإلكتروني غير صحيحة");
      return;
    }
    if (!password) {
      toast.error("يرجى إدخال كلمة المرور");
      return;
    }
    if (password.length < 6) {
      toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("كلمتا المرور غير متطابقتين");
      return;
    }
    if (!termsAccepted) {
      toast.error("يرجى الموافقة على الشروط والأحكام");
      return;
    }

    /* ── supabase sign-up ── */
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success(
          "تم إنشاء الحساب بنجاح! يرجى التحقق من بريدك الإلكتروني لتأكيد الحساب."
        );
      }
    } catch {
      toast.error("حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  /* shared input classes */
  const inputClasses =
    "w-full rounded-xl border border-gold/20 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition-all duration-300 focus:border-gold/60 focus:bg-white/[0.08] focus:ring-1 focus:ring-gold/30 backdrop-blur-sm";

  return (
    <div
      dir="rtl"
      lang="ar"
      className="hsm-bg relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10"
      style={{ fontFamily: '"Noto Sans Arabic","Inter",sans-serif' }}
    >
      {/* background particles */}
      <GoldParticles />

      {/* subtle radial glow behind card */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-gold/[0.04] blur-[120px]" />

      {/* glassmorphic card */}
      <motion.div
        className="relative z-10 w-full max-w-md rounded-2xl border border-white/[0.08] bg-white/[0.04] p-8 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-10"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* logo */}
        <AnimatedLogo />

        {/* heading */}
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold text-white">إنشاء حساب جديد</h1>
          <p className="mt-2 text-sm text-white/50">
            انضم إلى <span className="text-gold">Nour AI Studio</span>
          </p>
        </motion.div>

        {/* form */}
        <motion.form
          onSubmit={handleSubmit}
          className="space-y-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          {/* full name */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-xs font-medium text-white/60">
              الاسم الكامل
            </Label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <UserPlus className="h-4 w-4 text-gold/50" />
              </div>
              <input
                id="fullName"
                type="text"
                placeholder="أدخل اسمك الكامل"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`${inputClasses} pr-10`}
                autoComplete="name"
              />
            </div>
          </div>

          {/* email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-medium text-white/60">
              البريد الإلكتروني
            </Label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <Mail className="h-4 w-4 text-gold/50" />
              </div>
              <input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${inputClasses} pr-10`}
                dir="ltr"
                style={{ textAlign: "right" }}
                autoComplete="email"
              />
            </div>
          </div>

          {/* password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-medium text-white/60">
              كلمة المرور
            </Label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <Lock className="h-4 w-4 text-gold/50" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClasses} pr-10 pl-10`}
                dir="ltr"
                style={{ textAlign: "right" }}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 left-0 flex items-center pl-3 text-white/40 transition-colors hover:text-gold/70"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* confirm password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-xs font-medium text-white/60">
              تأكيد كلمة المرور
            </Label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <ShieldCheck className="h-4 w-4 text-gold/50" />
              </div>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`${inputClasses} pr-10 pl-10`}
                dir="ltr"
                style={{ textAlign: "right" }}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute inset-y-0 left-0 flex items-center pl-3 text-white/40 transition-colors hover:text-gold/70"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* terms & conditions checkbox */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked === true)}
              className="mt-0.5 border-gold/30 data-[state=checked]:bg-gold data-[state=checked]:text-black"
            />
            <Label
              htmlFor="terms"
              className="cursor-pointer text-xs leading-relaxed text-white/50 select-none"
            >
              أوافق على{" "}
              <span className="text-gold/80 underline underline-offset-2 hover:text-gold transition-colors cursor-pointer">
                الشروط والأحكام
              </span>{" "}
              و{" "}
              <span className="text-gold/80 underline underline-offset-2 hover:text-gold transition-colors cursor-pointer">
                سياسة الخصوصية
              </span>
            </Label>
          </div>

          {/* submit button */}
          <motion.button
            type="submit"
            disabled={isLoading}
            className="hsm-glow-btn relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-gold to-amber-500 px-6 py-3.5 text-sm font-bold text-black shadow-lg shadow-gold/20 transition-all duration-300 hover:shadow-gold/40 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <motion.span
                  className="inline-block h-4 w-4 rounded-full border-2 border-black/30 border-t-black"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                />
                جارٍ إنشاء الحساب...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <UserPlus className="h-4 w-4" />
                إنشاء الحساب
              </span>
            )}
          </motion.button>
        </motion.form>

        {/* divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-l from-gold/20 to-transparent" />
          <span className="text-[10px] uppercase tracking-widest text-white/20">أو</span>
          <div className="h-px flex-1 bg-gradient-to-r from-gold/20 to-transparent" />
        </div>

        {/* login link */}
        <motion.p
          className="text-center text-sm text-white/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          لديك حساب؟{" "}
          <Link
            to="/login"
            className="font-semibold text-gold transition-colors hover:text-gold/80 hover:underline underline-offset-4"
          >
            سجّل الدخول
          </Link>
        </motion.p>
      </motion.div>

      {/* sonner toaster */}
      <Toaster
        position="top-center"
        dir="rtl"
        toastOptions={{
          style: {
            fontFamily: '"Noto Sans Arabic","Inter",sans-serif',
            background: "rgba(20,20,22,0.9)",
            border: "1px solid rgba(212,175,55,0.2)",
            color: "#fff",
            backdropFilter: "blur(12px)",
          },
        }}
      />
    </div>
  );
}
