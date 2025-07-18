import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { Button } from '../../components/shared/Button';
import { Input } from '../../components/shared/Input';
import { Card } from '../../components/shared/Card';
import { Colors, Typography, Spacing } from '../../components/shared/design-system';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onNavigateToRegister: () => void;
  onNavigateToForgotPassword: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onNavigateToRegister,
  onNavigateToForgotPassword,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
    }

    if (!password.trim()) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // TODO: Integrar com SupabaseAuthService
      // const authService = container.get<IAuthService>('AuthService');
      // const result = await authService.signIn(email, password);
      
      // Simulação de login para desenvolvimento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onLoginSuccess();
    } catch (error) {
      setErrors({
        general: 'Email ou senha incorretos. Tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Logo e Branding */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>⛪</Text>
            </View>
            <Text style={styles.title}>Igreja Oliveira</Text>
            <Text style={styles.subtitle}>Bem-vindo ao sistema de gestão</Text>
          </View>

          {/* Formulário de Login */}
          <Card variant="elevated" style={styles.formCard}>
            <Text style={styles.formTitle}>Entrar</Text>
            
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Digite seu email"
              type="email"
              error={errors.email}
              required
            />

            <Input
              label="Senha"
              value={password}
              onChangeText={setPassword}
              placeholder="Digite sua senha"
              type="password"
              error={errors.password}
              required
            />

            {errors.general && (
              <Text style={styles.errorText}>{errors.general}</Text>
            )}

            <Button
              title="Entrar"
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading}
              style={styles.loginButton}
            />

            <Button
              title="Esqueceu a senha?"
              onPress={onNavigateToForgotPassword}
              variant="outline"
              size="small"
              style={styles.forgotButton}
            />
          </Card>

          {/* Link para Registro */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Não tem uma conta?</Text>
            <Button
              title="Criar nova conta"
              onPress={onNavigateToRegister}
              variant="secondary"
              size="small"
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  logoText: {
    fontSize: 40,
    color: Colors.white,
  },
  title: {
    fontSize: Typography.fontSizeXl,
    fontWeight: Typography.fontWeightBold,
    color: Colors.black,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSizeBase,
    color: Colors.gray,
    textAlign: 'center',
  },
  formCard: {
    marginBottom: Spacing.lg,
  },
  formTitle: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.black,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  loginButton: {
    marginTop: Spacing.lg,
  },
  forgotButton: {
    marginTop: Spacing.md,
  },
  errorText: {
    color: Colors.danger,
    fontSize: Typography.fontSizeSm,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  registerContainer: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  registerText: {
    fontSize: Typography.fontSizeBase,
    color: Colors.gray,
    marginBottom: Spacing.sm,
  },
}); 