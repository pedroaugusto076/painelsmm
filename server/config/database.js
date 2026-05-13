import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let db = null;
let query = null;
let isVercel = false;

// Detectar se está rodando na Vercel
if (process.env.VERCEL || process.env.POSTGRES_URL) {
  console.log('🌐 Ambiente Vercel detectado - usando Vercel Postgres');
  isVercel = true;
  
  // Importar Vercel Postgres
  const { sql } = await import('@vercel/postgres');
  
  // Função query para Vercel Postgres
  query = async (sqlQuery, params = []) => {
    try {
      // Converter sintaxe PostgreSQL ($1, $2) se necessário
      let pgQuery = sqlQuery;
      let pgParams = params;
      
      // Se a query usa ?, converter para $1, $2, etc
      if (sqlQuery.includes('?') && !sqlQuery.includes('$')) {
        let paramIndex = 1;
        pgQuery = sqlQuery.replace(/\?/g, () => `$${paramIndex++}`);
      }
      
      // Converter datetime SQLite para PostgreSQL
      pgQuery = pgQuery.replace(/datetime\('now'\)/g, 'CURRENT_TIMESTAMP');
      pgQuery = pgQuery.replace(/datetime\('now',\s*'([^']+)'\)/g, "CURRENT_TIMESTAMP + INTERVAL '$1'");
      
      const result = await sql.query(pgQuery, pgParams);
      return { rows: result.rows || [] };
    } catch (error) {
      console.error('Erro na query Vercel Postgres:', error);
      throw error;
    }
  };
  
  console.log('✅ Conectado ao Vercel Postgres');
  
} else {
  console.log('💻 Ambiente local detectado - usando SQLite');
  
  // Importar SQLite
  const sqlite3Module = await import('sqlite3');
  const sqlite3 = sqlite3Module.default;
  
  // Caminho do banco de dados SQLite
  const DB_PATH = join(__dirname, '..', 'database.sqlite');
  
  // Criar conexão com SQLite
  db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('❌ Erro ao conectar ao SQLite:', err.message);
    } else {
      console.log('✅ Conectado ao SQLite');
      initializeSQLiteDatabase();
    }
  });
  
  // Habilitar foreign keys
  db.run('PRAGMA foreign_keys = ON');
  
  // Função para executar queries SQLite
  query = (sqlQuery, params = []) => {
    return new Promise((resolve, reject) => {
      // Converter sintaxe PostgreSQL ($1, $2) para SQLite (?, ?)
      const sqliteSql = sqlQuery.replace(/\$(\d+)/g, '?');
      
      // Reordenar parâmetros se necessário
      const orderedParams = [];
      const matches = [...sqlQuery.matchAll(/\$(\d+)/g)];
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
  
  // Inicializar banco de dados SQLite com tabelas
  function initializeSQLiteDatabase() {
    const tables = `
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

      CREATE TABLE IF NOT EXISTS password_resets (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        user_id TEXT NOT NULL UNIQUE,
        token_hash TEXT NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

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
        smmmidia_order_id TEXT,
        error_message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_password_resets_user_id ON password_resets(user_id);
      CREATE INDEX IF NOT EXISTS idx_password_resets_token_hash ON password_resets(token_hash);
      CREATE INDEX IF NOT EXISTS idx_auth_attempts_ip ON auth_attempts(ip_address, created_at);
      CREATE INDEX IF NOT EXISTS idx_auth_attempts_user_id ON auth_attempts(user_id, created_at);
      CREATE INDEX IF NOT EXISTS idx_auth_attempts_type ON auth_attempts(attempt_type, created_at);
      CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
      CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON orders(payment_id);
      CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
    `;
    
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
    if (db) {
      db.close((err) => {
        if (err) {
          console.error('Erro ao fechar banco:', err.message);
        }
        console.log('Banco de dados fechado');
        process.exit(0);
      });
    }
  });
}

export { query, db, isVercel };
export default db;
