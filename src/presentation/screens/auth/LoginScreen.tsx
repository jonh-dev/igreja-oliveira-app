import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { Input } from '../../components/shared/Input';
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
                  transform: [{ translateY: slideAnim }, { scale: scaleAnim }]
                }
              ]}
            >
              <View style={styles.logoContainer}>
                <View style={styles.logoGlow}>
                  <Image
                    source={{
                      uri: 'https://cghxhewgelpcnglfeirw.supabase.co/storage/v1/object/public/igreja-oliveira/imagens/logo-no-background.png'
                    }}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </View>
              </View>
              
              <Text style={styles.welcomeTitle}>Igreja Oliveira</Text>
              <Text style={styles.welcomeSubtitle}>Bem-vindo de volta</Text>
            </Animated.View>

            {/* Form Section - Middle Third */}
            <Animated.View
              style={[
                styles.formSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <View style={styles.glassForm}>
                <Input
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="seu@email.com"
                  type="email"
                  error={errors.email}
                  style={styles.compactInput}
                />

                <Input
                  label="Senha"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  type="password"
                  error={errors.password}
                  style={styles.compactInput}
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
            </Animated.View>

            {/* Actions Section - Bottom Third */}
            <Animated.View
              style={[
                styles.actionsSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <View style={styles.divider} />
              
              <TouchableOpacity 
                style={styles.createAccountButton}
                onPress={onNavigateToRegister}
              >
                <View style={styles.createAccountGradient}>
                  <Text style={styles.createAccountText}>Criar nova conta</Text>
                </View>
              </TouchableOpacity>
              
              <Text style={styles.footerText}>Junte-se à nossa comunidade</Text>
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
  loginButton: {
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  loginButtonGradient: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
  },
  loginButtonText: {
    fontSize: Typography.fontSizeBase,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.white,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  forgotButton: {
    marginTop: Spacing.xs,
    padding: Spacing.xs,
    alignItems: 'center',
  },
  forgotText: {
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
  divider: {
    width: '60%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginBottom: Spacing.sm,
  },
  createAccountButton: {
    width: '100%',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  createAccountGradient: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  createAccountText: {
    fontSize: Typography.fontSizeBase,
    fontWeight: Typography.fontWeightMedium,
    color: Colors.secondary,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  footerText: {
    fontSize: Typography.fontSizeSm,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
}); 