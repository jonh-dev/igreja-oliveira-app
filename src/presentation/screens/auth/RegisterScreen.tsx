import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
  StatusBar,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { Input } from '../../components/shared/Input';
import { PhoneInput } from '../../components/shared/PhoneInput';
import {
  Colors,
  Typography,
  Spacing,
  Shadows,
  BorderRadius,
} from '../../components/shared/design-system';
import { container } from '../../../infrastructure/config/container';
import { ICEPValidationService } from '../../../application/interfaces/services/ICEPValidationService';
import { useLeadTracking } from '../../hooks/useLeadTracking';

interface PendingRegistrationData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

interface RegisterScreenProps {
  onRegisterSuccess: () => void;
  onNavigateToLogin: () => void;
  onNavigateToEmailVerification?: (data: PendingRegistrationData) => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  cep: string;
  address: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  cep?: string;
  address?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  general?: string;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onRegisterSuccess,
  onNavigateToLogin,
  onNavigateToEmailVerification,
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    cep: '',
    address: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isCEPLoading, setIsCEPLoading] = useState(false);
  const cepPulse = useRef(new Animated.Value(0)).current;

  const { captureUrlTrackingData, detectDeviceInfo } = useLeadTracking();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 25000,
          useNativeDriver: true,
        })
      ),
    ]).start();
  }, []);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const validateCEP = (cep: string): boolean => {
    const cleanCEP = cep.replace(/\D/g, '');
    return cleanCEP.length === 8;
  };

  const handleCEPChange = async (cep: string) => {
    updateFormData('cep', cep);

    const cleanCEP = cep.replace(/\D/g, '');
    if (cleanCEP.length === 8) {
      setIsCEPLoading(true);
      Animated.loop(
        Animated.sequence([
          Animated.timing(cepPulse, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(cepPulse, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      try {
        const cepService = container.get<ICEPValidationService>(
          'CEPValidationService'
        );
        const cepData = await cepService.validateCEP(cleanCEP);

        if (cepData) {
          setFormData(prev => ({
            ...prev,
            address: cepData.logradouro || prev.address,
            neighborhood: cepData.bairro || prev.neighborhood,
            city: cepData.localidade || prev.city,
            state: cepData.uf || prev.state,
          }));

          if (errors.cep) {
            setErrors(prev => ({ ...prev, cep: undefined }));
          }
        } else {
          setErrors(prev => ({ ...prev, cep: 'CEP não encontrado' }));
        }
      } catch (error) {
        console.error('Erro ao validar CEP:', error);
        setErrors(prev => ({ ...prev, cep: 'Erro ao buscar CEP' }));
      } finally {
        setIsCEPLoading(false);
        cepPulse.stopAnimation();
        cepPulse.setValue(0);
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    } else if (formData.phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Telefone inválido';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    if (!formData.cep.trim()) {
      newErrors.cep = 'CEP é obrigatório';
    } else if (!validateCEP(formData.cep)) {
      newErrors.cep = 'CEP inválido';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Endereço é obrigatório';
    }

    if (!formData.number.trim()) {
      newErrors.number = 'Número é obrigatório';
    }

    if (!formData.neighborhood.trim()) {
      newErrors.neighborhood = 'Bairro é obrigatório';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Cidade é obrigatória';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'Estado é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // Redireciona diretamente para verificação, sem criar usuário aqui
      if (onNavigateToEmailVerification) {
        onNavigateToEmailVerification({
          email: formData.email,
          password: formData.password,
          fullName: formData.name,
          phone: formData.phone,
          address: {
            street: formData.address,
            number: formData.number,
            neighborhood: formData.neighborhood,
            city: formData.city,
            state: formData.state,
            zipCode: formData.cep,
          },
        });
        return;
      }
      Alert.alert(
        'Verifique seu e-mail',
        'Enviamos um link de confirmação. Após confirmar, faça login.'
      );
      onRegisterSuccess();
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
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
      <Animated.View
        style={[
          styles.floatingElement3,
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
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
          >
            {/* Hero Section */}
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

              <Text style={styles.welcomeTitle}>Criar Conta</Text>
              <Text style={styles.welcomeSubtitle}>
                Junte-se à Igreja Oliveira
              </Text>
            </Animated.View>

            {/* Personal Data Section */}
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
                <Text style={styles.sectionTitle}>👤 Dados Pessoais</Text>

                <Input
                  label="Nome Completo"
                  value={formData.name}
                  onChangeText={value => updateFormData('name', value)}
                  placeholder="Digite seu nome completo"
                  error={errors.name}
                  style={styles.compactInput}
                />

                <Input
                  label="Email"
                  value={formData.email}
                  onChangeText={value => updateFormData('email', value)}
                  placeholder="Digite seu email"
                  type="email"
                  error={errors.email}
                  style={styles.compactInput}
                />

                <PhoneInput
                  label="Telefone"
                  value={formData.phone}
                  onChangeText={value => updateFormData('phone', value)}
                  placeholder="(00) 00000-0000"
                  error={errors.phone}
                />
              </View>
            </Animated.View>

            {/* Address Section */}
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
                <Text style={styles.sectionTitle}>📍 Endereço</Text>

                <Input
                  label="CEP"
                  value={formData.cep}
                  onChangeText={handleCEPChange}
                  placeholder="00000-000"
                  type="cep"
                  error={errors.cep}
                  style={styles.compactInput}
                />
                {isCEPLoading && (
                  <View style={styles.cepLoadingRow}>
                    <Animated.View
                      style={[
                        styles.cepDot,
                        {
                          opacity: cepPulse.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.3, 1],
                          }),
                        },
                      ]}
                    />
                    <Text style={styles.loadingText}>Buscando endereço…</Text>
                  </View>
                )}

                <View style={styles.row}>
                  <View style={styles.addressWidth}>
                    <Input
                      label="Endereço"
                      value={formData.address}
                      onChangeText={value => updateFormData('address', value)}
                      placeholder="Nome da rua"
                      error={errors.address}
                      style={styles.compactInput}
                    />
                  </View>
                  <View style={styles.numberWidth}>
                    <Input
                      label="Número"
                      value={formData.number}
                      onChangeText={value => updateFormData('number', value)}
                      placeholder="123"
                      error={errors.number}
                      style={styles.compactInput}
                    />
                  </View>
                </View>

                <Input
                  label="Bairro"
                  value={formData.neighborhood}
                  onChangeText={value => updateFormData('neighborhood', value)}
                  placeholder="Digite o bairro"
                  error={errors.neighborhood}
                  style={styles.compactInput}
                />

                <View style={styles.row}>
                  <View style={styles.halfWidth}>
                    <Input
                      label="Cidade"
                      value={formData.city}
                      onChangeText={value => updateFormData('city', value)}
                      placeholder="Cidade"
                      error={errors.city}
                      style={styles.compactInput}
                    />
                  </View>
                  <View style={styles.halfWidth}>
                    <Input
                      label="Estado"
                      value={formData.state}
                      onChangeText={value => updateFormData('state', value)}
                      placeholder="UF"
                      error={errors.state}
                      style={styles.compactInput}
                    />
                  </View>
                </View>
              </View>
            </Animated.View>

            {/* Security Section */}
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
                <Text style={styles.sectionTitle}>🔐 Segurança</Text>

                <Input
                  label="Senha"
                  value={formData.password}
                  onChangeText={value => updateFormData('password', value)}
                  placeholder="Digite sua senha"
                  type="password"
                  error={errors.password}
                  style={styles.compactInput}
                />

                <Input
                  label="Confirmar Senha"
                  value={formData.confirmPassword}
                  onChangeText={value =>
                    updateFormData('confirmPassword', value)
                  }
                  placeholder="Confirme sua senha"
                  type="password"
                  error={errors.confirmPassword}
                  style={styles.compactInput}
                />

                {errors.general && (
                  <Text style={styles.errorText}>{errors.general}</Text>
                )}

                <TouchableOpacity
                  style={styles.registerButton}
                  onPress={handleRegister}
                  disabled={isLoading}
                >
                  <View style={styles.registerButtonGradient}>
                    <Text style={styles.registerButtonText}>
                      {isLoading ? 'Criando conta...' : 'Criar Conta'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Actions Section */}
            <Animated.View
              style={[
                styles.actionsSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.divider} />

              <TouchableOpacity
                style={styles.loginButton}
                onPress={onNavigateToLogin}
              >
                <View style={styles.loginButtonGradient}>
                  <Text style={styles.loginButtonText}>
                    Já tem conta? Fazer Login
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
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
    width: 100,
    height: 100,
    borderRadius: 9999,
    backgroundColor: 'rgba(85, 107, 47, 0.5)',
    top: '10%',
    right: -50,
    opacity: 0.15,
  },
  floatingElement2: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 9999,
    backgroundColor: 'rgba(107, 142, 35, 0.3)',
    bottom: '30%',
    left: -30,
    opacity: 0.1,
  },
  floatingElement3: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 9999,
    backgroundColor: 'rgba(143, 188, 143, 0.2)',
    top: '50%',
    right: -40,
    opacity: 0.08,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },

  // Hero Section
  heroSection: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.md,
  },
  logoContainer: {
    marginBottom: Spacing.sm,
  },
  logoGlow: {
    width: 80,
    height: 80,
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#556B2F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 9999,
  },
  welcomeTitle: {
    fontSize: Typography.fontSizeXl,
    fontWeight: Typography.fontWeightBold,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  welcomeSubtitle: {
    fontSize: Typography.fontSizeSm,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontWeight: Typography.fontWeightMedium,
  },

  // Form Sections
  formSection: {
    marginBottom: Spacing.md,
  },
  glassForm: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    shadowColor: 'rgba(255, 255, 255, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.fontSizeBase,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.white,
    marginBottom: Spacing.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  compactInput: {
    marginBottom: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  halfWidth: {
    flex: 1,
  },
  addressWidth: {
    flex: 3,
  },
  numberWidth: {
    flex: 1,
  },
  registerButton: {
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  registerButtonGradient: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
  },
  registerButtonText: {
    fontSize: Typography.fontSizeBase,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.white,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    textAlign: 'center',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: Typography.fontSizeSm,
    marginTop: Spacing.xs,
    textAlign: 'center',
    fontWeight: Typography.fontWeightMedium,
  },
  loadingText: {
    fontSize: Typography.fontSizeSm,
    color: Colors.secondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    fontWeight: Typography.fontWeightMedium,
  },
  cepLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    justifyContent: 'center',
  },
  cepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.secondary,
  },

  // Actions Section
  actionsSection: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  divider: {
    width: '50%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: Spacing.sm,
  },
  loginButton: {
    width: '100%',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  loginButtonGradient: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  loginButtonText: {
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightMedium,
    color: 'rgba(255, 255, 255, 0.7)',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});
