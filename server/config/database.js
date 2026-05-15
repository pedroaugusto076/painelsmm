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
    console.log('🔍 [DB] Query:', sqlQuery.substring(0, 100) + '...');
    console.log('🔍 [DB] Params:', params);

    // Detectar tipo de operação
    const operation = sqlQuery.trim().toUpperCase();
    
    // SELECT
    if (operation.startsWith('SELECT')) {
      // Extrair nome da tabela
      const tableMatch = sqlQuery.match(/FROM\s+(\w+)/i);
      if (!tableMatch) throw new Error('Tabela não encontrada na query SELECT');
      
      const tableName = tableMatch[1];
      let supabaseQuery = supabase.from(tableName).select('*');
      
      // WHERE conditions
      if (sqlQuery.includes('WHERE')) {
        // Processar condições WHERE simples
        const whereMatch = sqlQuery.match(/WHERE\s+(.+?)(?:ORDER|LIMIT|$)/i);
        if (whereMatch) {
          const conditions = whereMatch[1].trim();
          
          // Processar cada condição
          if (conditions.includes('=')) {
            const parts = conditions.split('AND').map(c => c.trim());
            parts.forEach((condition, index) => {
              const [column, placeholder] = condition.split('=').map(s => s.trim());
              const cleanColumn = column.replace(/\w+\./, ''); // Remove table prefix
              supabaseQuery = supabaseQuery.eq(cleanColumn, params[index]);
            });
          }
        }
      }
      
      // ORDER BY
      if (sqlQuery.includes('ORDER BY')) {
        const orderMatch = sqlQuery.match(/ORDER BY\s+(\w+)\s*(ASC|DESC)?/i);
        if (orderMatch) {
          const column = orderMatch[1];
          const direction = orderMatch[2]?.toUpperCase() === 'ASC' ? true : false;
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
      
      const { data, error } = await supabaseQuery;
      
      if (error) throw error;
      
      console.log('✅ [DB] Query executada. Rows:', data?.length || 0);
      return { rows: data || [] };
    }
    
    // INSERT
    if (operation.startsWith('INSERT')) {
      const tableMatch = sqlQuery.match(/INTO\s+(\w+)/i);
      if (!tableMatch) throw new Error('Tabela não encontrada na query INSERT');
      
      const tableName = tableMatch[1];
      const columnsMatch = sqlQuery.match(/\(([^)]+)\)/);
      if (!columnsMatch) throw new Error('Colunas não encontradas na query INSERT');
      
      const columns = columnsMatch[1].split(',').map(c => c.trim());
      const insertData = {};
      columns.forEach((col, index) => {
        insertData[col] = params[index];
      });
      
      const { data, error } = await supabase
        .from(tableName)
        .insert(insertData)
        .select();
      
      if (error) throw error;
      
      console.log('✅ [DB] INSERT executado');
      return { rows: data || [] };
    }
    
    // UPDATE
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
        const [column] = part.split('=').map(s => s.trim());
        if (!column.includes('CURRENT_TIMESTAMP')) {
          updateData[column] = params[paramIndex++];
        } else {
          updateData[column] = new Date().toISOString();
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
    
    // DELETE
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
    
    throw new Error('Tipo de query não suportado');
    
  } catch (error) {
    console.error('❌ [DB] Erro na query Supabase:', error);
    console.error('📋 [DB] Query:', sqlQuery);
    console.error('📋 [DB] Params:', params);
    throw error;
  }
};

export { query, supabase };
export default supabase;
