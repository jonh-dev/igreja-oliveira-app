import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from './design-system';

export interface InputProps extends Omit<TextInputProps, 'onChangeText'> {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'cpf' | 'phone' | 'cep';
  error?: string;
  required?: boolean;
  mask?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  type = 'text',
  error,
  required = false,
  mask,
  style,
  textStyle,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    textInputProps.onFocus?.(textInputProps.onFocus as any);
  };

  const handleBlur = () => {
    setIsFocused(false);
    textInputProps.onBlur?.(textInputProps.onBlur as any);
  };

  const applyMask = (text: string) => {
    if (!mask) return text;
    
    let maskedText = '';
    let textIndex = 0;
    
    for (let i = 0; i < mask.length && textIndex < text.length; i++) {
      if (mask[i] === '#') {
        maskedText += text[textIndex];
        textIndex++;
      } else {
        maskedText += mask[i];
      }
    }
    
    return maskedText;
  };

  const handleChangeText = (text: string) => {
    const maskedText = applyMask(text);
    onChangeText(maskedText);
  };

  const getKeyboardType = () => {
    switch (type) {
      case 'email':
        return 'email-address';
      case 'phone':
        return 'phone-pad';
      case 'cpf':
      case 'cep':
        return 'numeric';
      default:
        return 'default';
    }
  };

  const getAutoCapitalize = () => {
    switch (type) {
      case 'email':
        return 'none';
      default:
        return 'sentences';
    }
  };

  const getSecureTextEntry = () => {
    return type === 'password';
  };

  const containerStyle = [
    styles.container,
    isFocused && styles.focused,
    error && styles.error,
    style,
  ];

  const inputStyle = [
    styles.input,
    isFocused && styles.inputFocused,
    error && styles.inputError,
    textStyle,
  ];

  return (
    <View style={containerStyle}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      
      <TextInput
        style={inputStyle}
        value={value}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.gray}
        keyboardType={getKeyboardType()}
        autoCapitalize={getAutoCapitalize()}
        secureTextEntry={getSecureTextEntry()}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...textInputProps}
      />
      
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
    color: Colors.darkGray,
    marginBottom: Spacing.xs,
  },
  required: {
    color: Colors.danger,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.fontSizeBase,
    color: Colors.black,
    backgroundColor: Colors.white,
    ...Shadows.sm,
  },
  inputFocused: {
    borderColor: Colors.primary,
    ...Shadows.md,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  errorText: {
    fontSize: Typography.fontSizeSm,
    color: Colors.danger,
    marginTop: Spacing.xs,
  },
  focused: {
    // Container focus state if needed
  },
  error: {
    // Container error state if needed
  },
}); 