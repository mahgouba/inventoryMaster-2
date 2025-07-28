# دليل نشر المشروع على منصات مختلفة

## الاستضافة باستخدام Docker

### 1. نشر على DigitalOcean
1. قم بإنشاء Droplet جديد مع Ubuntu 22.04
2. قم بتثبيت Docker و Docker Compose:
```bash
sudo apt update
sudo apt install docker.io docker-compose-v2 -y
sudo systemctl start docker
sudo systemctl enable docker
```

3. انسخ المشروع إلى الخادم:
```bash
git clone <your-repo-url>
cd inventory-management-system
```

4. أنشئ ملف البيئة:
```bash
cp .env.example .env
# قم بتعديل قاعدة البيانات ومتغيرات البيئة
```

5. ابدأ التشغيل:
```bash
sudo docker-compose up -d
```

### 2. نشر على AWS EC2
1. قم بإنشاء EC2 Instance مع Amazon Linux 2
2. اتصل بالخادم وثبت Docker:
```bash
sudo yum update -y
sudo yum install docker -y
sudo service docker start
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

3. انسخ المشروع وابدأ التشغيل:
```bash
git clone <your-repo-url>
cd inventory-management-system
sudo docker-compose up -d
```

### 3. نشر على Google Cloud Platform
1. قم بإنشاء VM Instance جديد
2. اختر Ubuntu 20.04 LTS
3. فعل HTTP/HTTPS traffic
4. اتبع نفس خطوات DigitalOcean

## الاستضافة على منصات الاستضافة السحابية

### 1. نشر على Vercel (للواجهة الأمامية فقط)
⚠️ ملاحظة: Vercel لا يدعم Express.js بشكل كامل. ستحتاج لفصل الواجهة الأمامية

### 2. نشر على Railway
1. قم بإنشاء حساب على Railway.app
2. اربط مستودع GitHub الخاص بك
3. Railway سيتولى البناء والنشر تلقائياً
4. أضف متغيرات البيئة في لوحة التحكم

### 3. نشر على Render.com
1. قم بإنشاء حساب على Render.com
2. اربط مستودع GitHub
3. اختر "Web Service"
4. أضف متغيرات البيئة:
   - NODE_ENV=production
   - DATABASE_URL=<postgresql-url>

## إعداد قاعدة البيانات

### PostgreSQL على منصات مختلفة:
- **DigitalOcean**: استخدم Managed PostgreSQL Database
- **AWS**: استخدم RDS PostgreSQL
- **Google Cloud**: استخدم Cloud SQL
- **Railway**: يوفر PostgreSQL مدمج
- **Render**: يوفر PostgreSQL مدمج

## المتغيرات المطلوبة
```env
NODE_ENV=production
DATABASE_URL=postgresql://username:password@host:port/database
OPENAI_API_KEY=your_openai_key (اختياري)
```

## أوامر البناء والتشغيل
```bash
# للبناء
npm run build

# للتشغيل في الإنتاج
npm start

# لبناء الجداول
npm run db:push
```

## نصائح مهمة
1. تأكد من تحديث DATABASE_URL للإنتاج
2. قم بتفعيل HTTPS للأمان
3. اعمل نسخ احتياطية دورية لقاعدة البيانات
4. راقب استهلاك الموارد والأداء