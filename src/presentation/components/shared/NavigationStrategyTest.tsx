import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { NavigationStrategy, UserRole } from '../../navigation/NavigationStrategy';
import { Colors, Typography, Spacing } from './design-system';

export const NavigationStrategyTest: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.ADMIN);

  const roles = [
    { role: UserRole.ADMIN, name: 'Administrador', color: Colors.danger },
    { role: UserRole.PASTOR, name: 'Pastor', color: Colors.primary },
    { role: UserRole.DEACON, name: 'Diácono', color: Colors.secondary },
    { role: UserRole.LEADER, name: 'Líder', color: Colors.accent },
    { role: UserRole.MEMBER, name: 'Membro', color: Colors.gray },
  ];

  const currentStack = NavigationStrategy.getStackForRole(selectedRole);

  const testScreens = [
    'AdminDashboard',
    'PastorDashboard',
    'MemberDashboard',
    'Login',
    'Settings',
    'DonationsView',
    'MembersView',
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🧭 Navigation Strategy Test</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Selecionar Role</Text>
        <View style={styles.roleButtons}>
          {roles.map(({ role, name, color }) => (
            <TouchableOpacity
              key={role}
              style={[
                styles.roleButton,
                { backgroundColor: color },
                selectedRole === role && styles.roleButtonActive
              ]}
              onPress={() => setSelectedRole(role)}
            >
              <Text style={styles.roleButtonText}>{name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Stack Atual: {currentStack.name}</Text>
        <Text style={styles.subtitle}>Rota Inicial: {currentStack.initialRoute}</Text>
        
        <View style={styles.screensContainer}>
          <Text style={styles.screensTitle}>Telas Disponíveis:</Text>
          {currentStack.screens.map((screen, index) => (
            <View key={screen} style={styles.screenItem}>
              <Text style={styles.screenName}>
                {index + 1}. {screen}
                {screen === currentStack.initialRoute && ' (Inicial)'}
              </Text>
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Teste de Permissões</Text>
        <Text style={styles.subtitle}>Role atual: {selectedRole}</Text>
        
        <View style={styles.permissionsContainer}>
          {testScreens.map((screen) => {
            const hasAccess = NavigationStrategy.canAccessScreen(selectedRole, screen);
            return (
              <View key={screen} style={styles.permissionItem}>
                <Text style={styles.screenName}>{screen}</Text>
                <View style={[
                  styles.accessIndicator,
                  { backgroundColor: hasAccess ? Colors.success : Colors.danger }
                ]}>
                  <Text style={styles.accessText}>
                    {hasAccess ? '✓ Acesso' : '✗ Negado'}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hierarquia de Permissões</Text>
        <View style={styles.hierarchyContainer}>
          {roles.map(({ role, name }, index) => (
            <View key={role} style={styles.hierarchyItem}>
              <Text style={styles.hierarchyLevel}>{4 - index}</Text>
              <Text style={styles.hierarchyName}>{name}</Text>
              <Text style={styles.hierarchyRole}>{role}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
    backgroundColor: Colors.lightGray,
  },
  title: {
    fontSize: Typography.fontSize2xl,
    fontWeight: Typography.fontWeightBold,
    color: Colors.primary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  section: {
    marginBottom: Spacing.xl,
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.darkGray,
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: Typography.fontSizeSm,
    color: Colors.gray,
    marginBottom: Spacing.md,
  },
  roleButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  roleButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    marginBottom: Spacing.sm,
    minWidth: 100,
    alignItems: 'center',
  },
  roleButtonActive: {
    opacity: 0.8,
  },
  roleButtonText: {
    color: Colors.white,
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightMedium,
  },
  screensContainer: {
    marginTop: Spacing.md,
  },
  screensTitle: {
    fontSize: Typography.fontSizeBase,
    fontWeight: Typography.fontWeightMedium,
    color: Colors.darkGray,
    marginBottom: Spacing.sm,
  },
  screenItem: {
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  screenName: {
    fontSize: Typography.fontSizeSm,
    color: Colors.darkGray,
  },
  permissionsContainer: {
    marginTop: Spacing.md,
  },
  permissionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  accessIndicator: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
  },
  accessText: {
    color: Colors.white,
    fontSize: Typography.fontSizeXs,
    fontWeight: Typography.fontWeightMedium,
  },
  hierarchyContainer: {
    marginTop: Spacing.md,
  },
  hierarchyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  hierarchyLevel: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightBold,
    color: Colors.primary,
    marginRight: Spacing.md,
    minWidth: 20,
  },
  hierarchyName: {
    fontSize: Typography.fontSizeBase,
    fontWeight: Typography.fontWeightMedium,
    color: Colors.darkGray,
    flex: 1,
  },
  hierarchyRole: {
    fontSize: Typography.fontSizeSm,
    color: Colors.gray,
  },
}); 