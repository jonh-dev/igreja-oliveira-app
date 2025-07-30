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

interface PastorDashboardProps {
  onNavigateToMembers: () => void;
  onNavigateToDonations: () => void;
  onNavigateToMinistries: () => void;
  onNavigateToSettings: () => void;
  onLogout: () => void;
}

interface MinistryCard {
  name: string;
  memberCount: number;
  leader: string;
  icon: string;
  color: string;
}

interface TitheSummary {
  month: string;
  amount: number;
  percentage: number;
}

export const PastorDashboard: React.FC<PastorDashboardProps> = ({
  onNavigateToMembers,
  onNavigateToDonations,
  onNavigateToMinistries,
  onNavigateToSettings,
  onLogout,
}) => {
  const metrics = [
    {
      title: 'Membros',
      value: '120',
      icon: '👥',
      color: Colors.primary,
      onPress: onNavigateToMembers,
    },
    {
      title: 'Dízimos',
      value: 'R$ 12k',
      icon: '💰',
      color: Colors.accent,
      onPress: onNavigateToDonations,
    },
    {
      title: 'Ministérios',
      value: '8',
      icon: '🎭',
      color: Colors.secondary,
      onPress: onNavigateToMinistries,
    },
    {
      title: 'Cultos',
      value: '4/semana',
      icon: '⛪',
      color: Colors.info,
    },
  ];

  const ministries: MinistryCard[] = [
    {
      name: 'Louvor',
      memberCount: 25,
      leader: 'Maria Santos',
      icon: '🎵',
      color: Colors.primary,
    },
    {
      name: 'Jovens',
      memberCount: 30,
      leader: 'João Costa',
      icon: '👨‍🎓',
      color: Colors.secondary,
    },
    {
      name: 'Crianças',
      memberCount: 20,
      leader: 'Ana Silva',
      icon: '👶',
      color: Colors.accent,
    },
    {
      name: 'Intercessão',
      memberCount: 15,
      leader: 'Pedro Lima',
      icon: '🙏',
      color: Colors.info,
    },
  ];

  const titheSummary: TitheSummary[] = [
    { month: 'Janeiro', amount: 12000, percentage: 85 },
    { month: 'Dezembro', amount: 11000, percentage: 78 },
    { month: 'Novembro', amount: 13500, percentage: 92 },
  ];

  const renderMetricCard = (metric: any) => (
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

  const renderMinistryCard = (ministry: MinistryCard) => (
    <TouchableOpacity
      key={ministry.name}
      style={styles.ministryCard}
      onPress={() => console.log(`Ver ministério: ${ministry.name}`)}
    >
      <View style={[styles.ministryIcon, { backgroundColor: ministry.color }]}>
        <Text style={styles.ministryIconText}>{ministry.icon}</Text>
      </View>
      <View style={styles.ministryContent}>
        <Text style={styles.ministryName}>{ministry.name}</Text>
        <Text style={styles.ministryLeader}>Líder: {ministry.leader}</Text>
        <Text style={styles.ministryMembers}>{ministry.memberCount} membros</Text>
      </View>
    </TouchableOpacity>
  );

  const renderTitheItem = (tithe: TitheSummary) => (
    <View key={tithe.month} style={styles.titheItem}>
      <View style={styles.titheHeader}>
        <Text style={styles.titheMonth}>{tithe.month}</Text>
        <Text style={styles.titheAmount}>R$ {tithe.amount.toLocaleString()}</Text>
      </View>
      <View style={styles.titheProgress}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${tithe.percentage}%`, backgroundColor: Colors.accent }
            ]} 
          />
        </View>
        <Text style={styles.tithePercentage}>{tithe.percentage}% da meta</Text>
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
            <Text style={styles.userName}>Pastor Silva</Text>
            <Text style={styles.userRole}>Pastor</Text>
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
          <Text style={styles.dashboardTitle}>📊 Dashboard Pastoral</Text>
          <Text style={styles.dashboardSubtitle}>
            Visão pastoral da Igreja Oliveira
          </Text>
        </View>

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          {metrics.map(renderMetricCard)}
        </View>

        {/* Ministries Section */}
        <Card variant="elevated" style={styles.ministriesCard}>
          <Text style={styles.sectionTitle}>🎭 Ministérios</Text>
          <View style={styles.ministriesList}>
            {ministries.map(renderMinistryCard)}
          </View>
          <Button
            title="Ver Todos os Ministérios"
            onPress={onNavigateToMinistries}
            variant="outline"
            size="small"
            style={styles.viewAllButton}
          />
        </Card>

        {/* Tithe Summary */}
        <Card variant="elevated" style={styles.titheCard}>
          <Text style={styles.sectionTitle}>💰 Resumo de Dízimos</Text>
          <View style={styles.titheList}>
            {titheSummary.map(renderTitheItem)}
          </View>
          <Button
            title="Ver Relatório Completo"
            onPress={onNavigateToDonations}
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
              title="👥 Ver Membros"
              onPress={onNavigateToMembers}
              variant="primary"
              size="small"
              style={styles.quickActionButton}
            />
            <Button
              title="💰 Ver Dízimos"
              onPress={onNavigateToDonations}
              variant="secondary"
              size="small"
              style={styles.quickActionButton}
            />
            <Button
              title="🎭 Ministérios"
              onPress={onNavigateToMinistries}
              variant="outline"
              size="small"
              style={styles.quickActionButton}
            />
            <Button
              title="📅 Próximo Culto"
              onPress={() => console.log('Próximo culto')}
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
  ministriesCard: {
    margin: Spacing.lg,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.black,
    marginBottom: Spacing.lg,
  },
  ministriesList: {
    marginBottom: Spacing.lg,
  },
  ministryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  ministryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  ministryIconText: {
    fontSize: 20,
  },
  ministryContent: {
    flex: 1,
  },
  ministryName: {
    fontSize: Typography.fontSizeBase,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.black,
    marginBottom: Spacing.xs,
  },
  ministryLeader: {
    fontSize: Typography.fontSizeSm,
    color: Colors.gray,
    marginBottom: Spacing.xs,
  },
  ministryMembers: {
    fontSize: Typography.fontSizeSm,
    color: Colors.accent,
    fontWeight: Typography.fontWeightMedium,
  },
  titheCard: {
    margin: Spacing.lg,
    marginTop: 0,
  },
  titheList: {
    marginBottom: Spacing.lg,
  },
  titheItem: {
    marginBottom: Spacing.md,
  },
  titheHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  titheMonth: {
    fontSize: Typography.fontSizeBase,
    fontWeight: Typography.fontWeightMedium,
    color: Colors.black,
  },
  titheAmount: {
    fontSize: Typography.fontSizeBase,
    fontWeight: Typography.fontWeightBold,
    color: Colors.accent,
  },
  titheProgress: {
    marginBottom: Spacing.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.lightGray,
    borderRadius: 4,
    marginBottom: Spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  tithePercentage: {
    fontSize: Typography.fontSizeSm,
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