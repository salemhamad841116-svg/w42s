/**
 * نظام التخزين المرتبط بالحساب والمزامنة السحابية
 */

const AUTH_KEY = "83e127286db693a6ad2fe4b05e041bc6";

// تعريف بسيط لنموذج الملاحظة
export interface Note {
  id: string;
  title: string;
  content: string;
  parentId?: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * الحصول على مفتاح التخزين المحلي الخاص بالمستخدم
 * @param email البريد الإلكتروني
 */
export function getUserNotesStorageKey(email: string): string {
  return `inf_user_notes_v2_${email}`;
}

/**
 * الحصول على مفتاح التخزين السحابي الخاص بالمستخدم
 * @param email البريد الإلكتروني
 */
function getCloudVaultKey(email: string): string {
  return `inf_cloud_vault_${email}_${AUTH_KEY}`;
}

/**
 * حفظ ملاحظات المستخدم محلياً وفي السحابة (محاكاة)
 * @param email البريد الإلكتروني
 * @param notes مصفوفة الملاحظات
 */
export function saveUserNotes(email: string, notes: Note[]): void {
  const localKey = getUserNotesStorageKey(email);
  const cloudKey = getCloudVaultKey(email);
  const data = JSON.stringify(notes);
  
  // الحفظ المحلي
  localStorage.setItem(localKey, data);
  
  // الحفظ في السحابة الاحتياطية (محاكاة عبر localStorage)
  localStorage.setItem(cloudKey, data);
}

/**
 * إنشاء ملاحظات افتراضية للمستخدم الجديد
 */
function getSeedNotes(): Note[] {
  return [
    {
      id: "root-note",
      title: "ملاحظتي الأولى",
      content: "مرحباً بك في نظام الملاحظات المتداخلة!",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
  ];
}

/**
 * تحميل ملاحظات المستخدم مع استعادة سحابية تلقائية
 * @param email البريد الإلكتروني
 */
export function loadUserNotes(email: string): Note[] {
  const localKey = getUserNotesStorageKey(email);
  const localData = localStorage.getItem(localKey);
  
  if (localData) {
    try {
      return JSON.parse(localData);
    } catch (e) {
      console.error("خطأ في قراءة البيانات المحلية.", e);
    }
  }

  // محاولة الاستعادة من السحابة إذا كانت البيانات المحلية غير موجودة أو تالفة
  const cloudKey = getCloudVaultKey(email);
  const cloudData = localStorage.getItem(cloudKey);
  
  if (cloudData) {
    console.log("[مزامنة] استعادة البيانات من السحابة متعددة الأجهزة...");
    try {
      const notes = JSON.parse(cloudData);
      // إعادة حفظ البيانات في التخزين المحلي
      localStorage.setItem(localKey, cloudData);
      return notes;
    } catch (e) {
      console.error("خطأ في قراءة البيانات السحابية.", e);
    }
  }

  // التهيئة بملاحظات افتراضية إذا لم يتم العثور على أي بيانات
  const seedNotes = getSeedNotes();
  saveUserNotes(email, seedNotes);
  return seedNotes;
}

/**
 * فرض الاستعادة من السحابة وتجاوز التخزين المحلي
 * @param email البريد الإلكتروني
 */
export function restoreAccountFromCloud(email: string): Note[] {
  const cloudKey = getCloudVaultKey(email);
  const cloudData = localStorage.getItem(cloudKey);
  
  if (cloudData) {
    try {
      const notes = JSON.parse(cloudData);
      const localKey = getUserNotesStorageKey(email);
      localStorage.setItem(localKey, cloudData);
      console.log("[مزامنة] تم فرض الاستعادة السحابية بنجاح.");
      return notes;
    } catch (e) {
      console.error("خطأ في الاستعادة من السحابة.", e);
    }
  }
  
  return [];
}

/**
 * مسح جميع بيانات المستخدم (محلياً وسحابياً)
 * @param email البريد الإلكتروني
 */
export function purgeUserData(email: string): void {
  const localKey = getUserNotesStorageKey(email);
  const cloudKey = getCloudVaultKey(email);
  
  localStorage.removeItem(localKey);
  localStorage.removeItem(cloudKey);
  
  // مسح أي إعدادات أو بيانات أخرى مرتبطة بالبريد الإلكتروني (مثال)
  Object.keys(localStorage).forEach(key => {
    if (key.includes(email)) {
      localStorage.removeItem(key);
    }
  });
  
  console.log(`[نظام] تم مسح جميع بيانات الحساب ${email}.`);
}
