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
import { DonationType, CountingMethod, BillCount, CoinCount } from '../../../domain/entities/Donation';
import { CreateDonationUseCase } from '../../../application/use-cases/donation/CreateDonationUseCase';
import { CreateCultoDonationDto, CreateManualDonationDto } from '../../../application/dto/CreateDonationDto';
import { container } from '../../../infrastructure/config/container';
import { IDonationRepository } from '../../../application/interfaces/repositories/IDonationRepository';

interface CreateDonationScreenProps {
  onNavigateBack: () => void;
  onDonationCreated: () => void;
}

const BILL_VALUES = [200, 100, 50, 20, 10, 5, 2];
const COIN_VALUES = [1, 0.5, 0.25, 0.1, 0.05, 0.01];

export const CreateDonationScreen: React.FC<CreateDonationScreenProps> = ({
  onNavigateBack,
  onDonationCreated,
}) => {
  const [loading, setLoading] = useState(false);
  const [donationType, setDonationType] = useState<DonationType>('culto');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [userId, setUserId] = useState('');
  const [countingMethod, setCountingMethod] = useState<CountingMethod>('detailed');
  const [billCounts, setBillCounts] = useState<BillCount[]>([]);
  const [coinCounts, setCoinCounts] = useState<CoinCount[]>([]);
  const [notes, setNotes] = useState('');
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

    if (donationType === 'tithe' || donationType === 'special') {
      if (!userId.trim()) {
        newErrors.userId = 'Identificação do doador é obrigatória';
      }
    }

    if (donationType === 'culto' && countingMethod === 'detailed') {
      const totalFromCounts = calculateTotalFromCounts();
      if (totalFromCounts === 0) {
        newErrors.counting = 'Adicione pelo menos uma cédula ou moeda';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTotalFromCounts = () => {
    const billTotal = billCounts.reduce((sum, bill) => sum + (bill.value * bill.count), 0);
    const coinTotal = coinCounts.reduce((sum, coin) => sum + (coin.value * coin.count), 0);
    return billTotal + coinTotal;
  };

  const parseAmount = (amountString: string): number => {
    const numericValue = amountString.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(numericValue) || 0;
  };

  const handleBillCountChange = (value: number, count: number) => {
    const newBillCounts = [...billCounts];
    const existingIndex = newBillCounts.findIndex(bill => bill.value === value);
    
    if (count === 0) {
      if (existingIndex !== -1) {
        newBillCounts.splice(existingIndex, 1);
      }
    } else {
      if (existingIndex !== -1) {
        newBillCounts[existingIndex].count = count;
      } else {
        newBillCounts.push({ value, count });
      }
    }
    
    setBillCounts(newBillCounts);
    
    if (countingMethod === 'detailed') {
      const total = calculateTotalFromCounts();
      setAmount(formatCurrency(total.toString()));
    }
  };

  const handleCoinCountChange = (value: number, count: number) => {
    const newCoinCounts = [...coinCounts];
    const existingIndex = newCoinCounts.findIndex(coin => coin.value === value);
    
    if (count === 0) {
      if (existingIndex !== -1) {
        newCoinCounts.splice(existingIndex, 1);
      }
    } else {
      if (existingIndex !== -1) {
        newCoinCounts[existingIndex].count = count;
      } else {
        newCoinCounts.push({ value, count });
      }
    }
    
    setCoinCounts(newCoinCounts);
    
    if (countingMethod === 'detailed') {
      const total = calculateTotalFromCounts();
      setAmount(formatCurrency(total.toString()));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const donationRepository = container.get<IDonationRepository>('DonationRepository');
      const createDonationUseCase = new CreateDonationUseCase(donationRepository);

      const registeredBy = 'user_current_id'; // TODO: Obter do contexto de auth
      const amountValue = parseAmount(amount);

      if (donationType === 'culto') {
        const cultoDto: CreateCultoDonationDto = {
          amount: amountValue,
          date,
          registeredBy,
          countingMethod,
          notes,
          description,
          billCounts: countingMethod === 'detailed' ? billCounts : undefined,
          coinCounts: countingMethod === 'detailed' ? coinCounts : undefined,
        };

        await createDonationUseCase.executeCultoDonation(cultoDto);
      } else {
        const manualDto: CreateManualDonationDto = {
          type: donationType as 'tithe' | 'special',
          amount: amountValue,
          date,
          userId,
          registeredBy,
          description,
        };

        await createDonationUseCase.executeManualDonation(manualDto);
      }

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
      console.error('Erro ao registrar doação:', error);
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
      case 'culto':
        return '⛪ Doação de Culto';
      case 'tithe':
        return '💰 Dízimo';
      case 'special':
        return '🎁 Doação Especial';
    }
  };

  const getDonationTypeDescription = (type: DonationType) => {
    switch (type) {
      case 'culto':
        return 'Ofertas coletadas durante o culto';
      case 'tithe':
        return 'Contribuição regular de 10% da renda';
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
    if (countingMethod === 'detailed') {
      return; // Não permitir edição manual quando em modo detalhado
    }
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

  const renderCountingMethodToggle = () => (
    <View style={styles.countingMethodContainer}>
      <Text style={styles.countingMethodLabel}>Método de Contagem:</Text>
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            countingMethod === 'detailed' && styles.toggleButtonActive
          ]}
          onPress={() => setCountingMethod('detailed')}
        >
          <Text style={[
            styles.toggleButtonText,
            countingMethod === 'detailed' && styles.toggleButtonTextActive
          ]}>
            📊 Detalhada
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            countingMethod === 'total' && styles.toggleButtonActive
          ]}
          onPress={() => setCountingMethod('total')}
        >
          <Text style={[
            styles.toggleButtonText,
            countingMethod === 'total' && styles.toggleButtonTextActive
          ]}>
            💰 Valor Total
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderBillCounting = () => (
    <View style={styles.countingSection}>
      <Text style={styles.countingTitle}>Cédulas</Text>
      <View style={styles.countingGrid}>
        {BILL_VALUES.map(value => {
          const billCount = billCounts.find(bill => bill.value === value)?.count || 0;
          return (
            <View key={value} style={styles.countingItem}>
              <Text style={styles.countingItemLabel}>R$ {value}</Text>
              <View style={styles.countingControls}>
                <TouchableOpacity
                  style={styles.countingButton}
                  onPress={() => handleBillCountChange(value, Math.max(0, billCount - 1))}
                >
                  <Text style={styles.countingButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.countingValue}>{billCount}</Text>
                <TouchableOpacity
                  style={styles.countingButton}
                  onPress={() => handleBillCountChange(value, billCount + 1)}
                >
                  <Text style={styles.countingButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderCoinCounting = () => (
    <View style={styles.countingSection}>
      <Text style={styles.countingTitle}>Moedas</Text>
      <View style={styles.countingGrid}>
        {COIN_VALUES.map(value => {
          const coinCount = coinCounts.find(coin => coin.value === value)?.count || 0;
          return (
            <View key={value} style={styles.countingItem}>
              <Text style={styles.countingItemLabel}>R$ {value.toFixed(2)}</Text>
              <View style={styles.countingControls}>
                <TouchableOpacity
                  style={styles.countingButton}
                  onPress={() => handleCoinCountChange(value, Math.max(0, coinCount - 1))}
                >
                  <Text style={styles.countingButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.countingValue}>{coinCount}</Text>
                <TouchableOpacity
                  style={styles.countingButton}
                  onPress={() => handleCoinCountChange(value, coinCount + 1)}
                >
                  <Text style={styles.countingButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>
    </View>
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
            {renderTypeButton('culto')}
            {renderTypeButton('tithe')}
            {renderTypeButton('special')}
          </View>
        </Card>

        {/* Counting Method for Culto */}
        {donationType === 'culto' && (
          <Card variant="elevated" style={styles.countingMethodCard}>
            {renderCountingMethodToggle()}
          </Card>
        )}

        {/* Detailed Counting for Culto */}
        {donationType === 'culto' && countingMethod === 'detailed' && (
          <Card variant="elevated" style={styles.countingCard}>
            <Text style={styles.sectionTitle}>Contagem Detalhada</Text>
            <Text style={styles.sectionSubtitle}>
              Conte as cédulas e moedas coletadas
            </Text>
            
            {renderBillCounting()}
            {renderCoinCounting()}
            
            <View style={styles.totalSection}>
              <Text style={styles.totalLabel}>Total Calculado:</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(calculateTotalFromCounts().toString())}
              </Text>
            </View>
          </Card>
        )}

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
              editable={donationType !== 'culto' || countingMethod === 'total'}
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

            {(donationType === 'tithe' || donationType === 'special') && (
              <Input
                label="Identificação do Doador"
                value={userId}
                onChangeText={setUserId}
                placeholder="Nome ou ID do doador"
                type="text"
                error={errors.userId}
                required
                style={styles.input}
              />
            )}

            <Input
              label="Descrição (opcional)"
              value={description}
              onChangeText={setDescription}
              placeholder="Descreva o motivo da doação..."
              type="text"
              style={styles.input}
            />

            {donationType === 'culto' && (
              <Input
                label="Observações (opcional)"
                value={notes}
                onChangeText={setNotes}
                placeholder="Observações sobre a coleta..."
                type="text"
                style={styles.input}
              />
            )}
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
            
            {(donationType === 'tithe' || donationType === 'special') && userId && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Doador:</Text>
                <Text style={styles.summaryValue}>{userId}</Text>
              </View>
            )}
            
            {description && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Descrição:</Text>
                <Text style={styles.summaryValue}>{description}</Text>
              </View>
            )}

            {donationType === 'culto' && countingMethod === 'detailed' && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Método:</Text>
                <Text style={styles.summaryValue}>Contagem Detalhada</Text>
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
  countingMethodCard: {
    marginBottom: Spacing.lg,
  },
  countingCard: {
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
  countingMethodContainer: {
    marginBottom: Spacing.md,
  },
  countingMethodLabel: {
    fontSize: Typography.fontSizeBase,
    fontWeight: Typography.fontWeightMedium,
    color: Colors.black,
    marginBottom: Spacing.sm,
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  toggleButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: Colors.primary,
  },
  toggleButtonText: {
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightMedium,
    color: Colors.gray,
  },
  toggleButtonTextActive: {
    color: Colors.white,
  },
  countingSection: {
    marginBottom: Spacing.lg,
  },
  countingTitle: {
    fontSize: Typography.fontSizeBase,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.black,
    marginBottom: Spacing.md,
  },
  countingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  countingItem: {
    width: '30%',
    padding: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  countingItemLabel: {
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightMedium,
    color: Colors.black,
    marginBottom: Spacing.xs,
  },
  countingControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  countingButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countingButtonText: {
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightBold,
    color: Colors.white,
  },
  countingValue: {
    fontSize: Typography.fontSizeBase,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.black,
    minWidth: 20,
    textAlign: 'center',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.primary + '10',
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  totalLabel: {
    fontSize: Typography.fontSizeBase,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.black,
  },
  totalValue: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightBold,
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