import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Caminho do banco de dados SQLite
const DB_PATH = join(__dirname, '..', 'database.sqlite');

// Criar conexão com SQLite
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Erro ao conectar ao SQLite:', err.message);
  } else {
    console.log('✅ Conectado ao SQLite');
    initializeDatabase();
  }
});

// Habilitar foreign keys
db.run('PRAGMA foreign_keys = ON');

// Função para executar queries (compatível com PostgreSQL)
export const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    // Converter sintaxe PostgreSQL ($1, $2) para SQLite (?, ?)
    const sqliteSql = sql.replace(/\$(\d+)/g, '?');
    
    // Reordenar parâmetros se necessário (PostgreSQL usa $1, $2, SQLite usa ordem)
    const orderedParams = [];
    const matches = [...sql.matchAll(/\$(\d+)/g)];
    if (matches.length > 0) {
      matches.forEach(match => {
        const index = parseInt(match[1]) - 1;
        orderedParams.push(params[index]);
      });
    } else {
      orderedParams.push(...params);
    }

    // Detectar tipo de query
    const isSelect = sqliteSql.trim().toUpperCase().startsWith('SELECT');
    const isInsertOrUpdate = sqliteSql.trim().toUpperCase().match(/^(INSERT|UPDATE|DELETE)/);

    if (isSelect) {
      db.all(sqliteSql, orderedParams, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve({ rows: rows || [] });
        }
      });
    } else if (isInsertOrUpdate) {
      db.run(sqliteSql, orderedParams, function(err) {
        if (err) {
          reject(err);
        } else {
          // Para INSERT com RETURNING, precisamos buscar o último registro
          if (sqliteSql.toUpperCase().includes('RETURNING')) {
            const tableName = sqliteSql.match(/INTO\s+(\w+)/i)?.[1];
            if (tableName) {
              db.get(`SELECT * FROM ${tableName} WHERE rowid = ?`, [this.lastID], (err, row) => {
                if (err) {
                  reject(err);
                } else {
                  resolve({ rows: row ? [row] : [] });
                }
              });
            } else {
              resolve({ rows: [] });
            }
          } else {
            resolve({ rows: [], rowCount: this.changes });
          }
        }
      });
    } else {
      db.run(sqliteSql, orderedParams, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ rows: [], rowCount: this.changes });
        }
      });
    }
  });
};

// Inicializar banco de dados com tabelas
function initializeDatabase() {
  const tables = `
    -- Tabela de usuários
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      email_verified INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME
    );

    -- Tabela de redefinição de senha
    CREATE TABLE IF NOT EXISTS password_resets (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      user_id TEXT NOT NULL UNIQUE,
      token_hash TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Tabela de tentativas de autenticação
    CREATE TABLE IF NOT EXISTS auth_attempts (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      ip_address TEXT NOT NULL,
      email TEXT,
      user_id TEXT,
      attempt_type TEXT NOT NULL,
      success INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Tabela de pedidos
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      user_id TEXT NOT NULL,
      service_type TEXT NOT NULL,
      package_id TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      instagram_username TEXT NOT NULL,
      post_url TEXT,
      status TEXT DEFAULT 'pending',
      payment_id TEXT,
      payment_preference_id TEXT,
      payment_status TEXT,
      pix_qr_code TEXT,
      pix_qr_code_base64 TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Índices para users
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

    -- Índices para password_resets
    CREATE INDEX IF NOT EXISTS idx_password_resets_user_id ON password_resets(user_id);
    CREATE INDEX IF NOT EXISTS idx_password_resets_token_hash ON password_resets(token_hash);

    -- Índices para auth_attempts
    CREATE INDEX IF NOT EXISTS idx_auth_attempts_ip ON auth_attempts(ip_address, created_at);
    CREATE INDEX IF NOT EXISTS idx_auth_attempts_user_id ON auth_attempts(user_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_auth_attempts_type ON auth_attempts(attempt_type, created_at);

    -- Índices para orders
    CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON orders(payment_id);
    CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
  `;

  // Executar cada comando CREATE separadamente
  const commands = tables.split(';').filter(cmd => cmd.trim());
  
  commands.forEach((command, index) => {
    if (command.trim()) {
      db.run(command, (err) => {
        if (err && !err.message.includes('already exists')) {
          console.error(`Erro ao criar tabela/índice ${index}:`, err.message);
        }
      });
    }
  });

  console.log('✅ Tabelas SQLite inicializadas');
}

// Fechar conexão ao encerrar
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Erro ao fechar banco:', err.message);
    }
    console.log('Banco de dados fechado');
    process.exit(0);
  });
});

export default db;
