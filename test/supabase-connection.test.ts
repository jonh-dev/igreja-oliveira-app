require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

describe('Supabase Connection', () => {
  it('deve conectar e retornar contagem de usuários', async () => {
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    expect(error).toBeNull();
    expect(typeof count === 'number' || count === null).toBe(true);
  });
}); 