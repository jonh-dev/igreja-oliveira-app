export enum UserRole {
  ADMIN = 'admin',
  PASTOR = 'pastor',
  DEACON = 'deacon',
  LEADER = 'leader',
  MEMBER = 'member',
}

export class NavigationStrategy {
  static getStackForRole(role: UserRole): string {
    switch (role) {
      case UserRole.ADMIN:
        return 'AdminNavigationStack';
      case UserRole.PASTOR:
        return 'PastorNavigationStack';
      case UserRole.DEACON:
        return 'DeaconNavigationStack';
      case UserRole.LEADER:
        return 'LeaderNavigationStack';
      case UserRole.MEMBER:
        return 'MemberNavigationStack';
      default:
        return 'GuestNavigationStack';
    }
  }
} 