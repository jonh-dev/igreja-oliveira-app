import { NavigationStrategy, UserRole } from '../NavigationStrategy';

describe('NavigationStrategy', () => {
  it('deve retornar o stack correto para cada UserRole', () => {
    const adminStack = NavigationStrategy.getStackForRole(UserRole.ADMIN);
    expect(adminStack.name).toBe('AdminStack');
    expect(adminStack.initialRoute).toBe('AdminDashboard');
    expect(adminStack.screens).toContain('AdminDashboard');

    const pastorStack = NavigationStrategy.getStackForRole(UserRole.PASTOR);
    expect(pastorStack.name).toBe('PastorStack');
    expect(pastorStack.initialRoute).toBe('PastorDashboard');
    expect(pastorStack.screens).toContain('PastorDashboard');

    const deaconStack = NavigationStrategy.getStackForRole(UserRole.DEACON);
    expect(deaconStack.name).toBe('DeaconStack');
    expect(deaconStack.initialRoute).toBe('DeaconDashboard');
    expect(deaconStack.screens).toContain('DeaconDashboard');

    const leaderStack = NavigationStrategy.getStackForRole(UserRole.LEADER);
    expect(leaderStack.name).toBe('LeaderStack');
    expect(leaderStack.initialRoute).toBe('LeaderDashboard');
    expect(leaderStack.screens).toContain('LeaderDashboard');

    const memberStack = NavigationStrategy.getStackForRole(UserRole.MEMBER);
    expect(memberStack.name).toBe('MemberStack');
    expect(memberStack.initialRoute).toBe('MemberDashboard');
    expect(memberStack.screens).toContain('MemberDashboard');
  });

  it('deve retornar GuestStack para papéis desconhecidos', () => {
    // @ts-expect-error: testando valor inválido
    const guestStack = NavigationStrategy.getStackForRole('INVALID');
    expect(guestStack.name).toBe('GuestStack');
    expect(guestStack.initialRoute).toBe('Login');
    expect(guestStack.screens).toContain('Login');
  });

  it('deve verificar permissões corretamente', () => {
    expect(NavigationStrategy.hasPermission(UserRole.ADMIN, UserRole.MEMBER)).toBe(true);
    expect(NavigationStrategy.hasPermission(UserRole.PASTOR, UserRole.LEADER)).toBe(true);
    expect(NavigationStrategy.hasPermission(UserRole.MEMBER, UserRole.ADMIN)).toBe(false);
    expect(NavigationStrategy.hasPermission(UserRole.LEADER, UserRole.PASTOR)).toBe(false);
  });

  it('deve verificar acesso a telas corretamente', () => {
    expect(NavigationStrategy.canAccessScreen(UserRole.ADMIN, 'AdminDashboard')).toBe(true);
    expect(NavigationStrategy.canAccessScreen(UserRole.PASTOR, 'PastorDashboard')).toBe(true);
    expect(NavigationStrategy.canAccessScreen(UserRole.MEMBER, 'MemberDashboard')).toBe(true);
    expect(NavigationStrategy.canAccessScreen(UserRole.MEMBER, 'AdminDashboard')).toBe(false);
  });
}); 