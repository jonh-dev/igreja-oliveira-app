import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Card } from '../../components/shared/Card';
import { Button } from '../../components/shared/Button';
import { Input } from '../../components/shared/Input';
import { Colors, Typography, Spacing, BorderRadius } from '../../components/shared/design-system';

interface CreateDonationScreenProps {
  onNavigateBack: () => void;
  onDonationCreated: () => void;
}

type DonationType = 'tithe' | 'offering' | 'special';

export const CreateDonationScreen: React.FC<CreateDonationScreenProps> = ({
  onNavigateBack,
  onDonationCreated,
}) => {
  const [loading, setLoading] = useState(false);
  const [donationType, setDonationType] = useState<DonationType>('tithe');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!amount.trim()) {
      newErrors.amount = 'Valor é obrigatório';
    } else {
      const amountValue = parseFloat(amount.replace(/[^\d,]/g, '').replace(',', '.'));
      if (isNaN(amountValue) || amountValue <= 0) {
        newErrors.amount = 'Valor deve ser maior que zero';
      }
    }

    if (!date.trim()) {
      newErrors.date = 'Data é obrigatória';
    } else {
      const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
      if (!dateRegex.test(date)) {
        newErrors.date = 'Data deve estar no formato DD/MM/AAAA';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Simular criação de doação - será substituído por chamada real ao Supabase
      await new Promise(resolve => setTimeout(resolve, 1500));

      Alert.alert(
        'Sucesso!',
        'Doação registrada com sucesso.',
        [
          {
            text: 'OK',
            onPress: () => {
              onDonationCreated();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Erro',
        'Erro ao registrar doação. Tente novamente.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const getDonationTypeLabel = (type: DonationType) => {
    switch (type) {
      case 'tithe':
        return '💰 Dízimo';
      case 'offering':
        return '💵 Oferta';
      case 'special':
        return '🎁 Especial';
    }
  };

  const getDonationTypeDescription = (type: DonationType) => {
    switch (type) {
      case 'tithe':
        return 'Contribuição regular de 10% da renda';
      case 'offering':
        return 'Contribuição voluntária para a obra';
      case 'special':
        return 'Doação específica para projetos especiais';
    }
  };

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, '');
    if (numericValue === '') return '';
    
    const floatValue = parseFloat(numericValue) / 100;
    return floatValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    });
  };

  const handleAmountChange = (value: string) => {
    const formatted = formatCurrency(value);
    setAmount(formatted);
  };

  const renderTypeButton = (type: DonationType) => (
    <TouchableOpacity
      style={[
        styles.typeButton,
        donationType === type && styles.typeButtonActive
      ]}
      onPress={() => setDonationType(type)}
    >
      <Text style={[
        styles.typeButtonText,
        donationType === type && styles.typeButtonTextActive
      ]}>
        {getDonationTypeLabel(type)}
      </Text>
      <Text style={[
        styles.typeButtonDescription,
        donationType === type && styles.typeButtonDescriptionActive
      ]}>
        {getDonationTypeDescription(type)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onNavigateBack}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nova Doação</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Donation Type Selection */}
        <Card variant="elevated" style={styles.typeCard}>
          <Text style={styles.sectionTitle}>Tipo de Doação</Text>
          <Text style={styles.sectionSubtitle}>
            Selecione o tipo de contribuição que deseja registrar
          </Text>
          
          <View style={styles.typeButtonsContainer}>
            {renderTypeButton('tithe')}
            {renderTypeButton('offering')}
            {renderTypeButton('special')}
          </View>
        </Card>

        {/* Donation Details */}
        <Card variant="elevated" style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Detalhes da Doação</Text>
          
          <View style={styles.formContainer}>
            <Input
              label="Valor (R$)"
              value={amount}
              onChangeText={handleAmountChange}
              placeholder="0,00"
              type="text"
              error={errors.amount}
              required
              style={styles.input}
            />

            <Input
              label="Data"
              value={date}
              onChangeText={setDate}
              placeholder="DD/MM/AAAA"
              type="text"
              error={errors.date}
              required
              style={styles.input}
            />

            <Input
              label="Descrição (opcional)"
              value={description}
              onChangeText={setDescription}
              placeholder="Descreva o motivo da doação..."
              type="text"
              style={styles.input}
            />
          </View>
        </Card>

        {/* Summary */}
        <Card variant="elevated" style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Resumo</Text>
          
          <View style={styles.summaryContent}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tipo:</Text>
              <Text style={styles.summaryValue}>{getDonationTypeLabel(donationType)}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Valor:</Text>
              <Text style={styles.summaryValue}>
                {amount || 'R$ 0,00'}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Data:</Text>
              <Text style={styles.summaryValue}>
                {date || 'Não informada'}
              </Text>
            </View>
            
            {description && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Descrição:</Text>
                <Text style={styles.summaryValue}>{description}</Text>
              </View>
            )}
          </View>
        </Card>

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          <Button
            title="Registrar Doação"
            onPress={handleSubmit}
            variant="primary"
            size="large"
            loading={loading}
            disabled={loading}
            style={styles.submitButton}
          />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  backButton: {
    padding: Spacing.sm,
  },
  backButtonText: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightBold,
    color: Colors.primary,
  },
  headerTitle: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.black,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  typeCard: {
    marginBottom: Spacing.lg,
  },
  detailsCard: {
    marginBottom: Spacing.lg,
  },
  summaryCard: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.black,
    marginBottom: Spacing.sm,
  },
  sectionSubtitle: {
    fontSize: Typography.fontSizeBase,
    color: Colors.gray,
    marginBottom: Spacing.lg,
  },
  typeButtonsContainer: {
    gap: Spacing.md,
  },
  typeButton: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.lightGray,
  },
  typeButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  typeButtonText: {
    fontSize: Typography.fontSizeBase,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.black,
    marginBottom: Spacing.xs,
  },
  typeButtonTextActive: {
    color: Colors.primary,
  },
  typeButtonDescription: {
    fontSize: Typography.fontSizeSm,
    color: Colors.gray,
  },
  typeButtonDescriptionActive: {
    color: Colors.primary,
  },
  formContainer: {
    gap: Spacing.lg,
  },
  input: {
    backgroundColor: Colors.white,
  },
  summaryContent: {
    gap: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  summaryLabel: {
    fontSize: Typography.fontSizeBase,
    fontWeight: Typography.fontWeightMedium,
    color: Colors.gray,
    flex: 1,
  },
  summaryValue: {
    fontSize: Typography.fontSizeBase,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.black,
    flex: 2,
    textAlign: 'right',
  },
  submitContainer: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  submitButton: {
    width: '100%',
  },
}); 