export enum UserRole {
  ADMIN = 'admin',
  PASTOR = 'pastor',
  DEACON = 'deacon',
  LEADER = 'leader',
  MEMBER = 'member',
}

export interface NavigationStack {
  name: string;
  screens: string[];
  initialRoute: string;
}

export class NavigationStrategy {
  static getStackForRole(role: UserRole): NavigationStack {
    switch (role) {
      case UserRole.ADMIN:
        return {
          name: 'AdminStack',
          screens: [
            'AdminDashboard',
            'MembersManagement',
            'DonationsManagement',
            'Reports',
            'Settings',
          ],
          initialRoute: 'AdminDashboard',
        };

      case UserRole.PASTOR:
        return {
          name: 'PastorStack',
          screens: [
            'PastorDashboard',
            'MembersView',
            'DonationsView',
            'Ministries',
            'Settings',
          ],
          initialRoute: 'PastorDashboard',
        };

      case UserRole.DEACON:
        return {
          name: 'DeaconStack',
          screens: [
            'DeaconDashboard',
            'MembersView',
            'DonationsView',
            'Ministries',
            'Settings',
          ],
          initialRoute: 'DeaconDashboard',
        };

      case UserRole.LEADER:
        return {
          name: 'LeaderStack',
          screens: [
            'LeaderDashboard',
            'MembersView',
            'DonationsView',
            'Settings',
          ],
          initialRoute: 'LeaderDashboard',
        };

      case UserRole.MEMBER:
        return {
          name: 'MemberStack',
          screens: ['MemberDashboard', 'MyDonations', 'MyProfile', 'Events'],
          initialRoute: 'MemberDashboard',
        };

      default:
        return {
          name: 'GuestStack',
          screens: ['Login', 'Register', 'ForgotPassword'],
          initialRoute: 'Login',
        };
    }
  }

  static hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
    const hierarchy = {
      [UserRole.ADMIN]: 4,
      [UserRole.PASTOR]: 3,
      [UserRole.DEACON]: 2,
      [UserRole.LEADER]: 1,
      [UserRole.MEMBER]: 0,
    };

    return hierarchy[userRole] >= hierarchy[requiredRole];
  }

  static canAccessScreen(userRole: UserRole, screenName: string): boolean {
    const adminScreens = [
      'AdminDashboard',
      'MembersManagement',
      'DonationsManagement',
      'Reports',
    ];
    const pastorScreens = [
      'PastorDashboard',
      'MembersView',
      'DonationsView',
      'Ministries',
    ];
    const deaconScreens = [
      'DeaconDashboard',
      'MembersView',
      'DonationsView',
      'Ministries',
    ];
    const leaderScreens = ['LeaderDashboard', 'MembersView', 'DonationsView'];
    const memberScreens = [
      'MemberDashboard',
      'MyDonations',
      'MyProfile',
      'Events',
    ];
    const guestScreens = ['Login', 'Register', 'ForgotPassword'];

    switch (userRole) {
      case UserRole.ADMIN:
        return [
          ...adminScreens,
          ...pastorScreens,
          ...deaconScreens,
          ...leaderScreens,
          ...memberScreens,
          ...guestScreens,
        ].includes(screenName);
      case UserRole.PASTOR:
        return [
          ...pastorScreens,
          ...deaconScreens,
          ...leaderScreens,
          ...memberScreens,
          ...guestScreens,
        ].includes(screenName);
      case UserRole.DEACON:
        return [
          ...deaconScreens,
          ...leaderScreens,
          ...memberScreens,
          ...guestScreens,
        ].includes(screenName);
      case UserRole.LEADER:
        return [...leaderScreens, ...memberScreens, ...guestScreens].includes(
          screenName
        );
      case UserRole.MEMBER:
        return [...memberScreens, ...guestScreens].includes(screenName);
      default:
        return guestScreens.includes(screenName);
    }
  }
}
