import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Animated, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../../infrastructure/config/supabase';
import { container } from '../../../infrastructure/config/container';
import { IUserRepository } from '../../../application/interfaces/repositories/IUserRepository';
import { Phone } from '../../../domain/value-objects/Phone';
import { Colors, Spacing, Typography, BorderRadius } from '../../components/shared/design-system';
import { Button } from '../../components/shared/Button';

interface PendingRegistrationData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  address?: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

interface EmailVerificationScreenProps {
  email: string;
  pendingData?: PendingRegistrationData | null;
  onVerified: () => void;
  onNavigateBack?: () => void;
}

export const EmailVerificationScreen: React.FC<EmailVerificationScreenProps> = ({ email, pendingData, onVerified, onNavigateBack }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [emailSent, setEmailSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];

  // Animação de entrada
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
    ]).start();
  }, []);

  // Enviar email de confirmação automaticamente
  useEffect(() => {
    const sendConfirmationEmail = async () => {
      if (!pendingData) return;
      
      setIsLoading(true);
      setErrorMsg(null);
      
      try {
        // Verificar se email já existe usando RPC (evita problemas de RLS)
        const normalizedEmail = pendingData.email.trim().toLowerCase();
        
        console.log('🔍 DEBUG - Verificando se email já existe:', normalizedEmail);
        const { data: emailExists, error: checkError } = await supabase
          .rpc('is_email_available', { email_in: normalizedEmail });
        
        if (checkError) {
          console.log('⚠️ DEBUG - Erro ao verificar email (prosseguindo):', checkError.message);
          // Continua mesmo com erro na verificação
        } else if (emailExists === false) {
          console.log('❌ DEBUG - Email já existe no banco');
          setErrorMsg('Este e-mail já está cadastrado. Tente fazer login ou use outro e-mail.');
          return;
        }
        
        // Normalizar telefone usando a classe Phone existente
        const phoneVO = Phone.create(pendingData.phone);
        const normalizedPhone = phoneVO ? phoneVO.getValue() : pendingData.phone;
        
        console.log('🔍 DEBUG - Dados do signup:', {
          email: pendingData.email,
          fullName: pendingData.fullName,
          phoneOriginal: pendingData.phone,
          phoneNormalized: normalizedPhone,
          phoneVOCreated: !!phoneVO
        });
        
        const { data, error } = await supabase.auth.signUp({
          email: pendingData.email,
          password: pendingData.password,
          options: {
            data: {
              full_name: pendingData.fullName,
              phone: normalizedPhone,
            },
          },
        });

        console.log('📊 DEBUG - Resultado do signUp:', {
          success: !error,
          userId: data?.user?.id,
          userMetadata: data?.user?.user_metadata,
          appMetadata: data?.user?.app_metadata,
          error: error?.message
        });

        if (error) {
          console.log('❌ DEBUG - Erro no signUp:', error);
          // Tratamento específico para email já existente
          if (error.message.includes('already registered') || error.message.includes('User already registered')) {
            setErrorMsg('Este e-mail já está cadastrado. Tente fazer login ou use outro e-mail.');
          } else {
            setErrorMsg('Erro ao enviar e-mail de confirmação: ' + error.message);
          }
        } else {
          // Salvar dados para completar perfil no primeiro login
          await AsyncStorage.setItem('pendingUserProfile', JSON.stringify({
            email: pendingData.email,
            fullName: pendingData.fullName,
            phone: normalizedPhone,
            address: pendingData.address,
            userId: data?.user?.id
          }));
          setEmailSent(true);
        }
      } catch (e: any) {
        setErrorMsg('Erro inesperado: ' + (e?.message || 'Tente novamente'));
      } finally {
        setIsLoading(false);
      }
    };
    
    sendConfirmationEmail();
  }, [pendingData]);

  const handleResendEmail = async () => {
    if (!pendingData) return;
    
    try {
      const { error } = await supabase.auth.resend({ 
        type: 'signup', 
        email: pendingData.email 
      });
      
      if (error) {
        Alert.alert('Erro', 'Não foi possível reenviar o e-mail: ' + error.message);
      } else {
        Alert.alert('Sucesso', 'E-mail reenviado! Verifique sua caixa de entrada.');
      }
    } catch (error: any) {
      Alert.alert('Erro', 'Erro inesperado ao reenviar e-mail');
    }
  };

  const handleGoToLogin = () => {
    Alert.alert(
      'Email confirmado?',
      'Você confirmou seu e-mail clicando no link que enviamos?',
      [
        {
          text: 'Não, ainda não',
          style: 'cancel',
          onPress: () => {
            Alert.alert(
              'Confirme seu e-mail',
              'Por favor, verifique sua caixa de entrada e clique no link de confirmação antes de continuar.'
            );
          }
        },
        {
          text: 'Sim, já confirmei',
          onPress: () => {
            Alert.alert(
              'Perfeito!',
              'Agora você pode fazer login com suas credenciais.',
              [{ text: 'Ir para Login', onPress: onVerified }]
            );
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Background Elements */}
      <View style={styles.backgroundGradient} />
      
      <Animated.View 
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {/* Logo/Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>📧</Text>
          </View>
        </View>

        {/* Título */}
        <Text style={styles.title}>Confirme seu e-mail</Text>
        
        {/* Status Message */}
        {isLoading ? (
          <View style={styles.messageContainer}>
            <Text style={styles.subtitle}>Enviando e-mail de confirmação...</Text>
          </View>
        ) : emailSent ? (
          <View style={styles.messageContainer}>
            <Text style={styles.subtitle}>
              Enviamos um link de confirmação para:
            </Text>
            <Text style={styles.email}>{pendingData?.email || email}</Text>
            <Text style={styles.instructions}>
              Verifique sua caixa de entrada e clique no link para confirmar sua conta.
              Após confirmar, você poderá fazer login.
            </Text>
          </View>
        ) : null}

        {/* Error Message */}
        {errorMsg && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsContainer}>
          {emailSent && (
            <>
              <TouchableOpacity 
                style={styles.primaryButton} 
                onPress={handleGoToLogin}
              >
                <Text style={styles.primaryButtonText}>Já confirmei - Ir para Login</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.secondaryButton} 
                onPress={handleResendEmail}
              >
                <Text style={styles.secondaryButtonText}>Reenviar e-mail</Text>
              </TouchableOpacity>
            </>
          )}

          {onNavigateBack && (
            <Button
              title="← Voltar ao cadastro"
              onPress={onNavigateBack}
              variant="outline"
              size="medium"
              style={styles.backButton}
            />
          )}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#0F172A',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  iconContainer: {
    marginBottom: Spacing.xl,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(85, 107, 47, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(85, 107, 47, 0.3)',
  },
  iconText: {
    fontSize: 40,
  },
  title: {
    color: Colors.white,
    fontSize: Typography.fontSizeXl,
    fontWeight: Typography.fontWeightBold,
    marginBottom: Spacing.lg,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: Typography.fontSizeBase,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    lineHeight: 24,
  },
  email: {
    color: Colors.primary,
    fontSize: Typography.fontSizeBase,
    fontWeight: Typography.fontWeightSemibold,
    textAlign: 'center',
    marginBottom: Spacing.md,
    backgroundColor: 'rgba(85, 107, 47, 0.1)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  instructions: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: Typography.fontSizeSm,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: Spacing.sm,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    marginBottom: Spacing.lg,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: Typography.fontSizeSm,
    textAlign: 'center',
    fontWeight: Typography.fontWeightMedium,
  },
  actionsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    width: '100%',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: Typography.fontSizeBase,
    fontWeight: Typography.fontWeightSemibold,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  secondaryButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  secondaryButtonText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: Typography.fontSizeSm,
    textAlign: 'center',
  },
  backButton: {
    marginTop: Spacing.md,
    minWidth: 200,
  },
});


