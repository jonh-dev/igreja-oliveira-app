import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { PhoneInput } from './PhoneInput';
import { Colors, Typography, Spacing } from './design-system';

export const PhoneInputExample: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState('');

  const handlePhoneChange = (text: string) => {
    setPhone(text);
    setError('');
  };

  const handleValidation = (valid: boolean) => {
    setIsValid(valid);
  };

  const handlePhoneValidation = () => {
    if (!phone) {
      setError('Telefone é obrigatório');
      return;
    }

    if (!isValid) {
      setError('Telefone inválido');
      return;
    }

    Alert.alert('Sucesso', `Telefone válido: ${phone}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exemplo de Input de Telefone</Text>

      <PhoneInput
        value={phone}
        onChangeText={handlePhoneChange}
        placeholder="Digite seu telefone"
        error={error}
        onValidation={handleValidation}
      />

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Telefone: {phone || 'Não informado'}
        </Text>
        <Text style={styles.infoText}>Válido: {isValid ? 'Sim' : 'Não'}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Text style={styles.buttonText} onPress={handlePhoneValidation}>
          Validar Telefone
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    backgroundColor: Colors.background.default,
  },
  title: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightBold,
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  infoContainer: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
  },
  infoText: {
    fontSize: Typography.fontSizeSm,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  buttonContainer: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: Typography.fontSizeBase,
    fontWeight: Typography.fontWeightMedium,
    color: Colors.primary,
    padding: Spacing.md,
    backgroundColor: Colors.secondary,
    borderRadius: 8,
  },
});
