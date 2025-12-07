# 🔗 دليل ربط Frontend بالـ Backend

## 📦 الملفات المحدثة

تم تحديث/إنشاء الملفات التالية:

### ملفات جديدة:
1. ✅ `src/config/api.ts` - إعدادات API والـ endpoints
2. ✅ `src/services/authService.ts` - خدمات المصادقة
3. ✅ `src/services/chatService.ts` - خدمات المحادثات
4. ✅ `src/services/fileService.ts` - خدمات الملفات

### ملفات محدثة:
1. ✅ `src/context/ChatContext.tsx` - تحديث ليستخدم API الحقيقي
2. ✅ `src/types/chat.ts` - إضافة حقول جديدة
3. ✅ `src/pages/Login.tsx` - ربط بـ API تسجيل الدخول

---

## 🚀 خطوات التطبيق

### الخطوة 1: نسخ الملفات

انسخ جميع الملفات من الملف المضغوط `frontend-updated.zip` إلى مشروع Frontend:

```
frontend-updated/
├── src/
│   ├── config/
│   │   └── api.ts           → انسخ إلى src/config/
│   ├── services/
│   │   ├── authService.ts   → انسخ إلى src/services/
│   │   ├── chatService.ts   → انسخ إلى src/services/
│   │   └── fileService.ts   → انسخ إلى src/services/
│   ├── context/
│   │   └── ChatContext.tsx  → استبدل الملف الموجود
│   ├── types/
│   │   └── chat.ts          → استبدل الملف الموجود
│   └── pages/
        └── Login.tsx        → استبدل الملف الموجود
```

---

### الخطوة 2: تحديث صفحة Signup

افتح `src/pages/Signup.tsx` وأضف في البداية:

```typescript
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
```

ثم أضف في بداية المكون:

```typescript
const navigate = useNavigate();
const [isLoading, setIsLoading] = useState(false);
const [errorMessage, setErrorMessage] = useState("");
```

ثم استبدل `onSubmit={(e) => e.preventDefault()}` بـ:

```typescript
onSubmit={handleSubmit}
```

وأضف دالة `handleSubmit`:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validate
  const emailError = validateEmail(formData.email);
  const allRequirementsMet = passwordRequirements.every(req => req.met);
  
  if (emailError || !allRequirementsMet || !formData.name || !formData.agreed) {
    setErrors({ email: emailError });
    if (!formData.name) setErrorMessage("يرجى إدخال الاسم الكامل");
    else if (!allRequirementsMet) setErrorMessage("كلمة المرور لا تستوفي المتطلبات");
    else if (!formData.agreed) setErrorMessage("يجب الموافقة على الشروط والأحكام");
    return;
  }

  setIsLoading(true);
  setErrorMessage("");

  try {
    await authService.register({
      email: formData.email,
      password: formData.password,
      fullName: formData.name,
    });
    
    // Auto login after registration
    await authService.login({
      email: formData.email,
      password: formData.password,
    });
    
    // Redirect to chat page
    navigate("/chat");
  } catch (error: any) {
    console.error("Registration error:", error);
    setErrorMessage(error.message || "فشل التسجيل");
  } finally {
    setIsLoading(false);
  }
};
```

---

### الخطوة 3: تحديث App.tsx

افتح `src/App.tsx` وتأكد من وجود:

```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ChatProvider } from './context/ChatContext';
import { authService } from './services/authService';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <ChatProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ChatProvider>
    </BrowserRouter>
  );
}
```

---

### الخطوة 4: تأكد من تشغيل Backend

قبل تشغيل Frontend، تأكد من:

1. ✅ Backend شغال على `http://localhost:8000`
2. ✅ PostgreSQL شغال
3. ✅ قاعدة البيانات موجودة

```bash
# في مجلد backend
npm run dev
```

---

### الخطوة 5: تشغيل Frontend

```bash
# في مجلد frontend
npm install  # إذا لم تكن قد ثبتت المكتبات
npm run dev
```

---

## 🧪 اختبار التكامل

### 1. اختبار التسجيل
1. افتح `http://localhost:5173/signup`
2. املأ البيانات
3. اضغط "إنشاء حساب"
4. يجب أن يتم تحويلك إلى `/chat`

### 2. اختبار تسجيل الدخول
1. افتح `http://localhost:5173/login`
2. أدخل البريد وكلمة المرور
3. اضغط "تسجيل الدخول"
4. يجب أن يتم تحويلك إلى `/chat`

### 3. اختبار رفع ملف
1. في صفحة Chat
2. ارفع ملف PDF أو DOCX
3. يجب أن ترى progress bar
4. بعد الانتهاء، يتم إنشاء محادثة تلقائياً

### 4. اختبار إرسال رسالة
1. بعد رفع الملف
2. اكتب رسالة
3. اضغط إرسال
4. **ملاحظة:** إذا لم يكن Gemini API key موجود، سيظهر خطأ لكن الرسالة ستُحفظ

---

## 🔑 إضافة Gemini API Key

### 1. احصل على المفتاح
- اذهب إلى: https://makersuite.google.com/app/apikey
- سجل دخول بحساب Google
- اضغط "Create API Key"
- انسخ المفتاح

### 2. أضفه في Backend
في ملف `backend/.env`:
```env
GEMINI_API_KEY="AIzaSy..."
```

### 3. عدّل config
في `backend/src/config/index.ts`:
```typescript
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'GEMINI_API_KEY'];
```

### 4. أعد تشغيل Backend
```bash
# اضغط Ctrl+C ثم
npm run dev
```

---

## 🎯 الميزات المتاحة الآن

### ✅ تعمل:
- تسجيل مستخدم جديد
- تسجيل الدخول
- تسجيل الخروج
- رفع ملفات (PDF, DOCX, TXT)
- إنشاء محادثات
- إرسال رسائل
- حذف محادثات
- إعادة تسمية محادثات
- تحميل المحادثات السابقة
- تحميل الرسائل

### ⏳ تحتاج Gemini API:
- الرد الذكي من البوت
- البحث في محتوى الملفات
- ربط الإجابات بالمصادر

---

## 🐛 حل المشاكل

### مشكلة: CORS Error

**الخطأ:**
```
Access to fetch at 'http://localhost:8000/api/v1/...' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**الحل:**
تأكد من أن `CORS_ORIGIN` في `backend/.env` يطابق عنوان Frontend:
```env
CORS_ORIGIN="http://localhost:5173"
```

---

### مشكلة: 401 Unauthorized

**الخطأ:**
```
{"error": "غير مصرح"}
```

**الحل:**
- تأكد من تسجيل الدخول أولاً
- تحقق من وجود `accessToken` في localStorage:
  ```javascript
  console.log(localStorage.getItem('accessToken'));
  ```

---

### مشكلة: Network Error

**الخطأ:**
```
Failed to fetch
```

**الحل:**
- تأكد من تشغيل Backend على `http://localhost:8000`
- تحقق من عدم وجود Firewall يمنع الاتصال

---

## 📝 ملاحظات مهمة

### 1. localStorage
- الـ `accessToken` يُحفظ في localStorage
- يبقى صالحاً لمدة ساعة واحدة
- بعدها يجب تسجيل الدخول مرة أخرى

### 2. رفع الملفات
- الحد الأقصى: 10 MB (قابل للتعديل في Backend)
- الأنواع المدعومة: PDF, DOCX, TXT, MD
- المعالجة تتم في الخلفية

### 3. المحادثات
- كل محادثة يمكن ربطها بملف واحد
- يمكن إنشاء محادثات بدون ملفات
- الرسائل تُحفظ تلقائياً

---

## 🎊 مبروك!

Frontend الآن متصل بالكامل مع Backend! 🚀

**الخطوات التالية:**
1. ✅ اختبر جميع الميزات
2. ✅ أضف Gemini API key للذكاء الاصطناعي
3. ✅ خصص التصميم حسب رغبتك
4. ✅ أضف ميزات إضافية

**إذا واجهت أي مشكلة، راجع قسم "حل المشاكل" أعلاه!**
