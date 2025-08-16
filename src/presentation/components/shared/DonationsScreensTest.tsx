import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Card } from './Card';
import { Button } from './Button';
import {
  DonationsListScreen,
  CreateDonationScreen,
  DonationDetailsScreen,
} from '../../screens/donations';
import { Colors, Typography, Spacing } from './design-system';

type DonationsScreenType = null | 'list' | 'create' | 'details';

export const DonationsScreensTest: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<DonationsScreenType>(null);
  const [selectedDonationId, setSelectedDonationId] = useState<string>('1');

  const handleNavigateToList = () => {
    setCurrentScreen('list');
  };

  const handleNavigateToCreate = () => {
    setCurrentScreen('create');
  };

  const handleNavigateToDetails = (donationId: string) => {
    setSelectedDonationId(donationId);
    setCurrentScreen('details');
  };

  const handleNavigateBack = () => {
    setCurrentScreen(null);
  };

  const handleDonationCreated = () => {
    console.log('✅ Doação criada com sucesso!');
    setCurrentScreen('list');
  };

  const handleDonationDeleted = () => {
    console.log('🗑️ Doação excluída com sucesso!');
    setCurrentScreen('list');
  };

  const handleNavigateToEdit = (donationId: string) => {
    console.log('✏️ Editando doação:', donationId);
    // Aqui seria implementada a navegação para tela de edição
  };

  if (currentScreen === 'list') {
    return (
      <DonationsListScreen
        onNavigateToCreateDonation={handleNavigateToCreate}
        onNavigateToDonationDetails={handleNavigateToDetails}
        onNavigateBack={handleNavigateBack}
      />
    );
  }

  if (currentScreen === 'create') {
    return (
      <CreateDonationScreen
        onNavigateBack={handleNavigateBack}
        onDonationCreated={handleDonationCreated}
      />
    );
  }

  if (currentScreen === 'details') {
    return (
      <DonationDetailsScreen
        donationId={selectedDonationId}
        onNavigateBack={handleNavigateBack}
        onNavigateToEdit={handleNavigateToEdit}
        onDonationDeleted={handleDonationDeleted}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>🧪 Donations Screens Test</Text>
          <Text style={styles.subtitle}>
            Teste as telas de doações da Igreja Oliveira
          </Text>

          <Card variant="elevated" style={styles.card}>
            <Text style={styles.cardTitle}>Telas de Doações</Text>
            <Text style={styles.cardDescription}>
              Selecione uma tela para testar a funcionalidade completa de
              doações
            </Text>

            <View style={styles.buttonContainer}>
              <Button
                title="📋 Lista de Doações"
                onPress={handleNavigateToList}
                variant="primary"
                style={styles.testButton}
              />

              <Button
                title="➕ Nova Doação"
                onPress={handleNavigateToCreate}
                variant="secondary"
                style={styles.testButton}
              />

              <Button
                title="👁️ Detalhes da Doação"
                onPress={() => handleNavigateToDetails('1')}
                variant="outline"
                style={styles.testButton}
              />
            </View>
          </Card>

          <Card variant="elevated" style={styles.featuresCard}>
            <Text style={styles.featuresTitle}>
              Funcionalidades Implementadas
            </Text>

            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>📋</Text>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Lista de Doações</Text>
                  <Text style={styles.featureDescription}>
                    Visualização de todas as doações com filtros e busca
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>➕</Text>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Nova Doação</Text>
                  <Text style={styles.featureDescription}>
                    Formulário completo para registro de doações
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>👁️</Text>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Detalhes da Doação</Text>
                  <Text style={styles.featureDescription}>
                    Visualização detalhada com opções de edição e exclusão
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🔍</Text>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Busca e Filtros</Text>
                  <Text style={styles.featureDescription}>
                    Pesquisa por nome e filtros por tipo de doação
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>💰</Text>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Tipos de Doação</Text>
                  <Text style={styles.featureDescription}>
                    Dízimo, Oferta e Doação Especial com validações
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>📊</Text>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Resumos e Métricas</Text>
                  <Text style={styles.featureDescription}>
                    Total de doações e valores com estatísticas
                  </Text>
                </View>
              </View>
            </View>
          </Card>

          <Card variant="elevated" style={styles.techCard}>
            <Text style={styles.techTitle}>Tecnologias Utilizadas</Text>

            <View style={styles.techList}>
              <Text style={styles.techItem}>• React Native + TypeScript</Text>
              <Text style={styles.techItem}>• Clean Architecture</Text>
              <Text style={styles.techItem}>• Design System Consistente</Text>
              <Text style={styles.techItem}>• Validações em Tempo Real</Text>
              <Text style={styles.techItem}>• Estados de Loading e Error</Text>
              <Text style={styles.techItem}>• Navegação Estruturada</Text>
            </View>
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
    color: Colors.primary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.fontSizeBase,
    color: Colors.gray,
    marginBottom: Spacing.xl,
    textAlign: 'center',
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
  },
  buttonContainer: {
    gap: Spacing.md,
  },
  testButton: {
    width: '100%',
  },
  featuresCard: {
    marginBottom: Spacing.lg,
  },
  featuresTitle: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.black,
    marginBottom: Spacing.lg,
  },
  featuresList: {
    gap: Spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  featureIcon: {
    fontSize: Typography.fontSize2xl,
    marginRight: Spacing.md,
    marginTop: 2,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: Typography.fontSizeBase,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.black,
    marginBottom: Spacing.xs,
  },
  featureDescription: {
    fontSize: Typography.fontSizeSm,
    color: Colors.gray,
    lineHeight: 18,
  },
  techCard: {
    marginBottom: Spacing.lg,
  },
  techTitle: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.black,
    marginBottom: Spacing.lg,
  },
  techList: {
    gap: Spacing.sm,
  },
  techItem: {
    fontSize: Typography.fontSizeBase,
    color: Colors.gray,
    lineHeight: 22,
  },
});
