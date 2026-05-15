// API Service Layer for PainelSMM Frontend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://painelsmm-two.vercel.app/api';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role?: string;
  createdAt?: string;
}

interface AuthResponse {
  user: UserData;
  token: string;
}

// Helper function to make API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = localStorage.getItem('token');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      // Se houver erros de validação, mostrar detalhes
      if (data.errors && Array.isArray(data.errors)) {
        const errorMessages = data.errors.map((err: any) => err.msg).join(', ');
        throw new Error(errorMessages);
      }
      
      // Se for erro 429 (rate limit), incluir waitSeconds no erro
      if (response.status === 429 && data.waitSeconds) {
        const error: any = new Error(data.message || 'Muitas tentativas');
        error.waitSeconds = data.waitSeconds;
        error.status = 429;
        throw error;
      }
      
      throw new Error(data.message || 'Erro na requisição');
    }

    return data;
  } catch (error: any) {
    console.error('API Error:', error);
    // Se for erro de conexão
    if (error.message === 'Failed to fetch') {
      throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
    }
    throw error;
  }
}

// Authentication API
export const authApi = {
  // Register new user
  register: async (userData: RegisterData): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    // Save token to localStorage
    if (response.success && response.data?.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response;
  },

  // Login user
  login: async (credentials: LoginData): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Save token to localStorage
    if (response.success && response.data?.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response;
  },

  // Get user profile
  getProfile: async (): Promise<ApiResponse<{ user: UserData }>> => {
    return apiRequest<{ user: UserData }>('/auth/profile', {
      method: 'GET',
    });
  },

  // Verify token
  verifyToken: async (): Promise<ApiResponse<{ user: UserData }>> => {
    return apiRequest<{ user: UserData }>('/auth/verify', {
      method: 'GET',
    });
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<ApiResponse & { waitSeconds?: number }> => {
    try {
      return await apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    } catch (error: any) {
      // Re-throw with waitSeconds if it's a rate limit error
      throw error;
    }
  },

  // Reset password
  resetPassword: async (token: string, password: string, confirmPassword: string): Promise<ApiResponse> => {
    return apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password, confirmPassword }),
    });
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  // Get current user from localStorage
  getCurrentUser: (): UserData | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },
};

// Payment API
export const paymentApi = {
  // Criar pagamento
  createPayment: async (orderData: {
    serviceType: string;
    packageId: string;
    quantity: number;
    price: number;
    instagramUsername: string;
    postUrl?: string;
  }): Promise<ApiResponse<{
    orderId: string;
    preferenceId: string;
    initPoint: string;
    sandboxInitPoint: string;
  }>> => {
    return apiRequest('/payments/create', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  // Buscar status do pagamento
  getPaymentStatus: async (orderId: string): Promise<ApiResponse<{ order: any }>> => {
    return apiRequest(`/payments/status?orderId=${orderId}`, {
      method: 'GET',
    });
  },

  // Listar pedidos do usuário
  getUserOrders: async (): Promise<ApiResponse<{ orders: any[] }>> => {
    return apiRequest('/payments/orders', {
      method: 'GET',
    });
  },
};

// Admin API
export const adminApi = {
  // Buscar estatísticas
  getStats: async (): Promise<ApiResponse<{
    totalOrders: number;
    ordersByStatus: Record<string, number>;
    totalRevenue: number;
    todayOrders: number;
    totalUsers: number;
  }>> => {
    return apiRequest('/admin/stats', {
      method: 'GET',
    });
  },

  // Buscar saldo SMMMIDIA
  getBalance: async (): Promise<ApiResponse<{
    balance: string;
    currency: string;
  }>> => {
    return apiRequest('/admin/balance', {
      method: 'GET',
    });
  },

  // Listar todos os pedidos
  getAllOrders: async (): Promise<ApiResponse<{
    orders: any[];
    total: number;
  }>> => {
    return apiRequest('/admin/orders', {
      method: 'GET',
    });
  },

  // Aprovar pedido
  approveOrder: async (orderId: string): Promise<ApiResponse<{
    orderId: string;
    smmmidiaOrderId: string;
  }>> => {
    return apiRequest(`/admin/orders/${orderId}/approve`, {
      method: 'POST',
    });
  },

  // Cancelar pedido
  cancelOrder: async (orderId: string, reason?: string): Promise<ApiResponse> => {
    return apiRequest(`/admin/orders/${orderId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  // Verificar status do pedido na SMMMIDIA
  checkOrderStatus: async (orderId: string): Promise<ApiResponse<{
    orderId: string;
    localStatus: string;
    smmmidiaStatus: string;
    charge: string;
    startCount: string;
    remains: string;
  }>> => {
    return apiRequest(`/admin/orders/${orderId}/status`, {
      method: 'GET',
    });
  },
};

export default authApi;
