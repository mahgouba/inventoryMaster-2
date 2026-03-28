# نشر التطبيق على Firebase

## المتطلبات الأولية

1. حساب Firebase: https://console.firebase.google.com
2. Firebase CLI: `npm install -g firebase-tools`
3. قاعدة بيانات PostgreSQL سحابية (مثل Neon أو Supabase)

---

## خطوات النشر

### 1. إعداد Firebase
```bash
firebase login
firebase init
```

### 2. تحديث Project ID
افتح ملف `.firebaserc` واستبدل `YOUR_FIREBASE_PROJECT_ID` بـ ID مشروعك:
```json
{
  "projects": {
    "default": "my-project-id"
  }
}
```

### 3. إعداد متغيرات البيئة على Firebase
```bash
firebase functions:secrets:set DATABASE_URL
# أدخل رابط PostgreSQL السحابي عند الطلب
```

### 4. بناء ونشر التطبيق
```bash
# بناء الواجهة الأمامية
npm run build

# بناء Firebase Functions
npm --prefix functions run build

# النشر الكامل
firebase deploy
```

أو دفعة واحدة:
```bash
npm run build && npm --prefix functions run build && firebase deploy
```

---

## ملاحظات مهمة

- **قاعدة البيانات**: يجب استخدام قاعدة بيانات PostgreSQL سحابية (مثل Neon.tech أو Supabase)
  - الدليل: https://neon.tech (مجاني)
  - نسخ رابط الاتصال في `DATABASE_URL`

- **رفع الصور (Logos)**: في الإنتاج على Firebase، يُنصح باستخدام Firebase Storage
  - حالياً يعمل رفع الشعارات محلياً فقط

- **الأداء**: Firebase Functions تبدأ باردة (cold start)
  - الوقت الأول قد يستغرق 2-5 ثوانٍ

---

## هيكل الملفات

```
├── client/          # الواجهة الأمامية (React)
├── server/          # الخادم الخلفي (Express)
│   ├── app.ts       # إعداد Express المشترك
│   └── index.ts     # التشغيل المحلي
├── functions/       # Firebase Cloud Functions
│   ├── src/index.ts # نقطة دخول Firebase
│   └── lib/         # الكود المُجمَّع (بعد البناء)
├── firebase.json    # إعداد Firebase
└── .firebaserc      # معرف المشروع
```

---

## الأوامر المتاحة

| الأمر | الوصف |
|-------|-------|
| `npm run dev` | تشغيل محلي للتطوير |
| `npm run build` | بناء الواجهة + الخادم |
| `npm --prefix functions run build` | بناء Firebase Functions |
| `firebase deploy` | نشر كل شيء |
| `firebase deploy --only hosting` | نشر الواجهة فقط |
| `firebase deploy --only functions` | نشر Functions فقط |
