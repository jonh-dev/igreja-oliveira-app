const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Configuração do teste:');
console.log('URL:', supabaseUrl);
console.log('API Key:', supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : '[NÃO DEFINIDA]');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('\n📡 Testando conexão com Supabase...');
    const { count, error, status } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    if (error) {
      console.error('❌ Erro de conexão:', error.message);
      console.error('Status:', status);
      console.error('Detalhes:', error);
      return false;
    }
    console.log('✅ Conexão Supabase funcionando!');
    console.log('📊 Total de usuários:', count);
    return true;
  } catch (err) {
    console.error('❌ Erro inesperado:', err);
    return false;
  }
}

testConnection(); 