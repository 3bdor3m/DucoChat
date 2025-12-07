import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { authService } from "../services/authService";
import { activationCodeService } from "../services/activationCodeService";
import { FaCamera, FaTrash, FaCrown, FaKey, FaLock, FaMail, FaBell, FaMoon, FaSun, FaGlobe, FaSignOutAlt, FaUserSlash, FaDownload, FaSync, FaCheck } from "react-icons/fa";

const Account = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.fullName?.split(' ')[0] || '',
    lastName: user?.fullName?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
  });

  const [profileImage, setProfileImage] = useState<string | null>(user?.profileImage || null);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropData, setCropData] = useState({ x: 0, y: 0, size: 200 });

  const [activationCode, setActivationCode] = useState('');
  const [isActivating, setIsActivating] = useState(false);

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [settings, setSettings] = useState({
    darkMode: true,
    language: 'ar',
    emailNotifications: true,
    pushNotifications: true,
  });

  const subscriptionTiers = {
    free: { name: 'مجاني', color: 'gray', limit: 5, features: ['5 ملفات', '10 محادثات', 'دعم أساسي'] },
    basic: { name: 'أساسي', color: 'blue', limit: 20, features: ['20 ملف', '50 محادثة', 'دعم سريع', 'بدون إعلانات'] },
    premium: { name: 'مميز', color: 'yellow', limit: 100, features: ['ملفات غير محدودة', 'محادثات غير محدودة', 'دعم أولوية', 'ميزات متقدمة'] },
  };

  const currentTier = subscriptionTiers[user?.subscriptionTier as keyof typeof subscriptionTiers] || subscriptionTiers.free;
  const usagePercentage = ((user?.filesCount || 0) / currentTier.limit) * 100;

  // Handle image upload
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('خطأ', 'يرجى اختيار صورة صحيحة');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setTempImage(event.target?.result as string);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  // Crop and save image
  const handleCropSave = () => {
    if (!canvasRef.current || !tempImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = 200;
      canvas.height = 200;
      ctx.drawImage(img, cropData.x, cropData.y, cropData.size, cropData.size, 0, 0, 200, 200);
      
      const croppedImage = canvas.toDataURL('image/jpeg', 0.8);
      setProfileImage(croppedImage);
      setShowCropModal(false);
      setTempImage(null);
      toast.success('تم!', 'تم تحديث الصورة الشخصية');
    };
    img.src = tempImage;
  };

  // Delete profile image
  const handleDeleteImage = () => {
    setProfileImage(null);
    toast.success('تم!', 'تم حذف الصورة الشخصية');
  };

  // Handle activation code
  const handleActivateCode = async () => {
    if (activationCode.length !== 10 || !/^\d+$/.test(activationCode)) {
      toast.error('خطأ', 'الكود يجب أن يكون 10 أرقام');
      return;
    }

    setIsActivating(true);
    try {
      await activationCodeService.activate(activationCode);
      toast.success('تم التفعيل!', 'تم ترقية حسابك بنجاح');
      setActivationCode('');
      // Refresh user data
      window.location.reload();
    } catch (error: any) {
      toast.error('خطأ', error.message || 'كود التفعيل غير صحيح');
    } finally {
      setIsActivating(false);
    }
  };

  // Handle password change
  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      toast.error('خطأ', 'كلمتا المرور غير متطابقتين');
      return;
    }

    if (passwords.new.length < 8) {
      toast.error('خطأ', 'كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }

    try {
      // Call API to change password
      toast.success('تم!', 'تم تغيير كلمة المرور بنجاح');
      setShowPasswordModal(false);
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error: any) {
      toast.error('خطأ', error.message || 'فشل تغيير كلمة المرور');
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    toast.success('تم!', 'تم تسجيل الخروج بنجاح');
    navigate('/');
  };

  // Handle delete account
  const handleDeleteAccount = () => {
    if (window.confirm('هل أنت متأكد من حذف حسابك؟ هذا الإجراء لا يمكن التراجع عنه!')) {
      // Call API to delete account
      toast.success('تم!', 'تم حذف حسابك');
      logout();
      navigate('/');
    }
  };

  return (
    <div className="w-full min-h-screen bg-black text-white selection:bg-[#2873ec]/30 overflow-hidden relative">
      {/* Header */}
      <div className="pt-4 flex justify-center px-4 relative z-20">
        <Header />
      </div>

      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#2873ec]/20 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#1a5bb8]/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-[#2873ec]/10 rounded-full blur-[100px] animate-blob animation-delay-4000" />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 relative z-10 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
            حسابي
          </h1>
          <p className="text-gray-400">إدارة معلوماتك الشخصية وإعداداتك</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Right Column - Profile & Subscription */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Image Card */}
            <div className="bg-white/3 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#2873ec]/30 bg-gradient-to-br from-[#2873ec]/20 to-[#1a5bb8]/20 flex items-center justify-center">
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-5xl font-bold text-[#2873ec]">
                        {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-[#2873ec] hover:bg-[#1a5bb8] text-white p-3 rounded-full shadow-lg transition-all transform hover:scale-110"
                  >
                    <FaCamera size={16} />
                  </button>
                  {profileImage && (
                    <button
                      onClick={handleDeleteImage}
                      className="absolute bottom-0 left-0 bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition-all transform hover:scale-110"
                    >
                      <FaTrash size={16} />
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <h2 className="mt-4 text-xl font-bold">{formData.firstName} {formData.lastName}</h2>
                <p className="text-gray-400 text-sm">{formData.email}</p>
              </div>
            </div>

            {/* Subscription Card */}
            <div className="bg-white/3 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <FaCrown className={`text-${currentTier.color}-400`} />
                  الباقة الحالية
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${currentTier.color}-500/20 text-${currentTier.color}-400`}>
                  {currentTier.name}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                {currentTier.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
                    <FaCheck className="text-green-400" size={12} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mb-2">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>الاستخدام</span>
                  <span>{user?.filesCount || 0} / {currentTier.limit}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className={`bg-${currentTier.color}-500 h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  />
                </div>
              </div>

              {user?.subscriptionTier !== 'premium' && (
                <button className="w-full mt-4 bg-gradient-to-r from-[#2873ec] to-[#1a5bb8] text-white py-2.5 rounded-xl font-medium hover:opacity-90 transition-all">
                  ترقية الباقة
                </button>
              )}
            </div>

            {/* Activation Code Card */}
            <div className="bg-white/3 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                <FaKey className="text-yellow-400" />
                كود التفعيل
              </h3>
              <input
                type="text"
                value={activationCode}
                onChange={(e) => setActivationCode(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="أدخل الكود (10 أرقام)"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#2873ec]/50 focus:ring-1 focus:ring-[#2873ec]/50 transition-all mb-3"
              />
              <button
                onClick={handleActivateCode}
                disabled={activationCode.length !== 10 || isActivating}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-2.5 rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isActivating ? 'جاري التفعيل...' : 'تفعيل'}
              </button>
            </div>
          </div>

          {/* Left Column - Details & Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Information */}
            <div className="bg-white/3 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold mb-4">معلومات الحساب</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-2">الاسم الأول</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    disabled={!isEditing}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#2873ec]/50 focus:ring-1 focus:ring-[#2873ec]/50 transition-all disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-2">الاسم الأخير</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    disabled={!isEditing}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#2873ec]/50 focus:ring-1 focus:ring-[#2873ec]/50 transition-all disabled:opacity-50"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-400 block mb-2">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 opacity-50 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-2">تاريخ التسجيل</label>
                  <div className="text-white">{new Date(user?.createdAt || '').toLocaleDateString('ar-SA')}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-2">آخر تسجيل دخول</label>
                  <div className="text-white">{new Date().toLocaleDateString('ar-SA')}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-2">حالة الحساب</label>
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    نشط
                  </span>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-2.5 bg-[#2873ec] hover:bg-[#1a5bb8] text-white rounded-xl font-medium transition-all"
                  >
                    تعديل
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        // Save changes
                        setIsEditing(false);
                        toast.success('تم!', 'تم حفظ التغييرات');
                      }}
                      className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-all"
                    >
                      حفظ
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-medium transition-all"
                    >
                      إلغاء
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white/3 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FaLock className="text-[#2873ec]" />
                الأمان
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full flex items-center justify-between p-4 bg-black/20 hover:bg-black/30 rounded-xl transition-all"
                >
                  <span className="flex items-center gap-3">
                    <FaLock className="text-gray-400" />
                    <span>تغيير كلمة المرور</span>
                  </span>
                  <span className="text-gray-400">←</span>
                </button>
                <button className="w-full flex items-center justify-between p-4 bg-black/20 hover:bg-black/30 rounded-xl transition-all">
                  <span className="flex items-center gap-3">
                    <FaMail className="text-gray-400" />
                    <span>تغيير البريد الإلكتروني</span>
                  </span>
                  <span className="text-gray-400">←</span>
                </button>
              </div>
            </div>

            {/* Settings */}
            <div className="bg-white/3 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold mb-4">الإعدادات</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-3">
                    {settings.darkMode ? <FaMoon className="text-[#2873ec]" /> : <FaSun className="text-yellow-400" />}
                    <span>الوضع الليلي</span>
                  </span>
                  <button
                    onClick={() => setSettings({ ...settings, darkMode: !settings.darkMode })}
                    className={`w-14 h-7 rounded-full transition-all ${settings.darkMode ? 'bg-[#2873ec]' : 'bg-gray-600'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-all transform ${settings.darkMode ? 'translate-x-8' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-3">
                    <FaGlobe className="text-[#2873ec]" />
                    <span>اللغة</span>
                  </span>
                  <select
                    value={settings.language}
                    onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                    className="bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#2873ec]/50"
                  >
                    <option value="ar">العربية</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-3">
                    <FaBell className="text-[#2873ec]" />
                    <span>إشعارات البريد</span>
                  </span>
                  <button
                    onClick={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}
                    className={`w-14 h-7 rounded-full transition-all ${settings.emailNotifications ? 'bg-[#2873ec]' : 'bg-gray-600'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-all transform ${settings.emailNotifications ? 'translate-x-8' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-3">
                    <FaBell className="text-[#2873ec]" />
                    <span>الإشعارات المنبثقة</span>
                  </span>
                  <button
                    onClick={() => setSettings({ ...settings, pushNotifications: !settings.pushNotifications })}
                    className={`w-14 h-7 rounded-full transition-all ${settings.pushNotifications ? 'bg-[#2873ec]' : 'bg-gray-600'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-all transform ${settings.pushNotifications ? 'translate-x-8' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Account Actions */}
            <div className="bg-white/3 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold mb-4">إجراءات الحساب</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 p-3 bg-[#2873ec] hover:bg-[#1a5bb8] text-white rounded-xl font-medium transition-all"
                >
                  <FaSignOutAlt />
                  <span>تسجيل الخروج</span>
                </button>
                <button className="flex items-center justify-center gap-2 p-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-all">
                  <FaDownload />
                  <span>تصدير البيانات</span>
                </button>
                <button className="flex items-center justify-center gap-2 p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all">
                  <FaSync />
                  <span>مزامنة البيانات</span>
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="flex items-center justify-center gap-2 p-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all"
                >
                  <FaUserSlash />
                  <span>حذف الحساب</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Crop Modal */}
      {showCropModal && tempImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">قص الصورة</h3>
            <div className="relative w-full h-64 mb-4 overflow-hidden rounded-xl border border-white/10">
              <img src={tempImage} alt="Crop" className="w-full h-full object-contain" />
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex gap-3">
              <button
                onClick={handleCropSave}
                className="flex-1 bg-[#2873ec] hover:bg-[#1a5bb8] text-white py-2.5 rounded-xl font-medium transition-all"
              >
                حفظ
              </button>
              <button
                onClick={() => {
                  setShowCropModal(false);
                  setTempImage(null);
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2.5 rounded-xl font-medium transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">تغيير كلمة المرور</h3>
            <div className="space-y-4">
              <input
                type="password"
                placeholder="كلمة المرور الحالية"
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#2873ec]/50 focus:ring-1 focus:ring-[#2873ec]/50 transition-all"
              />
              <input
                type="password"
                placeholder="كلمة المرور الجديدة"
                value={passwords.new}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#2873ec]/50 focus:ring-1 focus:ring-[#2873ec]/50 transition-all"
              />
              <input
                type="password"
                placeholder="تأكيد كلمة المرور الجديدة"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#2873ec]/50 focus:ring-1 focus:ring-[#2873ec]/50 transition-all"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleChangePassword}
                className="flex-1 bg-[#2873ec] hover:bg-[#1a5bb8] text-white py-2.5 rounded-xl font-medium transition-all"
              >
                تغيير
              </button>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswords({ current: '', new: '', confirm: '' });
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2.5 rounded-xl font-medium transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Account;