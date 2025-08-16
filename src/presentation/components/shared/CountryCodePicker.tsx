import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Colors, Typography, Spacing } from './design-system';

export interface Country {
  code: string;
  name: string;
  flag: string;
  phoneCode: string;
  mask?: string;
}

const COUNTRIES: Country[] = [
  {
    code: 'BR',
    name: 'Brasil',
    flag: '🇧🇷',
    phoneCode: '+55',
    mask: '(##) #####-####',
  },
  {
    code: 'US',
    name: 'Estados Unidos',
    flag: '🇺🇸',
    phoneCode: '+1',
    mask: '(###) ###-####',
  },
  {
    code: 'AR',
    name: 'Argentina',
    flag: '🇦🇷',
    phoneCode: '+54',
    mask: '## ####-####',
  },
  {
    code: 'CL',
    name: 'Chile',
    flag: '🇨🇱',
    phoneCode: '+56',
    mask: '# ####-####',
  },
  {
    code: 'CO',
    name: 'Colômbia',
    flag: '🇨🇴',
    phoneCode: '+57',
    mask: '### ###-####',
  },
  {
    code: 'PE',
    name: 'Peru',
    flag: '🇵🇪',
    phoneCode: '+51',
    mask: '### ###-###',
  },
  {
    code: 'UY',
    name: 'Uruguai',
    flag: '🇺🇾',
    phoneCode: '+598',
    mask: '## ###-###',
  },
  {
    code: 'PY',
    name: 'Paraguai',
    flag: '🇵🇾',
    phoneCode: '+595',
    mask: '### ###-###',
  },
  {
    code: 'PT',
    name: 'Portugal',
    flag: '🇵🇹',
    phoneCode: '+351',
    mask: '### ### ###',
  },
  {
    code: 'ES',
    name: 'Espanha',
    flag: '🇪🇸',
    phoneCode: '+34',
    mask: '### ### ###',
  },
];

interface CountryCodePickerProps {
  selectedCountry: Country;
  onCountrySelect: (country: Country) => void;
  disabled?: boolean;
}

export const CountryCodePicker: React.FC<CountryCodePickerProps> = ({
  selectedCountry,
  onCountrySelect,
  disabled = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleCountrySelect = (country: Country) => {
    onCountrySelect(country);
    setModalVisible(false);
  };

  const renderCountryItem = ({ item }: { item: Country }) => (
    <TouchableOpacity
      style={styles.countryItem}
      onPress={() => handleCountrySelect(item)}
    >
      <Text style={styles.flag}>{item.flag}</Text>
      <Text style={styles.countryName}>{item.name}</Text>
      <Text style={styles.phoneCode}>{item.phoneCode}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.selector, disabled && styles.disabled]}
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
      >
        <Text style={styles.flag}>{selectedCountry.flag}</Text>
        <Text style={styles.phoneCode}>{selectedCountry.phoneCode}</Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar País</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={COUNTRIES}
              keyExtractor={item => item.code}
              renderItem={renderCountryItem}
              style={styles.countryList}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minWidth: 100,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    backgroundColor: 'transparent',
    borderWidth: 0,
    minHeight: 48,
  },
  disabled: {
    opacity: 0.5,
    backgroundColor: Colors.background.disabled,
  },
  flag: {
    fontSize: 18,
    marginRight: Spacing.xs,
  },
  phoneCode: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: Typography.fontFamily.primary,
    marginRight: Spacing.xs,
    fontWeight: Typography.fontWeightMedium,
  },
  arrow: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.background.default,
    borderRadius: 12, // Changed from borderRadius.lg to 12
    padding: Spacing.lg,
    maxHeight: '80%',
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.default,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily.primary,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  closeButtonText: {
    fontSize: 18,
    color: Colors.text.secondary,
  },
  countryList: {
    maxHeight: 400,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  countryName: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily.primary,
    marginLeft: Spacing.sm,
  },
});

// Helper function to get default country (Brazil)
export const getDefaultCountry = (): Country => {
  return COUNTRIES.find(country => country.code === 'BR') || COUNTRIES[0];
};

// Helper function to find country by phone code
export const findCountryByPhoneCode = (
  phoneCode: string
): Country | undefined => {
  return COUNTRIES.find(country => country.phoneCode === phoneCode);
};
