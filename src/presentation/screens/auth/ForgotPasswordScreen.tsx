import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Button } from '../../components/shared/Button';
import { Input } from '../../components/shared/Input';
import { Card } from '../../components/shared/Card';
import { Colors, Typography, Spacing } from '../../components/shared/design-system';

interface ForgotPasswordScreenProps {
  onPasswordResetSent: () => void;
  onNavigateToLogin: () => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  onPasswordResetSent,
  onNavigateToLogin,
}) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    general?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // TODO: Integrar com SupabaseAuthService
      // const authService = container.get<IAuthService>('AuthService');
      // await authService.resetPassword(email);
      
      // Simulação de envio de email para desenvolvimento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        'Email Enviado!',
        'Verifique sua caixa de entrada para instruções de recuperação de senha.',
        [
          {
            text: 'OK',
            onPress: onPasswordResetSent,
          },
        ]
      );
    } catch (error) {
      setErrors({
        general: 'Erro ao enviar email de recuperação. Tente novamente.',
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
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>⛪</Text>
            </View>
            <Text style={styles.title}>Recuperar Senha</Text>
            <Text style={styles.subtitle}>
              Digite seu email para receber instruções de recuperação
            </Text>
          </View>

          {/* Formulário de Recuperação */}
          <Card variant="elevated" style={styles.formCard}>
            <Text style={styles.formTitle}>Enviar Email de Recuperação</Text>
            
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Digite seu email cadastrado"
              type="email"
              error={errors.email}
              required
            />

            {errors.general && (
              <Text style={styles.errorText}>{errors.general}</Text>
            )}

            <Button
              title="Enviar Email de Recuperação"
              onPress={handleResetPassword}
              loading={isLoading}
              disabled={isLoading}
              style={styles.resetButton}
            />

            <Button
              title="Voltar ao Login"
              onPress={onNavigateToLogin}
              variant="outline"
              size="small"
              style={styles.backButton}
            />
          </Card>

          {/* Informações Adicionais */}
          <Card variant="outlined" style={styles.infoCard}>
            <Text style={styles.infoTitle}>💡 Dicas</Text>
            <Text style={styles.infoText}>
              • Verifique sua caixa de spam{'\n'}
              • O email pode levar alguns minutos{'\n'}
              • Entre em contato com o administrador se necessário
            </Text>
          </Card>
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
    lineHeight: 22,
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
  resetButton: {
    marginTop: Spacing.lg,
  },
  backButton: {
    marginTop: Spacing.md,
  },
  errorText: {
    color: Colors.danger,
    fontSize: Typography.fontSizeSm,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  infoCard: {
    marginTop: Spacing.lg,
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