import React, { useState } from 'react';
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
} from 'react-native';
import { Button } from '../../components/shared/Button';
import { Input } from '../../components/shared/Input';
import { PhoneInput } from '../../components/shared/PhoneInput';
import { Card } from '../../components/shared/Card';
import { Colors, Typography, Spacing } from '../../components/shared/design-system';
import { container } from '../../../infrastructure/config/container';
import { ICEPValidationService } from '../../../application/interfaces/services/ICEPValidationService';
import { CreateUserUseCase } from '../../../application/use-cases/user/CreateUserUseCase';
import { useLeadTracking } from '../../hooks/useLeadTracking';

interface RegisterScreenProps {
  onRegisterSuccess: () => void;
  onNavigateBack: () => void;
  onNavigateToLogin: () => void;
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
  onNavigateBack,
  onNavigateToLogin,
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
  
  const { captureUrlTrackingData, detectDeviceInfo } = useLeadTracking();


  const validateCEP = (cep: string): boolean => {
    const cleanCEP = cep.replace(/\D/g, '');
    return cleanCEP.length === 8;
  };

  const handleCEPChange = async (cep: string) => {
    updateFormData('cep', cep);
    
    const cleanCEP = cep.replace(/\D/g, '');
    if (cleanCEP.length === 8) {
      setIsCEPLoading(true);
      
      try {
        const cepService = container.get<ICEPValidationService>('CEPValidationService');
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
      const createUserUseCase = container.get<CreateUserUseCase>('CreateUserUseCase');
      
      const deviceInfo = detectDeviceInfo();
      const currentUrl = typeof window !== 'undefined' && window.location ? window.location.href : 'app://igreja-oliveira/register';
      const urlData = captureUrlTrackingData(currentUrl);
      
      await createUserUseCase.execute({
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
        trackingData: {
          ...urlData,
          ...deviceInfo
        }
      });
      
      Alert.alert(
        'Conta Criada!',
        'Sua conta foi criada com sucesso! Verifique seu email para confirmar sua conta antes de fazer login.',
        [
          {
            text: 'OK',
            onPress: onRegisterSuccess,
          },
        ]
      );
    } catch (error) {
      console.error('Erro detalhado no cadastro:', error);
      
      let errorMessage = 'Erro ao criar conta. Tente novamente.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error('Mensagem do erro:', error.message);
        console.error('Stack trace:', error.stack);
      } else {
        console.error('Erro não identificado:', JSON.stringify(error));
      }
      
      setErrors({
        general: errorMessage,
      });
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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image
                source={{
                  uri: 'https://cghxhewgelpcnglfeirw.supabase.co/storage/v1/object/sign/igreja-oliveira/imagens/logo.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NGNmZWI4MS00NDFmLTRmODUtYWIyZC0wNjZhYjcwODY1YWMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpZ3JlamEtb2xpdmVpcmEvaW1hZ2Vucy9sb2dvLmpwZyIsImlhdCI6MTc1NDQ0ODUxMCwiZXhwIjo0ODc2NTEyNTEwfQ.fTXRVaV2etXr6vARoRKCWHhVA9v1QtKV40iYtIvEsEE'
                }}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>Criar Conta</Text>
            <Text style={styles.subtitle}>Junte-se à Igreja Oliveira</Text>
          </View>

          {/* Formulário de Registro */}
          <Card variant="elevated" style={styles.formCard}>
            <Text style={styles.formTitle}>Dados Pessoais</Text>
            
            <Input
              label="Nome Completo"
              value={formData.name}
              onChangeText={(value) => updateFormData('name', value)}
              placeholder="Digite seu nome completo"
              error={errors.name}
              required
            />

            <Input
              label="Email"
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              placeholder="Digite seu email"
              type="email"
              error={errors.email}
              required
            />


            <PhoneInput
              label="Telefone"
              value={formData.phone}
              onChangeText={(value) => updateFormData('phone', value)}
              placeholder="(00) 00000-0000"
              error={errors.phone}
              required
            />

            <Text style={styles.sectionTitle}>Endereço</Text>

            <Input
              label="CEP"
              value={formData.cep}
              onChangeText={handleCEPChange}
              placeholder="00000-000"
              type="cep"
              error={errors.cep}
              required
            />
            {isCEPLoading && (
              <Text style={styles.loadingText}>Buscando endereço...</Text>
            )}

            <View style={styles.row}>
              <View style={styles.addressWidth}>
                <Input
                  label="Endereço"
                  value={formData.address}
                  onChangeText={(value) => updateFormData('address', value)}
                  placeholder="Nome da rua"
                  error={errors.address}
                  required
                />
              </View>
              <View style={styles.numberWidth}>
                <Input
                  label="Número"
                  value={formData.number}
                  onChangeText={(value) => updateFormData('number', value)}
                  placeholder="123"
                  error={errors.number}
                  required
                />
              </View>
            </View>

            <Input
              label="Bairro"
              value={formData.neighborhood}
              onChangeText={(value) => updateFormData('neighborhood', value)}
              placeholder="Digite o bairro"
              error={errors.neighborhood}
              required
            />

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Input
                  label="Cidade"
                  value={formData.city}
                  onChangeText={(value) => updateFormData('city', value)}
                  placeholder="Cidade"
                  error={errors.city}
                  required
                />
              </View>
              <View style={styles.halfWidth}>
                <Input
                  label="Estado"
                  value={formData.state}
                  onChangeText={(value) => updateFormData('state', value)}
                  placeholder="UF"
                  error={errors.state}
                  required
                />
              </View>
            </View>

            <Text style={styles.sectionTitle}>Segurança</Text>

            <Input
              label="Senha"
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
              placeholder="Digite sua senha"
              type="password"
              error={errors.password}
              required
            />

            <Input
              label="Confirmar Senha"
              value={formData.confirmPassword}
              onChangeText={(value) => updateFormData('confirmPassword', value)}
              placeholder="Confirme sua senha"
              type="password"
              error={errors.confirmPassword}
              required
            />

            {errors.general && (
              <Text style={styles.errorText}>{errors.general}</Text>
            )}

            <Button
              title="Criar Conta"
              onPress={handleRegister}
              loading={isLoading}
              disabled={isLoading}
              style={styles.registerButton}
            />
          </Card>

          {/* Link para Login */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Já tem uma conta?</Text>
            <Button
              title="Fazer Login"
              onPress={onNavigateToLogin}
              variant="secondary"
              size="small"
            />
          </View>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
  sectionTitle: {
    fontSize: Typography.fontSizeBase,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.black,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
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
    marginTop: Spacing.lg,
  },
  errorText: {
    color: Colors.danger,
    fontSize: Typography.fontSizeSm,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  loginContainer: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  loginText: {
    fontSize: Typography.fontSizeBase,
    color: Colors.gray,
    marginBottom: Spacing.sm,
  },
  loadingText: {
    fontSize: Typography.fontSizeSm,
    color: Colors.primary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
}); 