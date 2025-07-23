import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../../components/shared/design-system';
import { Card } from '../../components/shared/Card';
import { Button } from '../../components/shared/Button';
import { Input } from '../../components/shared/Input';

interface GasofilacoReport {
  totalAmount: number;
  averageAmount: number;
  highestAmount: number;
  lowestAmount: number;
  totalCults: number;
  cults: Array<{
    cultDate: string;
    totalAmount: number;
    registeredBy: string;
  }>;
}

interface GasofilacoReportsScreenProps {
  onNavigateBack: () => void;
}

export const GasofilacoReportsScreen: React.FC<GasofilacoReportsScreenProps> = ({
  onNavigateBack,
}) => {
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [report, setReport] = useState<GasofilacoReport | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!startDate.trim()) {
      newErrors.startDate = 'Data inicial é obrigatória';
    } else {
      const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
      if (!dateRegex.test(startDate)) {
        newErrors.startDate = 'Data deve estar no formato DD/MM/AAAA';
      }
    }

    if (!endDate.trim()) {
      newErrors.endDate = 'Data final é obrigatória';
    } else {
      const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
      if (!dateRegex.test(endDate)) {
        newErrors.endDate = 'Data deve estar no formato DD/MM/AAAA';
      }
    }

    if (startDate && endDate) {
      const start = new Date(startDate.split('/').reverse().join('-'));
      const end = new Date(endDate.split('/').reverse().join('-'));
      
      if (start > end) {
        newErrors.endDate = 'Data final deve ser posterior à data inicial';
      }

      const diffInDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      if (diffInDays > 730) {
        newErrors.endDate = 'Período máximo é de 2 anos';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerateReport = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Simular chamada para o use case
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Dados mockados para demonstração
      const mockReport: GasofilacoReport = {
        totalAmount: 15420.50,
        averageAmount: 2570.08,
        highestAmount: 3850.00,
        lowestAmount: 1200.00,
        totalCults: 6,
        cults: [
          {
            cultDate: '2025-01-05',
            totalAmount: 3200.00,
            registeredBy: 'João Silva',
          },
          {
            cultDate: '2025-01-12',
            totalAmount: 3850.00,
            registeredBy: 'Maria Santos',
          },
          {
            cultDate: '2025-01-19',
            totalAmount: 2800.00,
            registeredBy: 'Pedro Costa',
          },
          {
            cultDate: '2025-01-26',
            totalAmount: 2950.00,
            registeredBy: 'Ana Oliveira',
          },
          {
            cultDate: '2025-02-02',
            totalAmount: 1200.00,
            registeredBy: 'Carlos Lima',
          },
          {
            cultDate: '2025-02-09',
            totalAmount: 1420.50,
            registeredBy: 'Lucia Ferreira',
          },
        ],
      };

      setReport(mockReport);
    } catch (error) {
      Alert.alert(
        'Erro',
        'Erro ao gerar relatório. Tente novamente.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    });
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const handleExportPDF = () => {
    Alert.alert(
      'Exportar PDF',
      'Funcionalidade de exportação PDF será implementada em breve.',
      [{ text: 'OK' }]
    );
  };

  const handleExportCSV = () => {
    Alert.alert(
      'Exportar CSV',
      'Funcionalidade de exportação CSV será implementada em breve.',
      [{ text: 'OK' }]
    );
  };

  const renderMetricsCard = () => {
    if (!report) return null;

    return (
      <Card style={styles.metricsCard}>
        <Text style={styles.cardTitle}>📊 Métricas Gerais</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Total Arrecadado</Text>
            <Text style={styles.metricValue}>{formatCurrency(report.totalAmount)}</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Média por Culto</Text>
            <Text style={styles.metricValue}>{formatCurrency(report.averageAmount)}</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Maior Valor</Text>
            <Text style={styles.metricValue}>{formatCurrency(report.highestAmount)}</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Menor Valor</Text>
            <Text style={styles.metricValue}>{formatCurrency(report.lowestAmount)}</Text>
          </View>
        </View>
        <View style={styles.totalCultsContainer}>
          <Text style={styles.totalCultsLabel}>Total de Cultos:</Text>
          <Text style={styles.totalCultsValue}>{report.totalCults}</Text>
        </View>
      </Card>
    );
  };

  const renderCultsList = () => {
    if (!report) return null;

    return (
      <Card style={styles.cultsCard}>
        <Text style={styles.cardTitle}>📅 Cultos no Período</Text>
        <ScrollView style={styles.cultsList}>
          {report.cults.map((cult, index) => (
            <View key={index} style={styles.cultItem}>
              <View style={styles.cultHeader}>
                <Text style={styles.cultDate}>{formatDate(cult.cultDate)}</Text>
                <Text style={styles.cultAmount}>{formatCurrency(cult.totalAmount)}</Text>
              </View>
              <Text style={styles.cultRegisteredBy}>
                Registrado por: {cult.registeredBy}
              </Text>
            </View>
          ))}
        </ScrollView>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Relatórios de Gasofilaço</Text>
      </View>

      <ScrollView style={styles.content}>
        <Card style={styles.filterCard}>
          <Text style={styles.cardTitle}>🔍 Filtros</Text>
          
          <View style={styles.dateInputs}>
            <View style={styles.dateInput}>
              <Text style={styles.inputLabel}>Data Inicial</Text>
              <Input
                label="Data Inicial"
                value={startDate}
                onChangeText={setStartDate}
                placeholder="DD/MM/AAAA"
                mask="99/99/9999"
                error={errors.startDate}
              />
            </View>
            
            <View style={styles.dateInput}>
              <Text style={styles.inputLabel}>Data Final</Text>
              <Input
                label="Data Final"
                value={endDate}
                onChangeText={setEndDate}
                placeholder="DD/MM/AAAA"
                mask="99/99/9999"
                error={errors.endDate}
              />
            </View>
          </View>

          <Button
            title={loading ? 'Gerando...' : 'Gerar Relatório'}
            onPress={handleGenerateReport}
            disabled={loading}
            loading={loading}
            style={styles.generateButton}
          />
        </Card>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Gerando relatório...</Text>
          </View>
        )}

        {report && (
          <>
            {renderMetricsCard()}
            {renderCultsList()}

            <View style={styles.exportButtons}>
              <Button
                title="Exportar PDF"
                onPress={handleExportPDF}
                variant="outline"
                style={styles.exportButton}
              />
              <Button
                title="Exportar CSV"
                onPress={handleExportCSV}
                variant="outline"
                style={styles.exportButton}
              />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray,
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  filterCard: {
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 15,
  },
  dateInputs: {
    flexDirection: 'row' as const,
    gap: 15,
    marginBottom: 20,
  },
  dateInput: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.black,
    marginBottom: 5,
  },
  generateButton: {
    marginTop: 10,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.gray,
  },
  metricsCard: {
    marginBottom: 20,
  },
  metricsGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 15,
  },
  metricItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 15,
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: Colors.gray,
    marginBottom: 5,
    textAlign: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    textAlign: 'center',
  },
  totalCultsContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: Colors.gray,
  },
  totalCultsLabel: {
    fontSize: 14,
    color: Colors.gray,
  },
  totalCultsValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  cultsCard: {
    marginBottom: 20,
  },
  cultsList: {
    maxHeight: 300,
  },
  cultItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray,
  },
  cultHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  cultDate: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.black,
  },
  cultAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  cultRegisteredBy: {
    fontSize: 12,
    color: Colors.gray,
  },
  exportButtons: {
    flexDirection: 'row' as const,
    gap: 15,
    marginTop: 10,
  },
  exportButton: {
    flex: 1,
  },
}); 