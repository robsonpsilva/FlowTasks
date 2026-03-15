import pool from './db';

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Sucesso! Conexão com o banco de dados estabelecida.');
    
    const res = await client.query('SELECT NOW()');
    console.log('🕒 Data e hora do servidor de banco de dados:', res.rows[0].now);
    
    client.release();
  } catch (err) {
    console.error('❌ Erro ao conectar ao banco de dados:', err);
  } finally {
    await pool.end();
  }
}

testConnection();