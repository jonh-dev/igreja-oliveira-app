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

interface MemberDashboardProps {
  onNavigateToMyDonations: () => void;
  onNavigateToMyProfile: () => void;
  onNavigateToEvents: () => void;
  onNavigateToSettings: () => void;
  onLogout: () => void;
}

interface MyDonation {
  id: string;
  type: 'tithe' | 'offering' | 'special';
  amount: number;
  date: string;
  description?: string;
}

interface MyMinistry {
  name: string;
  role: string;
  icon: string;
  color: string;
}

export const MemberDashboard: React.FC<MemberDashboardProps> = ({
  onNavigateToMyDonations,
  onNavigateToMyProfile,
  onNavigateToEvents,
  onNavigateToSettings,
  onLogout,
}) => {
  const metrics = [
    {
      title: 'Meus Dízimos',
      value: 'R$ 1.200',
      icon: '💰',
      color: Colors.accent,
      onPress: onNavigateToMyDonations,
    },
    {
      title: 'Próximo Evento',
      value: 'Culto 19h',
      icon: '📅',
      color: Colors.primary,
      onPress: onNavigateToEvents,
    },
    {
      title: 'Meus Ministérios',
      value: 'Louvor',
      icon: '🎭',
      color: Colors.secondary,
    },
    {
      title: 'Minhas Doações',
      value: 'R$ 500',
      icon: '💵',
      color: Colors.info,
      onPress: onNavigateToMyDonations,
    },
  ];

  const myDonations: MyDonation[] = [
    {
      id: '1',
      type: 'tithe',
      amount: 200,
      date: '15/01/2025',
      description: 'Dízimo do mês',
    },
    {
      id: '2',
      type: 'offering',
      amount: 50,
      date: '12/01/2025',
      description: 'Oferta especial',
    },
    {
      id: '3',
      type: 'special',
      amount: 100,
      date: '10/01/2025',
      description: 'Doação para missões',
    },
  ];

  const myMinistries: MyMinistry[] = [
    {
      name: 'Louvor',
      role: 'Músico',
      icon: '🎵',
      color: Colors.primary,
    },
    {
      name: 'Jovens',
      role: 'Participante',
      icon: '👨‍🎓',
      color: Colors.secondary,
    },
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

  const renderDonationItem = (donation: MyDonation) => (
    <View key={donation.id} style={styles.donationItem}>
      <View style={styles.donationHeader}>
        <View style={styles.donationType}>
          <Text style={styles.donationTypeText}>
            {donation.type === 'tithe' ? '💰 Dízimo' : 
             donation.type === 'offering' ? '💵 Oferta' : '🎁 Especial'}
          </Text>
          <Text style={styles.donationDate}>{donation.date}</Text>
        </View>
        <Text style={styles.donationAmount}>R$ {donation.amount}</Text>
      </View>
      {donation.description && (
        <Text style={styles.donationDescription}>{donation.description}</Text>
      )}
    </View>
  );

  const renderMinistryItem = (ministry: MyMinistry) => (
    <TouchableOpacity
      key={ministry.name}
      style={styles.ministryItem}
      onPress={() => console.log(`Ver ministério: ${ministry.name}`)}
    >
      <View style={[styles.ministryIcon, { backgroundColor: ministry.color }]}>
        <Text style={styles.ministryIconText}>{ministry.icon}</Text>
      </View>
      <View style={styles.ministryContent}>
        <Text style={styles.ministryName}>{ministry.name}</Text>
        <Text style={styles.ministryRole}>{ministry.role}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <Text style={styles.greeting}>Bem-vindo,</Text>
            <Text style={styles.userName}>Maria Silva</Text>
            <Text style={styles.userRole}>Membro</Text>
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
          <Text style={styles.dashboardTitle}>📊 Meu Dashboard</Text>
          <Text style={styles.dashboardSubtitle}>
            Sua visão pessoal na Igreja Oliveira
          </Text>
        </View>

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          {metrics.map(renderMetricCard)}
        </View>

        {/* My Donations */}
        <Card variant="elevated" style={styles.donationsCard}>
          <Text style={styles.sectionTitle}>💰 Minhas Doações</Text>
          <View style={styles.donationsList}>
            {myDonations.map(renderDonationItem)}
          </View>
          <Button
            title="Ver Todas as Doações"
            onPress={onNavigateToMyDonations}
            variant="outline"
            size="small"
            style={styles.viewAllButton}
          />
        </Card>

        {/* My Ministries */}
        <Card variant="elevated" style={styles.ministriesCard}>
          <Text style={styles.sectionTitle}>🎭 Meus Ministérios</Text>
          <View style={styles.ministriesList}>
            {myMinistries.map(renderMinistryItem)}
          </View>
          <Button
            title="Ver Todos os Ministérios"
            onPress={() => console.log('Ver todos os ministérios')}
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
              title="💰 Nova Doação"
              onPress={onNavigateToMyDonations}
              variant="primary"
              size="small"
              style={styles.quickActionButton}
            />
            <Button
              title="👤 Meu Perfil"
              onPress={onNavigateToMyProfile}
              variant="secondary"
              size="small"
              style={styles.quickActionButton}
            />
            <Button
              title="📅 Eventos"
              onPress={onNavigateToEvents}
              variant="outline"
              size="small"
              style={styles.quickActionButton}
            />
            <Button
              title="🎵 Louvor"
              onPress={() => console.log('Ministério de louvor')}
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
  donationsCard: {
    margin: Spacing.lg,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.black,
    marginBottom: Spacing.lg,
  },
  donationsList: {
    marginBottom: Spacing.lg,
  },
  donationItem: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  donationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  donationType: {
    flex: 1,
  },
  donationTypeText: {
    fontSize: Typography.fontSizeBase,
    fontWeight: Typography.fontWeightMedium,
    color: Colors.black,
    marginBottom: Spacing.xs,
  },
  donationDate: {
    fontSize: Typography.fontSizeSm,
    color: Colors.gray,
  },
  donationAmount: {
    fontSize: Typography.fontSizeBase,
    fontWeight: Typography.fontWeightBold,
    color: Colors.accent,
  },
  donationDescription: {
    fontSize: Typography.fontSizeSm,
    color: Colors.gray,
    fontStyle: 'italic',
  },
  ministriesCard: {
    margin: Spacing.lg,
    marginTop: 0,
  },
  ministriesList: {
    marginBottom: Spacing.lg,
  },
  ministryItem: {
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
  ministryRole: {
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