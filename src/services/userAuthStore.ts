/**
 * نظام مصادقة المستخدم
 * يعتمد على مفتاح سري للتشفير وتخزين البيانات في localStorage
 */

const AUTH_KEY = "83e127286db693a6ad2fe4b05e041bc6";

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // في تطبيق حقيقي، يجب تشفير كلمة المرور
  isVerified: boolean;
  verificationCode?: string;
  createdAt: number;
  lastLoginAt?: number;
  resetToken?: string;
}

export interface UserSession {
  token: string;
  email: string;
  expiresAt: number;
}

/**
 * وظيفة بسيطة لتوليد رمز تحقق من 6 أرقام
 */
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * محاكاة بسيطة للتجزئة (hashing) - للأغراض التوضيحية فقط
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString() + "_" + AUTH_KEY;
}

/**
 * تسجيل مستخدم جديد
 * @param name اسم المستخدم
 * @param email البريد الإلكتروني
 * @param password كلمة المرور
 */
export function register(name: string, email: string, password: string): { success: boolean; message: string; email?: string } {
  const key = `inf_user_acc_${email}`;
  if (localStorage.getItem(key)) {
    return { success: false, message: "البريد الإلكتروني مسجل بالفعل." };
  }

  const code = generateCode();
  const user: UserAccount = {
    id: Date.now().toString(),
    name,
    email,
    passwordHash: hashString(password),
    isVerified: false,
    verificationCode: code,
    createdAt: Date.now(),
  };

  localStorage.setItem(key, JSON.stringify(user));
  console.log(`[محاكاة] تم إرسال رمز التحقق إلى ${email}: ${code}`);
  return { success: true, message: "تم التسجيل بنجاح. يرجى التحقق من بريدك الإلكتروني.", email };
}

/**
 * التحقق من رمز التأكيد
 * @param email البريد الإلكتروني
 * @param code رمز التحقق
 */
export function verifyCode(email: string, code: string): { success: boolean; message: string; session?: UserSession } {
  const key = `inf_user_acc_${email}`;
  const data = localStorage.getItem(key);
  if (!data) return { success: false, message: "حساب غير موجود." };

  const user: UserAccount = JSON.parse(data);
  if (user.isVerified) return { success: false, message: "الحساب مفعل بالفعل." };
  if (user.verificationCode !== code) return { success: false, message: "رمز التحقق غير صحيح." };

  user.isVerified = true;
  user.verificationCode = undefined;
  localStorage.setItem(key, JSON.stringify(user));

  const session: UserSession = {
    token: hashString(email + Date.now().toString()),
    email,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 أيام
  };
  localStorage.setItem("inf_active_user_session", JSON.stringify(session));

  return { success: true, message: "تم تفعيل الحساب بنجاح.", session };
}

/**
 * إعادة إرسال رمز التحقق
 * @param email البريد الإلكتروني
 */
export function resendVerificationCode(email: string): { success: boolean; message: string } {
  const key = `inf_user_acc_${email}`;
  const data = localStorage.getItem(key);
  if (!data) return { success: false, message: "حساب غير موجود." };

  const user: UserAccount = JSON.parse(data);
  if (user.isVerified) return { success: false, message: "الحساب مفعل بالفعل." };

  const code = generateCode();
  user.verificationCode = code;
  localStorage.setItem(key, JSON.stringify(user));

  console.log(`[محاكاة] تم إعادة إرسال رمز التحقق إلى ${email}: ${code}`);
  return { success: true, message: "تم إرسال رمز جديد." };
}

/**
 * تسجيل الدخول
 * @param email البريد الإلكتروني
 * @param password كلمة المرور
 */
export function login(email: string, password: string): { success: boolean; message: string; user?: UserAccount; token?: string } {
  const key = `inf_user_acc_${email}`;
  const data = localStorage.getItem(key);
  if (!data) return { success: false, message: "بيانات الدخول غير صحيحة." };

  const user: UserAccount = JSON.parse(data);
  if (user.passwordHash !== hashString(password)) return { success: false, message: "بيانات الدخول غير صحيحة." };
  if (!user.isVerified) return { success: false, message: "الحساب غير مفعل. يرجى تفعيل حسابك أولاً." };

  user.lastLoginAt = Date.now();
  localStorage.setItem(key, JSON.stringify(user));

  const session: UserSession = {
    token: hashString(email + Date.now().toString()),
    email,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 أيام
  };
  localStorage.setItem("inf_active_user_session", JSON.stringify(session));

  return { success: true, message: "تم تسجيل الدخول بنجاح.", user, token: session.token };
}

/**
 * تسجيل الخروج
 */
export function logout(): void {
  localStorage.removeItem("inf_active_user_session");
}

/**
 * الحصول على الجلسة الحالية
 */
export function getCurrentSession(): { user: UserAccount | null; session: UserSession | null } {
  const sessionData = localStorage.getItem("inf_active_user_session");
  if (!sessionData) return { user: null, session: null };

  const session: UserSession = JSON.parse(sessionData);
  if (Date.now() > session.expiresAt) {
    logout();
    return { user: null, session: null };
  }

  const key = `inf_user_acc_${session.email}`;
  const userData = localStorage.getItem(key);
  if (!userData) {
    logout();
    return { user: null, session: null };
  }

  return { user: JSON.parse(userData), session };
}

/**
 * طلب إعادة تعيين كلمة المرور
 * @param email البريد الإلكتروني
 */
export function requestPasswordReset(email: string): { success: boolean; message: string } {
  const key = `inf_user_acc_${email}`;
  const data = localStorage.getItem(key);
  if (!data) return { success: false, message: "إذا كان البريد مسجلاً، فقد تم إرسال رمز الاستعادة." };

  const user: UserAccount = JSON.parse(data);
  const resetCode = generateCode();
  user.resetToken = resetCode;
  localStorage.setItem(key, JSON.stringify(user));

  console.log(`[محاكاة] تم إرسال رمز إعادة تعيين كلمة المرور إلى ${email}: ${resetCode}`);
  return { success: true, message: "تم إرسال رمز الاستعادة إذا كان الحساب موجوداً." };
}

/**
 * إعادة تعيين كلمة المرور
 * @param email البريد الإلكتروني
 * @param code رمز الاستعادة
 * @param newPassword كلمة المرور الجديدة
 */
export function resetPassword(email: string, code: string, newPassword: string): { success: boolean; message: string } {
  const key = `inf_user_acc_${email}`;
  const data = localStorage.getItem(key);
  if (!data) return { success: false, message: "رمز غير صالح أو منتهي الصلاحية." };

  const user: UserAccount = JSON.parse(data);
  if (user.resetToken !== code) return { success: false, message: "رمز غير صالح أو منتهي الصلاحية." };

  user.passwordHash = hashString(newPassword);
  user.resetToken = undefined;
  localStorage.setItem(key, JSON.stringify(user));

  return { success: true, message: "تم إعادة تعيين كلمة المرور بنجاح." };
}

/**
 * تغيير كلمة المرور للمستخدم الحالي
 * @param oldPassword كلمة المرور القديمة
 * @param newPassword كلمة المرور الجديدة
 */
export function changePassword(oldPassword: string, newPassword: string): { success: boolean; message: string } {
  const { user } = getCurrentSession();
  if (!user) return { success: false, message: "غير مصرح." };

  if (user.passwordHash !== hashString(oldPassword)) return { success: false, message: "كلمة المرور القديمة غير صحيحة." };

  user.passwordHash = hashString(newPassword);
  const key = `inf_user_acc_${user.email}`;
  localStorage.setItem(key, JSON.stringify(user));

  return { success: true, message: "تم تغيير كلمة المرور بنجاح." };
}

/**
 * تغيير البريد الإلكتروني للمستخدم الحالي
 * @param newEmail البريد الإلكتروني الجديد
 * @param code رمز التحقق للبريد الجديد (محاكاة)
 */
export function changeEmail(newEmail: string, code: string): { success: boolean; message: string } {
  const { user, session } = getCurrentSession();
  if (!user || !session) return { success: false, message: "غير مصرح." };

  const newKey = `inf_user_acc_${newEmail}`;
  if (localStorage.getItem(newKey)) return { success: false, message: "البريد الإلكتروني الجديد مستخدم بالفعل." };

  // إزالة الحساب القديم
  const oldKey = `inf_user_acc_${user.email}`;
  localStorage.removeItem(oldKey);

  // تحديث البيانات
  user.email = newEmail;
  localStorage.setItem(newKey, JSON.stringify(user));

  session.email = newEmail;
  localStorage.setItem("inf_active_user_session", JSON.stringify(session));

  return { success: true, message: "تم تحديث البريد الإلكتروني بنجاح." };
}

/**
 * حذف الحساب
 * @param confirmEmail البريد الإلكتروني للتأكيد
 */
export function deleteAccount(confirmEmail: string): { success: boolean; message: string; email?: string } {
  const { user } = getCurrentSession();
  if (!user) return { success: false, message: "غير مصرح." };
  if (user.email !== confirmEmail) return { success: false, message: "البريد الإلكتروني غير متطابق." };

  const key = `inf_user_acc_${user.email}`;
  localStorage.removeItem(key);
  logout();

  return { success: true, message: "تم حذف الحساب نهائياً.", email: user.email };
}
