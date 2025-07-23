import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { GasofilaçoScreen } from '../../screens/donations/GasofilaçoScreen';
import { GasofilacoReportsScreen } from '../../screens/donations/GasofilacoReportsScreen';
import { Colors, Typography, Spacing } from './design-system';

type TestScreen = 'gasofilaço' | 'reports';

export const GasofilaçoScreenTest: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<TestScreen>('gasofilaço');

  const handleNavigateBack = () => {
    Alert.alert('Navegação', 'Voltar pressionado');
  };

  const handleGasofilaçoRegistered = () => {
    Alert.alert('Sucesso', 'Gasofilaço registrado com sucesso!');
  };

  const renderGasofilaçoScreen = () => (
    <GasofilaçoScreen
      onNavigateBack={handleNavigateBack}
      onGasofilaçoRegistered={handleGasofilaçoRegistered}
    />
  );

  const renderReportsScreen = () => (
    <GasofilacoReportsScreen
      onNavigateBack={handleNavigateBack}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🧪 Teste - Gasofilaço</Text>
        <Text style={styles.subtitle}>Teste as funcionalidades do sistema de gasofilaço</Text>
      </View>

      <View style={styles.navigation}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.navButton,
              currentScreen === 'gasofilaço' && styles.navButtonActive
            ]}
            onPress={() => setCurrentScreen('gasofilaço')}
          >
            <Text style={[
              styles.navButtonText,
              currentScreen === 'gasofilaço' && styles.navButtonTextActive
            ]}>
              📝 Registrar Gasofilaço
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navButton,
              currentScreen === 'reports' && styles.navButtonActive
            ]}
            onPress={() => setCurrentScreen('reports')}
          >
            <Text style={[
              styles.navButtonText,
              currentScreen === 'reports' && styles.navButtonTextActive
            ]}>
              📊 Relatórios
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View style={styles.content}>
        {currentScreen === 'gasofilaço' ? renderGasofilaçoScreen() : renderReportsScreen()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  header: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  title: {
    fontSize: Typography.fontSize2xl,
    fontWeight: Typography.fontWeightBold,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSizeSm,
    color: Colors.gray,
    textAlign: 'center',
  },
  navigation: {
    backgroundColor: Colors.white,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  navButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginHorizontal: Spacing.xs,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
  },
  navButtonActive: {
    backgroundColor: Colors.primary,
  },
  navButtonText: {
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightMedium,
    color: Colors.gray,
  },
  navButtonTextActive: {
    color: Colors.white,
  },
  content: {
    flex: 1,
  },
}); 