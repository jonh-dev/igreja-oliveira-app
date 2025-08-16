import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  Animated,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Input } from '../../components/shared/Input';
import {
  Colors,
  Typography,
  Spacing,
  Shadows,
  BorderRadius,
} from '../../components/shared/design-system';

interface ForgotPasswordScreenProps {
  onPasswordResetSent: () => void;
  onNavigateBack: () => void;
  onNavigateToLogin: () => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  onPasswordResetSent,
  onNavigateBack,
  onNavigateToLogin,
}) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    general?: string;
  }>({});

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 20000,
          useNativeDriver: true,
        })
      ),
    ]).start();
  }, []);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

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
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      {/* Background com Gradiente */}
      <View style={styles.backgroundGradient} />

      {/* Floating Elements */}
      <Animated.View
        style={[
          styles.floatingElement1,
          {
            transform: [{ rotate: rotateInterpolate }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.floatingElement2,
          {
            transform: [{ rotate: rotateInterpolate }],
          },
        ]}
      />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'position' : undefined}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <View style={styles.content}>
            {/* Hero Section - Top Third */}
            <Animated.View
              style={[
                styles.heroSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
                },
              ]}
            >
              <View style={styles.logoContainer}>
                <View style={styles.logoGlow}>
                  <Image
                    source={{
                      uri: 'https://cghxhewgelpcnglfeirw.supabase.co/storage/v1/object/public/igreja-oliveira/imagens/logo-withe-no-background.png',
                    }}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </View>
              </View>

              <Text style={styles.welcomeTitle}>Recuperar Senha</Text>
              <Text style={styles.welcomeSubtitle}>
                Digite seu email para receber instruções
              </Text>
            </Animated.View>

            {/* Form Section - Middle Third */}
            <Animated.View
              style={[
                styles.formSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.glassForm}>
                <Input
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Digite seu email cadastrado"
                  type="email"
                  error={errors.email}
                  style={styles.compactInput}
                />

                {errors.general && (
                  <Text style={styles.errorText}>{errors.general}</Text>
                )}

                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={handleResetPassword}
                  disabled={isLoading}
                >
                  <View style={styles.resetButtonGradient}>
                    <Text style={styles.resetButtonText}>
                      {isLoading
                        ? 'Enviando...'
                        : 'Enviar Email de Recuperação'}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onNavigateToLogin}
                  style={styles.backButton}
                >
                  <Text style={styles.backText}>Voltar ao Login</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Actions Section - Bottom Third */}
            <Animated.View
              style={[
                styles.actionsSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>💡 Dicas</Text>
                <Text style={styles.infoText}>
                  • Verifique sua caixa de spam{'\n'}• O email pode levar alguns
                  minutos{'\n'}• Entre em contato com o administrador se
                  necessário
                </Text>
              </View>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#0F172A',
  },
  floatingElement1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 9999,
    backgroundColor: 'rgba(85, 107, 47, 0.6)',
    top: '15%',
    right: -60,
    opacity: 0.2,
  },
  floatingElement2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 9999,
    backgroundColor: 'rgba(107, 142, 35, 0.4)',
    bottom: '25%',
    left: -40,
    opacity: 0.15,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'space-between',
  },

  // TOP THIRD - Hero Section (30%)
  heroSection: {
    flex: 0.3,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.md,
  },
  logoContainer: {
    marginBottom: Spacing.sm,
  },
  logoGlow: {
    width: 100,
    height: 100,
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#556B2F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 9999,
  },
  welcomeTitle: {
    fontSize: Typography.fontSize2xl,
    fontWeight: Typography.fontWeightBold,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  welcomeSubtitle: {
    fontSize: Typography.fontSizeBase,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontWeight: Typography.fontWeightMedium,
  },

  // MIDDLE THIRD - Form Section (45%)
  formSection: {
    flex: 0.45,
    justifyContent: 'center',
  },
  glassForm: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: 'rgba(255, 255, 255, 0.1)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  compactInput: {
    marginBottom: Spacing.xs,
  },
  resetButton: {
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  resetButtonGradient: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
  },
  resetButtonText: {
    fontSize: Typography.fontSizeBase,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.white,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    textAlign: 'center',
  },
  backButton: {
    marginTop: Spacing.xs,
    padding: Spacing.xs,
    alignItems: 'center',
  },
  backText: {
    fontSize: Typography.fontSizeSm,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: Typography.fontWeightMedium,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: Typography.fontSizeSm,
    marginTop: Spacing.xs,
    textAlign: 'center',
    fontWeight: Typography.fontWeightMedium,
  },

  // BOTTOM THIRD - Actions Section (25%)
  actionsSection: {
    flex: 0.25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    width: '100%',
  },
  infoTitle: {
    fontSize: Typography.fontSizeBase,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  infoText: {
    fontSize: Typography.fontSizeSm,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 20,
  },
});
