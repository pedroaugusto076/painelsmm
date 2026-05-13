import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Configuração do pool de conexões PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'painelsmm',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20, // Máximo de conexões no pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Eventos do pool (apenas erros)
pool.on('error', (err) => {
  console.error('❌ Erro no pool de conexões:', err);
  process.exit(-1);
});

// Função para executar queries
export const query = async (text, params) => {
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (error) {
    console.error('❌ Erro na query:', error.message);
    throw error;
  }
};

// Função para obter um cliente do pool (para transações)
export const getClient = async () => {
  const client = await pool.connect();
  const release = client.release.bind(client);
  
  // Timeout para liberar o cliente
  const timeout = setTimeout(() => {
    console.error('❌ Cliente não foi liberado após 5 segundos!');
    release();
  }, 5000);
  
  client.release = () => {
    clearTimeout(timeout);
    release();
  };
  
  return client;
};

export default pool;
