export const Environment = {
  // Alternar entre 'development' e 'production'
  mode: 'development' as 'development' | 'production',

  // Configurações específicas por ambiente
  development: {
    showTestHarness: false,
    enableLogs: true,
    mockData: false,
  },

  production: {
    showTestHarness: false,
    enableLogs: false,
    mockData: false,
  },

  // Helper para verificar se está em desenvolvimento
  isDevelopment: () => Environment.mode === 'development',

  // Helper para verificar se deve mostrar testes
  shouldShowTests: () =>
    Environment.isDevelopment() && Environment.development.showTestHarness,

  // Helper para obter configurações atuais
  getConfig: () => Environment[Environment.mode],
} as const;
