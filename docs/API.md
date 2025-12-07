# توثيق DocuChat API

هذا المستند يوفر توثيقاً كاملاً لجميع نقاط النهاية (Endpoints) في DocuChat API.

**Base URL:** `/api/v1`

## 認証 (Authentication)

### `POST /auth/register`

- **الوصف:** تسجيل مستخدم جديد.
- **Body:**
  ```json
  {
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "password": "password123"
  }
  ```
- **الاستجابة (201 Created):**
  ```json
  {
    "user": { ... },
    "token": "jwt.token.here"
  }
  ```

### `POST /auth/login`

- **الوصف:** تسجيل دخول مستخدم.
- **Body:**
  ```json
  {
    "email": "john.doe@example.com",
    "password": "password123"
  }
  ```
- **الاستجابة (200 OK):**
  ```json
  {
    "user": { ... },
    "token": "jwt.token.here"
  }
  ```

### `GET /auth/me`

- **الوصف:** جلب معلومات المستخدم الحالي.
- **الحماية:** يتطلب Token.
- **الاستجابة (200 OK):** `{ ...user }`

## المستخدمون (Users)

### `GET /users/stats`

- **الوصف:** جلب إحصائيات المستخدم.
- **الحماية:** يتطلب Token.

### `PUT /users/profile`

- **الوصف:** تحديث معلومات المستخدم.
- **الحماية:** يتطلب Token.

### `PUT /users/profile-image`

- **الوصف:** تحديث صورة المستخدم.
- **الحماية:** يتطلب Token.

### `PUT /users/password`

- **الوصف:** تغيير كلمة المرور.
- **الحماية:** يتطلب Token.

### `DELETE /users/account`

- **الوصف:** حذف حساب المستخدم.
- **الحماية:** يتطلب Token.

### `POST /users/export-data`

- **الوصف:** تصدير بيانات المستخدم.
- **الحماية:** يتطلب Token.

## الملفات (Files)

### `POST /files/upload`

- **الوصف:** رفع ملف جديد.
- **الحماية:** يتطلب Token.

### `GET /files`

- **الوصف:** جلب قائمة الملفات (مع pagination).
- **الحماية:** يتطلب Token.

### `GET /files/:id`

- **الوصف:** جلب ملف محدد.
- **الحماية:** يتطلب Token.

### `DELETE /files/:id`

- **الوصف:** حذف ملف.
- **الحماية:** يتطلب Token.

## المحادثات (Chats)

### `POST /chats`

- **الوصف:** إنشاء محادثة جديدة.
- **الحماية:** يتطلب Token.

### `GET /chats`

- **الوصف:** جلب قائمة المحادثات (مع pagination).
- **الحماية:** يتطلب Token.

### `GET /chats/:id`

- **الوصف:** جلب محادثة محددة.
- **الحماية:** يتطلب Token.

### `PUT /chats/:id`

- **الوصف:** تحديث عنوان المحادثة.
- **الحماية:** يتطلب Token.

### `DELETE /chats/:id`

- **الوصف:** حذف محادثة.
- **الحماية:** يتطلب Token.

## الرسائل (Messages)

### `GET /chats/:id/messages`

- **الوصف:** جلب رسائل محادثة (مع pagination).
- **الحماية:** يتطلب Token.

### `POST /chats/:id/messages`

- **الوصف:** إرسال رسالة جديدة.
- **الحماية:** يتطلب Token.
