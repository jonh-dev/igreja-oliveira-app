import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Button } from './Button';
import { Card } from './Card';
import { AdminDashboard } from '../../screens/dashboard/AdminDashboard';
import { PastorDashboard } from '../../screens/dashboard/PastorDashboard';
import { MemberDashboard } from '../../screens/dashboard/MemberDashboard';
import { Colors, Typography, Spacing } from './design-system';

type DashboardScreenType = 'admin' | 'pastor' | 'member' | null;

export const DashboardScreensTest: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<DashboardScreenType>(null);

  const handleNavigateToMembers = () => {
    console.log('🔄 Navegando para Membros');
  };

  const handleNavigateToDonations = () => {
    console.log('🔄 Navegando para Doações');
  };

  const handleNavigateToReports = () => {
    console.log('🔄 Navegando para Relatórios');
  };

  const handleNavigateToMinistries = () => {
    console.log('🔄 Navegando para Ministérios');
  };

  const handleNavigateToSettings = () => {
    console.log('🔄 Navegando para Configurações');
  };

  const handleNavigateToMyDonations = () => {
    console.log('🔄 Navegando para Minhas Doações');
  };

  const handleNavigateToMyProfile = () => {
    console.log('🔄 Navegando para Meu Perfil');
  };

  const handleNavigateToEvents = () => {
    console.log('🔄 Navegando para Eventos');
  };

  const handleLogout = () => {
    console.log('🚪 Logout realizado');
    setCurrentScreen(null);
  };

  if (currentScreen === 'admin') {
    return (
      <AdminDashboard
        onNavigateToMembers={handleNavigateToMembers}
        onNavigateToDonations={handleNavigateToDonations}
        onNavigateToReports={handleNavigateToReports}
        onNavigateToSettings={handleNavigateToSettings}
        onLogout={handleLogout}
      />
    );
  }

  if (currentScreen === 'pastor') {
    return (
      <PastorDashboard
        onNavigateToMembers={handleNavigateToMembers}
        onNavigateToDonations={handleNavigateToDonations}
        onNavigateToMinistries={handleNavigateToMinistries}
        onNavigateToSettings={handleNavigateToSettings}
        onLogout={handleLogout}
      />
    );
  }

  if (currentScreen === 'member') {
    return (
      <MemberDashboard
        onNavigateToMyDonations={handleNavigateToMyDonations}
        onNavigateToMyProfile={handleNavigateToMyProfile}
        onNavigateToEvents={handleNavigateToEvents}
        onNavigateToSettings={handleNavigateToSettings}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>🧪 Dashboard Screens Test</Text>
          <Text style={styles.subtitle}>
            Teste as telas de dashboard da Igreja Oliveira
          </Text>

          <Card variant="elevated" style={styles.card}>
            <Text style={styles.cardTitle}>Dashboards por Hierarquia</Text>
            <Text style={styles.cardDescription}>
              Selecione um dashboard para testar a interface específica de cada role
            </Text>

            <View style={styles.buttonContainer}>
              <Button
                title="👑 Admin Dashboard"
                onPress={() => setCurrentScreen('admin')}
                variant="primary"
                style={styles.testButton}
              />

              <Button
                title="⛪ Pastor Dashboard"
                onPress={() => setCurrentScreen('pastor')}
                variant="secondary"
                style={styles.testButton}
              />

              <Button
                title="👤 Member Dashboard"
                onPress={() => setCurrentScreen('member')}
                variant="outline"
                style={styles.testButton}
              />
            </View>
          </Card>

          <Card variant="outlined" style={styles.infoCard}>
            <Text style={styles.infoTitle}>📋 Funcionalidades Testadas</Text>
            <Text style={styles.infoText}>
              ✅ Design System aplicado{'\n'}
              ✅ Métricas personalizadas por role{'\n'}
              ✅ Cards de estatísticas{'\n'}
              ✅ Atividades recentes{'\n'}
              ✅ Ações rápidas{'\n'}
              ✅ Navegação entre seções{'\n'}
              ✅ Responsividade mobile
            </Text>
          </Card>

          <Card variant="outlined" style={styles.infoCard}>
            <Text style={styles.infoTitle}>🎯 Características por Dashboard</Text>
            <Text style={styles.infoText}>
              <Text style={styles.bold}>👑 Admin:</Text> Visão geral completa, todas as métricas{'\n'}
              <Text style={styles.bold}>⛪ Pastor:</Text> Foco em ministérios e dízimos{'\n'}
              <Text style={styles.bold}>👤 Member:</Text> Dados pessoais e doações próprias
            </Text>
          </Card>

          <Card variant="outlined" style={styles.infoCard}>
            <Text style={styles.infoTitle}>🔧 Próximos Passos</Text>
            <Text style={styles.infoText}>
              • Integração com dados reais do Supabase{'\n'}
              • Implementação de Context API{'\n'}
              • Navegação com React Navigation{'\n'}
              • Testes unitários{'\n'}
              • Gráficos e visualizações
            </Text>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize2xl,
    fontWeight: Typography.fontWeightBold,
    color: Colors.black,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.fontSizeBase,
    color: Colors.gray,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  card: {
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.black,
    marginBottom: Spacing.sm,
  },
  cardDescription: {
    fontSize: Typography.fontSizeBase,
    color: Colors.gray,
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  buttonContainer: {
    gap: Spacing.md,
  },
  testButton: {
    marginBottom: Spacing.sm,
  },
  infoCard: {
    marginBottom: Spacing.lg,
  },
  infoTitle: {
    fontSize: Typography.fontSizeBase,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.black,
    marginBottom: Spacing.sm,
  },
  infoText: {
    fontSize: Typography.fontSizeSm,
    color: Colors.gray,
    lineHeight: 20,
  },
  bold: {
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.black,
  },
}); 