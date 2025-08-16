import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
} from './design-system';
import { CountryCodePicker, Country } from './CountryCodePicker';

interface PhoneInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  onValidation?: (isValid: boolean) => void;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  label = 'Telefone',
  value,
  onChangeText,
  placeholder = 'Digite o telefone',
  disabled = false,
  error,
  required = false,
  onValidation,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country>({
    name: 'Brasil',
    flag: '🇧🇷',
    phoneCode: '+55',
    code: 'BR',
  });

  const formatBrazilianPhone = (text: string): string => {
    const cleanText = text.replace(/\D/g, '');

    if (cleanText.length <= 2) {
      return cleanText;
    } else if (cleanText.length <= 6) {
      return `(${cleanText.slice(0, 2)}) ${cleanText.slice(2)}`;
    } else if (cleanText.length <= 10) {
      return `(${cleanText.slice(0, 2)}) ${cleanText.slice(2, 6)}-${cleanText.slice(6)}`;
    } else {
      return `(${cleanText.slice(0, 2)}) ${cleanText.slice(2, 7)}-${cleanText.slice(7, 11)}`;
    }
  };

  const formatPhoneByCountry = (text: string): string => {
    if (selectedCountry.code === 'BR') {
      return formatBrazilianPhone(text);
    }
    return text.replace(/\D/g, '');
  };

  const validatePhone = (formatted: string): boolean => {
    return selectedCountry.code === 'BR'
      ? formatted.replace(/\D/g, '').length >= 10
      : formatted.length >= 8;
  };

  const handleTextChange = (text: string) => {
    const formatted = formatPhoneByCountry(text);
    onChangeText(formatted);

    if (onValidation) {
      const isValid = validatePhone(formatted);
      onValidation(isValid);
    }
  };

  const handleCountryChange = (country: Country) => {
    setSelectedCountry(country);
    onChangeText('');
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const containerStyle = [
    styles.container,
    isFocused && styles.focused,
    error && styles.error,
  ];

  const inputStyle = [
    styles.input,
    isFocused && styles.inputFocused,
    error && styles.inputError,
  ];

  return (
    <View style={containerStyle}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => !disabled && inputRef.current?.focus()}
        style={inputStyle}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
      >
        <View style={styles.countrySelector}>
          <CountryCodePicker
            selectedCountry={selectedCountry}
            onCountrySelect={handleCountryChange}
            disabled={disabled}
          />
        </View>
        <TextInput
          ref={inputRef}
          style={styles.textInput}
          value={value}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          keyboardType="phone-pad"
          returnKeyType="next"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightMedium,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: Spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  required: {
    color: '#FF6B6B',
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  inputFocused: {
    borderColor: 'rgba(85, 107, 47, 0.8)',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#556B2F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  inputError: {
    borderColor: '#FF6B6B',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  countrySelector: {
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderTopLeftRadius: BorderRadius.md,
    borderBottomLeftRadius: BorderRadius.md,
  },
  textInput: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.fontSizeBase,
    color: Colors.white,
  },
  errorText: {
    fontSize: Typography.fontSizeSm,
    color: '#FF6B6B',
    marginTop: Spacing.xs,
    fontWeight: Typography.fontWeightMedium,
  },
  focused: {
  },
  error: {
  },
});
