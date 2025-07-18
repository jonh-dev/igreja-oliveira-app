import { NavigationStrategy, UserRole } from '../NavigationStrategy';

describe('NavigationStrategy', () => {
  it('deve retornar o stack correto para cada UserRole', () => {
    expect(NavigationStrategy.getStackForRole(UserRole.ADMIN)).toBe('AdminNavigationStack');
    expect(NavigationStrategy.getStackForRole(UserRole.PASTOR)).toBe('PastorNavigationStack');
    expect(NavigationStrategy.getStackForRole(UserRole.DEACON)).toBe('DeaconNavigationStack');
    expect(NavigationStrategy.getStackForRole(UserRole.LEADER)).toBe('LeaderNavigationStack');
    expect(NavigationStrategy.getStackForRole(UserRole.MEMBER)).toBe('MemberNavigationStack');
  });

  it('deve retornar GuestNavigationStack para papéis desconhecidos', () => {
    // @ts-expect-error: testando valor inválido
    expect(NavigationStrategy.getStackForRole('INVALID')).toBe('GuestNavigationStack');
  });
}); 