import { API_CONFIG } from '../config/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const activationCodeService = {
  // تفعيل كود
  async activate(code: string) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/activation-codes/activate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل تفعيل الكود');
    }

    return response.json();
  },
};