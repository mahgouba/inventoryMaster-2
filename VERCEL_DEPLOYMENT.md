# نشر النظام على منصة Vercel

## متطلبات النشر

### 1. إعداد قاعدة البيانات
- استخدم Neon Database أو أي خدمة PostgreSQL سحابية أخرى
- احصل على رابط قاعدة البيانات (DATABASE_URL)

### 2. متغيرات البيئة المطلوبة
قم بإضافة المتغيرات التالية في إعدادات Vercel:

```
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
NODE_ENV=production
SESSION_SECRET=your-strong-session-secret-here
```

### 3. إعدادات Vercel
1. ربط المستودع بـ Vercel
2. تحديد Framework Preset: "Other" أو "Vite"
3. Build Command: سيتم تحديده تلقائياً من vercel.json
4. Output Directory: `dist`
5. Install Command: `npm install`
6. Root Directory: `.` (الجذر)

### 4. ملفات التكوين

#### vercel.json
- تم إعداد التوجيهات للـ API والملفات الثابتة
- تكوين Serverless Functions للـ API
- إعدادات البناء المحسّنة لـ Vercel

#### api/index.ts
- نقطة دخول Serverless Function
- تكوين Express للعمل مع Vercel
- معالجة قاعدة البيانات والـ routes

#### tsconfig.server.json
- تكوين TypeScript للخادم
- إعدادات التجميع المناسبة

### 5. هيكل النشر
```
├── server/           # Backend API
├── client/          # Frontend React App  
├── shared/          # المخططات المشتركة
├── dist/            # ملفات البناء النهائية
├── vercel.json      # تكوين Vercel
└── package.json     # إعدادات المشروع
```

### 6. خطوات النشر
1. تأكد من وجود قاعدة بيانات سحابية
2. ادفع الكود إلى GitHub
3. ربط المستودع بـ Vercel
4. إضافة متغيرات البيئة
5. نشر المشروع

### 7. ملاحظات مهمة
- تأكد من أن DATABASE_URL يحتوي على `sslmode=require`
- جلسات المستخدمين ستستخدم MemoryStore (مناسب للاختبار)
- للإنتاج الحقيقي، استخدم Redis لجلسات المستخدمين

### 8. اختبار النشر
بعد النشر، تحقق من:
- [ ] تحميل الصفحة الرئيسية
- [ ] تسجيل الدخول
- [ ] عرض بيانات المخزون
- [ ] وظائف الـ API

### 9. استكشاف الأخطاء
- تحقق من سجلات Vercel Function Logs
- تأكد من صحة متغيرات البيئة
- تحقق من اتصال قاعدة البيانات