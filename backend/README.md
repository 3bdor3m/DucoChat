# Test App Backend

Backend API لتطبيق المحادثة الذكية مع الملفات باستخدام Gemini AI.

## التقنيات المستخدمة

- **Node.js** + **Express** - إطار العمل
- **TypeScript** - لغة البرمجة
- **Prisma** - ORM لقاعدة البيانات
- **PostgreSQL** - قاعدة البيانات
- **JWT** - المصادقة
- **Google Gemini AI** - الذكاء الاصطناعي
- **Multer** - رفع الملفات

## المتطلبات

- Node.js >= 18
- PostgreSQL >= 14
- pnpm (أو npm/yarn)

## التثبيت

### 1. تثبيت المكتبات

```bash
pnpm install
```

### 2. إعداد قاعدة البيانات

أنشئ قاعدة بيانات PostgreSQL:

```bash
createdb testapp_db
```

### 3. إعداد ملف البيئة

انسخ ملف `.env.example` إلى `.env` وعدّل القيم:

```bash
cp .env.example .env
```

عدّل الملف `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/testapp_db"
JWT_SECRET="your-secret-key-here"
GEMINI_API_KEY="your-gemini-api-key"
```

### 4. تشغيل Migrations

```bash
pnpm prisma:migrate
```

### 5. توليد Prisma Client

```bash
pnpm prisma:generate
```

## التشغيل

### Development

```bash
pnpm dev
```

### Production

```bash
pnpm build
pnpm start
```

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - تسجيل مستخدم جديد
- `POST /api/v1/auth/login` - تسجيل الدخول
- `GET /api/v1/auth/me` - الحصول على بيانات المستخدم
- `POST /api/v1/auth/forgot-password` - طلب إعادة تعيين كلمة المرور
- `POST /api/v1/auth/reset-password` - إعادة تعيين كلمة المرور

### Files

- `POST /api/v1/files/upload` - رفع ملف
- `GET /api/v1/files` - قائمة الملفات
- `GET /api/v1/files/:fileId` - تفاصيل ملف
- `DELETE /api/v1/files/:fileId` - حذف ملف
- `GET /api/v1/files/:fileId/status` - حالة معالجة الملف

### Chats

- `POST /api/v1/chats` - إنشاء محادثة
- `GET /api/v1/chats` - قائمة المحادثات
- `GET /api/v1/chats/:chatId` - تفاصيل محادثة
- `PUT /api/v1/chats/:chatId` - تحديث محادثة
- `DELETE /api/v1/chats/:chatId` - حذف محادثة

### Messages

- `POST /api/v1/chats/:chatId/messages` - إرسال رسالة
- `GET /api/v1/chats/:chatId/messages` - قائمة الرسائل

## بنية المشروع

```
backend/
├── src/
│   ├── config/          # إعدادات التطبيق
│   ├── controllers/     # Controllers للـ API
│   ├── middleware/      # Middleware (auth, errors)
│   ├── routes/          # تعريف المسارات
│   ├── services/        # منطق الأعمال
│   ├── utils/           # دوال مساعدة
│   ├── app.ts           # إعداد Express
│   └── server.ts        # نقطة الدخول
├── prisma/
│   └── schema.prisma    # نموذج قاعدة البيانات
├── uploads/             # الملفات المرفوعة
└── package.json
```

## الحصول على Gemini API Key

1. اذهب إلى [Google AI Studio](https://makersuite.google.com/app/apikey)
2. سجل الدخول بحساب Google
3. اضغط على "Create API Key"
4. انسخ المفتاح وضعه في `.env`

## ملاحظات

- تأكد من إنشاء مجلد `uploads` قبل التشغيل
- استخدم `pnpm prisma:studio` لفتح واجهة إدارة قاعدة البيانات
- جميع الـ endpoints ما عدا `/auth/register` و `/auth/login` تحتاج إلى JWT token

## License

ISC
