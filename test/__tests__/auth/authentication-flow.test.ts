import type { AuthResult } from '../../../src/application/interfaces/services/IAuthService';
import { SupabaseAuthService } from '../../../src/infrastructure/services/SupabaseAuthService';

// Construiremos os fakes antes de mockar o módulo
const fakeUserId = '00000000-0000-0000-0000-000000000001';
const fakeEmail = 'jonh.dev.br@gmail.com';

let selectCalls = 0;
let upsertCalls = 0;

const makeUsersBuilder = () => {
  const builder: any = {};
  builder.select = jest.fn(() => builder);
  builder.eq = jest.fn(() => builder);
  builder.maybeSingle = jest.fn(async () => {
    selectCalls += 1;
    if (selectCalls === 1) {
      return { data: null, error: null };
    }
    return {
      data: {
        id: fakeUserId,
        email: fakeEmail,
        full_name: 'John Doe',
        phone: null,
        country_code: '+55',
        role: 'member',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      error: null,
    };
  });
  builder.upsert = jest.fn(async () => {
    upsertCalls += 1;
    return { data: null, error: null };
  });
  return builder;
};

const usersBuilder = makeUsersBuilder();

// Mock do módulo usado no serviço (usar require.resolve inline para evitar hoisting de variável)
jest.mock(require.resolve('../../../src/infrastructure/config/supabase'), () => {
  const fakeSupabase: any = {
    auth: {
      signInWithPassword: jest.fn(async () => ({
        data: {
          user: {
            id: fakeUserId,
            email: fakeEmail,
            user_metadata: { full_name: 'John Doe', phone: null },
          },
          session: { access_token: 'access-token', refresh_token: 'refresh-token' },
        },
        error: null,
      })),
    },
    from: jest.fn((table: string) => {
      if (table !== 'users') throw new Error('unexpected table: ' + table);
      return usersBuilder;
    }),
  };
  return { supabase: fakeSupabase };
});

describe('Auth flow — ensure user row exists', () => {
  beforeEach(() => {
    selectCalls = 0;
    upsertCalls = 0;
    usersBuilder.select.mockClear();
    usersBuilder.eq.mockClear();
    usersBuilder.maybeSingle.mockClear();
    usersBuilder.upsert.mockClear();
  });

  it('autentica, cria perfil quando ausente e retorna usuário', async () => {
    const service = new SupabaseAuthService();

    const result: AuthResult = await service.authenticate(fakeEmail, 'secret');

    expect(usersBuilder.upsert).toHaveBeenCalled();
    expect(selectCalls).toBe(2);

    expect(result.user.id).toBe(fakeUserId);
    expect(result.user.email).toBe(fakeEmail);
    expect(result.user.role).toBe('member');
    expect(result.token).toBe('access-token');
    expect(result.refreshToken).toBe('refresh-token');
  });
});
