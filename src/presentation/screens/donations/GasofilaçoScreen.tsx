import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Card } from '../../components/shared/Card';
import { Button } from '../../components/shared/Button';
import { Input } from '../../components/shared/Input';
import { Colors } from '../../components/shared/design-system';
import { CreateGasofilacoUseCase } from '../../../application/use-cases/donation/CreateGasofilacoUseCase';
import { container } from '../../../infrastructure/config/container';

interface GasofilaçoScreenProps {
  onNavigateBack: () => void;
  onGasofilaçoRegistered: () => void;
}

interface BillCount {
  value: number;
  count: number;
}

interface CoinCount {
  value: number;
  count: number;
}

export const GasofilaçoScreen: React.FC<GasofilaçoScreenProps> = ({
  onNavigateBack,
  onGasofilaçoRegistered,
}) => {
  const [loading, setLoading] = useState(false);
  const [cultDate, setCultDate] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Contagem de cédulas
  const [billCounts, setBillCounts] = useState<BillCount[]>([
    { value: 200, count: 0 },
    { value: 100, count: 0 },
    { value: 50, count: 0 },
    { value: 20, count: 0 },
    { value: 10, count: 0 },
    { value: 5, count: 0 },
    { value: 2, count: 0 },
  ]);

  // Contagem de moedas
  const [coinCounts, setCoinCounts] = useState<CoinCount[]>([
    { value: 1, count: 0 },
    { value: 0.5, count: 0 },
    { value: 0.25, count: 0 },
    { value: 0.1, count: 0 },
    { value: 0.05, count: 0 },
    { value: 0.01, count: 0 },
  ]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!cultDate.trim()) {
      newErrors.cultDate = 'Data do culto é obrigatória';
    } else {
      const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
      if (!dateRegex.test(cultDate)) {
        newErrors.cultDate = 'Data deve estar no formato DD/MM/AAAA';
      }
    }

    const calculatedTotal = calculateTotal();
    if (calculatedTotal <= 0) {
      newErrors.totalAmount = 'Deve haver pelo menos uma cédula ou moeda';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTotal = (): number => {
    const billsTotal = billCounts.reduce((total, bill) => {
      return total + (bill.value * bill.count);
    }, 0);

    const coinsTotal = coinCounts.reduce((total, coin) => {
      return total + (coin.value * coin.count);
    }, 0);

    return billsTotal + coinsTotal;
  };

  const updateBillCount = (index: number, newCount: number) => {
    const newBillCounts = [...billCounts];
    newBillCounts[index].count = Math.max(0, newCount);
    setBillCounts(newBillCounts);
    
    const total = calculateTotal();
    setTotalAmount(total.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }));
  };

  const updateCoinCount = (index: number, newCount: number) => {
    const newCoinCounts = [...coinCounts];
    newCoinCounts[index].count = Math.max(0, newCount);
    setCoinCounts(newCoinCounts);
    
    const total = calculateTotal();
    setTotalAmount(total.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Converter data do formato DD/MM/AAAA para Date
      const [day, month, year] = cultDate.split('/');
      const cultDateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

      const gasofilacoData = {
        cultDate: cultDateObj,
        amount: calculateTotal(),
        registeredBy: 'current-user-id', // TODO: Pegar do contexto de autenticação
        description: `Gasofilaço - ${cultDate}`,
        notes: notes.trim() || undefined,
      };

      // Usar o use case para criar gasofilaço
      const createGasofilacoUseCase = new CreateGasofilacoUseCase(
        container.get('DonationRepository')
      );

      await createGasofilacoUseCase.execute(gasofilacoData);

      Alert.alert(
        'Sucesso!',
        'Gasofilaço registrado com sucesso.',
        [
          {
            text: 'OK',
            onPress: () => {
              onGasofilaçoRegistered();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Erro',
        error instanceof Error ? error.message : 'Erro ao registrar gasofilaço. Tente novamente.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const renderBillCounter = (bill: BillCount, index: number) => (
    <View key={bill.value} style={styles.counterItem}>
      <View style={styles.counterHeader}>
        <Text style={styles.counterLabel}>
          R$ {bill.value.toLocaleString()}
        </Text>
        <Text style={styles.counterSubtitle}>
          {bill.count} cédula{bill.count !== 1 ? 's' : ''}
        </Text>
      </View>
      
      <View style={styles.counterControls}>
        <TouchableOpacity
          style={styles.counterButton}
          onPress={() => updateBillCount(index, bill.count - 1)}
          disabled={bill.count === 0}
        >
          <Text style={styles.counterButtonText}>-</Text>
        </TouchableOpacity>
        
        <Text style={styles.counterValue}>{bill.count}</Text>
        
        <TouchableOpacity
          style={styles.counterButton}
          onPress={() => updateBillCount(index, bill.count + 1)}
        >
          <Text style={styles.counterButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCoinCounter = (coin: CoinCount, index: number) => (
    <View key={coin.value} style={styles.counterItem}>
      <View style={styles.counterHeader}>
        <Text style={styles.counterLabel}>
          R$ {coin.value.toFixed(2).replace('.', ',')}
        </Text>
        <Text style={styles.counterSubtitle}>
          {coin.count} moeda{coin.count !== 1 ? 's' : ''}
        </Text>
      </View>
      
      <View style={styles.counterControls}>
        <TouchableOpacity
          style={styles.counterButton}
          onPress={() => updateCoinCount(index, coin.count - 1)}
          disabled={coin.count === 0}
        >
          <Text style={styles.counterButtonText}>-</Text>
        </TouchableOpacity>
        
        <Text style={styles.counterValue}>{coin.count}</Text>
        
        <TouchableOpacity
          style={styles.counterButton}
          onPress={() => updateCoinCount(index, coin.count + 1)}
        >
          <Text style={styles.counterButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onNavigateBack}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gasofilaço</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Informações do Culto */}
        <Card variant="elevated" style={styles.cultInfoCard}>
          <Text style={styles.sectionTitle}>📅 Informações do Culto</Text>
          <Text style={styles.sectionSubtitle}>
            Registre os dados do culto dominical
          </Text>
          
          <View style={styles.formContainer}>
            <Input
              label="Data do Culto"
              value={cultDate}
              onChangeText={setCultDate}
              placeholder="DD/MM/AAAA"
              type="text"
              error={errors.cultDate}
              required
              style={styles.input}
            />

            <Input
              label="Observações (opcional)"
              value={notes}
              onChangeText={setNotes}
              placeholder="Observações sobre o culto..."
              type="text"
              style={styles.input}
            />
          </View>
        </Card>

        {/* Contagem de Cédulas */}
        <Card variant="elevated" style={styles.countingCard}>
          <Text style={styles.sectionTitle}>💵 Contagem de Cédulas</Text>
          <Text style={styles.sectionSubtitle}>
            Conte as cédulas recolhidas no gasofilaço
          </Text>
          
          <View style={styles.countersContainer}>
            {billCounts.map(renderBillCounter)}
          </View>
        </Card>

        {/* Contagem de Moedas */}
        <Card variant="elevated" style={styles.countingCard}>
          <Text style={styles.sectionTitle}>🪙 Contagem de Moedas</Text>
          <Text style={styles.sectionSubtitle}>
            Conte as moedas recolhidas no gasofilaço
          </Text>
          
          <View style={styles.countersContainer}>
            {coinCounts.map(renderCoinCounter)}
          </View>
        </Card>

        {/* Resumo */}
        <Card variant="elevated" style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>📊 Resumo</Text>
          
          <View style={styles.summaryContent}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Data do Culto:</Text>
              <Text style={styles.summaryValue}>
                {cultDate || 'Não informada'}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total de Cédulas:</Text>
              <Text style={styles.summaryValue}>
                {billCounts.reduce((total, bill) => total + bill.count, 0)} cédulas
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total de Moedas:</Text>
              <Text style={styles.summaryValue}>
                {coinCounts.reduce((total, coin) => total + coin.count, 0)} moedas
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Valor Total:</Text>
              <Text style={[styles.summaryValue, styles.totalAmount]}>
                {totalAmount || 'R$ 0,00'}
              </Text>
            </View>
            
            {notes && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Observações:</Text>
                <Text style={styles.summaryValue}>{notes}</Text>
              </View>
            )}
          </View>
        </Card>

        {/* Botão de Registro */}
        <View style={styles.submitContainer}>
          <Button
            title="Registrar Gasofilaço"
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

const styles = {
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: Colors.primary,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.black,
    textAlign: 'center' as const,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  cultInfoCard: {
    marginBottom: 16,
  },
  countingCard: {
    marginBottom: 16,
  },
  summaryCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.black,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 16,
  },
  formContainer: {
    gap: 16,
  },
  input: {
    marginBottom: 0,
  },
  countersContainer: {
    gap: 12,
  },
  counterItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
  },
  counterHeader: {
    flex: 1,
  },
  counterLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.black,
  },
  counterSubtitle: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 2,
  },
  counterControls: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
  },
  counterButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  counterButtonText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  counterValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.black,
    minWidth: 30,
    textAlign: 'center' as const,
  },
  summaryContent: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.gray,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.gray,
    textAlign: 'right' as const,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  submitContainer: {
    marginTop: 24,
    marginBottom: 32,
  },
  submitButton: {
    width: '100%' as const,
  },
}; 