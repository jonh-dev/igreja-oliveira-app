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
  ScrollView,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Button } from '../../components/shared/Button';
import { Input } from '../../components/shared/Input';
import { GlassCard } from '../../components/shared/GlassCard';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '../../components/shared/design-system';
import { container } from '../../../infrastructure/config/container';
import { AuthenticateUserUseCase } from '../../../application/use-cases/user/AuthenticateUserUseCase';
import { useLeadTracking } from '../../hooks/useLeadTracking';

type UserRole = 'admin' | 'pastor' | 'deacon' | 'leader' | 'member';

interface LoginScreenProps {
  onLoginSuccess: (role: UserRole, userId?: string) => void;
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

  const { trackFirstLogin, detectDeviceInfo, captureUrlTrackingData, isFirstLogin } = useLeadTracking();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  const { width, height } = Dimensions.get('window');

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
      const authenticateUserUseCase = container.get<AuthenticateUserUseCase>('AuthenticateUserUseCase');
      
      const result = await authenticateUserUseCase.execute({
        email,
        password
      });

      const shouldTrackFirstLogin = await isFirstLogin(result.user.id);
      if (shouldTrackFirstLogin) {
        const deviceInfo = detectDeviceInfo();
        const currentUrl = typeof window !== 'undefined' && window.location ? window.location.href : 'app://igreja-oliveira/login';
        const urlData = captureUrlTrackingData(currentUrl);
        
        await trackFirstLogin({
          userId: result.user.id,
          ...urlData,
          ...deviceInfo,
          conversionType: 'first_login'
        });
      }
      
      onLoginSuccess(result.user.role, result.user.id);
    } catch (error) {
      setErrors({
        general: 'Email ou senha incorretos. Tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background com Gradiente */}
      <View style={styles.backgroundGradient} />
      
      {/* Floating Elements */}
      <Animated.View 
        style={[
          styles.floatingElement1,
          {
            transform: [{ rotate: rotateInterpolate }]
          }
        ]}
      />
      <Animated.View 
        style={[
          styles.floatingElement2,
          {
            transform: [{ rotate: rotateInterpolate }]
          }
        ]}
      />
      
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            {/* Hero Section */}
            <Animated.View 
              style={[
                styles.heroSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }, { scale: scaleAnim }]
                }
              ]}
            >
              <View style={styles.logoContainer}>
                <View style={styles.logoGlow}>
                  <Image
                    source={{
                      uri: 'https://cghxhewgelpcnglfeirw.supabase.co/storage/v1/object/sign/igreja-oliveira/imagens/logo.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NGNmZWI4MS00NDFmLTRmODUtYWIyZC0wNjZhYjcwODY1YWMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpZ3JlamEtb2xpdmVpcmEvaW1hZ2Vucy9sb2dvLmpwZyIsImlhdCI6MTc1NDQ0ODUxMCwiZXhwIjo0ODc2NTEyNTEwfQ.fTXRVaV2etXr6vARoRKCWHhVA9v1QtKV40iYtIvEsEE'
                    }}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </View>
              </View>
              
              <Text style={styles.welcomeTitle}>Bem-vindo de volta</Text>
              <Text style={styles.welcomeSubtitle}>Igreja Oliveira</Text>
            </Animated.View>

            {/* Glass Form */}
            <Animated.View
              style={[
                styles.formContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <View style={styles.glassForm}>
                <View style={styles.formContent}>
                  <Input
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="seu@email.com"
                    type="email"
                    error={errors.email}
                    style={styles.glassInput}
                  />

                  <Input
                    label="Senha"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    type="password"
                    error={errors.password}
                    style={styles.glassInput}
                  />

                  {errors.general && (
                    <Text style={styles.errorText}>{errors.general}</Text>
                  )}

                  <TouchableOpacity
                    style={styles.loginButton}
                    onPress={handleLogin}
                    disabled={isLoading}
                  >
                    <View style={styles.loginButtonGradient}>
                      <Text style={styles.loginButtonText}>
                        {isLoading ? 'Entrando...' : 'Entrar'}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={onNavigateToForgotPassword}
                    style={styles.forgotButton}
                  >
                    <Text style={styles.forgotText}>Esqueceu sua senha?</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>

            {/* Register Link */}
            <Animated.View
              style={[
                styles.registerContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <Text style={styles.registerText}>Não tem uma conta?</Text>
              <TouchableOpacity onPress={onNavigateToRegister}>
                <Text style={styles.registerLink}>Criar conta</Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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
    width: 200,
    height: 200,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.glow.primary,
    top: screenHeight * 0.1,
    right: -100,
    opacity: 0.3,
  },
  floatingElement2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.glow.secondary,
    bottom: screenHeight * 0.2,
    left: -75,
    opacity: 0.2,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing['2xl'],
    justifyContent: 'center',
    minHeight: screenHeight,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  logoContainer: {
    marginBottom: Spacing.xl,
  },
  logoGlow: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    ...Shadows.glow,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
  },
  welcomeTitle: {
    fontSize: Typography.fontSize3xl,
    fontWeight: Typography.fontWeightBold,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  welcomeSubtitle: {
    fontSize: Typography.fontSizeLg,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontWeight: Typography.fontWeightMedium,
  },
  formContainer: {
    marginBottom: Spacing.xl,
  },
  glassForm: {
    borderRadius: BorderRadius.xxl,
    borderWidth: 1,
    borderColor: Colors.glass.border,
    backgroundColor: Colors.glass.background,
    ...Shadows.glass,
    overflow: 'hidden',
  },
  formContent: {
    padding: Spacing.xl,
  },
  glassInput: {
    marginBottom: Spacing.lg,
  },
  loginButton: {
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  loginButtonGradient: {
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
  },
  loginButtonText: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.white,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  forgotButton: {
    marginTop: Spacing.lg,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  forgotText: {
    fontSize: Typography.fontSizeBase,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: Typography.fontWeightMedium,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: Typography.fontSizeSm,
    marginTop: Spacing.sm,
    textAlign: 'center',
    fontWeight: Typography.fontWeightMedium,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  registerText: {
    fontSize: Typography.fontSizeBase,
    color: 'rgba(255, 255, 255, 0.7)',
    marginRight: Spacing.xs,
  },
  registerLink: {
    fontSize: Typography.fontSizeBase,
    color: Colors.secondary,
    fontWeight: Typography.fontWeightSemibold,
    textDecorationLine: 'underline',
  },
}); 