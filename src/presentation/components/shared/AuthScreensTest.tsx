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
import { LoginScreen } from '../../screens/auth/LoginScreen';
import { RegisterScreen } from '../../screens/auth/RegisterScreen';
import { ForgotPasswordScreen } from '../../screens/auth/ForgotPasswordScreen';
import { Colors, Typography, Spacing } from './design-system';

type AuthScreenType = 'login' | 'register' | 'forgot-password' | null;

export const AuthScreensTest: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AuthScreenType>(null);

  const handleLoginSuccess = () => {
    console.log('✅ Login realizado com sucesso');
    setCurrentScreen(null);
  };

  const handleRegisterSuccess = () => {
    console.log('✅ Registro realizado com sucesso');
    setCurrentScreen(null);
  };

  const handlePasswordResetSent = () => {
    console.log('✅ Email de recuperação enviado');
    setCurrentScreen(null);
  };

  const handleNavigateToLogin = () => {
    console.log('🔄 Navegando para Login');
    setCurrentScreen('login');
  };

  const handleNavigateToRegister = () => {
    console.log('🔄 Navegando para Registro');
    setCurrentScreen('register');
  };

  const handleNavigateToForgotPassword = () => {
    console.log('🔄 Navegando para Recuperação de Senha');
    setCurrentScreen('forgot-password');
  };

  if (currentScreen === 'login') {
    return (
      <LoginScreen
        onLoginSuccess={handleLoginSuccess}
        onNavigateToRegister={handleNavigateToRegister}
        onNavigateToForgotPassword={handleNavigateToForgotPassword}
      />
    );
  }

  if (currentScreen === 'register') {
    return (
      <RegisterScreen
        onRegisterSuccess={handleRegisterSuccess}
        onNavigateToLogin={handleNavigateToLogin}
      />
    );
  }

  if (currentScreen === 'forgot-password') {
    return (
      <ForgotPasswordScreen
        onPasswordResetSent={handlePasswordResetSent}
        onNavigateToLogin={handleNavigateToLogin}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>🧪 Auth Screens Test</Text>
          <Text style={styles.subtitle}>
            Teste as telas de autenticação da Igreja Oliveira
          </Text>

          <Card variant="elevated" style={styles.card}>
            <Text style={styles.cardTitle}>Telas de Autenticação</Text>
            <Text style={styles.cardDescription}>
              Selecione uma tela para testar a interface e funcionalidades
            </Text>

            <View style={styles.buttonContainer}>
              <Button
                title="🔐 Login Screen"
                onPress={() => setCurrentScreen('login')}
                variant="primary"
                style={styles.testButton}
              />

              <Button
                title="📝 Register Screen"
                onPress={() => setCurrentScreen('register')}
                variant="secondary"
                style={styles.testButton}
              />

              <Button
                title="🔑 Forgot Password Screen"
                onPress={() => setCurrentScreen('forgot-password')}
                variant="outline"
                style={styles.testButton}
              />
            </View>
          </Card>

          <Card variant="outlined" style={styles.infoCard}>
            <Text style={styles.infoTitle}>📋 Funcionalidades Testadas</Text>
            <Text style={styles.infoText}>
              ✅ Design System aplicado{'\n'}
              ✅ Validações de formulário{'\n'}
              ✅ Estados de loading{'\n'}
              ✅ Tratamento de erros{'\n'}
              ✅ Navegação entre telas{'\n'}
              ✅ Responsividade{'\n'}
              ✅ Acessibilidade básica
            </Text>
          </Card>

          <Card variant="outlined" style={styles.infoCard}>
            <Text style={styles.infoTitle}>🔧 Próximos Passos</Text>
            <Text style={styles.infoText}>
              • Integração com SupabaseAuthService{'\n'}
              • Implementação de Context API{'\n'}
              • Navegação com React Navigation{'\n'}
              • Testes unitários{'\n'}
              • Validações de CPF e CEP reais
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
}); 