import React, { useState, useEffect } from 'react';
import {
  Package,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Users,
  TrendingUp,
  RefreshCw,
  Send,
  AlertCircle,
  Eye,
  Filter,
  Search,
  Calendar,
  Download
} from 'lucide-react';
import { adminApi } from '../services/api';
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

interface Order {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  service_type: string;
  package_id: string;
  quantity: number;
  price: number;
  instagram_username: string;
  post_url: string | null;
  status: string;
  payment_status: string;
  payment_id: string;
  smmmidia_order_id: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

interface Stats {
  totalOrders: number;
  ordersByStatus: {
    pending: number;
    completed: number;
    processing: number;
    delivered: number;
    cancelled: number;
  };
  totalRevenue: number;
  todayOrders: number;
  totalUsers: number;
}

const AdminPanel: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [orderToApprove, setOrderToApprove] = useState<string | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultData, setResultData] = useState<{
    success: boolean;
    title: string;
    message: string;
    details?: any;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersRes, statsRes] = await Promise.all([
        adminApi.getAllOrders(),
        adminApi.getStats()
      ]);

      if (ordersRes.success) {
        setOrders(ordersRes.data.orders);
      }

      if (statsRes.success) {
        setStats(statsRes.data);
      }
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  };

  const handleApproveOrder = async (orderId: string) => {
    setOrderToApprove(orderId);
    setShowApproveModal(true);
  };

  const confirmApproveOrder = async () => {
    if (!orderToApprove) return;

    try {
      setActionLoading(orderToApprove);
      setShowApproveModal(false);
      const response = await adminApi.approveOrder(orderToApprove);

      if (response.success) {
        // Mostrar modal de sucesso
        const smmmidiaData = response.data;
        setResultData({
          success: true,
          title: '✅ Pedido Enviado com Sucesso!',
          message: 'O pedido foi aprovado e enviado ao fornecedor.',
          details: {
            'ID Local': smmmidiaData.orderId,
            'ID SMMMIDIA': smmmidiaData.smmmidiaOrderId,
            'Resposta do Fornecedor': JSON.stringify(smmmidiaData.smmmidiaResponse || smmmidiaData, null, 2)
          }
        });
        setShowResultModal(true);
        loadData();
      } else {
        // Mostrar modal de erro
        setResultData({
          success: false,
          title: '❌ Erro ao Aprovar Pedido',
          message: response.message || 'Erro ao enviar para o fornecedor',
          details: {
            ...(response.error && { 'Erro Específico': response.error }),
            ...(response.apiResponse && { 'Resposta da API SMMMIDIA': JSON.stringify(response.apiResponse, null, 2) }),
            ...(response.details && {
              'API Configurada': response.details.apiConfigured ? 'Sim ✅' : 'Não ❌',
              'API URL': response.details.apiUrl,
              'Serviço': response.details.serviceType,
              'Service ID': response.details.serviceId,
              'Link': response.details.link,
              'Quantidade': response.details.quantity
            })
          }
        });
        setShowResultModal(true);
      }
    } catch (error: any) {
      // Tentar pegar detalhes da resposta
      const response = error.response || {};
      
      setResultData({
        success: false,
        title: '❌ Erro ao Aprovar Pedido',
        message: error.message || 'Erro desconhecido',
        details: {
          ...(response.error && { 'Erro Específico': response.error }),
          ...(response.apiResponse && { 'Resposta da API SMMMIDIA': JSON.stringify(response.apiResponse, null, 2) }),
          ...(response.details && {
            'API Configurada': response.details.apiConfigured ? 'Sim ✅' : 'Não ❌',
            'API URL': response.details.apiUrl,
            'Serviço': response.details.serviceType,
            'Service ID': response.details.serviceId,
            'Link': response.details.link,
            'Quantidade': response.details.quantity
          })
        }
      });
      setShowResultModal(true);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    const reason = prompt('Motivo do cancelamento:');
    if (!reason) return;

    try {
      setActionLoading(orderId);
      const response = await adminApi.cancelOrder(orderId, reason);

      if (response.success) {
        showInfo('Pedido cancelado com sucesso!');
        loadData();
      } else {
        showError(`Erro: ${response.message}`);
      }
    } catch (error: any) {
      alert(`Erro ao cancelar pedido: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; icon: any }> = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      completed: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      processing: { bg: 'bg-blue-100', text: 'text-blue-800', icon: RefreshCw },
      delivered: { bg: 'bg-purple-100', text: 'text-purple-800', icon: Package },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        {status.toUpperCase()}
      </span>
    );
  };

  const getServiceName = (type: string) => {
    const names: Record<string, string> = {
      followers: 'Seguidores',
      likes: 'Curtidas',
      comments: 'Comentários',
      views: 'Visualizações'
    };
    return names[type] || type;
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = 
      order.instagram_username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-violet-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando painel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
              <p className="text-gray-600 mt-1">Gerencie todas as compras e pedidos</p>
            </div>
            <button
              onClick={loadData}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Pedidos</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalOrders}</p>
                </div>
                <Package className="w-10 h-10 text-violet-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Receita Total</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    R$ {stats.totalRevenue.toFixed(2)}
                  </p>
                </div>
                <DollarSign className="w-10 h-10 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pedidos Hoje</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.todayOrders}</p>
                </div>
                <Calendar className="w-10 h-10 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Usuários</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalUsers}</p>
                </div>
                <Users className="w-10 h-10 text-purple-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pendentes</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.ordersByStatus.completed || 0}
                  </p>
                </div>
                <Clock className="w-10 h-10 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por Instagram, email ou ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              >
                <option value="all">Todos os Status</option>
                <option value="pending">Pendente</option>
                <option value="completed">Pago</option>
                <option value="processing">Processando</option>
                <option value="delivered">Entregue</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pedido
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Serviço
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Instagram
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      Nenhum pedido encontrado
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          #{order.id.substring(0, 8)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.payment_id?.startsWith('api_') ? (
                            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-semibold">
                              VIA API
                            </span>
                          ) : order.payment_id?.startsWith('balance_') ? (
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
                              SALDO
                            </span>
                          ) : order.payment_id ? (
                            `MP: ${order.payment_id}`
                          ) : (
                            'Sem pagamento'
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{order.user_name}</div>
                        <div className="text-xs text-gray-500">{order.user_email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{getServiceName(order.service_type)}</div>
                        <div className="text-xs text-gray-500">{order.quantity} unidades</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">@{order.instagram_username}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          R$ {order.price.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateBR(order.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {order.status === 'completed' && !order.smmmidia_order_id && (
                            <button
                              onClick={() => handleApproveOrder(order.id)}
                              disabled={actionLoading === order.id}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                              title="Enviar pedido para o fornecedor"
                            >
                              {actionLoading === order.id ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <Send className="w-4 h-4" />
                              )}
                              Enviar
                            </button>
                          )}
                          {order.status !== 'cancelled' && (
                            <button
                              onClick={() => handleCancelOrder(order.id)}
                              disabled={actionLoading === order.id}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                              title="Cancelar pedido"
                            >
                              <XCircle className="w-4 h-4" />
                              Cancelar
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                            title="Ver detalhes completos"
                          >
                            <Eye className="w-4 h-4" />
                            Ver
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Detalhes do Pedido</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">ID do Pedido</p>
                  <p className="font-medium text-gray-900">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cliente</p>
                  <p className="font-medium text-gray-900">{selectedOrder.user_name}</p>
                  <p className="text-sm text-gray-500">{selectedOrder.user_email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Serviço</p>
                  <p className="font-medium text-gray-900">{getServiceName(selectedOrder.service_type)}</p>
                  <p className="text-sm text-gray-500">{selectedOrder.quantity} unidades</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Instagram</p>
                  <p className="font-medium text-gray-900">@{selectedOrder.instagram_username}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Valor</p>
                  <p className="font-medium text-gray-900">R$ {selectedOrder.price.toFixed(2)}</p>
                </div>
                {selectedOrder.post_url && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Link da Publicação</p>
                    <a
                      href={selectedOrder.post_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-600 hover:underline break-all"
                    >
                      {selectedOrder.post_url}
                    </a>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Data de Criação</p>
                  <p className="font-medium text-gray-900">
                    {formatDateBR(selectedOrder.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Última Atualização</p>
                  <p className="font-medium text-gray-900">
                    {formatDateBR(selectedOrder.updated_at)}
                  </p>
                </div>
                {selectedOrder.payment_id && (
                  <div>
                    <p className="text-sm text-gray-600">Forma de Pagamento</p>
                    <p className="font-medium text-gray-900">
                      {selectedOrder.payment_id.startsWith('api_') ? (
                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold">
                          🔌 VIA API
                        </span>
                      ) : selectedOrder.payment_id.startsWith('balance_') ? (
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">
                          💰 SALDO
                        </span>
                      ) : (
                        <>
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                            💳 PIX
                          </span>
                          <span className="block text-xs text-gray-500 mt-1">ID: {selectedOrder.payment_id}</span>
                        </>
                      )}
                    </p>
                  </div>
                )}
                {selectedOrder.smmmidia_order_id && (
                  <div>
                    <p className="text-sm text-gray-600">ID SMMMIDIA</p>
                    <p className="font-medium text-gray-900">{selectedOrder.smmmidia_order_id}</p>
                  </div>
                )}
                {selectedOrder.error_message && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Mensagem de Erro</p>
                    <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">{selectedOrder.error_message}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Aprovação */}
      {showApproveModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div onClick={() => setShowApproveModal(false)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Aprovar Pedido
              </h3>
              
              <p className="text-gray-600 mb-6">
                Tem certeza que deseja aprovar e enviar este pedido ao fornecedor?
              </p>
              
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowApproveModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmApproveOrder}
                  className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition"
                >
                  Aprovar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Resultado (Sucesso ou Erro) */}
      {showResultModal && resultData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div onClick={() => setShowResultModal(false)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className={`p-6 border-b ${resultData.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${resultData.success ? 'bg-green-100' : 'bg-red-100'}`}>
                    {resultData.success ? (
                      <CheckCircle className={`h-6 w-6 ${resultData.success ? 'text-green-600' : 'text-red-600'}`} />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-red-600" />
                    )}
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${resultData.success ? 'text-green-900' : 'text-red-900'}`}>
                      {resultData.title}
                    </h3>
                    <p className={`text-sm ${resultData.success ? 'text-green-700' : 'text-red-700'}`}>
                      {resultData.message}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowResultModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Body com Detalhes */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {resultData.details && Object.keys(resultData.details).length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 text-lg mb-3">📋 Detalhes:</h4>
                  {Object.entries(resultData.details).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-sm font-semibold text-gray-700 mb-2">{key}:</p>
                      <div className="bg-white rounded p-3 border border-gray-300">
                        <pre className="text-xs text-gray-800 whitespace-pre-wrap break-all font-mono">
                          {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowResultModal(false)}
                className={`w-full px-4 py-3 ${resultData.success ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white font-semibold rounded-xl transition`}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
