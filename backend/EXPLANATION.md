# شرح تفصيلي للكود

## 📋 نظرة عامة

تم بناء Backend كامل لتطبيق المحادثة الذكية باستخدام:
- **Node.js + Express** - إطار العمل الأساسي
- **TypeScript** - للكتابة الآمنة والمنظمة
- **Prisma ORM** - للتعامل مع قاعدة البيانات
- **PostgreSQL** - قاعدة البيانات
- **Google Gemini AI** - الذكاء الاصطناعي
- **JWT** - نظام المصادقة

---

## 🗂️ بنية المشروع

```
backend/
├── src/
│   ├── config/              # إعدادات التطبيق
│   │   └── index.ts         # جميع الإعدادات من .env
│   │
│   ├── middleware/          # Middleware للطلبات
│   │   ├── auth.ts          # التحقق من JWT token
│   │   └── errorHandler.ts # معالجة الأخطاء
│   │
│   ├── utils/               # دوال مساعدة
│   │   ├── jwt.ts           # توليد والتحقق من JWT
│   │   └── password.ts      # تشفير كلمات المرور
│   │
│   ├── controllers/         # منطق معالجة الطلبات
│   │   ├── authController.ts    # تسجيل، دخول، استعادة كلمة المرور
│   │   ├── fileController.ts    # رفع وإدارة الملفات
│   │   ├── chatController.ts    # إدارة المحادثات
│   │   └── messageController.ts # إرسال واستقبال الرسائل
│   │
│   ├── services/            # منطق الأعمال
│   │   ├── fileService.ts   # معالجة الملفات (PDF, DOCX)
│   │   └── aiService.ts     # التكامل مع Gemini AI
│   │
│   ├── routes/              # تعريف المسارات
│   │   ├── index.ts         # المسار الرئيسي
│   │   ├── authRoutes.ts    # مسارات المصادقة
│   │   ├── fileRoutes.ts    # مسارات الملفات
│   │   ├── chatRoutes.ts    # مسارات المحادثات
│   │   └── messageRoutes.ts # مسارات الرسائل
│   │
│   ├── app.ts               # إعداد Express
│   └── server.ts            # نقطة الدخول
│
├── prisma/
│   └── schema.prisma        # نموذج قاعدة البيانات
│
├── uploads/                 # مجلد الملفات المرفوعة
├── package.json
├── tsconfig.json
└── .env                     # متغيرات البيئة
```

---

## 📦 الملفات الرئيسية وشرحها

### 1. `prisma/schema.prisma` - نموذج قاعدة البيانات

**الوظيفة:** تعريف جداول قاعدة البيانات والعلاقات بينها

**الجداول:**

#### `User` - جدول المستخدمين
```prisma
model User {
  id               String   @id @default(uuid())
  email            String   @unique
  passwordHash     String
  fullName         String
  subscriptionTier String   @default("free")
  // ... العلاقات مع الملفات والمحادثات
}
```
- يخزن بيانات المستخدمين
- `passwordHash`: كلمة المرور مشفرة (ليست نص صريح)
- `subscriptionTier`: نوع الاشتراك (free, basic, premium)

#### `File` - جدول الملفات
```prisma
model File {
  id               String   @id @default(uuid())
  userId           String
  originalFilename String
  fileType         String   // .pdf, .docx, etc.
  status           String   @default("processing")
  // ... معلومات الملف
}
```
- يخزن معلومات الملفات المرفوعة
- `status`: حالة المعالجة (processing, completed, error)

#### `FileContent` - محتوى الملفات
```prisma
model FileContent {
  id              String   @id @default(uuid())
  fileId          String
  pageNumber      Int?
  paragraphNumber Int?
  content         String   @db.Text
  // ... للبحث في المحتوى
}
```
- يخزن النصوص المستخرجة من الملفات
- مقسمة إلى أجزاء (chunks) للبحث السريع

#### `Chat` - جدول المحادثات
```prisma
model Chat {
  id       String   @id @default(uuid())
  userId   String
  title    String   @default("محادثة جديدة")
  fileId   String?  // اختياري - ربط بملف
  settings Json?    // إعدادات المحادثة
}
```

#### `Message` - جدول الرسائل
```prisma
model Message {
  id          String   @id @default(uuid())
  chatId      String
  messageType String   // user أو bot
  content     String   @db.Text
}
```

#### `MessageSource` - مصادر الإجابات
```prisma
model MessageSource {
  messageId      String
  fileContentId  String
  relevanceScore Float?
}
```
- يربط إجابات البوت بمصادرها من الملفات

---

### 2. `src/config/index.ts` - إعدادات التطبيق

**الوظيفة:** قراءة المتغيرات من ملف `.env` وتوفيرها للتطبيق

```typescript
export const config = {
  port: 8000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  geminiApiKey: process.env.GEMINI_API_KEY,
  // ... باقي الإعدادات
}
```

**المتغيرات المهمة:**
- `DATABASE_URL`: رابط قاعدة البيانات PostgreSQL
- `JWT_SECRET`: مفتاح تشفير JWT tokens
- `GEMINI_API_KEY`: مفتاح Google Gemini API

---

### 3. `src/utils/jwt.ts` - إدارة JWT Tokens

**الوظيفة:** توليد والتحقق من JWT tokens للمصادقة

```typescript
// توليد token جديد
export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: '1h'
  });
}

// التحقق من token
export const verifyToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch {
    return null;
  }
}
```

**كيف يعمل:**
1. عند تسجيل الدخول، يتم توليد token يحتوي على `userId` و `email`
2. يرسل Token للـ Frontend
3. Frontend يرسل Token في كل طلب في header: `Authorization: Bearer <token>`
4. Backend يتحقق من Token قبل معالجة الطلب

---

### 4. `src/utils/password.ts` - تشفير كلمات المرور

**الوظيفة:** تشفير والتحقق من كلمات المرور

```typescript
// تشفير كلمة المرور
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
}

// التحقق من كلمة المرور
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
}
```

**ملاحظة مهمة:** لا يتم تخزين كلمات المرور كنص صريح أبداً، فقط الـ hash

---

### 5. `src/middleware/auth.ts` - Middleware المصادقة

**الوظيفة:** التحقق من أن المستخدم مصرح له بالوصول

```typescript
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // 1. استخراج Token من Header
  const token = req.headers.authorization?.substring(7);
  
  // 2. التحقق من Token
  const payload = verifyToken(token);
  
  // 3. التحقق من وجود المستخدم
  const user = await prisma.user.findUnique({
    where: { id: payload.userId }
  });
  
  // 4. إضافة بيانات المستخدم للطلب
  req.user = payload;
  next();
}
```

**الاستخدام:**
```typescript
router.get('/files', authenticate, getFiles);
// ↑ لن يتم تنفيذ getFiles إلا إذا نجحت المصادقة
```

---

### 6. `src/controllers/authController.ts` - نظام المصادقة

#### دالة `register` - التسجيل
```typescript
export const register = async (req: Request, res: Response) => {
  const { email, password, fullName } = req.body;
  
  // 1. التحقق من عدم وجود المستخدم
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new AppError('البريد مستخدم بالفعل');
  
  // 2. تشفير كلمة المرور
  const passwordHash = await hashPassword(password);
  
  // 3. إنشاء المستخدم
  const user = await prisma.user.create({
    data: { email, passwordHash, fullName }
  });
  
  res.status(201).json(user);
}
```

#### دالة `login` - تسجيل الدخول
```typescript
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  // 1. البحث عن المستخدم
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError('بيانات غير صحيحة', 401);
  
  // 2. التحقق من كلمة المرور
  const isValid = await comparePassword(password, user.passwordHash);
  if (!isValid) throw new AppError('بيانات غير صحيحة', 401);
  
  // 3. توليد Token
  const token = generateToken({ userId: user.id, email: user.email });
  
  res.json({ accessToken: token, user });
}
```

---

### 7. `src/controllers/fileController.ts` - إدارة الملفات

#### دالة `uploadFile` - رفع ملف
```typescript
export const uploadFile = async (req: AuthRequest, res: Response) => {
  const file = req.file; // Multer يوفر الملف
  
  // 1. حفظ معلومات الملف في قاعدة البيانات
  const fileRecord = await prisma.file.create({
    data: {
      userId: req.user!.userId,
      filename: file.filename,
      originalFilename: file.originalname,
      fileType: path.extname(file.originalname),
      fileSize: BigInt(file.size),
      storagePath: file.path,
      status: 'processing'
    }
  });
  
  // 2. معالجة الملف في الخلفية (async)
  processFile(fileRecord.id).catch(console.error);
  
  res.status(201).json(fileRecord);
}
```

**ملاحظة:** المعالجة تتم في الخلفية حتى لا ينتظر المستخدم

---

### 8. `src/services/fileService.ts` - معالجة الملفات

**الوظيفة:** استخراج النصوص من الملفات وتقسيمها

```typescript
export const processFile = async (fileId: string) => {
  const file = await prisma.file.findUnique({ where: { id: fileId } });
  
  // 1. استخراج النص حسب نوع الملف
  let textContent: string;
  switch (file.fileType) {
    case '.pdf':
      textContent = await extractPdfText(file.storagePath);
      break;
    case '.docx':
      textContent = await extractDocxText(file.storagePath);
      break;
    case '.txt':
      textContent = await extractTextFile(file.storagePath);
      break;
  }
  
  // 2. تقسيم النص إلى أجزاء (chunks)
  const chunks = splitTextIntoChunks(textContent);
  
  // 3. حفظ الأجزاء في قاعدة البيانات
  for (const chunk of chunks) {
    await prisma.fileContent.create({
      data: {
        fileId: file.id,
        pageNumber: chunk.page,
        paragraphNumber: chunk.paragraph,
        content: chunk.text
      }
    });
  }
  
  // 4. تحديث حالة الملف إلى "completed"
  await prisma.file.update({
    where: { id: fileId },
    data: { status: 'completed' }
  });
}
```

**لماذا التقسيم؟**
- لتسهيل البحث في المحتوى
- لتحديد مصدر الإجابة (صفحة، فقرة)
- لتحسين أداء الذكاء الاصطناعي

---

### 9. `src/services/aiService.ts` - التكامل مع Gemini

**الوظيفة:** توليد إجابات ذكية بناءً على محتوى الملفات

```typescript
export const generateAIResponse = async (request: AIRequest) => {
  const { fileId, userMessage, chatHistory, settings } = request;
  
  // 1. البحث عن محتوى ذي صلة من الملف
  const relevantContent = await findRelevantContent(fileId, userMessage);
  const context = relevantContent.map(c => c.content).join('\n\n');
  
  // 2. بناء Prompt للذكاء الاصطناعي
  const systemPrompt = `
أنت مساعد ذكي متخصص في الإجابة على الأسئلة بناءً على المستندات.

المحتوى المرجعي:
${context}

سياق المحادثة السابقة:
${conversationHistory}

السؤال: ${userMessage}
  `;
  
  // 3. استدعاء Gemini API
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash-exp',
    generationConfig: {
      temperature: settings.creativity_level / 100
    }
  });
  
  const result = await model.generateContent(systemPrompt);
  const text = result.response.text();
  
  // 4. إرجاع الإجابة مع المصادر
  return {
    content: text,
    sources: relevantContent.map(c => ({
      fileContentId: c.id,
      relevanceScore: 0.8
    }))
  };
}
```

**كيف يعمل البحث:**
```typescript
const findRelevantContent = async (fileId: string, query: string) => {
  // 1. جلب جميع أجزاء الملف
  const contents = await prisma.fileContent.findMany({
    where: { fileId }
  });
  
  // 2. استخراج الكلمات المفتاحية من السؤال
  const keywords = query.toLowerCase().split(/\s+/);
  
  // 3. حساب درجة التطابق لكل جزء
  const scored = contents.map(content => {
    const score = keywords.reduce((acc, keyword) => {
      return acc + (content.content.toLowerCase().includes(keyword) ? 1 : 0);
    }, 0);
    return { ...content, score };
  });
  
  // 4. إرجاع أفضل 3 أجزاء
  return scored
    .filter(c => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}
```

**ملاحظة:** هذا بحث بسيط. في الإنتاج، يُفضل استخدام Vector Embeddings

---

### 10. `src/controllers/messageController.ts` - إرسال الرسائل

```typescript
export const sendMessage = async (req: AuthRequest, res: Response) => {
  const { chatId } = req.params;
  const { content } = req.body;
  
  // 1. التحقق من ملكية المحادثة
  const chat = await prisma.chat.findFirst({
    where: { id: chatId, userId: req.user!.userId }
  });
  
  // 2. حفظ رسالة المستخدم
  const userMessage = await prisma.message.create({
    data: {
      chatId,
      messageType: 'user',
      content
    }
  });
  
  // 3. جلب تاريخ المحادثة
  const chatHistory = await prisma.message.findMany({
    where: { chatId },
    orderBy: { createdAt: 'asc' },
    take: 10
  });
  
  // 4. توليد رد الذكاء الاصطناعي
  const aiResponse = await generateAIResponse({
    chatId,
    fileId: chat.fileId,
    userMessage: content,
    chatHistory,
    settings: chat.settings
  });
  
  // 5. حفظ رسالة البوت
  const botMessage = await prisma.message.create({
    data: {
      chatId,
      messageType: 'bot',
      content: aiResponse.content
    }
  });
  
  // 6. حفظ المصادر
  if (aiResponse.sources) {
    await Promise.all(
      aiResponse.sources.map(source =>
        prisma.messageSource.create({
          data: {
            messageId: botMessage.id,
            fileContentId: source.fileContentId,
            relevanceScore: source.relevanceScore
          }
        })
      )
    );
  }
  
  // 7. إرجاع الرسالتين
  res.json({ userMessage, botMessage });
}
```

---

## 🔐 نظام المصادقة - كيف يعمل؟

### 1. التسجيل
```
المستخدم → POST /api/v1/auth/register
         ↓
    { email, password, fullName }
         ↓
    تشفير كلمة المرور (bcrypt)
         ↓
    حفظ في قاعدة البيانات
         ↓
    إرجاع بيانات المستخدم
```

### 2. تسجيل الدخول
```
المستخدم → POST /api/v1/auth/login
         ↓
    { email, password }
         ↓
    البحث عن المستخدم
         ↓
    التحقق من كلمة المرور
         ↓
    توليد JWT Token
         ↓
    إرجاع Token + بيانات المستخدم
```

### 3. الطلبات المحمية
```
المستخدم → GET /api/v1/files
         ↓
    Header: Authorization: Bearer <token>
         ↓
    Middleware: authenticate
         ↓
    التحقق من Token
         ↓
    إضافة req.user
         ↓
    تنفيذ Controller
```

---

## 📤 رفع ومعالجة الملفات - كيف يعمل؟

### 1. رفع الملف
```
المستخدم → POST /api/v1/files/upload
         ↓
    Multer يحفظ الملف في uploads/
         ↓
    حفظ معلومات الملف في DB (status: processing)
         ↓
    إرجاع استجابة فورية للمستخدم
         ↓
    معالجة الملف في الخلفية (async)
```

### 2. معالجة الملف (في الخلفية)
```
processFile(fileId)
    ↓
استخراج النص حسب النوع:
    - PDF → pdf-parse
    - DOCX → mammoth
    - TXT → fs.readFile
    ↓
تقسيم النص إلى chunks (1000 حرف لكل chunk)
    ↓
حفظ كل chunk في FileContent
    ↓
تحديث status إلى "completed"
```

### 3. التحقق من حالة المعالجة
```
المستخدم → GET /api/v1/files/:fileId/status
         ↓
    إرجاع: { status: 'processing' | 'completed' | 'error' }
```

---

## 💬 نظام المحادثة - كيف يعمل؟

### 1. إنشاء محادثة
```
المستخدم → POST /api/v1/chats
         ↓
    { title, fileId, settings }
         ↓
    إنشاء Chat في DB
         ↓
    إرجاع بيانات المحادثة
```

### 2. إرسال رسالة
```
المستخدم → POST /api/v1/chats/:chatId/messages
         ↓
    { content: "ما موضوع المستند؟" }
         ↓
    حفظ رسالة المستخدم
         ↓
    البحث عن محتوى ذي صلة من الملف
         ↓
    بناء Prompt مع السياق
         ↓
    استدعاء Gemini API
         ↓
    حفظ رد البوت
         ↓
    ربط الرد بالمصادر
         ↓
    إرجاع الرسالتين + المصادر
```

### 3. المصادر (Sources)
```
رد البوت يحتوي على:
{
  content: "المستند يتحدث عن...",
  sources: [
    {
      file: "document.pdf",
      page: 3,
      paragraph: 2,
      relevanceScore: 0.85
    }
  ]
}
```

---

## 🔄 تدفق البيانات الكامل

### مثال: مستخدم يسأل سؤال عن ملف

```
1. المستخدم يرفع ملف PDF
   POST /api/v1/files/upload
   → الملف يُحفظ، يبدأ استخراج النصوص

2. المستخدم ينشئ محادثة
   POST /api/v1/chats
   { fileId: "abc123" }
   → محادثة جديدة مرتبطة بالملف

3. المستخدم يرسل سؤال
   POST /api/v1/chats/xyz/messages
   { content: "ما هي النقاط الرئيسية؟" }
   
   → Backend:
      a. يحفظ رسالة المستخدم
      b. يبحث في FileContent عن أجزاء ذات صلة
      c. يرسل للـ Gemini:
         - السؤال
         - المحتوى ذو الصلة
         - تاريخ المحادثة
      d. يحفظ رد Gemini
      e. يربط الرد بمصادره
   
   ← يرجع:
      {
        userMessage: {...},
        botMessage: {
          content: "النقاط الرئيسية هي...",
          sources: [
            { file: "doc.pdf", page: 2, paragraph: 1 }
          ]
        }
      }

4. Frontend يعرض الرسائل مع المصادر
```

---

## 🎯 الميزات المهمة

### 1. الأمان
- ✅ كلمات المرور مشفرة (bcrypt)
- ✅ JWT tokens للمصادقة
- ✅ التحقق من ملكية الموارد (user يشوف ملفاته فقط)
- ✅ Validation للمدخلات

### 2. الأداء
- ✅ معالجة الملفات في الخلفية (async)
- ✅ Pagination للقوائم الطويلة
- ✅ Indexing في قاعدة البيانات

### 3. قابلية التوسع
- ✅ بنية معيارية (Controllers, Services, Routes)
- ✅ TypeScript للكتابة الآمنة
- ✅ Prisma ORM (سهل تغيير قاعدة البيانات)

### 4. تجربة المستخدم
- ✅ رسائل خطأ واضحة بالعربية
- ✅ استجابة فورية (معالجة الملفات لا تعطل المستخدم)
- ✅ مصادر واضحة للإجابات

---

## 🚀 التحسينات المستقبلية

### 1. Vector Embeddings
حالياً البحث بسيط (keyword matching). للتحسين:
```typescript
// استخدام OpenAI Embeddings أو Gemini Embeddings
const embedding = await generateEmbedding(text);
await prisma.fileContent.create({
  data: { content, embedding }
});

// البحث بالتشابه
const similar = await findSimilarContent(queryEmbedding);
```

### 2. WebSocket للـ Streaming
```typescript
// بدلاً من انتظار الإجابة كاملة
ws.on('message', async (message) => {
  const stream = await gemini.generateContentStream(prompt);
  for await (const chunk of stream) {
    ws.send(chunk.text());
  }
});
```

### 3. Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50 // 50 requests per hour
});

app.use('/api/', limiter);
```

### 4. Caching مع Redis
```typescript
// حفظ نتائج الأسئلة المتكررة
const cached = await redis.get(`answer:${questionHash}`);
if (cached) return cached;

const answer = await generateAIResponse(...);
await redis.set(`answer:${questionHash}`, answer, 'EX', 3600);
```

---

## 📝 ملاحظات مهمة

### 1. أمان API Key
- ⚠️ لا تشارك `GEMINI_API_KEY` أبداً
- ⚠️ لا ترفع ملف `.env` على Git
- ✅ استخدم `.env.example` كمثال فقط

### 2. حجم الملفات
- حالياً: 10 MB للـ free tier
- يمكن زيادته حسب الاشتراك
- تأكد من وجود مساحة كافية في `/uploads`

### 3. قاعدة البيانات
- استخدم PostgreSQL (ليس SQLite)
- عمل backup دوري
- استخدم migrations للتحديثات

### 4. الإنتاج (Production)
- استخدم PM2 لتشغيل التطبيق
- فعّل HTTPS
- استخدم Nginx كـ reverse proxy
- راقب الأخطاء (Sentry)
- راقب الأداء (New Relic)

---

## 🎓 خلاصة

**ما تم بناؤه:**
1. ✅ نظام مصادقة كامل (تسجيل، دخول، استعادة كلمة المرور)
2. ✅ نظام رفع ومعالجة ملفات (PDF, DOCX, TXT)
3. ✅ نظام محادثات متعددة
4. ✅ تكامل مع Gemini AI
5. ✅ ربط الإجابات بمصادرها
6. ✅ قاعدة بيانات منظمة مع Prisma

**التقنيات:**
- Node.js + Express + TypeScript
- Prisma + PostgreSQL
- Google Gemini AI
- JWT Authentication
- Multer للملفات

**الكود:**
- منظم ومعياري
- آمن (تشفير، مصادقة، validation)
- قابل للتوسع
- موثق بالعربية
