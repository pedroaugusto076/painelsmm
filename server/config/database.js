import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import ws from 'ws';

// Garantir que o .env seja carregado
dotenv.config();

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('🔍 [DEBUG] Verificando variáveis de ambiente...');
console.log('📋 SUPABASE_URL:', supabaseUrl ? '✅ Definida' : '❌ Não definida');
console.log('📋 SUPABASE_ANON_KEY:', supabaseKey ? '✅ Definida' : '❌ Não definida');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERRO: Variáveis do Supabase não encontradas!');
  console.error('📁 Verifique se o arquivo .env existe em: server/.env');
  console.error('📝 Execute: npm run test-supabase para verificar');
  throw new Error('❌ SUPABASE_URL e SUPABASE_ANON_KEY devem estar configurados no .env');
}

// Criar cliente Supabase com WebSocket
const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    transport: ws
  }
});

console.log('✅ Conectado ao Supabase');

// Função query compatível com o código existente
const query = async (sqlQuery, params = []) => {
  try {
    console.log('🔍 [DB] Query:', sqlQuery.substring(0, 150));
    console.log('🔍 [DB] Params:', params);

    // Detectar tipo de operação
    const operation = sqlQuery.trim().toUpperCase();
    
    // ============ SELECT QUERIES ============
    if (operation.startsWith('SELECT')) {
      // Caso especial: COUNT queries
      if (sqlQuery.includes('COUNT(*)')) {
        const tableMatch = sqlQuery.match(/FROM\s+(\w+)/i);
        if (!tableMatch) throw new Error('Tabela não encontrada na query COUNT');
        
        const tableName = tableMatch[1];
        let supabaseQuery = supabase.from(tableName).select('*', { count: 'exact', head: false });
        
        // WHERE conditions para COUNT
        if (sqlQuery.includes('WHERE')) {
          const whereMatch = sqlQuery.match(/WHERE\s+(.+?)(?:AND|$)/i);
          if (whereMatch) {
            const condition = whereMatch[1].trim();
            
            // Processar condição simples (coluna = ?)
            if (condition.includes('=')) {
              const [column] = condition.split('=').map(s => s.trim().replace(/\?/, ''));
              const cleanColumn = column.replace(/\w+\./, ''); // Remove table prefix
              
              if (params.length > 0) {
                supabaseQuery = supabaseQuery.eq(cleanColumn, params[0]);
              }
            }
            
            // Processar condição com > (datetime comparisons)
            if (condition.includes('>')) {
              const parts = condition.split('>').map(s => s.trim());
              const column = parts[0].replace(/\w+\./, '');
              
              // Para datetime('now', '-X minutes/hours')
              if (condition.includes('datetime')) {
                const minutesMatch = condition.match(/-(\d+)\s+minute/i);
                const hoursMatch = condition.match(/-(\d+)\s+hour/i);
                
                let date = new Date();
                if (minutesMatch) {
                  date.setMinutes(date.getMinutes() - parseInt(minutesMatch[1]));
                } else if (hoursMatch) {
                  date.setHours(date.getHours() - parseInt(hoursMatch[1]));
                }
                
                supabaseQuery = supabaseQuery.gt(column, date.toISOString());
              }
            }
          }
          
          // Processar múltiplas condições AND
          const andParts = sqlQuery.match(/WHERE\s+(.+?)(?:ORDER|LIMIT|GROUP|$)/i);
          if (andParts) {
            const conditions = andParts[1].split('AND').map(c => c.trim());
            let paramIndex = 0;
            
            conditions.forEach(condition => {
              if (condition.includes('=') && !condition.includes('datetime')) {
                const [column] = condition.split('=').map(s => s.trim());
                const cleanColumn = column.replace(/\w+\./, '');
                
                if (paramIndex < params.length) {
                  supabaseQuery = supabaseQuery.eq(cleanColumn, params[paramIndex]);
                  paramIndex++;
                }
              } else if (condition.includes('>') && condition.includes('datetime')) {
                const column = condition.split('>')[0].trim().replace(/\w+\./, '');
                const minutesMatch = condition.match(/-(\d+)\s+minute/i);
                const hoursMatch = condition.match(/-(\d+)\s+hour/i);
                
                let date = new Date();
                if (minutesMatch) {
                  date.setMinutes(date.getMinutes() - parseInt(minutesMatch[1]));
                } else if (hoursMatch) {
                  date.setHours(date.getHours() - parseInt(hoursMatch[1]));
                }
                
                supabaseQuery = supabaseQuery.gt(column, date.toISOString());
              }
            });
          }
        }
        
        const { data, error, count } = await supabaseQuery;
        
        if (error) throw error;
        
        console.log('✅ [DB] COUNT executado. Count:', count);
        return { rows: [{ count: count || 0 }] };
      }
      
      // SELECT normal com colunas específicas ou JOIN
      const tableMatch = sqlQuery.match(/FROM\s+(\w+)/i);
      if (!tableMatch) throw new Error('Tabela não encontrada na query SELECT');
      
      const tableName = tableMatch[1];
      
      // Detectar colunas selecionadas
      let selectColumns = '*';
      const selectMatch = sqlQuery.match(/SELECT\s+(.+?)\s+FROM/i);
      if (selectMatch) {
        const cols = selectMatch[1].trim();
        if (cols !== '*' && !cols.includes('COUNT')) {
          // Mapear colunas com alias (ex: u.name as user_name)
          selectColumns = cols.split(',').map(col => {
            const parts = col.trim().split(/\s+as\s+/i);
            if (parts.length > 1) {
              // Tem alias
              const originalCol = parts[0].replace(/\w+\./, ''); // Remove table prefix
              return `${originalCol}`;
            }
            return col.trim().replace(/\w+\./, '');
          }).join(',');
        }
      }
      
      let supabaseQuery = supabase.from(tableName).select(selectColumns === '*' ? '*' : selectColumns);
      
      // JOIN (LEFT JOIN users)
      if (sqlQuery.includes('JOIN')) {
        // Para queries com JOIN, precisamos usar select com relacionamento
        // Exemplo: orders com users
        if (tableName === 'orders' && sqlQuery.includes('users')) {
          supabaseQuery = supabase.from('orders').select(`
            *,
            users!orders_user_id_fkey (
              name,
              email
            )
          `);
        }
      }
      
      // WHERE conditions
      if (sqlQuery.includes('WHERE')) {
        const whereMatch = sqlQuery.match(/WHERE\s+(.+?)(?:ORDER|LIMIT|GROUP|$)/i);
        if (whereMatch) {
          const conditions = whereMatch[1].trim();
          
          // Processar condições simples
          if (conditions.includes('=')) {
            const parts = conditions.split('AND').map(c => c.trim());
            let paramIndex = 0;
            
            parts.forEach((condition) => {
              if (condition.includes('=') && !condition.includes('datetime')) {
                const [column] = condition.split('=').map(s => s.trim());
                const cleanColumn = column.replace(/\w+\./, ''); // Remove table prefix
                
                if (paramIndex < params.length) {
                  supabaseQuery = supabaseQuery.eq(cleanColumn, params[paramIndex]);
                  paramIndex++;
                }
              } else if (condition.includes('!=')) {
                const [column, value] = condition.split('!=').map(s => s.trim());
                const cleanColumn = column.replace(/\w+\./, '');
                
                if (paramIndex < params.length) {
                  supabaseQuery = supabaseQuery.neq(cleanColumn, params[paramIndex]);
                  paramIndex++;
                }
              }
            });
          }
        }
      }
      
      // ORDER BY
      if (sqlQuery.includes('ORDER BY')) {
        const orderMatch = sqlQuery.match(/ORDER BY\s+([\w.]+)\s*(ASC|DESC)?/i);
        if (orderMatch) {
          const column = orderMatch[1].replace(/\w+\./, ''); // Remove table prefix
          const direction = orderMatch[2]?.toUpperCase() !== 'DESC'; // Default ASC
          supabaseQuery = supabaseQuery.order(column, { ascending: direction });
        }
      }
      
      // LIMIT
      if (sqlQuery.includes('LIMIT')) {
        const limitMatch = sqlQuery.match(/LIMIT\s+(\d+)/i);
        if (limitMatch) {
          supabaseQuery = supabaseQuery.limit(parseInt(limitMatch[1]));
        }
      }
      
      // GROUP BY (para estatísticas)
      if (sqlQuery.includes('GROUP BY')) {
        // Para queries com GROUP BY, retornar dados agrupados
        const { data, error } = await supabaseQuery;
        if (error) throw error;
        
        console.log('✅ [DB] SELECT com GROUP BY executado. Rows:', data?.length || 0);
        return { rows: data || [] };
      }
      
      const { data, error } = await supabaseQuery;
      
      if (error) throw error;
      
      // Transformar dados se houver JOIN
      let transformedData = data;
      if (data && data.length > 0 && data[0].users) {
        transformedData = data.map(row => ({
          ...row,
          user_name: row.users?.name,
          user_email: row.users?.email,
          users: undefined // Remove objeto aninhado
        }));
      }
      
      console.log('✅ [DB] SELECT executado. Rows:', transformedData?.length || 0);
      return { rows: transformedData || [] };
    }
    
    // ============ INSERT QUERIES ============
    if (operation.startsWith('INSERT')) {
      const tableMatch = sqlQuery.match(/INTO\s+(\w+)/i);
      if (!tableMatch) throw new Error('Tabela não encontrada na query INSERT');
      
      const tableName = tableMatch[1];
      const columnsMatch = sqlQuery.match(/\(([^)]+)\)/);
      if (!columnsMatch) throw new Error('Colunas não encontradas na query INSERT');
      
      const columns = columnsMatch[1].split(',').map(c => c.trim());
      const insertData = {};
      columns.forEach((col, index) => {
        if (index < params.length) {
          insertData[col] = params[index];
        }
      });
      
      const { data, error } = await supabase
        .from(tableName)
        .insert(insertData)
        .select();
      
      if (error) throw error;
      
      console.log('✅ [DB] INSERT executado');
      return { rows: data || [] };
    }
    
    // ============ UPDATE QUERIES ============
    if (operation.startsWith('UPDATE')) {
      const tableMatch = sqlQuery.match(/UPDATE\s+(\w+)/i);
      if (!tableMatch) throw new Error('Tabela não encontrada na query UPDATE');
      
      const tableName = tableMatch[1];
      const setMatch = sqlQuery.match(/SET\s+(.+?)\s+WHERE/i);
      if (!setMatch) throw new Error('SET não encontrado na query UPDATE');
      
      const setParts = setMatch[1].split(',').map(s => s.trim());
      const updateData = {};
      let paramIndex = 0;
      
      setParts.forEach(part => {
        const [column, value] = part.split('=').map(s => s.trim());
        
        if (value.includes('CURRENT_TIMESTAMP')) {
          updateData[column] = new Date().toISOString();
        } else if (value === '?') {
          if (paramIndex < params.length) {
            updateData[column] = params[paramIndex];
            paramIndex++;
          }
        }
      });
      
      // WHERE condition
      const whereMatch = sqlQuery.match(/WHERE\s+(\w+)\s*=\s*\?/i);
      if (!whereMatch) throw new Error('WHERE não encontrado na query UPDATE');
      
      const whereColumn = whereMatch[1];
      const whereValue = params[params.length - 1];
      
      const { data, error } = await supabase
        .from(tableName)
        .update(updateData)
        .eq(whereColumn, whereValue)
        .select();
      
      if (error) throw error;
      
      console.log('✅ [DB] UPDATE executado');
      return { rows: data || [], rowCount: data?.length || 0 };
    }
    
    // ============ DELETE QUERIES ============
    if (operation.startsWith('DELETE')) {
      const tableMatch = sqlQuery.match(/FROM\s+(\w+)/i);
      if (!tableMatch) throw new Error('Tabela não encontrada na query DELETE');
      
      const tableName = tableMatch[1];
      const whereMatch = sqlQuery.match(/WHERE\s+(\w+)\s*=\s*\?/i);
      if (!whereMatch) throw new Error('WHERE não encontrado na query DELETE');
      
      const whereColumn = whereMatch[1];
      const whereValue = params[0];
      
      const { data, error } = await supabase
        .from(tableName)
        .delete()
        .eq(whereColumn, whereValue)
        .select();
      
      if (error) throw error;
      
      console.log('✅ [DB] DELETE executado');
      return { rows: data || [], rowCount: data?.length || 0 };
    }
    
    throw new Error('Tipo de query não suportado: ' + operation.substring(0, 50));
    
  } catch (error) {
    console.error('❌ [DB] Erro na query Supabase:', error);
    console.error('📋 [DB] Query:', sqlQuery);
    console.error('📋 [DB] Params:', params);
    throw error;
  }
};

export { query, supabase };
export default supabase;
