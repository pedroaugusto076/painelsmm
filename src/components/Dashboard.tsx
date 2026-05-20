import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Package,
  ShoppingCart,
  Target,
  User,
  Zap,
  X,
  Menu,
  LogOut,
  Users,
  ThumbsUp,
  MessageCircle,
  PlayCircle,
  Instagram,
  CheckCircle2,
  ShieldCheck,
  Clock,
  TrendingUp,
  Loader2,
  Settings,
  DollarSign,
  AlertCircle,
  RefreshCw,
  XCircle
} from 'lucide-react';
import { authApi, paymentApi, adminApi } from '../services/api';
import { showSuccess, showError, showInfo, showWarning } from '../utils/toast';

// Função para formatar data no horário de Brasília
const formatDateBR = (dateString: string) => {
  // Criar data assumindo que vem em UTC
  const date = new Date(dateString + (dateString.includes('Z') ? '' : 'Z'));
  
  return date.toLocaleString('pt-BR', { 
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// Modal de Confirmação de Logout
const LogoutModal: React.FC<{ isOpen: boolean; onClose: () => void; onConfirm: () => void }> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex flex-col items-center text-center">
          {/* Ícone */}
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <LogOut className="h-8 w-8 text-red-600" />
          </div>
          
          {/* Título */}
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Confirmar Saída
          </h3>
          
          {/* Mensagem */}
          <p className="text-gray-600 mb-6">
            Tem certeza que deseja sair da sua conta?
          </p>
          
          {/* Botões */}
          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Card de Saldo Compacto (para o header)
const BalanceCardCompact = () => {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [showAddBalanceModal, setShowAddBalanceModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    try {
      const response = await authApi.getProfile();
      if (response.success && response.data?.user) {
        setBalance(response.data.user.balance || 0);
      }
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  };

  const handleBalanceAdded = () => {
    loadBalance();
    setShowAddBalanceModal(false);
  };

  // Escutar evento de compra para atualizar saldo
  useEffect(() => {
    const handlePurchase = () => {
      loadBalance();
    };
    
    window.addEventListener('balanceUpdated', handlePurchase);
    return () => window.removeEventListener('balanceUpdated', handlePurchase);
  }, []);

  return (
    <>
      <div className="flex items-center gap-3">
        {/* Saldo */}
        <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-2 rounded-lg">
          <DollarSign className="w-5 h-5" />
          <div>
            <p className="text-xs text-violet-100">Saldo</p>
            {loading ? (
              <p className="text-sm font-bold">...</p>
            ) : (
              <p className="text-sm font-bold">R$ {balance.toFixed(2)}</p>
            )}
          </div>
        </div>

        {/* Botões */}
        <button
          onClick={() => setShowAddBalanceModal(true)}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg transition font-semibold text-sm"
        >
          <DollarSign className="w-4 h-4" />
          <span className="hidden sm:inline">Adicionar</span>
        </button>
        
        <button
          onClick={() => setShowHistoryModal(true)}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          title="Histórico"
        >
          <Clock className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Modais */}
      {showAddBalanceModal && (
        <AddBalanceModal
          onClose={() => setShowAddBalanceModal(false)}
          onSuccess={handleBalanceAdded}
          currentBalance={balance}
        />
      )}

      {showHistoryModal && (
        <BalanceHistoryModal onClose={() => setShowHistoryModal(false)} />
      )}
    </>
  );
};

// Card de Saldo (versão antiga - pode remover)
const BalanceCard = () => {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [showAddBalanceModal, setShowAddBalanceModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    try {
      const response = await authApi.getProfile();
      if (response.success && response.data?.user) {
        setBalance(response.data.user.balance || 0);
      }
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  };

  const handleBalanceAdded = () => {
    loadBalance(); // Recarregar saldo
    setShowAddBalanceModal(false);
  };

  return (
    <>
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl p-6 mb-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-violet-100 text-sm mb-1">Seu Saldo</p>
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-2xl font-bold">Carregando...</span>
              </div>
            ) : (
              <p className="text-4xl font-bold">R$ {balance.toFixed(2)}</p>
            )}
          </div>
          <DollarSign className="w-16 h-16 text-white/20" />
        </div>
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => setShowAddBalanceModal(true)}
            className="flex-1 bg-white text-violet-600 hover:bg-gray-100 font-semibold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2"
          >
            <DollarSign className="w-5 h-5" />
            Adicionar Saldo
          </button>
          <button
            onClick={() => setShowHistoryModal(true)}
            className="bg-white/10 hover:bg-white/20 backdrop-blur text-white font-semibold py-3 px-4 rounded-xl transition"
          >
            Histórico
          </button>
        </div>
      </div>

      {/* Modal Adicionar Saldo */}
      {showAddBalanceModal && (
        <AddBalanceModal
          onClose={() => setShowAddBalanceModal(false)}
          onSuccess={handleBalanceAdded}
          currentBalance={balance}
        />
      )}

      {/* Modal Histórico */}
      {showHistoryModal && (
        <BalanceHistoryModal onClose={() => setShowHistoryModal(false)} />
      )}
    </>
  );
};

// Modal de Adicionar Saldo
const AddBalanceModal: React.FC<{ onClose: () => void; onSuccess: () => void; currentBalance: number }> = ({ onClose, onSuccess, currentBalance }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [qrCodeBase64, setQrCodeBase64] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

  const suggestedAmounts = [50, 100, 200, 500];

  const handleAddBalance = async () => {
    const numAmount = parseFloat(amount);
    
    if (!numAmount || numAmount <= 0) {
      showInfo('Digite um valor válido');
      return;
    }

    try {
      setLoading(true);
      const response = await paymentApi.addBalance(numAmount);

      if (response.success && response.data) {
        setQrCode(response.data.qrCode);
        setQrCodeBase64(response.data.qrCodeBase64);
        setPaymentId(response.data.paymentId);
        
        // Iniciar polling para verificar pagamento
        startPolling(response.data.paymentId);
      }
    } catch (error: any) {
      showError(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (paymentId: string) => {
    const previousBalance = currentBalance;
    
    const interval = setInterval(async () => {
      try {
        const response = await authApi.getProfile();
        if (response.success && response.data?.user) {
          const newBalance = response.data.user.balance || 0;
          
          // Se o saldo mudou, pagamento foi confirmado
          if (newBalance > previousBalance) {
            setShowPaymentSuccess(true);
            clearInterval(interval);
            setTimeout(() => {
              onSuccess();
            }, 2000);
          }
        }
      } catch (error) {
        
      }
    }, 5000); // Verificar a cada 5 segundos

    // Parar após 10 minutos
    setTimeout(() => clearInterval(interval), 600000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(qrCode).then(() => {
      showSuccess('Código PIX copiado!');
    }).catch(() => {
      showError('Erro ao copiar código PIX');
    });
  };

  if (showPaymentSuccess) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div onClick={onClose} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Pagamento Confirmado!</h3>
          <p className="text-gray-600">Seu saldo foi adicionado com sucesso.</p>
        </div>
      </div>
    );
  }

  if (qrCode) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div onClick={onClose} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Pagar com PIX</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="text-center">
            <p className="text-gray-600 mb-4">Escaneie o QR Code ou copie o código PIX</p>
            
            {qrCodeBase64 && (
              <div className="bg-white p-4 rounded-xl inline-block mb-4">
                <img src={`data:image/png;base64,${qrCodeBase64}`} alt="QR Code" className="w-64 h-64" />
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-xl mb-4">
              <p className="text-sm text-gray-600 mb-2">Código PIX:</p>
              <p className="text-xs font-mono break-all text-gray-800">{qrCode}</p>
            </div>

            <button
              onClick={copyToClipboard}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 rounded-xl transition"
            >
              Copiar Código PIX
            </button>

            <p className="text-sm text-gray-500 mt-4">
              Aguardando pagamento... <Loader2 className="w-4 h-4 inline animate-spin" />
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Adicionar Saldo</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quanto deseja adicionar?
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              min="10"
              max="10000"
              step="0.01"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Mínimo: R$ 10,00 | Máximo: R$ 10.000,00</p>
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">Valores sugeridos:</p>
          <div className="grid grid-cols-4 gap-2">
            {suggestedAmounts.map((value) => (
              <button
                key={value}
                onClick={() => setAmount(value.toString())}
                className="py-2 px-3 bg-gray-100 hover:bg-violet-100 hover:text-violet-600 rounded-lg font-semibold text-sm transition"
              >
                R$ {value}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleAddBalance}
          disabled={loading || !amount}
          className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Gerando PIX...
            </>
          ) : (
            <>
              <DollarSign className="w-5 h-5" />
              Gerar PIX
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// Modal de Histórico
const BalanceHistoryModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await paymentApi.getBalanceHistory();
      if (response.success && response.data) {
        setTransactions(response.data.transactions);
      }
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Histórico de Transações</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Nenhuma transação encontrada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {tx.type === 'deposit' ? (
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                          <ShoppingCart className="w-4 h-4 text-red-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">
                          {tx.type === 'deposit' ? 'Depósito' : 'Compra'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDateBR(tx.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type === 'deposit' ? '+' : '-'} R$ {Math.abs(tx.amount).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Saldo: R$ {tx.balance_after.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  {tx.description && (
                    <p className="text-sm text-gray-600 mt-2">{tx.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Dashboard Component com Sidebar
export const Dashboard: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [user, setUser] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState('servicos');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const userData = authApi.getCurrentUser();
    setUser(userData);
    
    // Verificar se é admin (você pode adicionar uma propriedade is_admin no token/user)
    // Por enquanto, vamos verificar via API
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const response = await authApi.getProfile();
      if (response.success && response.data?.user) {
        setIsAdmin((response.data.user as any).is_admin === true);
      }
    } catch (error) {
      
    }
  };

  const handleLogout = () => {
    authApi.logout();
    localStorage.removeItem('keepLoggedIn');
    onNavigate('home');
  };

  const menuItems = [
    { id: 'servicos', name: 'Serviços', icon: Package },
    { id: 'pedidos', name: 'Meus Pedidos', icon: ShoppingCart },
    { id: 'api', name: 'API', icon: Target },
    { id: 'perfil', name: 'Perfil', icon: User },
    ...(isAdmin ? [{ id: 'admin', name: 'Admin', icon: Settings }] : []),
  ];

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Modal de Logout */}
      <LogoutModal 
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-violet-700 p-2 rounded-xl">
              <Zap className="h-5 w-5 text-white" fill="currentColor" />
            </div>
            <span className="font-bold text-lg tracking-tight text-gray-900">testsmm</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                data-tab={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-violet-50 text-violet-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Bar - Fixo */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">
              {menuItems.find(item => item.id === currentTab)?.name}
            </h1>
            {/* Badge Instagram */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full">
              <Instagram className="w-3.5 h-3.5 text-white" />
              <span className="text-xs font-semibold text-white">Instagram</span>
            </div>
          </div>
          
          {/* Saldo no Header */}
          <BalanceCardCompact />
        </header>

        {/* Content Area - Rolável */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {currentTab === 'servicos' && <ServicosTab />}
          {currentTab === 'pedidos' && <PedidosTab />}
          {currentTab === 'api' && <ApiTab />}
          {currentTab === 'perfil' && <PerfilTab user={user} />}
        </main>
      </div>
    </div>
  );
};

// Aba de Serviços
const ServicosTab = () => {
  const [selectedService, setSelectedService] = useState<string>('followers'); // Sempre começa com seguidores
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [instagramUsername, setInstagramUsername] = useState('');
  const [postUrl, setPostUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPixModal, setShowPixModal] = useState(false);
  const [pixData, setPixData] = useState<any>(null);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Limpar polling ao desmontar
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Função para verificar status do pagamento
  const checkPaymentStatus = async (orderId: string) => {
    try {
      const response = await paymentApi.getPaymentStatus(orderId);
      if (response.success && response.data?.order) {
        const order = response.data.order;

        if (order.status === 'completed') {
          // Pagamento confirmado!

          // Parar polling
          if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
          }
          
          // Fechar modal do PIX
          setShowPixModal(false);
          setPixData(null);
          
          // Mostrar modal de sucesso
          setShowSuccessModal(true);
          
          return true;
        }
      }
      return false;
    } catch (error) {
      
      return false;
    }
  };

  // Iniciar polling quando o modal PIX é aberto
  useEffect(() => {
    if (showPixModal && currentOrderId) {

      // Verificar a cada 5 segundos
      const interval = setInterval(() => {
        checkPaymentStatus(currentOrderId);
      }, 5000);
      
      setPollingInterval(interval);
      
      // Parar após 10 minutos (120 verificações)
      setTimeout(() => {
        if (interval) {
          clearInterval(interval);
          setPollingInterval(null);
          
        }
      }, 600000); // 10 minutos
    }
  }, [showPixModal, currentOrderId]);

  const services = [
    {
      id: 'followers',
      name: 'Seguidores',
      icon: Users,
      color: 'from-violet-500 to-pink-500',
      description: 'Aumente seus seguidores com perfis reais e ativos',
      packages: [
        { id: '100', qty: 100, price: 14.90, originalPrice: null, discount: null, bonus: false },
        { id: '500', qty: 500, price: 64.90, originalPrice: null, discount: null, bonus: false },
        { id: '1000', qty: 1000, price: 119.90, originalPrice: null, discount: null, bonus: false },
        { id: '2500', qty: 2500, price: 279.90, originalPrice: null, discount: 30, bonus: true },
        { id: '5000', qty: 5000, price: 499.90, originalPrice: null, discount: 40, bonus: true },
        { id: '10000', qty: 10000, price: 899.90, originalPrice: null, discount: 50, bonus: true },
      ]
    },
    {
      id: 'likes',
      name: 'Curtidas',
      icon: ThumbsUp,
      color: 'from-red-500 to-orange-500',
      description: 'Mais curtidas para suas publicações',
      packages: [
        { id: '100', qty: 100, price: 4.90, originalPrice: null, discount: null, bonus: false },
        { id: '500', qty: 500, price: 17.90, originalPrice: null, discount: null, bonus: false },
        { id: '1000', qty: 1000, price: 29.90, originalPrice: null, discount: null, bonus: false },
        { id: '2500', qty: 2500, price: 64.90, originalPrice: null, discount: 30, bonus: true },
        { id: '5000', qty: 5000, price: 119.90, originalPrice: null, discount: 40, bonus: true },
        { id: '10000', qty: 10000, price: 199.90, originalPrice: null, discount: 50, bonus: true },
      ]
    },
    {
      id: 'comments',
      name: 'Comentários',
      icon: MessageCircle,
      color: 'from-blue-500 to-cyan-500',
      description: 'Comentários reais e engajados',
      packages: [
        { id: '10', qty: 10, price: 14.90, originalPrice: null, discount: null, bonus: false },
        { id: '50', qty: 50, price: 69.90, originalPrice: null, discount: null, bonus: false },
        { id: '100', qty: 100, price: 139.90, originalPrice: null, discount: null, bonus: false },
        { id: '250', qty: 250, price: 349.90, originalPrice: null, discount: 30, bonus: false },
        { id: '500', qty: 500, price: 699.90, originalPrice: null, discount: 40, bonus: false },
        { id: '1000', qty: 1000, price: 1399.90, originalPrice: null, discount: 50, bonus: false },
      ]
    },
    {
      id: 'views',
      name: 'Visualizações',
      icon: PlayCircle,
      color: 'from-green-500 to-emerald-500',
      description: 'Aumente as visualizações dos seus vídeos',
      packages: [
        { id: '1000', qty: 1000, price: 4.90, originalPrice: null, discount: null, bonus: false },
        { id: '5000', qty: 5000, price: 19.90, originalPrice: null, discount: null, bonus: false },
        { id: '10000', qty: 10000, price: 34.90, originalPrice: null, discount: null, bonus: false },
        { id: '25000', qty: 25000, price: 74.90, originalPrice: null, discount: 30, bonus: true },
        { id: '50000', qty: 50000, price: 129.90, originalPrice: null, discount: 40, bonus: true },
        { id: '100000', qty: 100000, price: 229.90, originalPrice: null, discount: 50, bonus: true },
      ]
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Comprar com saldo
      const response = await paymentApi.purchaseWithBalance({
        serviceType: selectedService,
        packageId: selectedPackage,
        quantity: currentPackage!.qty,
        price: currentPackage!.price,
        instagramUsername: instagramUsername.replace('@', ''),
        postUrl: postUrl || undefined
      });

      if (response.success && response.data) {

        // Disparar evento para atualizar saldo no header
        window.dispatchEvent(new Event('balanceUpdated'));
        
        // Mostrar modal de sucesso
        setShowSuccessModal(true);
        
        // Limpar formulário
        setSelectedService('followers');
        setSelectedPackage('');
        setInstagramUsername('');
        setPostUrl('');
        
        // Fechar modal após 3 segundos
        setTimeout(() => {
          setShowSuccessModal(false);
        }, 3000);
      } else {
        
        alert('Erro: ' + (response.message || 'Resposta inválida'));
      }
    } catch (error: any) {

      // Verificar se é erro de saldo insuficiente
      if (error.response?.insufficientBalance) {
        const currentBalance = error.response.currentBalance || 0;
        const requiredAmount = error.response.requiredAmount || 0;
        const missing = requiredAmount - currentBalance;
        
        showError(`Saldo insuficiente! Você tem R$ ${currentBalance.toFixed(2)} e precisa de R$ ${requiredAmount.toFixed(2)}. Faltam R$ ${missing.toFixed(2)}.`);
        
        // Abrir modal de adicionar saldo automaticamente após 1 segundo
        setTimeout(() => {
          setShowAddBalanceModal(true);
        }, 1000);
      } else {
        showError(error.message || 'Erro desconhecido');
      }
    } finally {
      setLoading(false);
    }
  };

  const currentService = services.find(s => s.id === selectedService);
  const currentPackage = currentService?.packages.find(p => p.id === selectedPackage);

  const copyPixCode = () => {
    if (pixData?.pixQrCode) {
      navigator.clipboard.writeText(pixData.pixQrCode);
      showSuccess('Código PIX copiado!');
    }
  };

  const closePixModal = () => {

    setShowPixModal(false);
    setPixData(null);
    setCurrentOrderId(null);
    setSelectedService('followers');
    setSelectedPackage('');
    setInstagramUsername('');
    setPostUrl('');
    
    // Mostrar mensagem
    showSuccess('PIX gerado! Após o pagamento, verifique seus pedidos na aba "Meus Pedidos" ou "Admin/Logs".');
  };

  return (
    <div className="space-y-6">
      {/* Modal de Sucesso - Renderizado via Portal */}
      {showSuccessModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          
          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-300">
            <div className="text-center">
              {/* Ícone de Sucesso Animado */}
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
              
              {/* Título */}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                🎉 Pagamento Confirmado!
              </h3>
              
              {/* Mensagem */}
              <p className="text-gray-600 mb-6">
                Seu pedido foi confirmado com sucesso e está sendo processado.
              </p>
              
              {/* Informação */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-green-800">
                  ✓ Pagamento recebido<br />
                  ✓ Pedido em processamento<br />
                  ✓ Entrega em até 24 horas
                </p>
              </div>
              
              {/* Botão */}
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setCurrentOrderId(null);
                  // Redirecionar para Meus Pedidos
                  const dashboard = document.querySelector('[data-tab="pedidos"]') as HTMLButtonElement;
                  if (dashboard) {
                    dashboard.click();
                  }
                }}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl transition shadow-lg"
              >
                Ver Meus Pedidos
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal PIX - Renderizado via Portal */}
      {showPixModal && pixData && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Overlay */}
          <div 
            onClick={closePixModal}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Botão Fechar */}
            <div className="sticky top-0 bg-white z-10 flex justify-end p-4 border-b border-gray-100">
              <button
                onClick={closePixModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 text-center">
              {/* Ícone */}
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              
              {/* Título */}
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                PIX Gerado com Sucesso!
              </h3>
              
              {/* Valor */}
              <p className="text-3xl font-bold text-violet-600 mb-6">
                R$ {pixData.amount.toFixed(2)}
              </p>

              {/* QR Code */}
              {pixData.pixQrCodeBase64 && (
                <div className="bg-white p-3 rounded-xl border-2 border-gray-200 mb-4 mx-auto w-fit">
                  <img 
                    src={`data:image/png;base64,${pixData.pixQrCodeBase64}`}
                    alt="QR Code PIX"
                    className="w-64 h-64 object-contain"
                  />
                </div>
              )}

              {/* Código PIX */}
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Ou copie o código PIX:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={pixData.pixQrCode}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono overflow-hidden text-ellipsis"
                  />
                  <button
                    onClick={copyPixCode}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-lg transition whitespace-nowrap"
                  >
                    Copiar
                  </button>
                </div>
              </div>

              {/* Instruções */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-left mb-4">
                <h4 className="font-bold text-blue-900 mb-2 text-sm">Como pagar:</h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Abra o app do seu banco</li>
                  <li>Escolha pagar com PIX</li>
                  <li>Escaneie o QR Code ou cole o código</li>
                  <li>Confirme o pagamento</li>
                </ol>
              </div>

              {/* Aviso */}
              <p className="text-xs text-gray-500 mb-4">
                Após o pagamento, seu pedido será processado automaticamente em até 5 minutos.
              </p>

              {/* Botão Fechar */}
              <button
                onClick={closePixModal}
                className="w-full px-4 py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Grid de Serviços */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 sm:px-0">
        {services.map((service) => {
          const Icon = service.icon;
          const isSelected = selectedService === service.id;
          return (
            <button
              key={service.id}
              onClick={() => {
                setSelectedService(service.id);
                setSelectedPackage('');
              }}
              className={`text-center bg-white rounded-2xl p-6 transition-all border-2 ${
                isSelected
                  ? 'border-violet-500 shadow-lg scale-105'
                  : 'border-gray-100 hover:border-violet-200 hover:shadow-md'
              }`}
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4 mx-auto`}>
                <Icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {service.name}
              </h3>
              <p className="text-sm text-gray-600">
                {service.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Formulário de Pedido */}
      {selectedService && (
        <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8 border border-gray-100">
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-6 text-center sm:text-left">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentService?.color} flex items-center justify-center mx-auto sm:mx-0`}>
              {currentService && <currentService.icon className="h-6 w-6 text-white" />}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">
                {currentService?.name}
              </h2>
              <p className="text-sm text-gray-600">Selecione o pacote desejado</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seleção de Pacotes */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3 text-center sm:text-left">
                Escolha o Pacote
              </label>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {currentService?.packages.map((pkg) => {
                  // Definir cor do badge baseado no desconto
                  const badgeColor = pkg.discount === 30 
                    ? 'from-green-400 to-emerald-400' 
                    : pkg.discount === 40 
                    ? 'from-green-500 to-emerald-500' 
                    : pkg.discount === 50 
                    ? 'from-green-600 to-emerald-600' 
                    : '';
                  
                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => setSelectedPackage(pkg.id)}
                      className={`p-4 rounded-xl border-2 transition-all relative ${
                        selectedPackage === pkg.id
                          ? 'border-violet-500 bg-violet-50'
                          : 'border-gray-200 hover:border-violet-200 bg-white'
                      }`}
                    >
                      {/* Badge de Desconto */}
                      {pkg.discount && (
                        <div className={`absolute -top-2 -right-2 bg-gradient-to-r ${badgeColor} text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg`}>
                          -{pkg.discount}%
                        </div>
                      )}
                      
                      <div className="flex justify-center items-center mb-2">
                        <span className="text-2xl font-bold text-gray-900">
                          {pkg.qty >= 1000 ? `${pkg.qty / 1000}k` : pkg.qty}
                        </span>
                        {selectedPackage === pkg.id && (
                          <CheckCircle2 className="h-5 w-5 text-violet-600 ml-2" />
                        )}
                      </div>
                      
                      {/* Quantidade + Bônus */}
                      <div className="text-sm text-gray-600 mb-1 text-center">
                        {pkg.qty.toLocaleString()} {currentService.name.toLowerCase()}
                        {pkg.bonus && (
                          <span className="block text-xs font-bold text-orange-600 mt-0.5">
                            + {currentService.name} adicionais de brinde! 🎁
                          </span>
                        )}
                      </div>
                      
                      {/* Preço com desconto */}
                      {pkg.originalPrice ? (
                        <div className="text-center">
                          <div className="text-sm text-gray-400 line-through mb-0.5">
                            R$ {pkg.originalPrice.toFixed(2)}
                          </div>
                          <div className="text-lg font-bold text-green-600">
                            R$ {pkg.price.toFixed(2)}
                          </div>
                          <div className="text-xs text-green-600 font-semibold mt-1">
                            Economize R$ {(pkg.originalPrice - pkg.price).toFixed(2)}
                          </div>
                        </div>
                      ) : (
                        <div className="text-lg font-bold text-violet-600 text-center">
                          R$ {pkg.price.toFixed(2)}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedPackage && (
              <>
                {/* Usuário do Instagram */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Usuário do Instagram
                  </label>
                  <div className="relative">
                    <Instagram className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      value={instagramUsername}
                      onChange={(e) => setInstagramUsername(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition"
                      placeholder="@seuusuario"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Digite apenas o nome de usuário, sem @
                  </p>
                </div>

                {/* Link da Publicação (para likes, comments, views) */}
                {(selectedService === 'likes' || selectedService === 'comments' || selectedService === 'views') && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Link da Publicação
                    </label>
                    <input
                      type="url"
                      value={postUrl}
                      onChange={(e) => setPostUrl(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition"
                      placeholder="https://instagram.com/p/..."
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Cole o link completo da publicação do Instagram
                    </p>
                  </div>
                )}

                {/* Resumo do Pedido */}
                <div className="bg-gradient-to-br from-violet-50 to-pink-50 border-2 border-violet-200 rounded-xl p-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-violet-600" />
                    Resumo do Pedido
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Serviço:</span>
                      <span className="font-bold text-gray-900">{currentService?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quantidade:</span>
                      <span className="font-bold text-gray-900">{currentPackage?.qty.toLocaleString()}</span>
                    </div>
                    {currentPackage?.bonus && (
                      <div className="flex justify-between bg-orange-50 -mx-2 px-2 py-1.5 rounded">
                        <span className="text-orange-600 font-semibold">🎁 Bônus:</span>
                        <span className="font-bold text-orange-600">
                          {currentService?.name} adicionais grátis!
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Entrega:</span>
                      <span className="font-bold text-green-600">Até 24 horas</span>
                    </div>
                    <div className="border-t border-violet-200 pt-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-900 font-bold">Total:</span>
                        <span className="text-2xl font-bold text-violet-600">
                          R$ {currentPackage?.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Garantias */}
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="flex items-start gap-2 text-sm">
                    <ShieldCheck className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-gray-900">100% Seguro</p>
                      <p className="text-gray-600 text-xs">Sem riscos para sua conta</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Clock className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-gray-900">Entrega Rápida</p>
                      <p className="text-gray-600 text-xs">Até 24 horas</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <TrendingUp className="h-5 w-5 text-violet-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-gray-900">Reais e Ativos</p>
                      <p className="text-gray-600 text-xs">Perfis genuínos</p>
                    </div>
                  </div>
                </div>

                {/* Botão de Finalizar */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-violet-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5" />
                      Finalizar Pedido - R$ {currentPackage?.price.toFixed(2)}
                    </>
                  )}
                </button>
              </>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

// Aba de Admin/Logs
const AdminTab = () => {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await paymentApi.getUserOrders();
      if (response.success && response.data) {
        setPedidos(response.data.orders);
      }
    } catch (error) {
      
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const handleCheckPending = async () => {
    setChecking(true);
    try {
      const response = await fetch('/api/payments/check-pending', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        showSuccess(`Verificados ${data.data.checked} pedidos!\n${data.data.updates.length} atualizações realizadas.`);
        loadOrders(); // Recarregar lista
      } else {
        alert('❌ Erro ao verificar pagamentos: ' + data.message);
      }
    } catch (error) {
      
      showError('Erro ao verificar pagamentos');
    } finally {
      setChecking(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-300';
      case 'processing': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-300';
      case 'error': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'processing': return 'Processando';
      case 'pending': return 'Pendente';
      case 'cancelled': return 'Cancelado';
      case 'error': return 'Erro';
      default: return status;
    }
  };

  const getServiceName = (type: string) => {
    const names: any = {
      followers: 'Seguidores',
      likes: 'Curtidas',
      comments: 'Comentários',
      views: 'Visualizações'
    };
    return names[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Logs de Pedidos & SMMMIDIA</h3>
            <p className="text-sm text-gray-600 mt-1">
              Visualize o status de envio para a API da SMMMIDIA
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCheckPending}
              disabled={checking}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition flex items-center gap-2 disabled:opacity-50"
              title="Verificar pagamentos pendentes e processar manualmente"
            >
              <Loader2 className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} />
              {checking ? 'Verificando...' : 'Verificar Pendentes'}
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg transition flex items-center gap-2 disabled:opacity-50"
            >
              <Loader2 className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-700">
              {pedidos.filter(p => p.status === 'completed').length}
            </div>
            <div className="text-xs text-green-600 font-medium">Concluídos</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-700">
              {pedidos.filter(p => p.status === 'processing').length}
            </div>
            <div className="text-xs text-blue-600 font-medium">Processando</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="text-2xl font-bold text-yellow-700">
              {pedidos.filter(p => p.status === 'pending').length}
            </div>
            <div className="text-xs text-yellow-600 font-medium">Pendentes</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="text-2xl font-bold text-red-700">
              {pedidos.filter(p => p.status === 'error').length}
            </div>
            <div className="text-xs text-red-600 font-medium">Erros</div>
          </div>
        </div>
      </div>

      {/* Lista de Pedidos */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="font-bold text-gray-900 mb-4">Todos os Pedidos</h3>
        {pedidos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Nenhum pedido encontrado</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {pedidos.map((pedido) => (
              <div key={pedido.id} className="border border-gray-200 rounded-xl p-4 hover:border-violet-300 transition">
                {/* Header do Pedido */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-bold text-gray-900">{getServiceName(pedido.service_type)}</h4>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full border ${getStatusColor(pedido.status)}`}>
                        {getStatusText(pedido.status)}
                      </span>
                      {pedido.payment_status && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full border border-gray-300">
                          PIX: {pedido.payment_status}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {pedido.quantity.toLocaleString()} unidades • @{pedido.instagram_username}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      ID: {pedido.id}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-violet-600">R$ {parseFloat(pedido.price).toFixed(2)}</p>
                    <p className="text-xs text-gray-500">
                      {formatDateBR(pedido.created_at)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(pedido.created_at).toLocaleTimeString('pt-BR')}
                    </p>
                  </div>
                </div>

                {/* Detalhes SMMMIDIA */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Payment ID:</span>
                      <span className="ml-2 font-mono text-gray-700">{pedido.payment_id || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">SMMMIDIA Order ID:</span>
                      <span className="ml-2 font-mono text-gray-700">
                        {pedido.smmmidia_order_id ? (
                          <span className="text-green-600 font-bold">{pedido.smmmidia_order_id}</span>
                        ) : (
                          <span className="text-gray-400">Não enviado</span>
                        )}
                      </span>
                    </div>
                    {pedido.error_message && (
                      <div className="col-span-2">
                        <span className="text-red-600 font-semibold">Erro:</span>
                        <span className="ml-2 text-red-700">{pedido.error_message}</span>
                      </div>
                    )}
                    <div className="col-span-2">
                      <span className="text-gray-500">Última atualização:</span>
                      <span className="ml-2 text-gray-700">
                        {formatDateBR(pedido.updated_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Aba de Pedidos
const PedidosTab = () => {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    
    try {
      const response = await paymentApi.getUserOrders();

      if (response.success && response.data) {
        // Filtrar apenas pedidos concluídos (pagos)
        const completedOrders = response.data.orders.filter((order: any) => order.status === 'completed');
        
        setPedidos(completedOrders);
      } else {
        
      }
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  };

  const getServiceName = (type: string) => {
    const names: any = {
      followers: 'Seguidores',
      likes: 'Curtidas',
      comments: 'Comentários',
      views: 'Visualizações'
    };
    return names[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Pedidos Confirmados</h3>
          <span className="text-sm text-gray-600">
            {pedidos.length} {pedidos.length === 1 ? 'pedido' : 'pedidos'}
          </span>
        </div>
        {pedidos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="font-semibold mb-1">Nenhum pedido confirmado</p>
            <p className="text-sm">Seus pedidos pagos aparecerão aqui</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pedidos.map((pedido) => (
              <div key={pedido.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl hover:shadow-md transition">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <h4 className="font-bold text-gray-900">{getServiceName(pedido.service_type)}</h4>
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-100 text-green-700">
                      ✓ Confirmado
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {pedido.quantity.toLocaleString()} unidades • @{pedido.instagram_username}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDateBR(pedido.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">R$ {parseFloat(pedido.price).toFixed(2)}</p>
                  <p className="text-xs text-green-600 font-semibold mt-1">Pago</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Aba de API
const ApiTab = () => {
  const [apiKey, setApiKey] = useState('Carregando...');
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApiKey();
  }, []);

  const loadApiKey = async () => {
    try {
      const response = await authApi.getProfile();
      if (response.success && response.data?.user?.apiKey) {
        setApiKey(response.data.user.apiKey);
      } else {
        setApiKey('Erro ao carregar API key');
      }
    } catch (error) {
      
      setApiKey('Erro ao carregar API key');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id?: string) => {
    navigator.clipboard.writeText(text);
    if (id) {
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const CodeBlock = ({ code, language, id }: { code: string; language: string; id: string }) => (
    <div className="relative">
      <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
        <span className="text-xs text-gray-400 uppercase bg-gray-800 px-2 py-1 rounded">{language}</span>
        <button
          onClick={() => copyToClipboard(code, id)}
          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
        >
          {copiedCode === id ? (
            <CheckCircle2 className="w-4 h-4 text-green-400" />
          ) : (
            <Target className="w-4 h-4 text-gray-300" />
          )}
        </button>
      </div>
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl">
      {/* API Key */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl p-6 text-white">
        <h3 className="font-bold text-xl mb-2">🔑 Sua Chave de API</h3>
        <p className="text-violet-100 mb-4 text-sm">
          Use esta chave para integrar nossos serviços em suas aplicações
        </p>
        {loading ? (
          <div className="flex items-center gap-2 text-white">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Carregando sua API key...</span>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={apiKey}
              readOnly
              className="flex-1 px-4 py-3 bg-white/10 backdrop-blur border border-white/20 rounded-xl font-mono text-sm text-white"
            />
            <button
              onClick={() => copyToClipboard(apiKey)}
              disabled={apiKey === 'Carregando...' || apiKey === 'Erro ao carregar API key'}
              className="px-6 py-3 bg-white text-violet-600 hover:bg-gray-100 font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {copied ? '✓ Copiado!' : 'Copiar'}
            </button>
          </div>
        )}
      </div>

      {/* Base URL */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="font-bold text-gray-900 text-lg mb-3">📡 Base URL</h3>
        <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm">
          https://painelsmm-two.vercel.app/api/v1
        </div>
      </div>

      {/* Autenticação */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="font-bold text-gray-900 text-lg mb-3">🔐 Autenticação</h3>
        <p className="text-gray-600 mb-4 text-sm">
          Todas as requisições requerem sua API Key no corpo da requisição:
        </p>
        <CodeBlock
          id="auth"
          language="json"
          code={`{
  "key": "${apiKey}"
}`}
        />
      </div>

      {/* Endpoints */}
      <div className="space-y-4">
        {/* Listar Serviços */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-lg font-semibold text-sm">
              POST
            </span>
            <h3 className="text-lg font-bold text-gray-900">Listar Serviços</h3>
          </div>
          <p className="text-gray-600 mb-4 text-sm">
            Lista todos os serviços disponíveis com preços e limites.
          </p>

          <h4 className="font-semibold text-gray-900 mb-2 text-sm">Request:</h4>
          <CodeBlock
            id="services-req"
            language="json"
            code={`{
  "key": "${apiKey}",
  "action": "services"
}`}
          />

          <h4 className="font-semibold text-gray-900 mt-4 mb-2 text-sm">Response:</h4>
          <CodeBlock
            id="services-res"
            language="json"
            code={`[
  {
    "service": "1",
    "name": "Instagram Seguidores Brasil",
    "rate": "0.15",
    "min": "100",
    "max": "10000"
  }
]`}
          />
        </div>

        {/* Criar Pedido */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg font-semibold text-sm">
              POST
            </span>
            <h3 className="text-lg font-bold text-gray-900">Criar Pedido</h3>
          </div>
          <p className="text-gray-600 mb-4 text-sm">
            Cria um novo pedido de serviço.
          </p>

          <h4 className="font-semibold text-gray-900 mb-2 text-sm">Request:</h4>
          <CodeBlock
            id="add-req"
            language="json"
            code={`{
  "key": "${apiKey}",
  "action": "add",
  "service": "1",
  "link": "https://instagram.com/usuario",
  "quantity": 1000
}`}
          />

          <h4 className="font-semibold text-gray-900 mt-4 mb-2 text-sm">Response:</h4>
          <CodeBlock
            id="add-res"
            language="json"
            code={`{
  "order": "84a10992-85b7-4394-ac67-9ca8ed6d97d9"
}`}
          />
        </div>

        {/* Verificar Status */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-lg font-semibold text-sm">
              POST
            </span>
            <h3 className="text-lg font-bold text-gray-900">Verificar Status</h3>
          </div>
          <p className="text-gray-600 mb-4 text-sm">
            Verifica o status de um pedido existente.
          </p>

          <h4 className="font-semibold text-gray-900 mb-2 text-sm">Request:</h4>
          <CodeBlock
            id="status-req"
            language="json"
            code={`{
  "key": "${apiKey}",
  "action": "status",
  "order": "84a10992-85b7-4394-ac67-9ca8ed6d97d9"
}`}
          />

          <h4 className="font-semibold text-gray-900 mt-4 mb-2 text-sm">Response:</h4>
          <CodeBlock
            id="status-res"
            language="json"
            code={`{
  "charge": "150.00",
  "status": "In progress",
  "remains": "500",
  "currency": "BRL"
}`}
          />
        </div>
      </div>

      {/* Exemplos de Código */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="font-bold text-gray-900 text-lg mb-4">💻 Exemplos de Código</h3>

        {/* cURL */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-900 mb-3">cURL</h4>
          <CodeBlock
            id="curl-example"
            language="bash"
            code={`curl -X POST https://painelsmm-two.vercel.app/api/v1 \\
  -H "Content-Type: application/json" \\
  -d '{
    "key": "${apiKey}",
    "action": "services"
  }'`}
          />
        </div>

        {/* JavaScript */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-900 mb-3">JavaScript</h4>
          <CodeBlock
            id="js-example"
            language="javascript"
            code={`const API_URL = 'https://painelsmm-two.vercel.app/api/v1';
const API_KEY = '${apiKey}';

async function listServices() {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      key: API_KEY,
      action: 'services'
    })
  });
  return await response.json();
}

const services = await listServices();
`}
          />
        </div>

        {/* PHP */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-900 mb-3">PHP</h4>
          <CodeBlock
            id="php-example"
            language="php"
            code={`<?php
$API_URL = 'https://painelsmm-two.vercel.app/api/v1';
$API_KEY = '${apiKey}';

$data = [
    'key' => $API_KEY,
    'action' => 'services'
];

$ch = curl_init($API_URL);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

$response = curl_exec($ch);
curl_close($ch);

$services = json_decode($response, true);
print_r($services);
?>`}
          />
        </div>

        {/* Python */}
        <div>
          <h4 className="text-md font-semibold text-gray-900 mb-3">Python</h4>
          <CodeBlock
            id="python-example"
            language="python"
            code={`import requests

API_URL = 'https://painelsmm-two.vercel.app/api/v1'
API_KEY = '${apiKey}'

response = requests.post(
    API_URL,
    json={
        'key': API_KEY,
        'action': 'services'
    }
)

services = response.json()
print(services)`}
          />
        </div>
      </div>

      {/* Códigos de Erro */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="font-bold text-gray-900 text-lg mb-4">⚠️ Códigos de Erro</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Código</th>
                <th className="px-4 py-2 text-left font-semibold">Mensagem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-2 font-mono">401</td>
                <td className="px-4 py-2">API key inválida</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono">400</td>
                <td className="px-4 py-2">Parâmetros inválidos</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono">404</td>
                <td className="px-4 py-2">Pedido não encontrado</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono">500</td>
                <td className="px-4 py-2">Erro interno do servidor</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Limites */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="font-bold text-gray-900 text-lg mb-4">📊 Limites</h3>
        <ul className="space-y-2 text-gray-600 text-sm">
          <li>• <strong>Requisições:</strong> 100 por minuto</li>
          <li>• <strong>Pedidos simultâneos:</strong> 10</li>
          <li>• <strong>Timeout:</strong> 30 segundos</li>
        </ul>
      </div>
    </div>
  );
};

// Aba de Perfil
const PerfilTab = ({ user }: { user: any }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="font-bold text-gray-900 mb-4">Informações da Conta</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Nome</label>
            <input
              type="text"
              defaultValue={user?.name}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              defaultValue={user?.email}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
            />
          </div>
          <button className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition">
            Salvar Alterações
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="font-bold text-gray-900 mb-4">Alterar Senha</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Senha Atual</label>
            <input
              type="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Nova Senha</label>
            <input
              type="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
            />
          </div>
          <button className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition">
            Alterar Senha
          </button>
        </div>
      </div>
    </div>
  );
};

