import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Card } from '../../components/shared/Card';
import { Button } from '../../components/shared/Button';
import { Colors, Typography, Spacing } from '../../components/shared/design-system';

interface AdminDashboardProps {
  onNavigateToMembers: () => void;
  onNavigateToDonations: () => void;
  onNavigateToReports: () => void;
  onNavigateToSettings: () => void;
  onLogout: () => void;
}

interface MetricCard {
  title: string;
  value: string;
  icon: string;
  color: string;
  onPress?: () => void;
}

interface ActivityItem {
  id: string;
  type: 'member' | 'donation' | 'event';
  title: string;
  description: string;
  time: string;
  icon: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateToMembers,
  onNavigateToDonations,
  onNavigateToReports,
  onNavigateToSettings,
  onLogout,
}) => {
  const metrics: MetricCard[] = [
    {
      title: 'Membros',
      value: '150',
      icon: '👥',
      color: Colors.primary,
      onPress: onNavigateToMembers,
    },
    {
      title: 'Doações',
      value: 'R$ 15k',
      icon: '💰',
      color: Colors.accent,
      onPress: onNavigateToDonations,
    },
    {
      title: 'Eventos',
      value: '12',
      icon: '📅',
      color: Colors.secondary,
    },
    {
      title: 'Relatórios',
      value: '5',
      icon: '📊',
      color: Colors.info,
      onPress: onNavigateToReports,
    },
  ];

  const recentActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'member',
      title: 'Novo membro: Maria Silva',
      description: 'Membro adicionado ao sistema',
      time: '2h atrás',
      icon: '👤',
    },
    {
      id: '2',
      type: 'donation',
      title: 'Doação: R$ 500 - João Santos',
      description: 'Dízimo registrado',
      time: '4h atrás',
      icon: '💵',
    },
    {
      id: '3',
      type: 'event',
      title: 'Evento: Culto Domingo',
      description: 'Evento criado para domingo',
      time: '1 dia atrás',
      icon: '⛪',
    },
    {
      id: '4',
      type: 'member',
      title: 'Atualização: Pedro Costa',
      description: 'Dados do membro atualizados',
      time: '1 dia atrás',
      icon: '✏️',
    },
  ];

  const renderMetricCard = (metric: MetricCard) => (
    <TouchableOpacity
      key={metric.title}
      style={styles.metricCard}
      onPress={metric.onPress}
      disabled={!metric.onPress}
    >
      <View style={[styles.metricIcon, { backgroundColor: metric.color }]}>
        <Text style={styles.metricIconText}>{metric.icon}</Text>
      </View>
      <Text style={styles.metricValue}>{metric.value}</Text>
      <Text style={styles.metricTitle}>{metric.title}</Text>
    </TouchableOpacity>
  );

  const renderActivityItem = (activity: ActivityItem) => (
    <View key={activity.id} style={styles.activityItem}>
      <View style={styles.activityIcon}>
        <Text style={styles.activityIconText}>{activity.icon}</Text>
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>{activity.title}</Text>
        <Text style={styles.activityDescription}>{activity.description}</Text>
        <Text style={styles.activityTime}>{activity.time}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <Text style={styles.greeting}>Bem-vindo,</Text>
            <Text style={styles.userName}>João Silva</Text>
            <Text style={styles.userRole}>Administrador</Text>
          </View>
          <View style={styles.headerActions}>
            <Button
              title="⚙️"
              onPress={onNavigateToSettings}
              variant="outline"
              size="small"
              style={styles.settingsButton}
            />
            <Button
              title="Sair"
              onPress={onLogout}
              variant="danger"
              size="small"
            />
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Dashboard Title */}
        <View style={styles.dashboardHeader}>
          <Text style={styles.dashboardTitle}>📊 Dashboard Administrativo</Text>
          <Text style={styles.dashboardSubtitle}>
            Visão geral da Igreja Oliveira
          </Text>
        </View>

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          {metrics.map(renderMetricCard)}
        </View>

        {/* Recent Activity */}
        <Card variant="elevated" style={styles.activityCard}>
          <Text style={styles.activityCardTitle}>📈 Atividade Recente</Text>
          <View style={styles.activityList}>
            {recentActivities.map(renderActivityItem)}
          </View>
          <Button
            title="Ver Todas as Atividades"
            onPress={() => console.log('Ver todas as atividades')}
            variant="outline"
            size="small"
            style={styles.viewAllButton}
          />
        </Card>

        {/* Quick Actions */}
        <Card variant="outlined" style={styles.quickActionsCard}>
          <Text style={styles.quickActionsTitle}>⚡ Ações Rápidas</Text>
          <View style={styles.quickActionsGrid}>
            <Button
              title="➕ Novo Membro"
              onPress={onNavigateToMembers}
              variant="primary"
              size="small"
              style={styles.quickActionButton}
            />
            <Button
              title="💰 Nova Doação"
              onPress={onNavigateToDonations}
              variant="secondary"
              size="small"
              style={styles.quickActionButton}
            />
            <Button
              title="📅 Novo Evento"
              onPress={() => console.log('Novo evento')}
              variant="outline"
              size="small"
              style={styles.quickActionButton}
            />
            <Button
              title="📊 Relatório"
              onPress={onNavigateToReports}
              variant="outline"
              size="small"
              style={styles.quickActionButton}
            />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  header: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: Typography.fontSizeSm,
    color: Colors.gray,
    marginBottom: Spacing.xs,
  },
  userName: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightBold,
    color: Colors.black,
    marginBottom: Spacing.xs,
  },
  userRole: {
    fontSize: Typography.fontSizeSm,
    color: Colors.primary,
    fontWeight: Typography.fontWeightMedium,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  settingsButton: {
    marginRight: Spacing.sm,
  },
  content: {
    flex: 1,
  },
  dashboardHeader: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  dashboardTitle: {
    fontSize: Typography.fontSize2xl,
    fontWeight: Typography.fontWeightBold,
    color: Colors.black,
    marginBottom: Spacing.xs,
  },
  dashboardSubtitle: {
    fontSize: Typography.fontSizeBase,
    color: Colors.gray,
    textAlign: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  metricCard: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  metricIconText: {
    fontSize: 24,
  },
  metricValue: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightBold,
    color: Colors.black,
    marginBottom: Spacing.xs,
  },
  metricTitle: {
    fontSize: Typography.fontSizeSm,
    color: Colors.gray,
    textAlign: 'center',
  },
  activityCard: {
    margin: Spacing.lg,
    marginTop: 0,
  },
  activityCardTitle: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.black,
    marginBottom: Spacing.lg,
  },
  activityList: {
    marginBottom: Spacing.lg,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  activityIconText: {
    fontSize: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: Typography.fontSizeBase,
    fontWeight: Typography.fontWeightMedium,
    color: Colors.black,
    marginBottom: Spacing.xs,
  },
  activityDescription: {
    fontSize: Typography.fontSizeSm,
    color: Colors.gray,
    marginBottom: Spacing.xs,
  },
  activityTime: {
    fontSize: Typography.fontSizeXs,
    color: Colors.gray,
  },
  viewAllButton: {
    alignSelf: 'center',
  },
  quickActionsCard: {
    margin: Spacing.lg,
    marginTop: 0,
  },
  quickActionsTitle: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.black,
    marginBottom: Spacing.lg,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  quickActionButton: {
    flex: 1,
    minWidth: '45%',
  },
}); 