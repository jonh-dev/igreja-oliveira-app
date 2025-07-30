import React, { useState, useEffect } from 'react';
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
import { Colors, Typography, Spacing, BorderRadius } from '../../components/shared/design-system';

interface Donation {
  id: string;
  type: 'tithe' | 'offering' | 'special';
  amount: number;
  date: string;
  description?: string;
  userId: string;
  userName: string;
  createdAt: string;
  updatedAt: string;
}

interface DonationDetailsScreenProps {
  donationId: string;
  onNavigateBack: () => void;
  onNavigateToEdit: (donationId: string) => void;
  onDonationDeleted: () => void;
}

export const DonationDetailsScreen: React.FC<DonationDetailsScreenProps> = ({
  donationId,
  onNavigateBack,
  onNavigateToEdit,
  onDonationDeleted,
}) => {
  const [donation, setDonation] = useState<Donation | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadDonationDetails();
  }, [donationId]);

  const loadDonationDetails = async () => {
    setLoading(true);
    
    try {
      // Simular carregamento de dados - será substituído por chamada real ao Supabase
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockDonation: Donation = {
        id: donationId,
        type: 'tithe',
        amount: 500,
        date: '15/01/2025',
        description: 'Dízimo do mês de janeiro - Contribuição regular para a obra',
        userId: 'user1',
        userName: 'João Silva',
        createdAt: '15/01/2025 10:30:00',
        updatedAt: '15/01/2025 10:30:00',
      };
      
      setDonation(mockDonation);
    } catch (error) {
      Alert.alert(
        'Erro',
        'Erro ao carregar detalhes da doação.',
        [{ text: 'OK', onPress: onNavigateBack }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta doação? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ]
    );
  };

  const confirmDelete = async () => {
    setDeleting(true);
    
    try {
      // Simular exclusão - será substituído por chamada real ao Supabase
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        'Sucesso!',
        'Doação excluída com sucesso.',
        [
          {
            text: 'OK',
            onPress: onDonationDeleted,
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Erro',
        'Erro ao excluir doação. Tente novamente.',
        [{ text: 'OK' }]
      );
    } finally {
      setDeleting(false);
    }
  };

  const getDonationTypeLabel = (type: string) => {
    switch (type) {
      case 'tithe':
        return '💰 Dízimo';
      case 'offering':
        return '💵 Oferta';
      case 'special':
        return '🎁 Especial';
      default:
        return type;
    }
  };

  const getDonationTypeColor = (type: string) => {
    switch (type) {
      case 'tithe':
        return Colors.primary;
      case 'offering':
        return Colors.secondary;
      case 'special':
        return Colors.accent;
      default:
        return Colors.gray;
    }
  };

  const getDonationTypeDescription = (type: string) => {
    switch (type) {
      case 'tithe':
        return 'Contribuição regular de 10% da renda';
      case 'offering':
        return 'Contribuição voluntária para a obra';
      case 'special':
        return 'Doação específica para projetos especiais';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onNavigateBack}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalhes da Doação</Text>
          <View style={styles.headerSpacer} />
        </View>
        
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando detalhes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!donation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onNavigateBack}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalhes da Doação</Text>
          <View style={styles.headerSpacer} />
        </View>
        
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Doação não encontrada</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onNavigateBack}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes da Doação</Text>
        <TouchableOpacity style={styles.editButton} onPress={() => onNavigateToEdit(donation.id)}>
          <Text style={styles.editButtonText}>✏️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Donation Type Card */}
        <Card variant="elevated" style={styles.typeCard}>
          <View style={styles.typeHeader}>
            <Text style={[styles.typeLabel, { color: getDonationTypeColor(donation.type) }]}>
              {getDonationTypeLabel(donation.type)}
            </Text>
            <Text style={styles.typeDescription}>
              {getDonationTypeDescription(donation.type)}
            </Text>
          </View>
        </Card>

        {/* Amount Card */}
        <Card variant="elevated" style={styles.amountCard}>
          <Text style={styles.amountLabel}>Valor da Doação</Text>
          <Text style={styles.amountValue}>R$ {donation.amount.toLocaleString()}</Text>
        </Card>

        {/* Details Card */}
        <Card variant="elevated" style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Informações da Doação</Text>
          
          <View style={styles.detailsList}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Data:</Text>
              <Text style={styles.detailValue}>{donation.date}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Doador:</Text>
              <Text style={styles.detailValue}>{donation.userName}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Registrado em:</Text>
              <Text style={styles.detailValue}>{donation.createdAt}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Última atualização:</Text>
              <Text style={styles.detailValue}>{donation.updatedAt}</Text>
            </View>
          </View>
        </Card>

        {/* Description Card */}
        {donation.description && (
          <Card variant="elevated" style={styles.descriptionCard}>
            <Text style={styles.sectionTitle}>Descrição</Text>
            <Text style={styles.descriptionText}>{donation.description}</Text>
          </Card>
        )}

        {/* Actions Card */}
        <Card variant="elevated" style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Ações</Text>
          
          <View style={styles.actionsContainer}>
            <Button
              title="Editar Doação"
              onPress={() => onNavigateToEdit(donation.id)}
              variant="outline"
              size="medium"
              style={styles.actionButton}
            />
            
            <Button
              title="Excluir Doação"
              onPress={handleDelete}
              variant="danger"
              size="medium"
              loading={deleting}
              disabled={deleting}
              style={styles.actionButton}
            />
          </View>
        </Card>
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
  editButton: {
    padding: Spacing.sm,
  },
  editButtonText: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightBold,
    color: Colors.primary,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Typography.fontSizeBase,
    color: Colors.gray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: Typography.fontSizeBase,
    color: Colors.danger,
  },
  typeCard: {
    marginBottom: Spacing.lg,
  },
  typeHeader: {
    alignItems: 'center',
  },
  typeLabel: {
    fontSize: Typography.fontSize2xl,
    fontWeight: Typography.fontWeightBold,
    marginBottom: Spacing.sm,
  },
  typeDescription: {
    fontSize: Typography.fontSizeBase,
    color: Colors.gray,
    textAlign: 'center',
  },
  amountCard: {
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: Typography.fontSizeBase,
    color: Colors.gray,
    marginBottom: Spacing.sm,
  },
  amountValue: {
    fontSize: Typography.fontSize3xl,
    fontWeight: Typography.fontWeightBold,
    color: Colors.primary,
  },
  detailsCard: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.black,
    marginBottom: Spacing.lg,
  },
  detailsList: {
    gap: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: Typography.fontSizeBase,
    fontWeight: Typography.fontWeightMedium,
    color: Colors.gray,
    flex: 1,
  },
  detailValue: {
    fontSize: Typography.fontSizeBase,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.black,
    flex: 2,
    textAlign: 'right',
  },
  descriptionCard: {
    marginBottom: Spacing.lg,
  },
  descriptionText: {
    fontSize: Typography.fontSizeBase,
    color: Colors.black,
    lineHeight: 24,
  },
  actionsCard: {
    marginBottom: Spacing.lg,
  },
  actionsContainer: {
    gap: Spacing.md,
  },
  actionButton: {
    width: '100%',
  },
}); 