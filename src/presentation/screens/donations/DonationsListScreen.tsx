import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { Card } from '../../components/shared/Card';
import { Button } from '../../components/shared/Button';
import { Input } from '../../components/shared/Input';
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
} from '../../components/shared/design-system';

interface Donation {
  id: string;
  type: 'tithe' | 'offering' | 'special';
  amount: number;
  date: string;
  description?: string;
  userId: string;
  userName: string;
}

interface DonationsListScreenProps {
  onNavigateToCreateDonation: () => void;
  onNavigateToDonationDetails: (donationId: string) => void;
  onNavigateBack: () => void;
}

export const DonationsListScreen: React.FC<DonationsListScreenProps> = ({
  onNavigateToCreateDonation,
  onNavigateToDonationDetails,
  onNavigateBack,
}) => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<
    'all' | 'tithe' | 'offering' | 'special'
  >('all');

  // Mock data - será substituído por dados reais do Supabase
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const mockDonations: Donation[] = [
        {
          id: '1',
          type: 'tithe',
          amount: 500,
          date: '15/01/2025',
          description: 'Dízimo do mês',
          userId: 'user1',
          userName: 'João Silva',
        },
        {
          id: '2',
          type: 'offering',
          amount: 200,
          date: '12/01/2025',
          description: 'Oferta especial',
          userId: 'user2',
          userName: 'Maria Santos',
        },
        {
          id: '3',
          type: 'special',
          amount: 1000,
          date: '10/01/2025',
          description: 'Doação para missões',
          userId: 'user3',
          userName: 'Pedro Costa',
        },
        {
          id: '4',
          type: 'tithe',
          amount: 300,
          date: '08/01/2025',
          description: 'Dízimo do mês',
          userId: 'user4',
          userName: 'Ana Oliveira',
        },
        {
          id: '5',
          type: 'offering',
          amount: 150,
          date: '05/01/2025',
          description: 'Oferta de gratidão',
          userId: 'user5',
          userName: 'Carlos Lima',
        },
      ];
      setDonations(mockDonations);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredDonations = donations.filter(donation => {
    const matchesSearch =
      donation.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      selectedFilter === 'all' || donation.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getTotalAmount = () => {
    return filteredDonations.reduce(
      (total, donation) => total + donation.amount,
      0
    );
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

  const renderDonationCard = (donation: Donation) => (
    <TouchableOpacity
      key={donation.id}
      style={styles.donationCard}
      onPress={() => onNavigateToDonationDetails(donation.id)}
    >
      <View style={styles.donationHeader}>
        <View style={styles.donationType}>
          <Text
            style={[
              styles.donationTypeText,
              { color: getDonationTypeColor(donation.type) },
            ]}
          >
            {getDonationTypeLabel(donation.type)}
          </Text>
          <Text style={styles.donationDate}>{donation.date}</Text>
        </View>
        <Text style={styles.donationAmount}>
          R$ {donation.amount.toLocaleString()}
        </Text>
      </View>

      <View style={styles.donationContent}>
        <Text style={styles.donationUser}>{donation.userName}</Text>
        {donation.description && (
          <Text style={styles.donationDescription}>{donation.description}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderFilterButton = (
    filter: 'all' | 'tithe' | 'offering' | 'special',
    label: string
  ) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === filter && styles.filterButtonActive,
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text
        style={[
          styles.filterButtonText,
          selectedFilter === filter && styles.filterButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onNavigateBack}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Doações</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={onNavigateToCreateDonation}
        >
          <Text style={styles.addButtonText}>➕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Input
            label=""
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Pesquisar doações..."
            type="text"
            style={styles.searchInput}
          />
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filtersRow}>
              {renderFilterButton('all', 'Todas')}
              {renderFilterButton('tithe', 'Dízimos')}
              {renderFilterButton('offering', 'Ofertas')}
              {renderFilterButton('special', 'Especiais')}
            </View>
          </ScrollView>
        </View>

        {/* Summary Card */}
        <Card variant="elevated" style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>📊 Resumo</Text>
          <View style={styles.summaryContent}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total de Doações</Text>
              <Text style={styles.summaryValue}>
                {filteredDonations.length}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Valor Total</Text>
              <Text style={styles.summaryValue}>
                R$ {getTotalAmount().toLocaleString()}
              </Text>
            </View>
          </View>
        </Card>

        {/* Donations List */}
        {loading ? (
          <Card variant="elevated" style={styles.loadingCard}>
            <Text style={styles.loadingText}>Carregando doações...</Text>
          </Card>
        ) : filteredDonations.length > 0 ? (
          <View style={styles.donationsList}>
            {filteredDonations.map(renderDonationCard)}
          </View>
        ) : (
          <Card variant="elevated" style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Nenhuma doação encontrada</Text>
            <Text style={styles.emptySubtitle}>
              {searchTerm
                ? 'Tente ajustar os filtros de busca'
                : 'Não há doações registradas ainda'}
            </Text>
            <Button
              title="Nova Doação"
              onPress={onNavigateToCreateDonation}
              variant="primary"
              size="medium"
              style={styles.emptyButton}
            />
          </Card>
        )}
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
  addButton: {
    padding: Spacing.sm,
  },
  addButtonText: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightBold,
    color: Colors.primary,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  searchContainer: {
    marginBottom: Spacing.lg,
  },
  searchInput: {
    backgroundColor: Colors.white,
  },
  filtersContainer: {
    marginBottom: Spacing.lg,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  filterButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterButtonText: {
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightMedium,
    color: Colors.gray,
  },
  filterButtonTextActive: {
    color: Colors.white,
  },
  summaryCard: {
    marginBottom: Spacing.lg,
  },
  summaryTitle: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.black,
    marginBottom: Spacing.md,
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: Typography.fontSizeSm,
    color: Colors.gray,
    marginBottom: Spacing.xs,
  },
  summaryValue: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightBold,
    color: Colors.primary,
  },
  donationsList: {
    gap: Spacing.md,
  },
  donationCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  donationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  donationType: {
    flex: 1,
  },
  donationTypeText: {
    fontSize: Typography.fontSizeBase,
    fontWeight: Typography.fontWeightSemibold,
    marginBottom: Spacing.xs,
  },
  donationDate: {
    fontSize: Typography.fontSizeSm,
    color: Colors.gray,
  },
  donationAmount: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightBold,
    color: Colors.primary,
  },
  donationContent: {
    marginTop: Spacing.sm,
  },
  donationUser: {
    fontSize: Typography.fontSizeBase,
    fontWeight: Typography.fontWeightMedium,
    color: Colors.black,
    marginBottom: Spacing.xs,
  },
  donationDescription: {
    fontSize: Typography.fontSizeSm,
    color: Colors.gray,
    lineHeight: 20,
  },
  loadingCard: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    fontSize: Typography.fontSizeBase,
    color: Colors.gray,
  },
  emptyCard: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyTitle: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.black,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: Typography.fontSizeBase,
    color: Colors.gray,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  emptyButton: {
    minWidth: 200,
  },
});
