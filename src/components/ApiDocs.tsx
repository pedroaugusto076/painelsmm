import React, { useState } from 'react';
import { Code, Copy, Check, Book, Zap, Shield, Globe } from 'lucide-react';

const ApiDocs: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const CodeBlock = ({ code, language, id }: { code: string; language: string; id: string }) => (
    <div className="relative">
      <div className="absolute top-2 right-2 flex items-center gap-2">
        <span className="text-xs text-gray-400 uppercase">{language}</span>
        <button
          onClick={() => copyToClipboard(code, id)}
          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
        >
          {copiedCode === id ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-gray-300" />
          )}
        </button>
      </div>
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-3 mb-4">
            <Book className="w-12 h-12" />
            <h1 className="text-4xl font-bold">Documentação da API</h1>
          </div>
          <p className="text-xl text-violet-100">
            API REST para integração com painéis SMM. Compatível com o formato SMMMIDIA.
          </p>
          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              <span>Rápida e Confiável</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span>Segura</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              <span>RESTful</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Base URL */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Base URL</h2>
          <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm">
            https://painelsmm-two.vercel.app/api/v1
          </div>
        </div>

        {/* Autenticação */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🔑 Autenticação</h2>
          <p className="text-gray-600 mb-4">
            Todas as requisições requerem uma <strong>API Key</strong> válida no corpo da requisição:
          </p>
          <CodeBlock
            id="auth"
            language="json"
            code={`{
  "key": "sua-api-key-aqui"
}`}
          />
        </div>

        {/* Endpoints */}
        <div className="space-y-8">
          {/* Listar Serviços */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-lg font-semibold text-sm">
                POST
              </span>
              <h3 className="text-xl font-bold text-gray-900">Listar Serviços</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Lista todos os serviços disponíveis com preços e limites.
            </p>

            <h4 className="font-semibold text-gray-900 mb-2">Request:</h4>
            <CodeBlock
              id="services-req"
              language="json"
              code={`{
  "key": "sua-api-key",
  "action": "services"
}`}
            />

            <h4 className="font-semibold text-gray-900 mt-4 mb-2">Response:</h4>
            <CodeBlock
              id="services-res"
              language="json"
              code={`[
  {
    "service": "1",
    "name": "Instagram Seguidores Brasil",
    "type": "Default",
    "category": "Instagram",
    "rate": "0.15",
    "min": "100",
    "max": "10000",
    "description": "Seguidores brasileiros reais e ativos"
  },
  {
    "service": "2",
    "name": "Instagram Curtidas Brasil",
    "type": "Default",
    "category": "Instagram",
    "rate": "0.12",
    "min": "100",
    "max": "10000",
    "description": "Curtidas de perfis brasileiros"
  }
]`}
            />
          </div>

          {/* Criar Pedido */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg font-semibold text-sm">
                POST
              </span>
              <h3 className="text-xl font-bold text-gray-900">Criar Pedido</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Cria um novo pedido de serviço.
            </p>

            <h4 className="font-semibold text-gray-900 mb-2">Request:</h4>
            <CodeBlock
              id="add-req"
              language="json"
              code={`{
  "key": "sua-api-key",
  "action": "add",
  "service": "1",
  "link": "https://instagram.com/usuario",
  "quantity": 1000
}

// Para comentários personalizados (service: "3"):
{
  "key": "sua-api-key",
  "action": "add",
  "service": "3",
  "link": "https://instagram.com/p/ABC123",
  "quantity": 10,
  "comments": "Adorei esse conteúdo!"
}`}
            />

            <h4 className="font-semibold text-gray-900 mt-4 mb-2">Parâmetros:</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">Parâmetro</th>
                    <th className="px-4 py-2 text-left font-semibold">Tipo</th>
                    <th className="px-4 py-2 text-left font-semibold">Obrigatório</th>
                    <th className="px-4 py-2 text-left font-semibold">Descrição</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-2 font-mono text-xs">key</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">✅ Sim</td>
                    <td className="px-4 py-2">Sua API key</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-mono text-xs">action</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">✅ Sim</td>
                    <td className="px-4 py-2">Deve ser "add"</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-mono text-xs">service</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">✅ Sim</td>
                    <td className="px-4 py-2">ID do serviço</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-mono text-xs">link</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">✅ Sim</td>
                    <td className="px-4 py-2">Link do perfil ou post</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-mono text-xs">quantity</td>
                    <td className="px-4 py-2">number</td>
                    <td className="px-4 py-2">✅ Sim</td>
                    <td className="px-4 py-2">Quantidade desejada</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-mono text-xs">comments</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">⚠️ Serviço 3</td>
                    <td className="px-4 py-2">Texto do comentário (obrigatório para comentários personalizados)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h4 className="font-semibold text-gray-900 mt-4 mb-2">Response (Sucesso):</h4>
            <CodeBlock
              id="add-res-success"
              language="json"
              code={`{
  "order": "84a10992-85b7-4394-ac67-9ca8ed6d97d9"
}`}
            />

            <h4 className="font-semibold text-gray-900 mt-4 mb-2">Response (Erro):</h4>
            <CodeBlock
              id="add-res-error"
              language="json"
              code={`{
  "error": "Invalid service ID"
}`}
            />
          </div>

          {/* Verificar Status */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-lg font-semibold text-sm">
                POST
              </span>
              <h3 className="text-xl font-bold text-gray-900">Verificar Status</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Verifica o status de um pedido existente.
            </p>

            <h4 className="font-semibold text-gray-900 mb-2">Request:</h4>
            <CodeBlock
              id="status-req"
              language="json"
              code={`{
  "key": "sua-api-key",
  "action": "status",
  "order": "84a10992-85b7-4394-ac67-9ca8ed6d97d9"
}`}
            />

            <h4 className="font-semibold text-gray-900 mt-4 mb-2">Response:</h4>
            <CodeBlock
              id="status-res"
              language="json"
              code={`{
  "charge": "150.00",
  "start_count": "0",
  "status": "In progress",
  "remains": "500",
  "currency": "BRL"
}`}
            />

            <h4 className="font-semibold text-gray-900 mt-4 mb-2">Status possíveis:</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li><code className="bg-gray-100 px-2 py-1 rounded">Pending</code> - Aguardando processamento</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded">In progress</code> - Em andamento</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded">Completed</code> - Concluído</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded">Canceled</code> - Cancelado</li>
            </ul>
          </div>

          {/* Verificar Saldo */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg font-semibold text-sm">
                POST
              </span>
              <h3 className="text-xl font-bold text-gray-900">Verificar Saldo</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Verifica o saldo disponível na conta.
            </p>

            <h4 className="font-semibold text-gray-900 mb-2">Request:</h4>
            <CodeBlock
              id="balance-req"
              language="json"
              code={`{
  "key": "sua-api-key",
  "action": "balance"
}`}
            />

            <h4 className="font-semibold text-gray-900 mt-4 mb-2">Response:</h4>
            <CodeBlock
              id="balance-res"
              language="json"
              code={`{
  "balance": "999999.99",
  "currency": "BRL"
}`}
            />
          </div>
        </div>

        {/* Exemplos de Código */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">💻 Exemplos de Código</h2>

          {/* cURL */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">cURL</h3>
            <CodeBlock
              id="curl-example"
              language="bash"
              code={`# Listar serviços
curl -X POST https://painelsmm-two.vercel.app/api/v1 \\
  -H "Content-Type: application/json" \\
  -d '{
    "key": "sua-api-key",
    "action": "services"
  }'

# Criar pedido
curl -X POST https://painelsmm-two.vercel.app/api/v1 \\
  -H "Content-Type: application/json" \\
  -d '{
    "key": "sua-api-key",
    "action": "add",
    "service": "1",
    "link": "https://instagram.com/usuario",
    "quantity": 1000
  }'`}
            />
          </div>

          {/* JavaScript */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">JavaScript / Node.js</h3>
            <CodeBlock
              id="js-example"
              language="javascript"
              code={`const API_URL = 'https://painelsmm-two.vercel.app/api/v1';
const API_KEY = 'sua-api-key';

// Listar serviços
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

// Criar pedido
async function createOrder(serviceId, link, quantity) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      key: API_KEY,
      action: 'add',
      service: serviceId,
      link: link,
      quantity: quantity
    })
  });
  return await response.json();
}

// Uso
const services = await listServices();
console.log(services);`}
            />
          </div>

          {/* PHP */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">PHP</h3>
            <CodeBlock
              id="php-example"
              language="php"
              code={`<?php

$API_URL = 'https://painelsmm-two.vercel.app/api/v1';
$API_KEY = 'sua-api-key';

// Listar serviços
function listServices($apiUrl, $apiKey) {
    $data = [
        'key' => $apiKey,
        'action' => 'services'
    ];
    
    $ch = curl_init($apiUrl);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    return json_decode($response, true);
}

$services = listServices($API_URL, $API_KEY);
print_r($services);

?>`}
            />
          </div>

          {/* Python */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Python</h3>
            <CodeBlock
              id="python-example"
              language="python"
              code={`import requests

API_URL = 'https://painelsmm-two.vercel.app/api/v1'
API_KEY = 'sua-api-key'

# Listar serviços
def list_services():
    response = requests.post(
        API_URL,
        json={
            'key': API_KEY,
            'action': 'services'
        }
    )
    return response.json()

# Criar pedido
def create_order(service_id, link, quantity):
    response = requests.post(
        API_URL,
        json={
            'key': API_KEY,
            'action': 'add',
            'service': service_id,
            'link': link,
            'quantity': quantity
        }
    )
    return response.json()

# Uso
services = list_services()
print(services)`}
            />
          </div>
        </div>

        {/* Códigos de Erro */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">⚠️ Códigos de Erro</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold">Código</th>
                  <th className="px-4 py-2 text-left font-semibold">Mensagem</th>
                  <th className="px-4 py-2 text-left font-semibold">Descrição</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-2 font-mono">401</td>
                  <td className="px-4 py-2">API key is required</td>
                  <td className="px-4 py-2">API key não fornecida</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono">401</td>
                  <td className="px-4 py-2">Invalid API key</td>
                  <td className="px-4 py-2">API key inválida</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono">400</td>
                  <td className="px-4 py-2">Invalid action</td>
                  <td className="px-4 py-2">Ação não reconhecida</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono">400</td>
                  <td className="px-4 py-2">Service ID is required</td>
                  <td className="px-4 py-2">ID do serviço não fornecido</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono">404</td>
                  <td className="px-4 py-2">Order not found</td>
                  <td className="px-4 py-2">Pedido não encontrado</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono">405</td>
                  <td className="px-4 py-2">Method not allowed</td>
                  <td className="px-4 py-2">Use POST</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono">500</td>
                  <td className="px-4 py-2">Internal server error</td>
                  <td className="px-4 py-2">Erro interno do servidor</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Limites */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">📊 Limites</h2>
          <ul className="space-y-2 text-gray-600">
            <li>• <strong>Requisições:</strong> 100 por minuto</li>
            <li>• <strong>Pedidos simultâneos:</strong> 10</li>
            <li>• <strong>Quantidade mínima:</strong> Varia por serviço (veja /services)</li>
            <li>• <strong>Quantidade máxima:</strong> Varia por serviço (veja /services)</li>
          </ul>
        </div>

        {/* Segurança */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🔒 Segurança</h2>
          <ul className="space-y-2 text-gray-600">
            <li>✅ Todas as requisições devem usar HTTPS</li>
            <li>✅ API key deve ser mantida em segredo</li>
            <li>✅ Não compartilhe sua API key publicamente</li>
            <li>✅ Rate limiting: 100 requisições por minuto</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ApiDocs;
