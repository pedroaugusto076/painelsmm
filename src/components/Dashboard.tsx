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
  Settings
} from 'lucide-react';
import { authApi, paymentApi } from '../services/api';

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

// Dashboard Component com Sidebar
export const Dashboard: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [user, setUser] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState('servicos');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const userData = authApi.getCurrentUser();
    setUser(userData);
  }, []);

  const handleLogout = () => {
    authApi.logout();
    localStorage.removeItem('keepLoggedIn');
    onNavigate('home');
  };

  const menuItems = [
    { id: 'servicos', name: 'Serviços', icon: Package },
    { id: 'pedidos', name: 'Meus Pedidos', icon: ShoppingCart },
    { id: 'admin', name: 'Admin/Logs', icon: Settings },
    { id: 'api', name: 'API', icon: Target },
    { id: 'perfil', name: 'Perfil', icon: User },
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
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="h-6 w-6 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">
            {menuItems.find(item => item.id === currentTab)?.name}
          </h1>
          <div className="w-10" /> {/* Spacer */}
        </header>

        {/* Content Area - Rolável */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {currentTab === 'servicos' && <ServicosTab />}
          {currentTab === 'pedidos' && <PedidosTab />}
          {currentTab === 'admin' && <AdminTab />}
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

  const services = [
    {
      id: 'followers',
      name: 'Seguidores',
      icon: Users,
      color: 'from-violet-500 to-pink-500',
      description: 'Aumente seus seguidores com perfis reais e ativos',
      packages: [
        { id: '100', qty: 100, price: 0.01, originalPrice: null, discount: null, bonus: false },
        { id: '500', qty: 500, price: 75, originalPrice: null, discount: null, bonus: false },
        { id: '1000', qty: 1000, price: 150, originalPrice: null, discount: null, bonus: false },
        { id: '2500', qty: 2500, price: 337.5, originalPrice: 375, discount: 10, bonus: true },
        { id: '5000', qty: 5000, price: 594, originalPrice: 742.5, discount: 20, bonus: true },
        { id: '10000', qty: 10000, price: 1039.5, originalPrice: 1485, discount: 30, bonus: true },
      ]
    },
    {
      id: 'likes',
      name: 'Curtidas',
      icon: ThumbsUp,
      color: 'from-red-500 to-orange-500',
      description: 'Mais curtidas para suas publicações',
      packages: [
        { id: '100', qty: 100, price: 12, originalPrice: null, discount: null, bonus: false },
        { id: '500', qty: 500, price: 55, originalPrice: null, discount: null, bonus: false },
        { id: '1000', qty: 1000, price: 100, originalPrice: null, discount: null, bonus: false },
        { id: '2500', qty: 2500, price: 225, originalPrice: 250, discount: 10, bonus: true },
        { id: '5000', qty: 5000, price: 380, originalPrice: 475, discount: 20, bonus: true },
        { id: '10000', qty: 10000, price: 630, originalPrice: 900, discount: 30, bonus: true },
      ]
    },
    {
      id: 'comments',
      name: 'Comentários',
      icon: MessageCircle,
      color: 'from-blue-500 to-cyan-500',
      description: 'Comentários reais e engajados',
      packages: [
        { id: '10', qty: 10, price: 20, originalPrice: null, discount: null, bonus: false },
        { id: '25', qty: 25, price: 45, originalPrice: null, discount: null, bonus: false },
        { id: '50', qty: 50, price: 85, originalPrice: null, discount: null, bonus: false },
        { id: '100', qty: 100, price: 153, originalPrice: 170, discount: 10, bonus: true },
        { id: '200', qty: 200, price: 256, originalPrice: 320, discount: 20, bonus: true },
        { id: '500', qty: 500, price: 525, originalPrice: 750, discount: 30, bonus: true },
      ]
    },
    {
      id: 'views',
      name: 'Visualizações',
      icon: PlayCircle,
      color: 'from-green-500 to-emerald-500',
      description: 'Aumente as visualizações dos seus vídeos',
      packages: [
        { id: '1000', qty: 1000, price: 10, originalPrice: null, discount: null, bonus: false },
        { id: '5000', qty: 5000, price: 45, originalPrice: null, discount: null, bonus: false },
        { id: '10000', qty: 10000, price: 85, originalPrice: null, discount: null, bonus: false },
        { id: '25000', qty: 25000, price: 189, originalPrice: 210, discount: 10, bonus: true },
        { id: '50000', qty: 50000, price: 320, originalPrice: 400, discount: 20, bonus: true },
        { id: '100000', qty: 100000, price: 525, originalPrice: 750, discount: 30, bonus: true },
      ]
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Criar pagamento PIX
      const response = await paymentApi.createPayment({
        serviceType: selectedService,
        packageId: selectedPackage,
        quantity: currentPackage!.qty,
        price: currentPackage!.price,
        instagramUsername: instagramUsername.replace('@', ''),
        postUrl: postUrl || undefined
      });

      if (response.success && response.data) {
        // Mostrar modal com QR Code PIX
        setPixData(response.data);
        setShowPixModal(true);
      }
    } catch (error: any) {
      alert(error.message || 'Erro ao gerar PIX. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const currentService = services.find(s => s.id === selectedService);
  const currentPackage = currentService?.packages.find(p => p.id === selectedPackage);

  const copyPixCode = () => {
    if (pixData?.pixQrCode) {
      navigator.clipboard.writeText(pixData.pixQrCode);
      alert('Código PIX copiado!');
    }
  };

  const closePixModal = () => {
    setShowPixModal(false);
    setPixData(null);
    setSelectedService('followers');
    setSelectedPackage('');
    setInstagramUsername('');
    setPostUrl('');
  };

  return (
    <div className="space-y-6">
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
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              className={`text-left bg-white rounded-2xl p-6 transition-all border-2 ${
                isSelected
                  ? 'border-violet-500 shadow-lg scale-105'
                  : 'border-gray-100 hover:border-violet-200 hover:shadow-md'
              }`}
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4`}>
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
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentService?.color} flex items-center justify-center`}>
              {currentService && <currentService.icon className="h-6 w-6 text-white" />}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {currentService?.name}
              </h2>
              <p className="text-sm text-gray-600">Selecione o pacote desejado</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seleção de Pacotes */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Escolha o Pacote
              </label>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {currentService?.packages.map((pkg) => {
                  // Definir cor do badge baseado no desconto
                  const badgeColor = pkg.discount === 10 
                    ? 'from-green-400 to-emerald-400' 
                    : pkg.discount === 20 
                    ? 'from-green-500 to-emerald-500' 
                    : pkg.discount === 30 
                    ? 'from-green-600 to-emerald-600' 
                    : '';
                  
                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => setSelectedPackage(pkg.id)}
                      className={`p-4 rounded-xl border-2 transition-all text-left relative ${
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
                      
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-2xl font-bold text-gray-900">
                          {pkg.qty >= 1000 ? `${pkg.qty / 1000}k` : pkg.qty}
                        </span>
                        {selectedPackage === pkg.id && (
                          <CheckCircle2 className="h-5 w-5 text-violet-600" />
                        )}
                      </div>
                      
                      {/* Quantidade + Bônus */}
                      <div className="text-sm text-gray-600 mb-1">
                        {pkg.qty.toLocaleString()} {currentService.name.toLowerCase()}
                        {pkg.bonus && (
                          <span className="block text-xs font-bold text-orange-600 mt-0.5">
                            + {currentService.name} adicionais de brinde! 🎁
                          </span>
                        )}
                      </div>
                      
                      {/* Preço com desconto */}
                      {pkg.originalPrice ? (
                        <div>
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
                        <div className="text-lg font-bold text-violet-600">
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
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadOrders();
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
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg transition flex items-center gap-2 disabled:opacity-50"
          >
            <Loader2 className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
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
                      {new Date(pedido.created_at).toLocaleDateString('pt-BR')}
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
                        {new Date(pedido.updated_at).toLocaleString('pt-BR')}
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
        setPedidos(response.data.orders);
      }
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'processing': return 'Processando';
      case 'pending': return 'Pendente';
      case 'cancelled': return 'Cancelado';
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
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="font-bold text-gray-900 mb-4">Histórico de Pedidos</h3>
        {pedidos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Você ainda não fez nenhum pedido</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pedidos.map((pedido) => (
              <div key={pedido.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-bold text-gray-900">{getServiceName(pedido.service_type)}</h4>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${getStatusColor(pedido.status)}`}>
                      {getStatusText(pedido.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {pedido.quantity.toLocaleString()} unidades • @{pedido.instagram_username}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(pedido.created_at).toLocaleDateString('pt-BR')} às {new Date(pedido.created_at).toLocaleTimeString('pt-BR')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-violet-600">R$ {parseFloat(pedido.price).toFixed(2)}</p>
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
  const [apiKey] = useState('sk_test_1234567890abcdef');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="font-bold text-gray-900 mb-4">Sua Chave de API</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={apiKey}
            readOnly
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl font-mono text-sm"
          />
          <button
            onClick={copyToClipboard}
            className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition"
          >
            {copied ? 'Copiado!' : 'Copiar'}
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Use esta chave para integrar nossos serviços em suas aplicações
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="font-bold text-gray-900 mb-4">Documentação da API</h3>
        <p className="text-gray-600 mb-4">
          Acesse nossa documentação completa para integrar os serviços SMM em sua aplicação.
        </p>
        <button className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition">
          Ver Documentação
        </button>
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

