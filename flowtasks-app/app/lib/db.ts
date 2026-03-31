import { Pool } from 'pg';

/**
 * Declaração global para evitar múltiplas instâncias do Pool 
 * durante o Hot Reloading no ambiente de desenvolvimento.
 */
declare global {
  var pgPool: Pool | undefined;
}

const pool =
  global.pgPool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20, 
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    // Garante que o SSL seja tratado corretamente para conexões externas (Render/Supabase/Neon)
    ssl: {
      rejectUnauthorized: false // Necessário para a maioria dos serviços de nuvem (Neon/Render/Supabase)
    },
  });

// Listeners de eventos para monitoramento de saúde do Pool
pool.on('connect', () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('🐘 [Postgres] Nova conexão estabelecida com o Pool.');
  }
});

pool.on('error', (err) => {
  console.error('❌ [Postgres] Erro inesperado em um cliente ocioso:', err.message);
});

/**
 * Teste imediato de conectividade (Readiness Check)
 * Isso ajuda a identificar erros de credenciais no boot da aplicação.
 */
const checkConnection = async () => {
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT NOW() as now, current_database() as db');
    console.log(`✅ [Postgres] Conectado ao banco "${res.rows[0].db}" em ${res.rows[0].now}`);
    client.release();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    console.error('🚨 [Postgres] Falha crítica na conexão inicial:', message);
  }
};

// Executa o check de conexão
checkConnection();

if (process.env.NODE_ENV !== 'production') {
  global.pgPool = pool;
}

export default pool;