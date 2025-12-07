# 🚀 دليل التشغيل الكامل

## المتطلبات الأساسية

قبل البدء، تأكد من تثبيت:

### 1. Node.js (الإصدار 18 أو أحدث)
```bash
# تحقق من النسخة
node --version  # يجب أن يكون >= 18

# إذا لم يكن مثبتاً، حمّله من:
# https://nodejs.org/
```

### 2. PostgreSQL (الإصدار 14 أو أحدث)
```bash
# تحقق من النسخة
psql --version

# للتثبيت على Ubuntu/Debian:
sudo apt update
sudo apt install postgresql postgresql-contrib

# للتثبيت على macOS:
brew install postgresql@14
brew services start postgresql@14

# للتثبيت على Windows:
# حمّل من: https://www.postgresql.org/download/windows/
```

### 3. pnpm (مدير الحزم)
```bash
# تثبيت pnpm
npm install -g pnpm

# أو استخدم npm مباشرة (بدون pnpm)
```

---

## 📦 الخطوة 1: تحميل وتثبيت المشروع

### 1.1 نسخ المشروع
```bash
# إذا كان على Git
git clone <repository-url>
cd backend

# أو إذا كان لديك المجلد مباشرة
cd backend
```

### 1.2 تثبيت المكتبات
```bash
# باستخدام pnpm (مفضل)
pnpm install

# أو باستخدام npm
npm install

# أو باستخدام yarn
yarn install
```

**الانتظار:** قد يستغرق 2-5 دقائق حسب سرعة الإنترنت

---

## 🗄️ الخطوة 2: إعداد قاعدة البيانات

### 2.1 إنشاء قاعدة بيانات PostgreSQL

```bash
# الدخول إلى PostgreSQL
sudo -u postgres psql

# أو على Windows/macOS
psql -U postgres
```

**داخل PostgreSQL:**
```sql
-- إنشاء قاعدة بيانات
CREATE DATABASE testapp_db;

-- إنشاء مستخدم (اختياري)
CREATE USER testapp_user WITH PASSWORD 'your_password';

-- منح الصلاحيات
GRANT ALL PRIVILEGES ON DATABASE testapp_db TO testapp_user;

-- الخروج
\q
```

### 2.2 التحقق من الاتصال
```bash
# اختبار الاتصال
psql -U postgres -d testapp_db -c "SELECT version();"

# يجب أن ترى نسخة PostgreSQL
```

---

## ⚙️ الخطوة 3: إعداد ملف البيئة (.env)

### 3.1 نسخ ملف المثال
```bash
cp .env.example .env
```

### 3.2 تعديل ملف .env

افتح ملف `.env` وعدّل القيم:

```env
# قاعدة البيانات
DATABASE_URL="postgresql://postgres:password@localhost:5432/testapp_db"
# ↑ عدّل: username, password, database name

# JWT Secret (مفتاح سري - غيّره!)
JWT_SECRET="your-super-secret-key-here-change-this"
# ↑ استخدم مفتاح عشوائي طويل

# Gemini API Key (مهم جداً!)
GEMINI_API_KEY="your-gemini-api-key-here"
# ↑ احصل عليه من الخطوة 4

# CORS (عنوان Frontend)
CORS_ORIGIN="http://localhost:5173"
# ↑ إذا كان Frontend على منفذ مختلف، عدّله

# باقي الإعدادات (اختيارية)
PORT=8000
NODE_ENV=development
```

---

## 🔑 الخطوة 4: الحصول على Gemini API Key

### 4.1 الذهاب إلى Google AI Studio
افتح المتصفح واذهب إلى:
```
https://makersuite.google.com/app/apikey
```

### 4.2 تسجيل الدخول
- سجل دخول بحساب Google الخاص بك

### 4.3 إنشاء API Key
1. اضغط على **"Create API Key"**
2. اختر مشروع Google Cloud (أو أنشئ جديد)
3. انسخ المفتاح

### 4.4 وضع المفتاح في .env
```env
GEMINI_API_KEY="AIzaSy..."  # المفتاح الذي نسخته
```

**⚠️ مهم:** لا تشارك هذا المفتاح مع أحد!

---

## 🗃️ الخطوة 5: تشغيل Migrations

### 5.1 توليد Prisma Client
```bash
pnpm prisma:generate
# أو
npx prisma generate
```

### 5.2 تشغيل Migrations (إنشاء الجداول)
```bash
pnpm prisma:migrate
# أو
npx prisma migrate dev --name init
```

**ماذا يحدث؟**
- يتم إنشاء جميع الجداول في قاعدة البيانات
- يتم إنشاء مجلد `prisma/migrations`

### 5.3 التحقق من الجداول
```bash
# افتح Prisma Studio (واجهة مرئية)
pnpm prisma:studio
# أو
npx prisma studio
```

سيفتح متصفح على `http://localhost:5555` - يمكنك رؤية الجداول

---

## 🚀 الخطوة 6: تشغيل التطبيق

### 6.1 وضع التطوير (Development)
```bash
pnpm dev
# أو
npm run dev
```

**يجب أن ترى:**
```
╔═══════════════════════════════════════╗
║   Test App Backend                    
║   Environment: development
║   Port: 8000
║   API: http://localhost:8000/api/v1
╚═══════════════════════════════════════╝
```

### 6.2 اختبار API

افتح متصفح أو Postman واذهب إلى:
```
http://localhost:8000/
```

يجب أن ترى:
```json
{
  "name": "Test App Backend",
  "version": "1.0.0",
  "status": "running"
}
```

### 6.3 اختبار Health Check
```
http://localhost:8000/api/v1/health
```

يجب أن ترى:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 🧪 الخطوة 7: اختبار API

### 7.1 تسجيل مستخدم جديد

**الطلب:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456",
    "fullName": "أحمد محمد"
  }'
```

**أو باستخدام Postman:**
- Method: `POST`
- URL: `http://localhost:8000/api/v1/auth/register`
- Body (JSON):
```json
{
  "email": "test@example.com",
  "password": "Test123456",
  "fullName": "أحمد محمد"
}
```

**الاستجابة المتوقعة:**
```json
{
  "id": "uuid-here",
  "email": "test@example.com",
  "fullName": "أحمد محمد",
  "isActive": true,
  "subscriptionTier": "free",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### 7.2 تسجيل الدخول

**الطلب:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'
```

**الاستجابة المتوقعة:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "bearer",
  "expiresIn": 3600,
  "user": {
    "id": "uuid-here",
    "email": "test@example.com",
    "fullName": "أحمد محمد",
    "subscriptionTier": "free"
  }
}
```

**⚠️ مهم:** احفظ الـ `accessToken` - ستحتاجه في الطلبات القادمة

### 7.3 رفع ملف

**الطلب (باستخدام curl):**
```bash
curl -X POST http://localhost:8000/api/v1/files/upload \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@/path/to/your/file.pdf"
```

**أو باستخدام Postman:**
1. Method: `POST`
2. URL: `http://localhost:8000/api/v1/files/upload`
3. Headers:
   - `Authorization`: `Bearer YOUR_ACCESS_TOKEN`
4. Body → form-data:
   - Key: `file` (اختر Type: File)
   - Value: اختر ملف PDF أو DOCX

**الاستجابة المتوقعة:**
```json
{
  "id": "file-uuid",
  "filename": "1234567890-document.pdf",
  "fileType": ".pdf",
  "fileSize": 1024000,
  "status": "processing",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### 7.4 التحقق من حالة الملف

```bash
curl -X GET http://localhost:8000/api/v1/files/FILE_ID/status \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**الاستجابة:**
```json
{
  "status": "completed",
  "errorMessage": null,
  "metadata": {
    "totalChunks": 15
  }
}
```

### 7.5 إنشاء محادثة

```bash
curl -X POST http://localhost:8000/api/v1/chats \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "محادثة حول المستند",
    "fileId": "FILE_ID",
    "settings": {
      "creativity_level": 70,
      "search_mode": false
    }
  }'
```

### 7.6 إرسال رسالة

```bash
curl -X POST http://localhost:8000/api/v1/chats/CHAT_ID/messages \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "ما هو موضوع هذا المستند؟"
  }'
```

**الاستجابة:**
```json
{
  "userMessage": {
    "id": "msg-uuid-1",
    "content": "ما هو موضوع هذا المستند؟",
    "messageType": "user",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "botMessage": {
    "id": "msg-uuid-2",
    "content": "المستند يتحدث عن...",
    "messageType": "bot",
    "sources": [
      {
        "file": "document.pdf",
        "page": 1,
        "paragraph": 2,
        "relevanceScore": 0.85
      }
    ],
    "createdAt": "2024-01-01T00:00:01.000Z"
  }
}
```

---

## 🔧 حل المشاكل الشائعة

### مشكلة 1: خطأ في الاتصال بقاعدة البيانات

**الخطأ:**
```
Error: Can't reach database server at `localhost:5432`
```

**الحل:**
```bash
# تأكد من تشغيل PostgreSQL
sudo systemctl status postgresql  # Linux
brew services list  # macOS

# إذا لم يكن يعمل، شغّله:
sudo systemctl start postgresql  # Linux
brew services start postgresql@14  # macOS
```

### مشكلة 2: خطأ في Prisma Migrate

**الخطأ:**
```
Error: P3009: migrate found failed migrations
```

**الحل:**
```bash
# إعادة تعيين قاعدة البيانات
pnpm prisma migrate reset

# ثم تشغيل migrate مرة أخرى
pnpm prisma migrate dev
```

### مشكلة 3: خطأ في Gemini API

**الخطأ:**
```
Error: Invalid API key
```

**الحل:**
1. تأكد من أن `GEMINI_API_KEY` في ملف `.env` صحيح
2. تأكد من عدم وجود مسافات زائدة
3. جرب إنشاء API key جديد

### مشكلة 4: Port مستخدم بالفعل

**الخطأ:**
```
Error: listen EADDRINUSE: address already in use :::8000
```

**الحل:**
```bash
# إيقاف العملية على المنفذ 8000
# Linux/macOS:
lsof -ti:8000 | xargs kill -9

# أو غيّر المنفذ في .env:
PORT=8001
```

### مشكلة 5: مجلد uploads غير موجود

**الخطأ:**
```
Error: ENOENT: no such file or directory, open './uploads/...'
```

**الحل:**
```bash
# إنشاء المجلد
mkdir -p uploads
```

---

## 📱 ربط Frontend بالـ Backend

### في مشروع Frontend (React):

1. **تحديث عنوان API:**
```typescript
// src/config.ts
export const API_BASE_URL = 'http://localhost:8000/api/v1';
```

2. **مثال: تسجيل الدخول**
```typescript
const login = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  
  // حفظ Token
  localStorage.setItem('accessToken', data.accessToken);
  
  return data;
};
```

3. **مثال: رفع ملف**
```typescript
const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch(`${API_BASE_URL}/files/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  
  return response.json();
};
```

4. **مثال: إرسال رسالة**
```typescript
const sendMessage = async (chatId: string, content: string) => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });
  
  return response.json();
};
```

---

## 🎯 الخطوات التالية

### 1. تطوير Frontend
- استخدم الـ API endpoints المذكورة أعلاه
- احفظ `accessToken` في localStorage
- أرسله في كل طلب في header `Authorization`

### 2. اختبار شامل
- جرب جميع الـ endpoints
- اختبر حالات الخطأ
- تأكد من عمل رفع الملفات

### 3. التحسينات
- أضف Rate Limiting
- أضف Logging
- أضف Monitoring
- أضف Tests

### 4. النشر (Production)
- استخدم خدمة استضافة (Heroku, Railway, DigitalOcean)
- استخدم قاعدة بيانات مُدارة
- فعّل HTTPS
- استخدم متغيرات بيئة آمنة

---

## 📚 موارد إضافية

### الوثائق
- [Express.js](https://expressjs.com/)
- [Prisma](https://www.prisma.io/docs)
- [Google Gemini API](https://ai.google.dev/docs)
- [JWT](https://jwt.io/)

### أدوات مفيدة
- **Postman** - لاختبار API
- **Prisma Studio** - لإدارة قاعدة البيانات
- **pgAdmin** - لإدارة PostgreSQL

---

## ✅ Checklist النهائي

قبل البدء في التطوير، تأكد من:

- [ ] Node.js مثبت (>= 18)
- [ ] PostgreSQL مثبت ويعمل
- [ ] قاعدة بيانات `testapp_db` موجودة
- [ ] ملف `.env` معدّل بالقيم الصحيحة
- [ ] Gemini API Key صحيح
- [ ] `pnpm install` تم بنجاح
- [ ] `pnpm prisma:generate` تم بنجاح
- [ ] `pnpm prisma:migrate` تم بنجاح
- [ ] مجلد `uploads` موجود
- [ ] `pnpm dev` يعمل بدون أخطاء
- [ ] اختبرت `/api/v1/health` ويعمل
- [ ] اختبرت تسجيل مستخدم جديد
- [ ] اختبرت تسجيل الدخول
- [ ] اختبرت رفع ملف

---

## 🆘 الدعم

إذا واجهت أي مشكلة:

1. راجع قسم "حل المشاكل الشائعة" أعلاه
2. تحقق من logs في Terminal
3. تحقق من ملف `.env`
4. تأكد من تشغيل PostgreSQL
5. تأكد من صحة Gemini API Key

---

**🎉 مبروك! Backend جاهز للاستخدام**
